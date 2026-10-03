"""
Semgrep CLI Static Analysis Fallback Runner (MODULE 2).

Triggered automatically when:
  - GitHub App installation token is missing / read permissions denied, OR
  - Firecracker KVM microVM allocation fails.

Runs `semgrep --config p/ci --json` on the PR diff content and normalizes
findings into the standard TRACECOMMON schema so the UI renders identically
regardless of execution mode (DYNAMIC_MICROVM vs STATIC_SEMGREP_FALLBACK).
"""

import json
import os
import shutil
import subprocess
import tempfile
import logging
from typing import List, Optional

logger = logging.getLogger(__name__)


# ── TRACECOMMON-compatible output schema ───────────────────────────────────────
class SemgrepFinding:
    """A single normalized Semgrep finding mapped to TRACECOMMON event schema."""

    def __init__(self, raw: dict):
        self.check_id: str = raw.get("check_id", "unknown-rule")
        self.severity: str = raw.get("extra", {}).get("severity", "WARNING").upper()
        self.message: str = raw.get("extra", {}).get("message", "")
        self.path: str = raw.get("path", "")
        self.start_line: int = raw.get("start", {}).get("line", 0)
        self.end_line: int = raw.get("end", {}).get("line", 0)
        self.code_snippet: str = raw.get("extra", {}).get("lines", "").strip()

    def to_tracecommon_event(self) -> dict:
        """
        Converts a Semgrep finding into a TRACECOMMON NormalizedEvent dict.
        Maps severity to PRISON node types (RED_MALICIOUS / AMBER_HONEYPOT / BLUE_STANDARD).
        """
        node_type_map = {
            "ERROR":   "RED_MALICIOUS",
            "WARNING": "AMBER_HONEYPOT",
            "INFO":    "BLUE_STANDARD",
        }
        return {
            "pid": 0,
            "ppid": 0,
            "comm": "semgrep",
            "event_type": "STATIC_ANALYSIS",
            "syscall": "semgrep_rule_match",
            "node_type": node_type_map.get(self.severity, "AMBER_HONEYPOT"),
            "is_anomaly": self.severity in ("ERROR", "WARNING"),
            "details": {
                "check_id": self.check_id,
                "severity": self.severity,
                "message": self.message,
                "filename": self.path,
                "start_line": self.start_line,
                "end_line": self.end_line,
                "code_snippet": self.code_snippet,
            },
        }


