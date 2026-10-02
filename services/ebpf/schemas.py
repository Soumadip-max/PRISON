"""
Pydantic schemas for eBPF Kernel Probes and Syscall Observation (`OSEN`).
"""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from services.orchestrator.schemas import EventType, SyscallEvent


class EBPFProbeStatus(BaseModel):
    is_attached: bool = False
    active_probes: List[str] = Field(default_factory=list)
    total_events_captured: int = 0
    ring_buffer_drop_count: int = 0


class RawSyscallLog(BaseModel):
    sandbox_id: str
    timestamp: float
    pid: int
    ppid: int
    comm: str
    syscall_name: str
    args: List[str] = Field(default_factory=list)
    raw_details: Dict[str, Any] = Field(default_factory=dict)
