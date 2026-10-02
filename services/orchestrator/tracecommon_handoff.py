"""
TRACECOMMON Telemetry Pipeline Handoff Interface.
Transforms raw eBPF kernel events & honeypot triggers into standardized TRACECOMMON schema payloads.
"""

from typing import List, Optional
from services.orchestrator.schemas import TraceCommonPayload, SyscallEvent
from services.isolation.schemas import SandboxExecutionResult


class TraceCommonHandoff:
    """
    Normalizes execution outputs and eBPF events into TRACECOMMON standard format.
    """

    @staticmethod
    def build_payload(
        sandbox_result: SandboxExecutionResult,
        events: List[SyscallEvent],
        repo_name: str,
        pr_number: int,
        commit_sha: str
    ) -> TraceCommonPayload:
        """
        Constructs a validated TraceCommonPayload.
        """
        return TraceCommonPayload(
            sandbox_id=sandbox_result.sandbox_id,
            repo_name=repo_name,
            pr_number=pr_number,
            commit_sha=commit_sha,
            status=sandbox_result.status,
            total_events=len(events),
            events=events,
            honeypot_triggered=sandbox_result.honeypot_triggered,
            triggered_decoy=sandbox_result.triggered_decoy
        )

    def send_to_pipeline(self, payload: TraceCommonPayload, target_url: Optional[str] = None) -> bool:
        """
        Delivers normalized payload to downstream pipeline endpoint or internal registry.
        """
        # In actual deployment, performs HTTP POST to Dev 4 pipeline target_url or pushes to Redis stream.
        return True
