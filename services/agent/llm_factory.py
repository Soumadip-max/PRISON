"""
LLM Provider Factory for ANAKIN Patch Agent (MODULE 3).

Supports multiple LLM providers with automatic fallback priority:
  1. DeepSeek Coder (primary — deepseek-coder or deepseek-chat)
  2. OpenAI GPT-4o
  3. Anthropic Claude
  4. Rule-based fallback (always available)

All providers share the same interface: async call_triage(dag) -> dict
and async call_patch(context) -> str (Unified Git Diff).
"""

import json
import os
import logging
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)


# ── System Prompts ─────────────────────────────────────────────────────────────

TRIAGE_SYSTEM_PROMPT = """You are ANAKIN, an AI security triage engine for the PRISON platform.
You analyze Linux kernel eBPF syscall traces (Directed Acyclic Graphs) from ephemeral PR sandboxes.

Your task: evaluate the execution DAG and return a JSON threat report.

Return ONLY valid JSON with these exact keys:
{
  "threat_detected": <bool>,
  "severity_score": <int 0-100>,
  "confidence_score": <float 0.0-1.0>,
  "summary": "<1 sentence summary>",
  "attack_vector": "<technical description>",
  "compromised_files": ["<file paths>"],
  "suggested_action": "<action string>"
}"""

PATCH_SYSTEM_PROMPT = """You are ANAKIN, an expert security remediation AI for the PRISON platform.
You generate GitHub Unified Git Diff patches to neutralize malicious code found in PRs.

STRICT OUTPUT RULES:
- Output ONLY valid Unified Git Diff format. No markdown. No explanations. No backticks.
- The diff must start with '--- a/<filename>' and '+++ b/<filename>'.
- Every removed malicious line starts with '-'. Every safe replacement starts with '+'.
- Do NOT include markdown commentary, code blocks, or backtick fences inside the diff.
- The replacement must be a safe, functional equivalent (e.g., echo 'disabled' instead of curl exfil).
- If no fix is possible, output: --- a/UNFIXABLE +++ b/UNFIXABLE @@ -1 +1 @@ -UNFIXABLE_MALICIOUS_CODE +# PRISON: Removed by ANAKIN security agent"""

PATCH_USER_TEMPLATE = """Security breach detected in PR execution sandbox.

Target file: {target_file}
Malicious patterns detected: {malicious_patterns}

Original file content:
{original_content}

Generate a Unified Git Diff patch that removes or neutralizes the malicious code.
Remember: Output ONLY the raw unified diff. No markdown. No explanation."""


# ── Provider Base ──────────────────────────────────────────────────────────────

class LLMProvider:
    """Abstract base for LLM providers."""

    provider_name: str = "base"

    async def call_triage(self, dag_json: str) -> Optional[dict]:
        raise NotImplementedError

    async def call_patch(self, target_file: str, original_content: str, malicious_patterns: list) -> Optional[str]:
        raise NotImplementedError


# ── DeepSeek Provider ──────────────────────────────────────────────────────────

