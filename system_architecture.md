# System Architecture Specification

## Architecture Overview

PRISON uses a microservices architecture organized around isolated execution environments, low-overhead kernel probes, normalized event pipelines, and an autonomous AI agent engine.

```
                                  +-------------------+
                                  |  GitHub Webhook   |
                                  +---------+---------+
                                            |
                                            v
+-------------------------------------------+-------------------------------------------+
|                            PRISON Core API & Orchestrator                             |
+---------------+-------------------------------------------+---------------------------+
                |                                           |
                v                                           v
  +-------------+---------------------------+   +-----------+---------------------------+
  |    MANTITUP Track: Isolation Layer     |   |    OSEN Track: System Observability       |
  |  - Firecracker microVM Controller       |   |  - eBPF Kernel Probes                     |
  |  - Honeypot Decoy Injector              |   |  - Syscall Interception (`execve`, etc.)  |
  +-------------+---------------------------+   +-----------+---------------------------+
                |                                           |
                +---------------------+---------------------+
                                      |
                                      v
                        +-------------+---------------------------+
                        |  TRACECOMMON Track: Telemetry Pipeline  |
                        |  - Event Ingestion & Standardizer       |
                        |  - Redis Stream / PostgreSQL Storage      |
                        +-------------+---------------------------+
                                      |
                                      v
                        +-------------+---------------------------+
                        |   ANAKIN Track: Agent Execution Engine  |
                        |  - Attack Execution Path Generator      |
                        |  - Automated Git Patch & Remediation    |
                        +-------------+---------------------------+
                                      |
                                      v
                        +-------------+---------------------------+
                        | PRISON Web Dashboard & GitHub API       |
                        +-----------------------------------------+
```

---

## Component Deep Dive

### 1. Isolation Layer (`MANTITUP`)
* **Technology:** Firecracker MicroVMs, KVM, Docker Cgroups.
* **Mechanism:** Spawns minimalist Linux kernels per PR run. Sets up read-only root filesystems and dynamically injects dummy environment variables (`AWS_ACCESS_KEY_ID=AKIA_HONEYPOT_PRISON_DEMO`).

### 2. Kernel Observability Probes (`OSEN`)
* **Technology:** eBPF (Extended Berkeley Packet Filter), C / Go Probes.
* **Mechanism:** Attaches tracepoints and kprobes to critical kernel hooks:
  * `sys_enter_execve`: Tracks binary execution and child processes.
  * `sys_enter_connect`: Intercepts socket initiation and outbound destination IPs.
  * `sys_enter_openat`: Detects unauthorized access to `/etc/shadow`, `.env`, or honeypots.

### 3. Unified Telemetry Engine (`TRACECOMMON`)
* **Technology:** FastAPI, Redis, PostgreSQL, OpenTelemetry standard formats.
* **Mechanism:** Receives raw JSON-encoded eBPF events from `OSEN`, normalizes timestamps, maps process PIDs to dependency call stacks, and builds a directed acyclic graph (DAG) representation.

### 4. Autonomous Remediation Agent (`ANAKIN`)
* **Technology:** Python, LangChain, OpenAI GPT-4o / Local LLM adapters, GitPython.
* **Mechanism:** Evaluates the serialized DAG. Identifies compromised packages, generates a human-readable threat matrix, writes a patch targeting `package.json`/`requirements.txt`, and commits the patch to the GitHub pull request branch.