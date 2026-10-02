"""
Pydantic v2 schemas for Execution Graph (DAG) representation.
"""

from enum import Enum
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, ConfigDict


class NodeType(str, Enum):
    BLUE_STANDARD = "BLUE_STANDARD"
    AMBER_HONEYPOT = "AMBER_HONEYPOT"
    RED_MALICIOUS = "RED_MALICIOUS"


class GraphNode(BaseModel):
    """
    Individual process or resource node in the Directed Acyclic Graph.
    """
    model_config = ConfigDict(extra="ignore")

    id: str = Field(..., description="Unique node ID (e.g. pid-timestamp)")
    label: str = Field(..., description="Human readable label (e.g. 'npm install', 'open .env')")
    pid: int
    ppid: int
    comm: str
    node_type: NodeType = Field(NodeType.BLUE_STANDARD, description="Node color code for UI graph rendering")
    syscall: str
    details: Dict[str, Any] = Field(default_factory=dict, description="Detailed parameters (args, ips, files)")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class GraphEdge(BaseModel):
    """
    Parent-child process or resource dependency edge.
    """
    model_config = ConfigDict(extra="ignore")

    source: str = Field(..., description="Parent node ID")
    target: str = Field(..., description="Child node ID")
    relationship: str = Field("spawned", description="Relationship type (spawned, connected, read)")


class ExecutionDAG(BaseModel):
    """
    Complete Directed Acyclic Graph representation of a PR detonation run.
    """
    model_config = ConfigDict(extra="ignore")

    execution_id: str = Field(..., description="Unique execution run ID")
    nodes: List[GraphNode] = Field(default_factory=list)
    edges: List[GraphEdge] = Field(default_factory=list)
    has_honeypot_hit: bool = Field(False)
    has_malicious_node: bool = Field(False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
