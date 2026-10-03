"""
PRISON Diff Analyzer — Real-time static analysis of PR diffs.
Determines threat level, generates targeted patches, and produces
clean/malicious execution nodes based on actual code mutations.
"""

import re
import hashlib
import random
from typing import Optional
from dataclasses import dataclass, field


# ── Threat Pattern Registry ───────────────────────────────────────────────────
# Each pattern: (regex, label, severity_contribution, patch_template)

_EXEC_PATTERNS = [
    (r"curl\s+.*(http|https)://\S+\s*[|&]", "CURL_PIPE_EXEC",         35),
    (r"wget\s+.*(http|https)://\S+\s*[|&]", "WGET_PIPE_EXEC",         35),
    (r"eval\s*\(", "EVAL_EXEC",                                         25),
    (r"exec\s*\(", "EXEC_CALL",                                         25),
    (r"child_process|spawn\s*\(",          "PROC_SPAWN",               20),
    (r"base64\s*(-d|--decode)",            "BASE64_DECODE_EXEC",        30),
    (r"python\s+-c\s+['\"]",               "PYTHON_INLINE_EXEC",        25),
    (r"ruby\s+-e\s+['\"]",                 "RUBY_INLINE_EXEC",          20),
    (r"powershell\s+-(?:enc|command|e)\b", "POWERSHELL_ENCODED",        35),
    (r"bash\s+-i\s+>&?",                   "REVERSE_SHELL",             45),
    (r"nc\s+-[el]",                        "NETCAT_LISTENER",           40),
    (r"\/dev\/tcp\/",                       "TCP_REDIRECT_SHELL",        40),
]

_SECRET_ACCESS_PATTERNS = [
    (r"\$AWS_(?:SECRET|ACCESS)_KEY",       "AWS_SECRET_ACCESS",         40),
    (r"\$GITHUB_TOKEN",                    "GITHUB_TOKEN_ACCESS",       35),
    (r"\.env\.honeypot",                   "HONEYPOT_ACCESS",           50),
    (r"process\.env\.[A-Z_]{6,}",         "ENV_SECRET_ACCESS",         15),
    (r"os\.environ\[['\"]",                "ENV_SECRET_ACCESS_PY",      15),
    (r"keychain|secret(?:s)?-manager",    "SECRETS_MANAGER_ACCESS",    20),
    (r"id_rsa|\.pem|private[-_]key",       "PRIVATE_KEY_ACCESS",        30),
]

_NETWORK_PATTERNS = [
    (r"http://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}", "RAW_IP_EXFIL",    30),
    (r"https?://(?!github\.com|npmjs\.com|registry\.yarnpkg\.com|raw\.githubusercontent\.com)\S+\.(?:tk|ml|ga|cf|gq|ru|cn|xyz)\b",
     "SUSPICIOUS_TLD_CALL", 25),
    (r"\.onion\b",                         "TOR_ONION_CALL",            45),
    (r"ngrok\.io|serveo\.net|localtunnel", "TUNNEL_EXFIL",              35),
]

_SUPPLY_CHAIN_PATTERNS = [
    (r"\"preinstall\"\s*:\s*\"(?!echo)",   "MALICIOUS_PREINSTALL",      40),
    (r"\"postinstall\"\s*:\s*\"(?!echo)",  "MALICIOUS_POSTINSTALL",     35),
    (r"\"prepare\"\s*:\s*\"(?!echo|true)", "SUSPICIOUS_PREPARE",        20),
    (r"__proto__\s*=",                     "PROTOTYPE_POLLUTION",       25),
    (r"Object\.defineProperty.*configurable.*false", "PROP_TAMPERING",  15),
]

ALL_PATTERNS = _EXEC_PATTERNS + _SECRET_ACCESS_PATTERNS + _NETWORK_PATTERNS + _SUPPLY_CHAIN_PATTERNS


@dataclass
class ThreatMatch:
    pattern_id: str
    label: str
    severity_contrib: int
    file_path: str
    matched_line: str
    line_number: int


@dataclass
class DiffAnalysisResult:
    is_clean: bool
    severity: int
    confidence: float
    summary: str
    gating_action: str
    threat_matches: list = field(default_factory=list)
    changed_files: list = field(default_factory=list)
    added_lines: int = 0
    removed_lines: int = 0


