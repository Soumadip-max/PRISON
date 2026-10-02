"""
Pydantic v2 schemas for raw and normalized eBPF telemetry events.
"""

from enum import Enum
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, ConfigDict


class RiskLevel(str, Enum):
    CLEAN = "CLEAN"
    HONEYPOT_HIT = "HONEYPOT_HIT"
    UNAUTHORIZED_SOCKET = "UNAUTHORIZED_SOCKET"
    SUSPICIOUS_EXEC = "SUSPICIOUS_EXEC"


class SyscallType(str, Enum):
    EXECVE = "sys_enter_execve"
    CONNECT = "sys_enter_connect"
    OPENAT = "sys_enter_openat"
    OTHER = "sys_other"


class RawEbpfEvent(BaseModel):
    """
    Raw eBPF trace event emitted by OSEN kernel probes.
    """
    model_config = ConfigDict(extra="ignore")

    execution_id: str = Field(..., description="Unique detonation run identifier")
    timestamp: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))
    pid: int = Field(..., description="Process ID")
    ppid: int = Field(..., description="Parent Process ID")
    comm: str = Field(..., description="Command / Binary name (e.g. node, python, curl)")
    syscall: str = Field(..., description="Syscall intercepted (sys_enter_execve, etc.)")
    args: Dict[str, Any] = Field(default_factory=dict, description="Syscall argument payload")
    honeypot_key: Optional[str] = Field(None, description="Honeypot key if matched by probe")


class NormalizedEvent(BaseModel):
    """
    Normalized, standardized telemetry event processed by TRACECOMMON.
    """
    model_config = ConfigDict(extra="ignore")

    event_id: str = Field(..., description="Unique event UUID")
    execution_id: str = Field(..., description="Execution run ID")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    pid: int
    ppid: int
    comm: str
    syscall: str
    resolved_path: Optional[str] = Field(None, description="Resolved execution path or file opened")
    destination_ip: Optional[str] = Field(None, description="Destination IP if socket connect")
    destination_port: Optional[int] = Field(None, description="Destination Port if socket connect")
    honeypot_hit: bool = Field(False, description="True if synthetic honeypot decoy accessed")
    risk_level: RiskLevel = Field(RiskLevel.CLEAN, description="Assigned risk score")
    metadata: Dict[str, Any] = Field(default_factory=dict)
