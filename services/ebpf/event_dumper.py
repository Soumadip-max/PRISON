"""
Raw eBPF Event Log Dumper (`OSEN` Track).
Dumps raw timestamped JSON event telemetry tagged by Sandbox ID and Execution Context.
"""

import json
import os
from typing import List, Dict, Any
from services.orchestrator.schemas import SyscallEvent


class EventDumper:
    """
    Serializes and writes raw timestamped eBPF log dumps to filesystem or stream.
    """

    def __init__(self, output_dir: str = "/tmp/prison_logs"):
        self.output_dir = output_dir

    def dump_events_to_file(self, sandbox_id: str, events: List[SyscallEvent]) -> str:
        """
        Dumps raw events list to a JSON file named by sandbox_id.
        """
        os.makedirs(self.output_dir, exist_ok=True)
        filename = f"ebpf_trace_{sandbox_id}.json"
        filepath = os.path.join(self.output_dir, filename)

        serialized = [event.model_dump() for event in events]

        with open(filepath, "w", encoding="utf-8") as f:
            json.dump({"sandbox_id": sandbox_id, "count": len(events), "events": serialized}, f, indent=2)

        return filepath

    def dump_to_json_string(self, sandbox_id: str, events: List[SyscallEvent]) -> str:
        """
        Returns JSON string representation of captured events.
        """
        serialized = [event.model_dump() for event in events]
        return json.dumps({"sandbox_id": sandbox_id, "count": len(events), "events": serialized}, indent=2)
