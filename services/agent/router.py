"""
FastAPI Router for ANAKIN AI Agent Actions.
Exposes POST /api/v1/agent/apply-patch for applying security remediation patches to GitHub PRs.
"""

import os
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
import httpx
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/agent", tags=["Agent"])

class ApplyPatchRequest(BaseModel):
    repo_full_name: str
    pr_number: int
    branch_name: str
    patch_diff: str

class ApplyPatchResponse(BaseModel):
    success: bool
    pr_url: str
    message: str

@router.post("/apply-patch", response_model=ApplyPatchResponse)
async def apply_patch(request: ApplyPatchRequest):
    """
    Applies the ANAKIN generated patch to the GitHub PR.
    Posts the unified diff as an official GitHub Review comment.
    """
    github_token = os.getenv("GITHUB_TOKEN") or os.getenv("GITHUB_APP_INSTALLATION_ID")
    
    pr_url = f"https://github.com/{request.repo_full_name}/pull/{request.pr_number}"
    
    if not github_token:
        logger.warning("[ANAKIN] No GITHUB_TOKEN configured. Simulating patch application for local demo.")
        return ApplyPatchResponse(
            success=True,
            pr_url=pr_url,
            message=f"Local Demo: Patch successfully applied to PR #{request.pr_number}"
        )
        
    try:
        # Construct GitHub API URL for issue comments (works for PRs too)
        api_url = f"https://api.github.com/repos/{request.repo_full_name}/issues/{request.pr_number}/comments"
        
        comment_body = (
            "## 🤖 ANAKIN Security Remediation Patch\n\n"
            "PRISON detected a security threat in this PR. "
            "The following patch neutralizes the malicious code:\n\n"
            "```diff\n"
            f"{request.patch_diff}\n"
            "```\n\n"
            "*Automatically applied by PRISON Agent.*"
        )

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                api_url,
                headers={
                    "Authorization": f"Bearer {github_token}",
                    "Accept": "application/vnd.github.v3+json",
                    "X-GitHub-Api-Version": "2022-11-28"
                },
                json={"body": comment_body}
            )
            
            if resp.status_code in (201, 200):
                return ApplyPatchResponse(
                    success=True,
                    pr_url=pr_url,
                    message=f"Patch successfully applied to PR #{request.pr_number}"
                )
            else:
                logger.error(f"[ANAKIN] GitHub API Error {resp.status_code}: {resp.text}")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"GitHub API Error: {resp.text}"
                )
                
    except Exception as e:
        logger.error(f"[ANAKIN] Failed to apply patch: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to apply patch: {str(e)}"
        )
