"""
ANAKIN AI Agent Triage Engine with LLM Integration and Rule R08 Confidence Gating.
Now uses LLMFactory for multi-provider support: DeepSeek → OpenAI → Anthropic → rule-based.
"""

import json
import os
from typing import Any, Dict, Optional

from services.agent.triage.prompts import SYSTEM_TRIAGE_PROMPT, USER_TRIAGE_PROMPT_TEMPLATE
from services.agent.triage.schemas import GatingAction, ThreatReport
from services.telemetry.schemas.graph import ExecutionDAG, NodeType
from services.agent.llm_factory import LLMFactory


class AnakinTriageEngine:
    """
    Evaluates telemetry DAGs, interacts with LLM providers, and enforces PR build gating.
    """

    def __init__(self, api_key: Optional[str] = None, model: str = "gpt-4o"):
        # Legacy single-key init kept for backward compat; factory takes priority
        self.api_key = api_key or os.getenv("OPENAI_API_KEY") or os.getenv("ANTHROPIC_API_KEY")
        self.model = model
        # Prefer factory-resolved provider (DeepSeek > OpenAI > Anthropic > None)
        self._llm_provider = LLMFactory.get_provider()
        self._provider_name = LLMFactory.get_provider_name()

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
        Calls the LLM provider resolved by LLMFactory.
        Priority: DeepSeek (deepseek-chat) → OpenAI (gpt-4o) → Anthropic → rule-based.
        Falls back to rule-based triage on any failure.
        """
        provider = self._llm_provider
        if provider is None:
            return self._rule_based_triage(dag)

        try:
            dag_json = json.dumps({
                "execution_id": dag.execution_id,
                "total_nodes": len(dag.nodes),
                "has_honeypot_hit": dag.has_honeypot_hit,
                "has_malicious_node": dag.has_malicious_node,
                "nodes": [n.model_dump(mode="json") for n in dag.nodes],
                "edges": [e.model_dump(mode="json") for e in dag.edges],
            })
            result = await provider.call_triage(dag_json)
            if result and isinstance(result, dict):
                import logging
                logging.getLogger(__name__).info(
                    f"[ANAKIN] LLM triage succeeded via {provider.provider_name}."
                )
                return result
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(
                f"[ANAKIN] LLM triage failed ({provider.provider_name}): {e}. Falling back to rule-based."
            )

        return self._rule_based_triage(dag)