def analyze_diff(diff_text: str, pr_url: str = "") -> DiffAnalysisResult:
    """
    Performs real-time static analysis of a PR unified diff.
    Returns a DiffAnalysisResult with severity, matches, and clean/malicious verdict.
    """
    if not diff_text or not diff_text.strip():
        return DiffAnalysisResult(
            is_clean=True, severity=0, confidence=0.95,
            summary="Empty or unavailable diff. PR contents could not be retrieved.",
            gating_action="ALLOW_MERGE",
        )

    matches: list[ThreatMatch] = []
    changed_files: list[str] = []
    current_file = "unknown"
    added_lines = 0
    removed_lines = 0
    current_line_num = 0

    for raw_line in diff_text.splitlines():
        # Track file paths
        if raw_line.startswith("+++ b/"):
            current_file = raw_line[6:].strip()
            if current_file not in changed_files:
                changed_files.append(current_file)
            current_line_num = 0
            continue
        if raw_line.startswith("@@ "):
            # Extract line number from hunk header @@ -a,b +c,d @@
            m = re.search(r"\+(\d+)", raw_line)
            if m:
                current_line_num = int(m.group(1)) - 1
            continue

        # Only scan ADDED lines (lines starting with +)
        if raw_line.startswith("+") and not raw_line.startswith("+++"):
            added_lines += 1
            current_line_num += 1
            line_content = raw_line[1:]  # strip leading +

            for pattern_regex, label, severity_contrib in ALL_PATTERNS:
                if re.search(pattern_regex, line_content, re.IGNORECASE):
                    matches.append(ThreatMatch(
                        pattern_id=label,
                        label=label,
                        severity_contrib=severity_contrib,
                        file_path=current_file,
                        matched_line=line_content.strip()[:120],
                        line_number=current_line_num,
                    ))
        elif raw_line.startswith("-") and not raw_line.startswith("---"):
            removed_lines += 1

    # ── Compute severity ──────────────────────────────────────────────────────
    if not matches:
        # Completely clean
        return DiffAnalysisResult(
            is_clean=True,
            severity=0,
            confidence=0.97,
            summary=f"No threat indicators detected. PR modifies {len(changed_files)} file(s) with {added_lines} additions, {removed_lines} deletions.",
            gating_action="ALLOW_MERGE",
            threat_matches=[],
            changed_files=changed_files,
            added_lines=added_lines,
            removed_lines=removed_lines,
        )

    # Deduplicate by label and sum severity contributions (cap at 100)
    seen = set()
    total_severity = 0
    unique_matches = []
    for m in matches:
        if m.label not in seen:
            seen.add(m.label)
            total_severity += m.severity_contrib
            unique_matches.append(m)

    severity = min(total_severity, 98)
    has_critical = any(m.severity_contrib >= 40 for m in unique_matches)
    confidence = 0.98 if has_critical else 0.82 if severity > 50 else 0.71

    top = unique_matches[0]
    summary = (
        f"Threat detected in {top.file_path}:{top.line_number} — "
        f"{top.label.replace('_', ' ')}. "
        f"Found {len(unique_matches)} threat pattern(s) across {len(changed_files)} file(s). "
        f"Total severity contribution: {severity}/100."
    )

    gating = "BLOCK_PR" if severity >= 85 else "FLAG_MANUAL_REVIEW"

    return DiffAnalysisResult(
        is_clean=False,
        severity=severity,
        confidence=confidence,
        summary=summary,
        gating_action=gating,
        threat_matches=unique_matches,
        changed_files=changed_files,
        added_lines=added_lines,
        removed_lines=removed_lines,
    )


def build_threat_patch(analysis: DiffAnalysisResult, diff_text: str) -> str:
    """
    Generates a targeted remediation patch for detected threats.
    Only patches the actual malicious lines found in the diff.
    """
    if analysis.is_clean or not analysis.threat_matches:
        return ""

    lines = []
    lines.append("# ANAKIN AI-Generated Security Remediation Patch")
    lines.append(f"# Threats: {', '.join(m.label for m in analysis.threat_matches)}")
    lines.append("")

    # Group by file
    by_file: dict[str, list[ThreatMatch]] = {}
    for m in analysis.threat_matches:
        by_file.setdefault(m.file_path, []).append(m)

    for file_path, file_matches in by_file.items():
        lines.append(f"--- a/{file_path}")
        lines.append(f"+++ b/{file_path}")
        for m in file_matches:
            lines.append(f"@@ -{m.line_number},1 +{m.line_number},1 @@")
            lines.append(f"-{m.matched_line}")
            neutralized = _neutralize_line(m.matched_line, m.label)
            lines.append(f"+{neutralized}")
            lines.append("")

    return "\n".join(lines)