class DeepSeekProvider(LLMProvider):
    """
    DeepSeek API provider using deepseek-coder for patch generation
    and deepseek-chat for triage reasoning.

    Base URL: https://api.deepseek.com
    Models: deepseek-coder, deepseek-chat
    """

    provider_name = "deepseek"
    BASE_URL = "https://api.deepseek.com/v1"

    def __init__(self, api_key: str, triage_model: str = "deepseek-chat", patch_model: str = "deepseek-coder"):
        self.api_key = api_key
        self.triage_model = triage_model
        self.patch_model = patch_model

    async def _post(self, model: str, messages: list, json_mode: bool = False) -> Optional[str]:
        """Core HTTP POST to DeepSeek API."""
        try:
            import httpx
            payload: Dict[str, Any] = {
                "model": model,
                "messages": messages,
                "temperature": 0.1,
                "max_tokens": 2048,
            }
            if json_mode:
                payload["response_format"] = {"type": "json_object"}

            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(
                    f"{self.BASE_URL}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json=payload,
                )
                if resp.status_code == 200:
                    return resp.json()["choices"][0]["message"]["content"]
                else:
                    logger.warning(f"[DEEPSEEK] HTTP {resp.status_code}: {resp.text[:200]}")
                    return None
        except ImportError:
            logger.warning("[DEEPSEEK] httpx not installed. Run: pip install httpx")
            return None
        except Exception as e:
            logger.error(f"[DEEPSEEK] Request failed: {e}")
            return None

    async def call_triage(self, dag_json: str) -> Optional[dict]:
        """Call DeepSeek for DAG triage. Returns parsed JSON dict or None."""
        messages = [
            {"role": "system", "content": TRIAGE_SYSTEM_PROMPT},
            {"role": "user", "content": f"Analyze this execution DAG and return a JSON threat report:\n\n{dag_json}"},
        ]
        content = await self._post(self.triage_model, messages, json_mode=True)
        if content:
            try:
                return json.loads(content)
            except json.JSONDecodeError:
                logger.error("[DEEPSEEK] Triage response is not valid JSON.")
        return None

    async def call_patch(self, target_file: str, original_content: str, malicious_patterns: list) -> Optional[str]:
        """Call DeepSeek Coder to generate a Unified Git Diff patch."""
        user_prompt = PATCH_USER_TEMPLATE.format(
            target_file=target_file,
            malicious_patterns=", ".join(malicious_patterns),
            original_content=original_content,
        )
        messages = [
            {"role": "system", "content": PATCH_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ]
        return await self._post(self.patch_model, messages, json_mode=False)


# ── OpenAI Provider ────────────────────────────────────────────────────────────

class OpenAIProvider(LLMProvider):
    """OpenAI GPT-4o provider."""

    provider_name = "openai"
    BASE_URL = "https://api.openai.com/v1"

    def __init__(self, api_key: str, model: str = "gpt-4o"):
        self.api_key = api_key
        self.model = model

    async def _post(self, messages: list, json_mode: bool = False) -> Optional[str]:
        try:
            import httpx
            payload: Dict[str, Any] = {
                "model": self.model,
                "messages": messages,
                "temperature": 0.1,
                "max_tokens": 2048,
            }
            if json_mode:
                payload["response_format"] = {"type": "json_object"}

            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(
                    f"{self.BASE_URL}/chat/completions",
                    headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"},
                    json=payload,
                )
                if resp.status_code == 200:
                    return resp.json()["choices"][0]["message"]["content"]
                logger.warning(f"[OPENAI] HTTP {resp.status_code}: {resp.text[:200]}")
                return None
        except Exception as e:
            logger.error(f"[OPENAI] Request failed: {e}")
            return None

    async def call_triage(self, dag_json: str) -> Optional[dict]:
        messages = [
            {"role": "system", "content": TRIAGE_SYSTEM_PROMPT},
            {"role": "user", "content": f"Analyze this execution DAG:\n\n{dag_json}"},
        ]
        content = await self._post(messages, json_mode=True)
        if content:
            try:
                return json.loads(content)
            except json.JSONDecodeError:
                pass
        return None

    async def call_patch(self, target_file: str, original_content: str, malicious_patterns: list) -> Optional[str]:
        messages = [
            {"role": "system", "content": PATCH_SYSTEM_PROMPT},
            {"role": "user", "content": PATCH_USER_TEMPLATE.format(
                target_file=target_file,
                malicious_patterns=", ".join(malicious_patterns),
                original_content=original_content,
            )},
        ]
        return await self._post(messages, json_mode=False)


# ── Anthropic Provider ─────────────────────────────────────────────────────────

class AnthropicProvider(LLMProvider):
    """Anthropic Claude provider."""

    provider_name = "anthropic"

    def __init__(self, api_key: str, model: str = "claude-3-5-sonnet-20241022"):
        self.api_key = api_key
        self.model = model

    async def _post(self, system: str, user: str) -> Optional[str]:
        try:
            import httpx
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(
                    "https://api.anthropic.com/v1/messages",
                    headers={
                        "x-api-key": self.api_key,
                        "anthropic-version": "2023-06-01",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": self.model,
                        "max_tokens": 2048,
                        "system": system,
                        "messages": [{"role": "user", "content": user}],
                    },
                )
                if resp.status_code == 200:
                    return resp.json()["content"][0]["text"]
                logger.warning(f"[ANTHROPIC] HTTP {resp.status_code}: {resp.text[:200]}")
                return None
        except Exception as e:
            logger.error(f"[ANTHROPIC] Request failed: {e}")
            return None

    async def call_triage(self, dag_json: str) -> Optional[dict]:
        content = await self._post(TRIAGE_SYSTEM_PROMPT, f"Analyze this execution DAG:\n\n{dag_json}")
        if content:
            try:
                # Claude may wrap JSON in backticks — strip them
                clean = content.strip().strip("```json").strip("```").strip()
                return json.loads(clean)
            except json.JSONDecodeError:
                pass
        return None

    async def call_patch(self, target_file: str, original_content: str, malicious_patterns: list) -> Optional[str]:
        return await self._post(
            PATCH_SYSTEM_PROMPT,
            PATCH_USER_TEMPLATE.format(
                target_file=target_file,
                malicious_patterns=", ".join(malicious_patterns),
                original_content=original_content,
            ),
        )


# ── Factory ────────────────────────────────────────────────────────────────────

class LLMFactory:
    """
    Selects and returns the best available LLM provider based on configured API keys.

    Priority: DeepSeek → OpenAI → Anthropic → None (rule-based fallback)

    Environment Variables:
        DEEPSEEK_API_KEY   — enables DeepSeek Coder/Chat (primary)
        OPENAI_API_KEY     — enables GPT-4o
        ANTHROPIC_API_KEY  — enables Claude
    """

    @staticmethod
    def get_provider() -> Optional[LLMProvider]:
        """
        Returns the highest-priority available LLM provider, or None if no
        API keys are configured (rule-based triage will be used instead).
        """
        deepseek_key = os.getenv("DEEPSEEK_API_KEY")
        openai_key   = os.getenv("OPENAI_API_KEY")
        anthropic_key = os.getenv("ANTHROPIC_API_KEY")

        if deepseek_key:
            logger.info("[LLM_FACTORY] Using DeepSeek provider (deepseek-coder + deepseek-chat).")
            return DeepSeekProvider(api_key=deepseek_key)

        if openai_key:
            logger.info("[LLM_FACTORY] Using OpenAI GPT-4o provider.")
            return OpenAIProvider(api_key=openai_key)

        if anthropic_key:
            logger.info("[LLM_FACTORY] Using Anthropic Claude provider.")
            return AnthropicProvider(api_key=anthropic_key)

        logger.warning("[LLM_FACTORY] No LLM API key configured. Using rule-based fallback.")
        return None

    @staticmethod
    def get_provider_name() -> str:
        """Return the name of the active provider for metadata/logging."""
        if os.getenv("DEEPSEEK_API_KEY"):
            return "deepseek"
        if os.getenv("OPENAI_API_KEY"):
            return "openai"
        if os.getenv("ANTHROPIC_API_KEY"):
            return "anthropic"
        return "rule_based"
