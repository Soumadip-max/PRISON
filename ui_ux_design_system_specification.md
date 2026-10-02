# UI/UX & Visual Design System

## 1. Design Philosophy

PRISON's visual identity reflects high-tech security, transparency, and actionable insights. The design prioritizes immediate threat visibility through visual execution trees and high-contrast alert indicators.

---

## 2. Color Palette & Theme

The interface operates strictly in a **Dark Security Mode**:

```
+-----------------------------------------------------------------+
| Background Primary  : #090D16 (Deep Space Dark)                |
| Card Surface        : #111827 (Slate Dark)                      |
| Primary Brand / OSEN: #3B82F6 (Electric Blue)                   |
| Threat Alert Red    : #EF4444 (Crimson Red)                     |
| Honeypot Amber      : #F59E0B (Amber Warning)                    |
| Success Green       : #10B981 (Emerald Green)                  |
| Text Primary        : #F9FAFB (High Contrast White)            |
+-----------------------------------------------------------------+
```

---

## 3. Key Dashboard Components

### A. Attack Execution Tree (`TRACECOMMON` + React Flow)
* **Visual Graph:** Displays the process hierarchy.
* **Node Types:**
  * **Blue Nodes:** Standard build steps (`npm test`, `python setup.py`).
  * **Amber Nodes:** Honeypot access attempts.
  * **Red Nodes:** Suspicious binary executions or unauthorized socket connections.

### B. eBPF Real-Time Telemetry Feed (`OSEN`)
* Streaming terminal widget showing raw system events (`SYSCALL: execve`, `PID: 4102`, `DEST: 192.168.1.5:8080`).

### C. Agentic Remediation Panel (`ANAKIN`)
* Side-by-side Git diff viewer highlighting malicious dependencies and presenting one-click fix approvals.