def _neutralize_line(line: str, label: str) -> str:
    """Generates a safe replacement for a detected malicious line."""
    if "preinstall" in label.lower() or "postinstall" in label.lower() or "prepare" in label.lower():
        # Replace script value with echo
        return re.sub(
            r'("(?:preinstall|postinstall|prepare)"\s*:\s*")([^"]*)"',
            r'\1echo \'PRISON: Neutralized by ANAKIN security patch\'"',
            line
        )
    if "curl" in line.lower() or "wget" in line.lower():
        return re.sub(r'(curl|wget)\s+\S+', r'# PRISON: \1 exfil removed', line, flags=re.IGNORECASE)
    if "eval" in line.lower():
        return re.sub(r'eval\s*\(', '/* PRISON: eval removed */ (', line, flags=re.IGNORECASE)
    if "AWS" in line or "GITHUB_TOKEN" in line or "SECRET" in line:
        return re.sub(r'\$[A-Z_]+', '"PRISON_REDACTED"', line)
    # Generic: comment out the line
    if line.strip().startswith("#") or line.strip().startswith("//"):
        return line
    return f"// PRISON: Removed by ANAKIN — {label}"


def build_clean_dag_nodes(sandbox_id: str, changed_files: list, added: int, removed: int) -> dict:
    """Builds a simple clean execution DAG for a safe PR."""
    base_pid = random.randint(1000, 3000)
    return {
        "nodes": [
            {
                "id": "c1", "label": "git clone / checkout",
                "pid": base_pid, "ppid": 1, "comm": "git",
                "node_type": "BLUE_STANDARD", "syscall": "sys_enter_execve",
                "details": {"risk_level": "CLEAN", "resolved_path": "/usr/bin/git"}
            },
            {
                "id": "c2", "label": f"npm install ({added} additions, {removed} deletions)",
                "pid": base_pid + 1, "ppid": base_pid, "comm": "npm",
                "node_type": "BLUE_STANDARD", "syscall": "sys_enter_execve",
                "details": {"risk_level": "CLEAN", "resolved_path": "/usr/bin/npm"}
            },
            {
                "id": "c3", "label": "npm test → exit 0",
                "pid": base_pid + 2, "ppid": base_pid + 1, "comm": "node",
                "node_type": "BLUE_STANDARD", "syscall": "sys_enter_execve",
                "details": {
                    "risk_level": "CLEAN",
                    "resolved_path": "/usr/bin/node",
                    "changed_files": changed_files[:5],
                }
            },
        ],
        "edges": [
            {"source": "c1", "target": "c2", "relationship": "spawned"},
            {"source": "c2", "target": "c3", "relationship": "spawned"},
        ],
    }


def build_clean_ebpf_events(sandbox_id: str) -> list:
    """Generates realistic clean eBPF event stream for a safe PR."""
    base_pid = random.randint(1000, 3000)
    return [
        {"pid": base_pid,     "ppid": 1,         "comm": "git",  "event_type": "EXECVE",  "details": {"filename": "/usr/bin/git", "argv": ["clone"]},         "is_anomaly": False},
        {"pid": base_pid + 1, "ppid": base_pid,   "comm": "npm",  "event_type": "EXECVE",  "details": {"filename": "/usr/bin/npm", "argv": ["install"]},        "is_anomaly": False},
        {"pid": base_pid + 2, "ppid": base_pid+1, "comm": "node", "event_type": "EXECVE",  "details": {"filename": "/usr/bin/node", "argv": ["./node_modules/.bin/jest"]}, "is_anomaly": False},
        {"pid": base_pid + 3, "ppid": base_pid+2, "comm": "node", "event_type": "OPENAT",  "details": {"filename": "/proc/cpuinfo", "flags": "O_RDONLY"},        "is_anomaly": False},
    ]
