"""
ANAKIN AI Agent Triage Engine with LLM Integration and Rule R08 Confidence Gating.
"""

import json
import os
from typing import Any, Dict, Optional

from services.agent.triage.prompts import SYSTEM_TRIAGE_PROMPT, USER_TRIAGE_PROMPT_TEMPLATE
from services.agent.triage.schemas import GatingAction, ThreatReport
from services.telemetry.schemas.graph import ExecutionDAG, NodeType


class AnakinTriageEngine:
    """
    Evaluates telemetry DAGs, interacts with LLM providers, and enforces PR build gating.
    """

    def __init__(self, api_key: Optional[str] = None, model: str = "gpt-4o"):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY") or os.getenv("ANTHROPIC_API_KEY")
        self.model = model

    async def evaluate_dag(self, dag: ExecutionDAG) -> ThreatReport:
        """
        Main entrypoint: parses the ExecutionDAG and yields a structured ThreatReport.
        """
        # If an API key is available, call the LLM; otherwise use rule-based empirical analysis fallback
        if self.api_key:
            report_dict = await self._call_llm_triage(dag)
        else:
            report_dict = self._rule_based_triage(dag)

        # Enforce Rule R08: Confidence Score Gating
        threat_detected = report_dict.get("threat_detected", False)
        confidence = float(report_dict.get("confidence_score", 0.0))

        if threat_detected:
            if confidence >= 0.85:
                gating = GatingAction.BLOCK_PR
            else:
                gating = GatingAction.FLAG_MANUAL_REVIEW
        else:
            gating = GatingAction.ALLOW_MERGE

        return ThreatReport(
            execution_id=dag.execution_id,
            threat_detected=threat_detected,
            severity_score=int(report_dict.get("severity_score", 0)),
            confidence_score=confidence,
            summary=report_dict.get("summary", "No threat detected."),
            attack_vector=report_dict.get("attack_vector", "None"),
            compromised_files=report_dict.get("compromised_files", []),
            suggested_action=report_dict.get("suggested_action", "Pass build."),
            gating_action=gating,
        )

    def _rule_based_triage(self, dag: ExecutionDAG) -> Dict[str, Any]:
        """
        Empirical rule-based fallback when LLM API keys are absent.
        """
        nodes = dag.nodes
        honeypot_nodes = [n for n in nodes if n.node_type == NodeType.AMBER_HONEYPOT]
        malicious_nodes = [n for n in nodes if n.node_type == NodeType.RED_MALICIOUS]

        compromised_files = []
        for n in honeypot_nodes + malicious_nodes:
            if n.details.get("resolved_path"):
                compromised_files.append(n.details["resolved_path"])

        if honeypot_nodes:
            return {
                "threat_detected": True,
                "severity_score": 95,
                "confidence_score": 0.98,
                "summary": f"Decoy Honeypot secret key accessed by process '{honeypot_nodes[0].comm}' (PID: {honeypot_nodes[0].pid}).",
                "attack_vector": f"Process {honeypot_nodes[0].comm} executed syscall '{honeypot_nodes[0].syscall}' targetting honeypot key AWS_ACCESS_KEY_ID=AKIA_HONEYPOT_PRISON_DEMO.",
                "compromised_files": list(set(compromised_files)),
                "suggested_action": "Block pull request, remove malicious preinstall script, and isolate developer key.",
            }
        elif malicious_nodes:
            return {
                "threat_detected": True,
                "severity_score": 80,
                "confidence_score": 0.88,
                "summary": f"Suspicious process execution or unauthorized socket connection detected: '{malicious_nodes[0].comm}'.",
                "attack_vector": f"Process {malicious_nodes[0].comm} attempted unauthorized action details: {malicious_nodes[0].details}.",
                "compromised_files": list(set(compromised_files)),
                "suggested_action": "Block pull request and remove suspicious dependency invocation.",
            }
        else:
            return {
                "threat_detected": False,
                "severity_score": 0,
                "confidence_score": 0.99,
                "summary": "Clean build execution. No honeypot hits or suspicious system calls detected.",
                "attack_vector": "None",
                "compromised_files": [],
                "suggested_action": "Pass build checks.",
            }

    async def _call_llm_triage(self, dag: ExecutionDAG) -> Dict[str, Any]:
        """
        Calls external LLM endpoint if configured.
        """
        # Fallback to rule-based parser if LLM request fails or library uninstalled
        try:
            import httpx
            async with httpx.AsyncClient(timeout=15.0) as client:
                prompt_content = USER_TRIAGE_PROMPT_TEMPLATE.format(
                    execution_id=dag.execution_id,
                    total_nodes=len(dag.nodes),
                    has_honeypot_hit=dag.has_honeypot_hit,
                    has_malicious_node=dag.has_malicious_node,
                    nodes_json=json.dumps([n.model_dump(mode="json") for n in dag.nodes]),
                    edges_json=json.dumps([e.model_dump(mode="json") for e in dag.edges]),
                )
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": self.model,
                        "messages": [
                            {"role": "system", "content": SYSTEM_TRIAGE_PROMPT},
                            {"role": "user", "content": prompt_content},
                        ],
                        "response_format": {"type": "json_object"},
                    },
                )
                if response.status_code == 200:
                    data = response.json()
                    content = data["choices"][0]["message"]["content"]
                    return json.loads(content)
        except Exception:
            pass

        return self._rule_based_triage(dag)
