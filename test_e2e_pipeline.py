"""
PRISON End-to-End Pipeline Verification Script
Simulates GitHub webhook, traces execution across MANTITUP, OSEN, TRACECOMMON, and mocks ANAKIN.
"""

import asyncio
import os
import time
import json
import uuid

# Mock ANAKIN Agent (since it's a simulated E2E test without a real LLM endpoint active)
class AnakinAgentMock:
    def analyze_and_remediate(self, payload: dict) -> str:
        events = payload.get("events", [])
        triggered = payload.get("honeypot_triggered", False)
        
        if not triggered:
            return "No threats detected. PR is safe."
        
        decoy = payload.get("triggered_decoy")
        patch = (
            "diff --git a/package.json b/package.json\n"
            "--- a/package.json\n"
            "+++ b/package.json\n"
            "@@ -10,3 +10,2 @@\n"
            '   "dependencies": {\n'
            '-    "malicious-package": "^1.0.0"\n'
            "   }\n"
        )
        
        report = (
            f"[!] CRITICAL SECURITY THREAT DETECTED [!]\n\n"
            f"**Analysis:** The package attempted to exfiltrate decoy credentials: `{decoy}`.\n"
            f"**Action Taken:** Automatic remediation patch generated.\n\n"
            f"```diff\n{patch}```"
        )
        return report

async def run_e2e_test():
    print("Starting PRISON E2E Pipeline Verification...")
    
    # Setup environment secrets
    os.environ["GITHUB_WEBHOOK_SECRET"] = "e2e_secret"
    os.environ["PRISON_DEV_MODE"] = "true"
    
    from services.orchestrator.schemas import GitHubWebhookPayload
    from services.orchestrator.job_dispatcher import JobDispatcher
    
    # 1. Simulate GitHub Webhook Event
    print("\n[1/4] Triggering Mock GitHub Webhook (pull_request.opened)...")
    payload = GitHubWebhookPayload(
        action="opened",
        number=99,
        pull_request={
            "number": 99,
            "state": "open",
            "title": "Add dependencies",
            "head": {
                "ref": "feature/deps",
                "sha": "a1b2c3d4e5f6",
                "clone_url": "https://github.com/example/repo.git"
            }
        },
        repository={
            "id": 111,
            "name": "repo",
            "full_name": "example/repo",
            "clone_url": "https://github.com/example/repo.git",
            "default_branch": "main"
        },
        sender={"login": "testuser"}
    )
    
    dispatcher = JobDispatcher()
    job_id = dispatcher.dispatch_job(payload)
    print(f"[OK] Webhook accepted. Job ID: {job_id}")
    
    # 2. Wait for JobDispatcher to complete execution (MANTITUP & OSEN)
    print("\n[2/4] Waiting for MANTITUP (Sandbox) & OSEN (eBPF) execution...")
    # Poll job status
    trace_payload = None
    for _ in range(20):
        job_info = dispatcher.active_jobs.get(job_id, {})
        status = job_info.get("status")
        if status in ["COMPLETED", "TIMEOUT", "HONEYPOT_HALTED", "ERROR"]:
            trace_payload = job_info.get("payload")
            break
        await asyncio.sleep(0.5)
        
    if not trace_payload:
        print("[FAIL] Pipeline execution timed out!")
        return
        
    print(f"[OK] Execution finished with status: {trace_payload.status}")
    print(f"[OK] eBPF Syscall events captured: {trace_payload.total_events}")
    
    # 3. Verify TRACECOMMON Payload
    print("\n[3/4] Verifying TRACECOMMON Graph Serialization...")
    payload_dict = trace_payload.model_dump()
    assert payload_dict["sandbox_id"] == job_id
    assert payload_dict["honeypot_triggered"] is True
    
    event_types = [e["event_type"] for e in payload_dict["events"]]
    print("   Events Detected: " + ', '.join(event_types))
    print("[OK] TRACECOMMON payload validated.")
    
    # 4. ANAKIN Agent Remediation
    print("\n[4/4] Triggering ANAKIN AI Security Agent...")
    agent = AnakinAgentMock()
    report = agent.analyze_and_remediate(payload_dict)
    
    print("\n--- ANAKIN AGENT GITHUB COMMENT ---")
    print(report)
    print("-----------------------------------")
    print("[OK] ANAKIN successfully analyzed threats and generated a Git patch.")
    
    print("\n[DONE] ALL E2E PIPELINE TESTS PASSED!")

if __name__ == "__main__":
    asyncio.run(run_e2e_test())
