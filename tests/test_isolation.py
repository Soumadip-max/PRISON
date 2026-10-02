"""
Unit tests for MicroVM Isolation and Honeypot Injection (`MANTITUP`).
"""

import tempfile
import os
from services.isolation.honeypot_injector import HoneypotInjector
from services.isolation.sandbox_runner import SandboxRunner
from services.isolation.schemas import SandboxExecutionRequest, HoneypotCredentials


def test_honeypot_env_injection():
    creds = HoneypotCredentials()
    injector = HoneypotInjector(creds)
    env = injector.get_env_dict()

    assert env["AWS_ACCESS_KEY_ID"] == "AKIA_PRISON_DECOY_9982"
    assert env["JWT_SECRET"] == "ey_prison_decoy_jwt_token_production_fake"


def test_honeypot_workspace_file_seeding():
    creds = HoneypotCredentials()
    injector = HoneypotInjector(creds)

    with tempfile.TemporaryDirectory() as tmpdir:
        files = injector.seed_workspace_files(tmpdir)
        env_file = os.path.join(tmpdir, ".env")
        assert os.path.exists(env_file)

        with open(env_file, "r") as f:
            content = f.read()
            assert creds.AWS_ACCESS_KEY_ID in content


def test_honeypot_trigger_detection():
    creds = HoneypotCredentials()
    injector = HoneypotInjector(creds)

    triggered, decoy = injector.check_honeypot_trigger(output_text="Exfiltrating key AKIA_PRISON_DECOY_9982 to remote host")
    assert triggered is True
    assert decoy == "EXFILTRATED_SECRET:AWS_ACCESS_KEY_ID"


def test_sandbox_runner_execution():
    runner = SandboxRunner()
    req = SandboxExecutionRequest(
        sandbox_id="test_sbx_001",
        repo_url="https://github.com/example/repo.git",
        commit_sha="abc1234",
        pr_number=42,
        timeout_seconds=10
    )

    res = runner.run_sandbox(req)
    assert res.sandbox_id == "test_sbx_001"
    assert res.status in ["COMPLETED", "HONEYPOT_HALTED"]
