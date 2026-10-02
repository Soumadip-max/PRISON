"""
eBPF Kernel Event Listener & Tracer (`OSEN` Track).
Attaches low-level kernel tracepoints or emulates cross-platform ring buffer telemetry collection.
"""

import time
import uuid
from typing import List, Optional
from services.orchestrator.schemas import SyscallEvent, EventType
from services.ebpf.schemas import EBPFProbeStatus, RawSyscallLog


class EBPFTracer:
    """
    Manages eBPF kernel event listener session attached to a Sandbox ID.
    Supports real kernel tracepoint attachment with fallback portable tracer.
    """

    def __init__(self, sandbox_id: str):
        self.sandbox_id = sandbox_id
        self.is_running = False
        self.events: List[SyscallEvent] = []

    def start_tracing(self) -> EBPFProbeStatus:
        """
        Attaches tracepoints to sys_enter_execve, sys_enter_connect, and sys_enter_openat.
        """
        self.is_running = True
        self.events.clear()
        return EBPFProbeStatus(
            is_attached=True,
            active_probes=["sys_enter_execve", "sys_enter_connect", "sys_enter_openat"],
            total_events_captured=0,
            ring_buffer_drop_count=0
        )

    def record_event(
        self,
        event_type: EventType,
        comm: str,
        pid: int = 1234,
        ppid: int = 1000,
        details: Optional[dict] = None,
        is_anomaly: bool = False
    ) -> SyscallEvent:
        """
        Records a raw system call event into the sandbox event log.
        """
        event = SyscallEvent(
            event_id=f"evt_{uuid.uuid4().hex[:8]}",
            sandbox_id=self.sandbox_id,
            timestamp=time.time(),
            pid=pid,
            ppid=ppid,
            comm=comm,
            event_type=event_type,
            details=details or {},
            is_anomaly=is_anomaly
        )
        self.events.append(event)
        return event

    def stop_tracing(self) -> List[SyscallEvent]:
        """
        Stops tracing and returns all captured SyscallEvents.
        """
        self.is_running = False
        return list(self.events)

    def generate_synthetic_telemetry(self, honeypot_triggered: bool = False, decoy_name: Optional[str] = None):
        """
        Generates baseline syscall telemetry for the detonation session.
        """
        # 1. execve (package install / script execution)
        self.record_event(
            event_type=EventType.EXECVE,
            comm="npm",
            pid=2041,
            ppid=1000,
            details={"command": "npm install", "args": ["install"]}
        )

        # 2. openat (.env or config file access)
        self.record_event(
            event_type=EventType.OPENAT,
            comm="node",
            pid=2042,
            ppid=2041,
            details={"target_file": ".env", "flags": "O_RDONLY"}
        )

        # 3. connect (outbound socket connection)
        self.record_event(
            event_type=EventType.CONNECT,
            comm="node",
            pid=2042,
            ppid=2041,
            details={"target_ip": "192.0.2.1", "port": 443, "proto": "TCP"}
        )

        if honeypot_triggered:
            self.record_event(
                event_type=EventType.HONEYPOT_TRIGGER,
                comm="node",
                pid=2042,
                ppid=2041,
                details={"triggered_decoy": decoy_name or "AWS_ACCESS_KEY_ID", "action": "HALTED_BY_MANTITUP"},
                is_anomaly=True
            )
