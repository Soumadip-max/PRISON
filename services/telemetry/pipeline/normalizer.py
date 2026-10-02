"""
TRACECOMMON Telemetry Event Normalizer.
Normalizes raw eBPF kernel event payloads from OSEN into standardized, risk-assessed events.
"""

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional, Tuple

from services.telemetry.schemas.events import (
    NormalizedEvent,
    RawEbpfEvent,
    RiskLevel,
    SyscallType,
)

# Known synthetic honeypot patterns defined in system directives
HONEYPOT_PATTERNS = [
    "AKIA_HONEYPOT_PRISON_DEMO",
    "AWS_SECRET_ACCESS_KEY",
    "PRISON_HONEYPOT_TOKEN",
    ".env.honeypot",
    "/etc/shadow",
]

# Suspicious binary execution keywords
SUSPICIOUS_COMMANDS = [
    "nc ",
    "ncat",
    "netcat",
    "/dev/tcp/",
    "bash -i",
    "sh -i",
    "python -c import socket",
    "curl -s http",
    "wget http",
    "base64 -d",
]


class EventNormalizer:
    """
    Normalizes raw system calls and evaluates threat indicators.
    """

    @staticmethod
    def normalize(raw: RawEbpfEvent) -> NormalizedEvent:
        """
        Processes a RawEbpfEvent and returns a structured NormalizedEvent.
        """
        event_id = str(uuid.uuid4())
        timestamp = raw.timestamp or datetime.now(timezone.utc)
        resolved_path: Optional[str] = None
        destination_ip: Optional[str] = None
        destination_port: Optional[int] = None
        honeypot_hit = False
        risk_level = RiskLevel.CLEAN

        # Extract arguments
        args = raw.args or {}
        filename = args.get("filename") or args.get("path") or ""
        argv = args.get("argv") or []
        cmdline = f"{raw.comm} " + " ".join(argv if isinstance(argv, list) else [str(argv)])
        if filename:
            resolved_path = str(filename)

        # Check for honeypot access (openat or injected env read)
        if raw.honeypot_key:
            honeypot_hit = True
            risk_level = RiskLevel.HONEYPOT_HIT
        elif raw.syscall == SyscallType.OPENAT.value or raw.syscall == "sys_enter_openat":
            for pattern in HONEYPOT_PATTERNS:
                if pattern in str(filename) or pattern in str(args):
                    honeypot_hit = True
                    risk_level = RiskLevel.HONEYPOT_HIT
                    break

        # Check for execve execution details
        if raw.syscall == SyscallType.EXECVE.value or raw.syscall == "sys_enter_execve":
            resolved_path = str(filename) if filename else raw.comm
            for susp in SUSPICIOUS_COMMANDS:
                if susp in cmdline:
                    risk_level = RiskLevel.SUSPICIOUS_EXEC
                    break

        # Check for socket connect details
        if raw.syscall == SyscallType.CONNECT.value or raw.syscall == "sys_enter_connect":
            destination_ip = str(args.get("ip") or args.get("dest_ip") or "unknown")
            destination_port = int(args.get("port") or args.get("dest_port") or 0)
            # Flag non-localhost outbound connections during untrusted build execution
            if destination_ip not in ("127.0.0.1", "localhost", "0.0.0.0", "unknown"):
                risk_level = RiskLevel.UNAUTHORIZED_SOCKET

        return NormalizedEvent(
            event_id=event_id,
            execution_id=raw.execution_id,
            timestamp=timestamp,
            pid=raw.pid,
            ppid=raw.ppid,
            comm=raw.comm,
            syscall=raw.syscall,
            resolved_path=resolved_path,
            destination_ip=destination_ip,
            destination_port=destination_port,
            honeypot_hit=honeypot_hit,
            risk_level=risk_level,
            metadata={
                "args": args,
                "cmdline": cmdline,
            },
        )
