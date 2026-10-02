"""
Test runner for PRISON Core Engine test suite.
"""

import os
import sys
import unittest
import importlib

# Ensure root directory is on PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))


class TestSignatureValidator(unittest.TestCase):
    def test_valid_signature(self):
        from tests.test_signature_validator import test_valid_signature
        test_valid_signature()

    def test_invalid_signature(self):
        from tests.test_signature_validator import test_invalid_signature
        test_invalid_signature()

    def test_missing_header(self):
        from tests.test_signature_validator import test_missing_header
        test_missing_header()


class TestIsolation(unittest.TestCase):
    def test_honeypot_env_injection(self):
        from tests.test_isolation import test_honeypot_env_injection
        test_honeypot_env_injection()

    def test_honeypot_workspace_file_seeding(self):
        from tests.test_isolation import test_honeypot_workspace_file_seeding
        test_honeypot_workspace_file_seeding()

    def test_honeypot_trigger_detection(self):
        from tests.test_isolation import test_honeypot_trigger_detection
        test_honeypot_trigger_detection()

    def test_sandbox_runner_execution(self):
        from tests.test_isolation import test_sandbox_runner_execution
        test_sandbox_runner_execution()


class TestEBPF(unittest.TestCase):
    def test_ebpf_tracer_lifecycle(self):
        from tests.test_ebpf import test_ebpf_tracer_lifecycle
        test_ebpf_tracer_lifecycle()

    def test_event_dumper(self):
        from tests.test_ebpf import test_event_dumper
        test_event_dumper()


class TestOrchestrator(unittest.TestCase):
    def test_health_check(self):
        from tests.test_orchestrator import test_health_check
        test_health_check()

    def test_webhook_ingestion_success(self):
        from tests.test_orchestrator import test_webhook_ingestion_success
        test_webhook_ingestion_success()


if __name__ == "__main__":
    unittest.main()
