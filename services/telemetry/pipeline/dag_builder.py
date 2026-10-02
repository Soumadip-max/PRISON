"""
TRACECOMMON Directed Acyclic Graph (DAG) Builder.
Constructs execution process trees and classifies nodes into UI color tiers (Blue, Amber, Red).
"""

from typing import Dict, List, Set
from services.telemetry.schemas.events import NormalizedEvent, RiskLevel
from services.telemetry.schemas.graph import (
    ExecutionDAG,
    GraphEdge,
    GraphNode,
    NodeType,
)


class DAGBuilder:
    """
    Builds a Directed Acyclic Graph from normalized eBPF telemetry events.
    """

    def __init__(self, execution_id: str):
        self.execution_id = execution_id
        self._events: List[NormalizedEvent] = []
        self._nodes_map: Dict[str, GraphNode] = {}
        self._edges: List[GraphEdge] = []
        self._seen_edge_keys: Set[str] = set()

    def add_event(self, event: NormalizedEvent) -> GraphNode:
        """
        Processes a normalized event and updates the DAG nodes and edges.
        """
        self._events.append(event)
        
        # Determine UI Node Color Type
        if event.honeypot_hit or event.risk_level == RiskLevel.HONEYPOT_HIT:
            node_type = NodeType.AMBER_HONEYPOT
        elif event.risk_level in (RiskLevel.SUSPICIOUS_EXEC, RiskLevel.UNAUTHORIZED_SOCKET):
            node_type = NodeType.RED_MALICIOUS
        else:
            node_type = NodeType.BLUE_STANDARD

        # Generate node ID
        node_id = f"proc-{event.pid}-{event.event_id[:8]}"
        
        # Build human readable label
        if event.resolved_path:
            label = f"{event.comm} ({event.syscall} -> {event.resolved_path})"
        elif event.destination_ip:
            label = f"{event.comm} (connect -> {event.destination_ip}:{event.destination_port})"
        else:
            label = f"{event.comm} ({event.syscall})"

        node = GraphNode(
            id=node_id,
            label=label,
            pid=event.pid,
            ppid=event.ppid,
            comm=event.comm,
            node_type=node_type,
            syscall=event.syscall,
            details={
                "risk_level": event.risk_level.value,
                "resolved_path": event.resolved_path,
                "destination_ip": event.destination_ip,
                "destination_port": event.destination_port,
                "honeypot_hit": event.honeypot_hit,
                "metadata": event.metadata,
            },
            timestamp=event.timestamp,
        )

        self._nodes_map[node_id] = node

        # Link parent process to child process if parent exists in graph
        for existing_id, existing_node in list(self._nodes_map.items()):
            if existing_node.pid == event.ppid and existing_id != node_id:
                edge_key = f"{existing_id}->{node_id}"
                if edge_key not in self._seen_edge_keys:
                    self._seen_edge_keys.add(edge_key)
                    self._edges.append(
                        GraphEdge(source=existing_id, target=node_id, relationship="spawned")
                    )

        return node

    def build(self) -> ExecutionDAG:
        """
        Finalizes and returns the complete ExecutionDAG.
        """
        nodes = list(self._nodes_map.values())
        has_honeypot = any(n.node_type == NodeType.AMBER_HONEYPOT for n in nodes)
        has_malicious = any(n.node_type == NodeType.RED_MALICIOUS for n in nodes)

        return ExecutionDAG(
            execution_id=self.execution_id,
            nodes=nodes,
            edges=self._edges,
            has_honeypot_hit=has_honeypot,
            has_malicious_node=has_malicious,
        )