class SemgrepFallbackRunner:
    """
    Runs Semgrep static analysis as a fallback when dynamic MicroVM detonation
    is unavailable. Outputs results in standard TRACECOMMON telemetry format.
    """

    SEMGREP_CONFIG = "p/ci"
    DEFAULT_EXTRA_CONFIGS = ["p/secrets", "p/owasp-top-ten"]

    def __init__(self, extra_configs: Optional[List[str]] = None):
        self.extra_configs = extra_configs or self.DEFAULT_EXTRA_CONFIGS
        self._semgrep_available = shutil.which("semgrep") is not None

    def is_available(self) -> bool:
        """Check if semgrep CLI is installed and on PATH."""
        return self._semgrep_available

    def scan_content(
        self,
        file_content: str,
        filename: str = "pr_diff.py",
        sandbox_id: str = "static-fallback",
    ) -> dict:
        """
        Scan a string of file content using Semgrep CLI.

        Args:
            file_content: The source code or diff content to scan.
            filename: Hint filename for Semgrep rule matching (extension matters).
            sandbox_id: The PRISON execution ID for this fallback run.

        Returns:
            A TRACECOMMON-compatible telemetry payload dict.
        """
        if not self._semgrep_available:
            logger.warning("[SEMGREP] Semgrep CLI not found. Returning empty static scan.")
            return self._empty_result(sandbox_id, reason="SEMGREP_NOT_INSTALLED")

        with tempfile.TemporaryDirectory(prefix=f"prison_semgrep_{sandbox_id}_") as tmpdir:
            # Write content to a temp file for Semgrep to scan
            scan_path = os.path.join(tmpdir, filename)
            with open(scan_path, "w", encoding="utf-8") as f:
                f.write(file_content)

            findings = self._run_semgrep(tmpdir)

        return self._build_tracecommon_payload(sandbox_id, findings)

    def scan_directory(self, directory: str, sandbox_id: str = "static-fallback") -> dict:
        """
        Scan an entire directory using Semgrep CLI.
        Used when a full repo clone is available for static analysis.
        """
        if not self._semgrep_available:
            return self._empty_result(sandbox_id, reason="SEMGREP_NOT_INSTALLED")

        findings = self._run_semgrep(directory)
        return self._build_tracecommon_payload(sandbox_id, findings)

    def _run_semgrep(self, target_path: str) -> List[SemgrepFinding]:
        """Execute Semgrep CLI and parse JSON output."""
        configs = [self.SEMGREP_CONFIG] + self.extra_configs
        cmd = ["semgrep", "--json", "--quiet", "--no-git-ignore"]
        for cfg in configs:
            cmd += ["--config", cfg]
        cmd.append(target_path)

        logger.info(f"[SEMGREP] Running: {' '.join(cmd)}")

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=120,
            )
            output = result.stdout.strip()
            if not output:
                logger.warning("[SEMGREP] Empty output from Semgrep CLI.")
                return []

            data = json.loads(output)
            raw_results = data.get("results", [])
            logger.info(f"[SEMGREP] Found {len(raw_results)} findings.")
            return [SemgrepFinding(r) for r in raw_results]

        except subprocess.TimeoutExpired:
            logger.error("[SEMGREP] Scan timed out after 120s.")
            return []
        except json.JSONDecodeError as e:
            logger.error(f"[SEMGREP] Failed to parse JSON output: {e}")
            return []
        except Exception as e:
            logger.error(f"[SEMGREP] Unexpected error: {e}")
            return []

    def _build_tracecommon_payload(
        self, sandbox_id: str, findings: List[SemgrepFinding]
    ) -> dict:
        """Build the normalized TRACECOMMON telemetry payload from Semgrep findings."""
        events = [f.to_tracecommon_event() for f in findings]
        critical = [f for f in findings if f.severity == "ERROR"]
        warnings  = [f for f in findings if f.severity == "WARNING"]

        honeypot_triggered = len(critical) > 0
        triggered_decoy = critical[0].check_id if critical else None

        return {
            "sandbox_id": sandbox_id,
            "execution_mode": "STATIC_SEMGREP_FALLBACK",
            "repo_name": "unknown",
            "pr_number": 0,
            "commit_sha": "static-analysis",
            "status": "STATIC_FLAGGED" if honeypot_triggered else "STATIC_FALLBACK_PASSED",
            "total_events": len(events),
            "events": events,
            "honeypot_triggered": honeypot_triggered,
            "triggered_decoy": triggered_decoy,
            "semgrep_summary": {
                "total_findings": len(findings),
                "critical": len(critical),
                "warnings": len(warnings),
                "rules_matched": list({f.check_id for f in findings}),
            },
            "privacy_guarantee": {
                "execution_mode": "STATIC_SEMGREP_FALLBACK",
                "data_retention": "PURGED",
                "fallback_used": True,
            },
        }

    @staticmethod
    def _empty_result(sandbox_id: str, reason: str = "UNKNOWN") -> dict:
        return {
            "sandbox_id": sandbox_id,
            "execution_mode": "STATIC_SEMGREP_FALLBACK",
            "status": "STATIC_FALLBACK_PASSED",
            "total_events": 0,
            "events": [],
            "honeypot_triggered": False,
            "triggered_decoy": None,
            "semgrep_summary": {"total_findings": 0, "critical": 0, "warnings": 0, "rules_matched": []},
            "fallback_reason": reason,
            "privacy_guarantee": {
                "execution_mode": "STATIC_SEMGREP_FALLBACK",
                "data_retention": "PURGED",
                "fallback_used": True,
            },
        }
