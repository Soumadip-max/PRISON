"""
Integration tests for Orchestrator FastAPI API endpoints.
"""

from fastapi.testclient import TestClient
import hmac
import hashlib
import json
from services.orchestrator.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_webhook_ingestion_success():
    import os
    secret = "secret123"
    os.environ["GITHUB_WEBHOOK_SECRET"] = secret
    payload = {
        "action": "opened",
        "number": 42,
        "pull_request": {
            "number": 42,
            "state": "open",
            "title": "Add suspicious dependency",
            "head": {
                "ref": "feature/malicious-pkg",
                "sha": "9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e",
                "clone_url": "https://github.com/example/repo.git"
            }
        },
        "repository": {
            "id": 123456,
            "name": "repo",
            "full_name": "example/repo",
            "clone_url": "https://github.com/example/repo.git",
            "default_branch": "main"
        },
        "sender": {"login": "attacker"}
    }

    raw_body = json.dumps(payload).encode("utf-8")
    signature = "sha256=" + hmac.new(secret.encode("utf-8"), raw_body, hashlib.sha256).hexdigest()

    response = client.post(
        "/api/v1/webhook/github",
        content=raw_body,
        headers={
            "Content-Type": "application/json",
            "X-Hub-Signature-256": signature
        }
    )

    # Fast ACK response (202 Accepted)
    assert response.status_code == 202
    data = response.json()
    assert data["status"] == "ACCEPTED"
    assert data["pr_number"] == 42
    assert data["repo_name"] == "example/repo"
    assert data["job_id"].startswith("sbx_")
