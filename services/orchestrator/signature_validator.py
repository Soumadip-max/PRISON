"""
GitHub HMAC Signature 256 Validator for Webhook Ingestion.
"""

import hmac
import hashlib
import os
from typing import Optional


def verify_github_signature(
    raw_body: bytes,
    signature_header: Optional[str],
    secret: Optional[str] = None
) -> bool:
    """
    Verifies the X-Hub-Signature-256 header sent by GitHub webhooks against secret.
    If secret is not passed, falls back to GITHUB_WEBHOOK_SECRET env var.
    If secret is empty or not set, returns True in development mode if explicitly configured,
    or raises ValueError.
    """
    if secret is None:
        secret = os.getenv("GITHUB_WEBHOOK_SECRET", "")

    if not secret:
        # Development mode bypass if secret is not set
        dev_mode = os.getenv("PRISON_DEV_MODE", "true").lower() == "true"
        if dev_mode and not signature_header:
            return True
        return False

    if not signature_header:
        return False

    if not signature_header.startswith("sha256="):
        return False

    expected_signature = signature_header[7:]

    computed_hmac = hmac.new(
        key=secret.encode("utf-8"),
        msg=raw_body,
        digestmod=hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(computed_hmac, expected_signature)
