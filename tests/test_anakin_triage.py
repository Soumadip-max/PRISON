"""
Unit tests for ANAKIN AI Triage Engine and Rule R08 confidence gating.
"""

try:
    import pytest
except ImportError:
    class PytestMock:
        def mark(self): pass
        class mark:
            @staticmethod
            def asyncio(func): return func
    pytest = PytestMock()
from services.agent.triage.engine import AnakinTriageEngine
from services.agent.triage.schemas import GatingAction
from services.agent.graph.attack_tree import AttackTreeGenerator
from services.telemetry.pipeline.dag_builder import DAGBuilder
from services.telemetry.pipeline.normalizer import EventNormalizer
from services.telemetry.schemas.events import RawEbpfEvent


@pytest.mark.asyncio
async def test_anakin_triage_honeypot_blocking_gating():
    builder = DAGBuilder(execution_id="exec-triage-1")

    # Parent process: node
    e1 = EventNormalizer.normalize(
        RawEbpfEvent(
            execution_id="exec-triage-1",
            pid=200,
            ppid=1,
            comm="node",
            syscall="sys_enter_execve",
            args={"argv": ["node", "index.js"]},
        )
    )
    # Child process: honeypot hit
    e2 = EventNormalizer.normalize(
        RawEbpfEvent(
            execution_id="exec-triage-1",
            pid=201,
            ppid=200,
            comm="node",
            syscall="sys_enter_openat",
            args={"filename": "AKIA_HONEYPOT_PRISON_DEMO"},
            honeypot_key="AKIA_HONEYPOT_PRISON_DEMO",
        )
    )

    builder.add_event(e1)
    builder.add_event(e2)
    dag = builder.build()

    engine = AnakinTriageEngine()
    report = await engine.evaluate_dag(dag)

    # Verify threat assessment and Rule R08 gating
    assert report.threat_detected is True
    assert report.severity_score >= 90
    assert report.confidence_score >= 0.85
    assert report.gating_action == GatingAction.BLOCK_PR
    assert "AKIA_HONEYPOT_PRISON_DEMO" in report.attack_vector or "Honeypot" in report.summary

    # Test Markdown attack tree generation
    markdown_tree = AttackTreeGenerator.generate_markdown(dag)
    assert "HONEYPOT TRAP" in markdown_tree
    assert "PID 200" in markdown_tree
    assert "PID 201" in markdown_tree
