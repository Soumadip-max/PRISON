# Technical Execution Walkthrough: PRISON Engine Core

**Role:** Backend Lead (Developer 3) — PRISON Engine Core  
**Tracks Owned:** `MANTITUP` (Isolation & Honeypots), `OSEN` (Kernel Observability), GitHub Ingestion Engine  
**Directories Scope:** `services/orchestrator/`, `services/isolation/`, `services/ebpf/`

---

## 🎯 Architecture Overview & Component Boundaries

The **PRISON Engine Core** acts as the dynamic detonation engine for untrusted GitHub Pull Requests. It intercepts PR webhooks, spawns isolated microVM execution sandboxes with decoy credentials (honeypots), attaches eBPF kernel probes to trace system behavior, and normalizes telemetry into the `TRACECOMMON` schema format for downstream security analysis.

```
+-----------------------------------------------------------------------------------+
|                            services/orchestrator                                  |
|  FastAPI Webhook Server (`/api/v1/webhook/github`) + HMAC Validator + Dispatcher   |
+------------------------------------------+----------------------------------------+
                                           |
                    +----------------------+----------------------+
                    v                                             v
+----------------------------------------+   +----------------------------------------+
|           services/isolation           |   |             services/ebpf              |
|  `MANTITUP` MicroVM Sandbox Runner     |   |  `OSEN` eBPF Kernel Event Listener     |
|  - Firecracker / Docker Isolation      |   |  - Tracepoints (`execve`, `connect`,   |
|  - Synthetic Honeypot Injector         |   |    `openat`)                           |
|  - Decoy Envs: AWS, JWT, .env          |   |  - Kernel Event Stream & Dumper        |
+----------------------------------------+   +----------------------------------------+
                    |                                             |
                    +----------------------+----------------------+
                                           v
+-----------------------------------------------------------------------------------+
|                        TRACECOMMON Schema Handoff                                 |
|               Normalized JSON Event Payload to Dev 4 Pipeline                     |
+-----------------------------------------------------------------------------------+
```

---

## 📋 Implementation Steps Breakdown

### Step 1: FastAPI Webhook Route & HMAC Signature Validator (`services/orchestrator/`)
- **Module:** `webhook_router.py`, `signature_validator.py`, `job_dispatcher.py`
- **Responsibilities:**
  - Expose `POST /api/v1/webhook/github` receiving GitHub PR events.
  - Verify `X-Hub-Signature-256` header against `GITHUB_WEBHOOK_SECRET` using HMAC SHA-256.
  - Validate and parse `pull_request.opened` and `pull_request.synchronize` actions using Pydantic models.
  - Asynchronously queue detonation jobs for processing without blocking the webhook ACK (responds within <100ms with HTTP 202 Accepted).

### Step 2: MicroVM Sandbox Runner & Honeypot Injector (`services/isolation/`)
- **Module:** `sandbox_runner.py`, `honeypot_injector.py`, `vm_config.py`
- **Responsibilities:**
  - Spawns ephemeral Firecracker microVM execution sandboxes (with Docker sandbox fallback adapter for standard environments).
  - Enforces hard execution timeouts (default: 30 seconds), memory limits, and isolated net namespaces.
  - **Decoy Credential Seeding (`MANTITUP`):** Dynamically injects decoy environment variables and honeypot files into the runtime context:
    - `AWS_ACCESS_KEY_ID="AKIA_PRISON_DECOY_9982"`
    - `AWS_SECRET_ACCESS_KEY="prison_decoy_secret_key_883719472"`
    - `JWT_SECRET="ey_prison_decoy_jwt_token_production_fake"`
    - `.env` file pre-loaded into workspace root.
  - Executes package build / setup scripts (e.g. `npm install`, `pip install`, `make`).
  - Cleans up and destroys microVM resources on execution complete/timeout.

### Step 3: eBPF Kernel Event Listener & Log Dumper (`services/ebpf/`)
- **Module:** `ebpf_tracer.py`, `probes.c`, `event_dumper.py`
- **Responsibilities:**
  - Attaches low-level kernel probes to intercept system calls during build execution:
    - `sys_enter_execve`: Process spawns, command-line arguments, parent process PIDs.
    - `sys_enter_connect`: Socket connection initiation, target IP/port destination.
    - `sys_enter_openat`: Sensitive file reads targeting `.env`, `/etc/shadow`, ssh keys, or decoy honeypot paths.
  - Ring buffer reader for high-throughput zero-loss kernel telemetry collection.
  - Generates raw timestamped JSON log dumps tagged by Sandbox ID and Execution Context.

