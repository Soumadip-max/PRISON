"""
Unit tests for HMAC SHA-256 Webhook Signature Validation.
"""

import hmac
import hashlib
from services.orchestrator.signature_validator import verify_github_signature


def test_valid_signature():
    secret = "secret123"
    body = b'{"action": "opened"}'
    computed_hmac = hmac.new(secret.encode("utf-8"), body, hashlib.sha256).hexdigest()
    header = f"sha256={computed_hmac}"

    assert verify_github_signature(body, header, secret=secret) is True


def test_invalid_signature():
    secret = "secret123"
    body = b'{"action": "opened"}'
    header = "sha256=invalid_hex_hash_code"

    assert verify_github_signature(body, header, secret=secret) is False


def test_missing_header():
    secret = "secret123"
    body = b'{"action": "opened"}'

    assert verify_github_signature(body, None, secret=secret) is False
