"""
Asynchronous Job Dispatcher for GitHub PR Detonation Pipelines.
"""

import asyncio
import uuid
from typing import Dict, Any

from services.orchestrator.schemas import GitHubWebhookPayload, TraceCommonPayload
from services.isolation.schemas import SandboxExecutionRequest
from services.isolation.sandbox_runner import SandboxRunner
from services.ebpf.ebpf_tracer import EBPFTracer
from services.ebpf.event_dumper import EventDumper
from services.orchestrator.tracecommon_handoff import TraceCommonHandoff


class JobDispatcher:
    """
    Manages background detonation execution jobs for incoming PR webhooks.
    """

    def __init__(self):
        self.active_jobs: Dict[str, Dict[str, Any]] = {}
        self.handoff = TraceCommonHandoff()
        self.dumper = EventDumper()

    def dispatch_job(self, payload: GitHubWebhookPayload) -> str:
        """
        Dispatches detonation execution job asynchronously.
        Returns job_id immediately for fast webhook acknowledgement (<100ms).
        """
        sandbox_id = f"sbx_{uuid.uuid4().hex[:12]}"

        # Record job state
        self.active_jobs[sandbox_id] = {
            "status": "QUEUED",
            "repo_name": payload.repository.full_name,
            "pr_number": payload.number,
            "commit_sha": payload.pull_request.head.sha
        }

        # Run pipeline in background task
        asyncio.create_task(
            self._execute_detonation_pipeline(sandbox_id, payload)
        )

        return sandbox_id

    async def _execute_detonation_pipeline(self, sandbox_id: str, payload: GitHubWebhookPayload) -> TraceCommonPayload:
        """
        Internal async background workflow:
        1. Initialize eBPF tracer.
        2. Execute microVM sandbox runner with honeypot injection.
        3. Collect kernel events & honeypot triggers.
        4. Hand off normalized TRACECOMMON payload to Dev 4 telemetry pipeline.
        """
        self.active_jobs[sandbox_id]["status"] = "RUNNING"

        # 1. Initialize eBPF Kernel Probes
        tracer = EBPFTracer(sandbox_id=sandbox_id)
        tracer.start_tracing()

        # 2. Prepare Sandbox Execution Request
        request = SandboxExecutionRequest(
            sandbox_id=sandbox_id,
            repo_url=payload.repository.clone_url,
            commit_sha=payload.pull_request.head.sha,
            pr_number=payload.number,
            timeout_seconds=30
        )

        # 3. Run MicroVM Sandbox Execution
        runner = SandboxRunner()
        # Run blocking execution in thread pool executor
        loop = asyncio.get_event_loop()
        sandbox_result = await loop.run_in_executor(None, runner.run_sandbox, request)

        # 4. Generate Telemetry Events
        tracer.generate_synthetic_telemetry(
            honeypot_triggered=sandbox_result.honeypot_triggered,
            decoy_name=sandbox_result.triggered_decoy
        )
        captured_events = tracer.stop_tracing()

        # Dump raw log
        try:
            self.dumper.dump_to_json_string(sandbox_id, captured_events)
        except Exception:
            pass

        # 5. Build TRACECOMMON Payload & Handoff
        trace_payload = TraceCommonHandoff.build_payload(
            sandbox_result=sandbox_result,
            events=captured_events,
            repo_name=payload.repository.full_name,
            pr_number=payload.number,
            commit_sha=payload.pull_request.head.sha
        )

        self.handoff.send_to_pipeline(trace_payload)

        self.active_jobs[sandbox_id]["status"] = sandbox_result.status
        self.active_jobs[sandbox_id]["payload"] = trace_payload

        return trace_payload
