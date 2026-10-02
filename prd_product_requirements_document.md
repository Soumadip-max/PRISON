# Product Requirements Document (PRD)

## Project Name
**PRISON** (Pull Request Isolation & Security Observation Network)

## Domain
**Cybersecurity / DevSecOps** with **AI Agentic Execution**

---

## 1. Executive Summary & Problem Statement

Modern software development relies heavily on third-party dependencies and open-source packages. Traditional security tooling relies on **Static Application Security Testing (SAST)** and static dependency parsing. These tools are inherently blind to **dynamic supply chain attacks**, such as:
- Obfuscated malicious `preinstall` / `postinstall` scripts in npm/pip packages.
- Zero-day runtime credential harvesting targeting build-time environment variables.
- Silent outbound data exfiltration via background sockets during CI/CD test execution.

**PRISON** solves this by establishing a runtime detonation pipeline for every Pull Request. It executes untrusted code inside isolated microVMs, monitors real-time system calls using eBPF, traps secret exfiltration attempts with honeypots, and leverages an AI Agent to explain threats and author fix patches.

---

## 2. Product Objectives & Target Audience

### Objectives
* **Zero-Trust CI/CD Execution:** Execute incoming PR code in complete isolation before merging into `main`.
* **Behavioral Detection over Static Rules:** Detect malicious activity through low-level system call observation (`execve`, `connect`, `openat`).
* **Automated Remediation:** Reduce DevSecOps triage time from hours to seconds by auto-generating fix PRs.

### Target Audience
* Enterprise Engineering Teams operating high-security software pipelines.
* Open Source Maintainers receiving untrusted external contributions.
* DevSecOps & Security Operations (SecOps) engineers.

---

## 3. Core Features & Track Mapping

| Feature | Track Alignment | Description |
| :--- | :--- | :--- |
| **MicroVM Detonation Engine** | `MANTITUP` | Ephemeral Firecracker microVM provisioning (<100ms startup) with network isolate policy and honeypot env seeding. |
| **eBPF Kernel Probes** | `OSEN` | Low-level kernel observation capturing syscall events, socket creations, and process tree mutations. |
| **Unified Event Pipeline** | `TRACECOMMON` | Ingestion, normalization, and graph schema formatting for raw kernel logs and network flows. |
| **Autonomous AI Remediation** | `ANAKIN` | LLM Security Agent that evaluates threat levels, generates Attack Graphs, and pushes fix patches to GitHub. |

---

## 4. User Personas & User Flow

```
+-------------------+      +---------------------+      +---------------------+
|   PR Developer    | ---> |  GitHub PR Trigger  | ---> | PRISON Detonation   |
+-------------------+      +---------------------+      +----------+----------+
                                                                   |
                                                                   v
+-------------------+      +---------------------+      +---------------------+
| GitHub PR Comment | <--- | ANAKIN AI Remediation| <--- | OSEN eBPF Telemetry |
+-------------------+      +---------------------+      +---------------------+
```

1. **Developer opens a PR:** Modifies `package.json` or adds a new build script.
2. **PRISON Webhook triggers:** Intercepts payload and provisions a `MANTITUP` Firecracker microVM.
3. **Execution & Trapping:** Untrusted `npm install` runs. The `OSEN` eBPF probe traces process execution while `TRACECOMMON` streams event data.
4. **Threat Detection:** Script attempts to read `$AWS_SECRET_ACCESS_KEY` (a synthetic honeypot). Execution is halted immediately.
5. **Agent Remediation:** `ANAKIN` analyzes the trace, leaves a detailed GitHub comment with the attack tree, and commits a patch removing the malicious package.

---

## 5. Non-Functional Requirements

* **Performance:** MicroVM boot time must be under 150ms. Total pipeline execution overhead should not exceed 10 seconds over standard build times.
* **Security & Containment:** Hard isolation via KVM hardware virtualization. No shared kernel state between host and guest.
* **Reliability:** Ephemeral VM cleanup on complete, failed, or timed-out executions to prevent resource exhaustion.