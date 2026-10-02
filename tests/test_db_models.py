"""
Unit tests for packages/db database models and async session management.
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
from sqlalchemy import select
from packages.db import (
    init_db,
    AsyncSessionLocal,
    TelemetryEventModel,
    ExecutionGraphModel,
    ThreatReportModel,
    RemediationPatchModel,
)


@pytest.mark.asyncio
async def test_database_initialization_and_models():
    # Initialize in-memory SQLite tables
    await init_db()

    async with AsyncSessionLocal() as session:
        # Create a telemetry event record
        event = TelemetryEventModel(
            execution_id="exec-test-101",
            pid=4102,
            ppid=1,
            comm="node",
            syscall="sys_enter_openat",
            args={"filename": "AKIA_HONEYPOT_PRISON_DEMO"},
            honeypot_hit=True,
            risk_level="HONEYPOT_HIT",
        )
        session.add(event)

        # Create a threat report record
        report = ThreatReportModel(
            execution_id="exec-test-101",
            threat_detected=True,
            severity_score=95,
            confidence_score=0.98,
            summary="Honeypot hit detected.",
            attack_vector="Honeypot key accessed.",
            compromised_files=["AKIA_HONEYPOT_PRISON_DEMO"],
            suggested_action="Block PR.",
        )
        session.add(report)
        await session.commit()

        # Query back saved event
        result = await session.execute(
            select(TelemetryEventModel).where(TelemetryEventModel.execution_id == "exec-test-101")
        )
        fetched_event = result.scalar_one_or_none()

        assert fetched_event is not None
        assert fetched_event.comm == "node"
        assert fetched_event.honeypot_hit is True
        assert fetched_event.risk_level == "HONEYPOT_HIT"
