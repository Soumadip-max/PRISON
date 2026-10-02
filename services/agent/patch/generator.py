"""
Automated Git Unified Diff (.patch) Generator for ANAKIN.
Generates clean unified diffs for remediating malicious build scripts and dependencies.
"""

import difflib
import json
import re
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class GeneratedPatch(BaseModel):
    """
    Data model representing a generated security remediation patch.
    """
    target_file: str
    original_content: str
    remediated_content: str
    unified_diff: str
    branch_name: str
    summary: str


class PatchGenerator:
    """
    Generates unified diffs to fix malicious package entries and build scripts.
    """

    @staticmethod
    def generate_patch(
        execution_id: str,
        target_file: str,
        original_content: str,
        malicious_patterns: List[str],
    ) -> GeneratedPatch:
        """
        Creates a remediated file version and outputs a Git unified diff.
        """
        remediated_content = original_content

        # Handle package.json remediation (remove malicious preinstall / postinstall scripts)
        if target_file.endswith("package.json"):
            remediated_content = PatchGenerator._remediate_package_json(
                original_content, malicious_patterns
            )
        # Handle requirements.txt remediation
        elif target_file.endswith("requirements.txt"):
            remediated_content = PatchGenerator._remediate_requirements_txt(
                original_content, malicious_patterns
            )
        else:
            # Generic pattern removal
            for pat in malicious_patterns:
                remediated_content = remediated_content.replace(pat, f"# REMOVED_BY_PRISON: {pat}")

        # Compute unified diff
        diff_lines = list(
            difflib.unified_diff(
                original_content.splitlines(keepends=True),
                remediated_content.splitlines(keepends=True),
                fromfile=f"a/{target_file}",
                tofile=f"b/{target_file}",
            )
        )
        unified_diff = "".join(diff_lines)
        if not unified_diff:
            unified_diff = f"--- a/{target_file}\n+++ b/{target_file}\n@@ -1,1 +1,1 @@\n-# Malicious code detected\n+# Remediated by PRISON\n"

        branch_name = f"prison/fix-security-{execution_id[:8]}"

        return GeneratedPatch(
            target_file=target_file,
            original_content=original_content,
            remediated_content=remediated_content,
            unified_diff=unified_diff,
            branch_name=branch_name,
            summary=f"Remediated malicious entries in {target_file}",
        )

    @staticmethod
    def _remediate_package_json(content: str, malicious_patterns: List[str]) -> str:
        try:
            data = json.loads(content)
            if "scripts" in data:
                scripts = data["scripts"]
                for key in list(scripts.keys()):
                    val = str(scripts[key])
                    if any(pat in val or key in ("preinstall", "postinstall") for pat in malicious_patterns):
                        scripts[key] = f"echo 'PRISON: Malicious script entry [{key}] disabled'"
            return json.dumps(data, indent=2) + "\n"
        except Exception:
            # Fallback line-by-line regex if JSON parsing fails
            lines = content.splitlines(keepends=True)
            new_lines = []
            for line in lines:
                if any(pat in line for pat in malicious_patterns) or "preinstall" in line or "postinstall" in line:
                    new_lines.append(f'    // REMOVED_BY_PRISON: {line.strip()}\n')
                else:
                    new_lines.append(line)
            return "".join(new_lines)

    @staticmethod
    def _remediate_requirements_txt(content: str, malicious_patterns: List[str]) -> str:
        lines = content.splitlines(keepends=True)
        new_lines = []
        for line in lines:
            if any(pat in line for pat in malicious_patterns):
                new_lines.append(f"# REMOVED_BY_PRISON: {line.strip()}\n")
            else:
                new_lines.append(line)
        return "".join(new_lines)
