# AGENT DIRECTIVES & STRICT CONTEXT BOUNDARIES
# Project: PRISON (Pull Request Isolation & Security Observation Network)
# Track Architecture Mapping: MANTITUP | OSEN | TRACECOMMON | ANAKIN

---

## 🛑 STRICT RULES (NON-NEGOTIABLE)

1. **TRACK ALIGNMENT INTEGRITY:**
   - **MANTITUP**: Isolation layer only (Firecracker MicroVMs, KVM, container containment, honeypot injection).
   - **OSEN**: Low-level kernel observability only (eBPF probes, syscalls: `execve`, `connect`, `openat`).
   - **TRACECOMMON**: Event ingestion, standardization, graph schema, data storage pipelines.
   - **ANAKIN**: Agentic AI triage, attack graph parsing, Git automated patch generation.
   - *DO NOT* mix business logic across track components.

2. **NO HALLUCINATED DEPENDENCIES:**
   - Use strictly verified dependencies defined in `requirements.txt`, `Cargo.toml`, or `package.json`.
   - Never import non-existent LLM modules, unverified eBPF libraries, or hallucinated APIs.
   - When importing eBPF components, verify C/Go kernel header compatibilities.

3. **CONSTRAINED FILE MODIFICATION SCOPE:**
   - Only edit or generate files inside the active module path requested.
   - NEVER modify configuration files (`docker-compose.yml`, root `.env`, or CI workflows) unless explicitly asked.
   - Keep mock datasets inside `tests/fixtures/` or designated mock modules.

4. **SECURITY & HONEYPOT CONTROLS:**
   - NEVER output real production credentials or private keys in test mocks or generated code.
   - All honeypot environment keys MUST follow the format: `AWS_ACCESS_KEY_ID=AKIA_HONEYPOT_PRISON_DEMO`.

5. **CODE STRUCTURE & TYPE SAFETY:**
   - Python code MUST use strict type hints (`Pydantic v2` / `mypy`).
   - Rust/Go eBPF probes MUST handle errors explicitly without panicking.
   - TypeScript/React dashboard code MUST maintain strict type definitions.

---

## 🛠️ PATH MAPPING & ARCHITECTURE CONSTRAINTS

```
/src
├── mantitup/      --> Firecracker MicroVM & Honeypot Injector
├── osen/          --> eBPF Kernel Probes (C/Go) & Syscall Traps
├── tracecommon/   --> Telemetry Ingestion, FastAPI, Graph Engine
└── anakin/        --> LangChain/LLM Agent, Attack Graph Parsing, Git Patching
```

*When asked to build or edit code, ALWAYS verify which module folder it belongs to before creating new files.*