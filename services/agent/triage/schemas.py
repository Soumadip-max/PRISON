"""
Pydantic v2 schemas for ANAKIN AI Agent triage results and threat reports.
"""

from enum import Enum
from datetime import datetime, timezone
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class GatingAction(str, Enum):
    BLOCK_PR = "BLOCK_PR"                      # Threat detected with high confidence (>= 85%)
    FLAG_MANUAL_REVIEW = "FLAG_MANUAL_REVIEW"  # Threat detected but confidence < 85%
    ALLOW_MERGE = "ALLOW_MERGE"                # Clean execution run


class ThreatReport(BaseModel):
    """
    Structured security evaluation produced by ANAKIN LLM Triage Engine.
    """
    model_config = ConfigDict(extra="ignore")

    execution_id: str = Field(..., description="Detonation execution identifier")
    threat_detected: bool = Field(..., description="True if malicious or honeypot hit identified")
    severity_score: int = Field(..., ge=0, le=100, description="Threat severity rating (0 to 100)")
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Agent confidence (0.0 to 1.0)")
    summary: str = Field(..., description="Human-readable summary of the security finding")
    attack_vector: str = Field(..., description="Detailed technical breakdown of attack path")
    compromised_files: List[str] = Field(default_factory=list, description="Files, packages, or scripts implicated")
    suggested_action: str = Field(..., description="Recommended fix or patch strategy")
    gating_action: GatingAction = Field(..., description="Enforced CI build check decision")
    evaluated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
