"""
FastAPI Webhook Router for GitHub Event Ingestion.
Exposes POST /api/v1/webhook/github with HMAC SHA-256 signature verification.
"""

from fastapi import APIRouter, Request, HTTPException, Header, status
from typing import Optional
import json

from services.orchestrator.schemas import GitHubWebhookPayload, WebhookResponse
from services.orchestrator.signature_validator import verify_github_signature
from services.orchestrator.job_dispatcher import JobDispatcher

router = APIRouter(prefix="/api/v1", tags=["Webhooks"])
dispatcher = JobDispatcher()


@router.post(
    "/webhook/github",
    response_model=WebhookResponse,
    status_code=status.HTTP_202_ACCEPTED
)
async def github_webhook(
    request: Request,
    x_hub_signature_256: Optional[str] = Header(None, alias="X-Hub-Signature-256")
):
    """
    Receives GitHub Pull Request webhook payloads.
    Verifies HMAC SHA-256 signature and queues detonation job asynchronously.
    Responds within <100ms with HTTP 202 Accepted.
    """
    raw_body = await request.body()

    # 1. Verify HMAC Signature
    is_valid = verify_github_signature(raw_body, x_hub_signature_256)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid GitHub HMAC SHA-256 signature."
        )

    # 2. Parse Payload
    try:
        json_data = json.loads(raw_body.decode("utf-8"))
        payload = GitHubWebhookPayload(**json_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid webhook payload: {str(e)}"
        )

    # 3. Action Filter (only process PR opened, synchronize, or reopened)
    supported_actions = {"opened", "synchronize", "reopened"}
    if payload.action not in supported_actions:
        return WebhookResponse(
            status="SKIPPED",
            job_id="none",
            message=f"Action '{payload.action}' ignored. Only PR opened/synchronize are detonated.",
            pr_number=payload.number,
            repo_name=payload.repository.full_name
        )

    # 4. Dispatch Async Detonation Job
    job_id = dispatcher.dispatch_job(payload)

    return WebhookResponse(
        status="ACCEPTED",
        job_id=job_id,
        message="Pull Request queued for microVM detonation and eBPF tracing.",
        pr_number=payload.number,
        repo_name=payload.repository.full_name
    )