### Step 4: Inter-Service Event Handoff Interface to `TRACECOMMON` (Dev 4)
- **Module:** `tracecommon_handoff.py`, `schemas.py`
- **Responsibilities:**
  - Transforms raw eBPF events and honeypot trigger alerts into the standardized `TRACECOMMON` JSON format.
  - Hands off structured event payloads to Developer 4's Telemetry Pipeline via direct REST call or internal event queue interface.

---

## 📐 Data Models & Interface Contracts

### 1. GitHub Webhook Payload Schema (`services/orchestrator/schemas.py`)
```python
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class RepositoryInfo(BaseModel):
    id: int
    name: str
    full_name: str
    clone_url: str
    default_branch: str

class PullRequestHead(BaseModel):
    ref: str
    sha: str
    clone_url: Optional[str] = None

class PullRequestInfo(BaseModel):
    number: int
    state: str
    title: str
    head: PullRequestHead

class GitHubWebhookPayload(BaseModel):
    action: str
    number: int
    pull_request: PullRequestInfo
    repository: RepositoryInfo
    sender: Dict[str, Any]
```

### 2. MicroVM Sandbox & Honeypot Config Schema (`services/isolation/schemas.py`)
```python
class HoneypotCredentials(BaseModel):
    AWS_ACCESS_KEY_ID: str = "AKIA_PRISON_DECOY_9982"
    AWS_SECRET_ACCESS_KEY: str = "prison_decoy_secret_key_883719472"
    JWT_SECRET: str = "ey_prison_decoy_jwt_token_production_fake"
    DATABASE_URL: str = "postgres://decoy_user:decoy_pass@127.0.0.1:5432/decoy_db"

class SandboxExecutionRequest(BaseModel):
    sandbox_id: str
    repo_url: str
    commit_sha: str
    pr_number: int
    timeout_seconds: int = 30
    honeypots: HoneypotCredentials = Field(default_factory=HoneypotCredentials)
```

### 3. TRACECOMMON Standardized Event Schema (`services/orchestrator/schemas.py` / `services/ebpf/schemas.py`)
```python
from enum import Enum

class EventType(str, Enum):
    EXECVE = "EXECVE"
    CONNECT = "CONNECT"
    OPENAT = "OPENAT"
    HONEYPOT_TRIGGER = "HONEYPOT_TRIGGER"

class SyscallEvent(BaseModel):
    event_id: str
    sandbox_id: str
    timestamp: float
    pid: int
    ppid: int
    comm: str
    event_type: EventType
    details: Dict[str, Any]  # e.g., args, target_ip, target_file, decoy_accessed
    is_anomaly: bool = False

class TraceCommonPayload(BaseModel):
    sandbox_id: str
    repo_name: str
    pr_number: int
    commit_sha: str
    status: str  # "COMPLETED", "TIMEOUT", "HONEYPOT_HALTED"
    total_events: int
    events: List[SyscallEvent]
    honeypot_triggered: bool
    triggered_decoy: Optional[str] = None
```

---

## 🛠 Created File Structure

```
services/
├── orchestrator/
│   ├── __init__.py
│   ├── main.py
│   ├── schemas.py
│   ├── signature_validator.py
│   ├── webhook_router.py
│   ├── job_dispatcher.py
│   └── tracecommon_handoff.py
├── isolation/
│   ├── __init__.py
│   ├── schemas.py
│   ├── sandbox_runner.py
│   ├── honeypot_injector.py
│   └── vm_config.py
└── ebpf/
    ├── __init__.py
    ├── schemas.py
    ├── ebpf_tracer.py
    ├── probes.c
    └── event_dumper.py
tests/
├── test_signature_validator.py
├── test_isolation.py
├── test_ebpf.py
└── test_orchestrator.py
```

---

## 🚦 Verification Results & Status

- **Step 1: FastAPI Orchestrator & HMAC signature validator (`services/orchestrator/`):** ✅ Completed & Tested.
- **Step 2: MicroVM Execution Sandbox & Synthetic Honeypot Injector (`services/isolation/`):** ✅ Completed & Tested (`MANTITUP`).
- **Step 3: eBPF Kernel Event Listener & Event Log Dumper (`services/ebpf/`):** ✅ Completed & Tested (`OSEN`).
- **Step 4: Inter-Service Handoff to `TRACECOMMON` Pipeline:** ✅ Completed & Tested.

### Automated Test Suite Execution:
```bash
python run_tests.py
Ran 11 tests in 2.372s - OK
```
All unit and integration test suites passed with 100% success rate.

