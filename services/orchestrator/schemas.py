"""
Pydantic schemas for Orchestrator service and TRACECOMMON contract.
"""

from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class RepositoryInfo(BaseModel):
    id: int
    name: str
    full_name: str
    clone_url: str
    default_branch: str = "main"


class PullRequestHead(BaseModel):
    ref: str
    sha: str
    clone_url: Optional[str] = None


class PullRequestInfo(BaseModel):
    number: int
    state: str = "open"
    title: str
    head: PullRequestHead


class GitHubWebhookPayload(BaseModel):
    action: str
    number: int
    pull_request: PullRequestInfo
    repository: RepositoryInfo
    sender: Dict[str, Any] = Field(default_factory=dict)


class LocalPathPayload(BaseModel):
    source_type: str
    target_path: str


class WebhookResponse(BaseModel):
    status: str
    job_id: str
    message: str
    pr_number: int
    repo_name: str


class EventType(str, Enum):
    EXECVE = "EXECVE"
    CONNECT = "CONNECT"
    OPENAT = "OPENAT"
    HONEYPOT_TRIGGER = "HONEYPOT_TRIGGER"


class SyscallEvent(BaseModel):
    event_id: str
    sandbox_id: str
    timestamp: float
    pid: int
    ppid: int
    comm: str
    event_type: EventType
    details: Dict[str, Any] = Field(default_factory=dict)
    is_anomaly: bool = False


class TraceCommonPayload(BaseModel):
    sandbox_id: str
    repo_name: str
    pr_number: int
    commit_sha: str
    status: str  # "COMPLETED", "TIMEOUT", "HONEYPOT_HALTED"
    total_events: int
    events: List[SyscallEvent] = Field(default_factory=list)
    honeypot_triggered: bool = False
    triggered_decoy: Optional[str] = None
