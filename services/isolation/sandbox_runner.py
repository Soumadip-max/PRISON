"""
MicroVM Sandbox Runner (`MANTITUP` Track).
Executes untrusted PR code in isolated microVM/container environments with Honeypot injection.
"""

import time
import subprocess
import os
import tempfile
from typing import Optional, Dict, Any

from services.isolation.schemas import SandboxExecutionRequest, SandboxExecutionResult
from services.isolation.honeypot_injector import HoneypotInjector
from services.isolation.vm_config import VMConfig


class SandboxRunner:
    """
    Spawns ephemeral detonation sandboxes, injects honeypot environment variables
    and files, enforces hard timeouts, and monitors for honeypot traps.
    """

    def __init__(self, vm_config: Optional[VMConfig] = None):
        self.config = vm_config or VMConfig()

    def run_sandbox(self, request: SandboxExecutionRequest) -> SandboxExecutionResult:
        """
        Executes detonation sandbox for given request.
        """
        start_time = time.time()
        injector = HoneypotInjector(request.honeypots)
        env_vars = os.environ.copy()
        env_vars.update(injector.get_env_dict())

        # Create temporary working directory for workspace sandbox
        with tempfile.TemporaryDirectory(prefix=f"prison_sandbox_{request.sandbox_id}_") as tmpdir:
            # Seed honeypot files (.env, .aws/credentials)
            injector.seed_workspace_files(tmpdir)

            # Simulated execution or subprocess execution of build command
            # If repo_url is local or dummy, run safety check script or echo test
            cmd = ["python", "-c", "import os; print('Detonation sandbox initialized for ' + os.getenv('AWS_ACCESS_KEY_ID', 'none'))"]

            try:
                proc = subprocess.Popen(
                    cmd,
                    cwd=tmpdir,
                    env=env_vars,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True
                )

                try:
                    stdout, stderr = proc.communicate(timeout=request.timeout_seconds)
                    exit_code = proc.returncode
                    status = "COMPLETED"
                except subprocess.TimeoutExpired:
                    proc.kill()
                    stdout, stderr = proc.communicate()
                    exit_code = -1
                    status = "TIMEOUT"

            except Exception as e:
                return SandboxExecutionResult(
                    sandbox_id=request.sandbox_id,
                    status="ERROR",
                    exit_code=1,
                    stdout="",
                    stderr=str(e),
                    execution_time=time.time() - start_time,
                    honeypot_triggered=False,
                    triggered_decoy=None
                )

            exec_duration = time.time() - start_time

            # Check if honeypots were triggered in output
            triggered, decoy = injector.check_honeypot_trigger(output_text=stdout + stderr)
            if triggered:
                status = "HONEYPOT_HALTED"

            return SandboxExecutionResult(
                sandbox_id=request.sandbox_id,
                status=status,
                exit_code=exit_code,
                stdout=stdout,
                stderr=stderr,
                execution_time=exec_duration,
                honeypot_triggered=triggered,
                triggered_decoy=decoy,
                metadata={
                    "repo_url": request.repo_url,
                    "commit_sha": request.commit_sha,
                    "pr_number": request.pr_number,
                    "timeout_seconds": request.timeout_seconds
                }
            )
