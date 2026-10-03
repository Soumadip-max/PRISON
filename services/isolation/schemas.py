"""
Pydantic schemas for microVM Sandbox and Honeypot Injection (`MANTITUP`).
"""

from typing import Dict, Any, Optional
from pydantic import BaseModel, Field


class HoneypotCredentials(BaseModel):
    AWS_ACCESS_KEY_ID: str = "AKIA_PRISON_DECOY_9982"
    AWS_SECRET_ACCESS_KEY: str = "prison_decoy_secret_key_883719472"
    JWT_SECRET: str = "ey_prison_decoy_jwt_token_production_fake"
    DATABASE_URL: str = "postgres://decoy_user:decoy_pass@127.0.0.1:5432/decoy_db"


class SandboxExecutionRequest(BaseModel):
    sandbox_id: str
    repo_url: str
    commit_sha: str
    pr_number: int
    local_path: Optional[str] = None
    timeout_seconds: int = 30
    honeypots: HoneypotCredentials = Field(default_factory=HoneypotCredentials)


class SandboxExecutionResult(BaseModel):
    sandbox_id: str
    status: str  # "COMPLETED", "TIMEOUT", "HONEYPOT_HALTED", "ERROR"
    exit_code: int = 0
    stdout: str = ""
    stderr: str = ""
    execution_time: float = 0.0
    honeypot_triggered: bool = False
    triggered_decoy: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
