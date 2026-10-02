"""
Synthetic Honeypot Injector (`MANTITUP` Track).
Injects decoy credentials and files into detonation environments and checks for access/exfiltration.
"""

from typing import Dict, Optional, Tuple
import os
import json
from services.isolation.schemas import HoneypotCredentials


class HoneypotInjector:
    """
    Manages generation, environment injection, filesystem seeding,
    and detection of synthetic honeypot decoy triggers.
    """

    def __init__(self, honeypots: Optional[HoneypotCredentials] = None):
        self.honeypots = honeypots or HoneypotCredentials()

    def get_env_dict(self) -> Dict[str, str]:
        """
        Returns environment variable dictionary seeded with synthetic decoys.
        """
        return {
            "AWS_ACCESS_KEY_ID": self.honeypots.AWS_ACCESS_KEY_ID,
            "AWS_SECRET_ACCESS_KEY": self.honeypots.AWS_SECRET_ACCESS_KEY,
            "JWT_SECRET": self.honeypots.JWT_SECRET,
            "DATABASE_URL": self.honeypots.DATABASE_URL,
            "PRISON_HONEYPOT_ACTIVE": "true"
        }

    def seed_workspace_files(self, workspace_path: str) -> Dict[str, str]:
        """
        Seeds honeypot files into the target workspace directory.
        Returns map of file path -> decoy contents.
        """
        files_created = {}

        # 1. Seed .env file
        env_file_path = os.path.join(workspace_path, ".env")
        env_content = (
            f"# Production Environment Credentials\n"
            f"AWS_ACCESS_KEY_ID={self.honeypots.AWS_ACCESS_KEY_ID}\n"
            f"AWS_SECRET_ACCESS_KEY={self.honeypots.AWS_SECRET_ACCESS_KEY}\n"
            f"JWT_SECRET={self.honeypots.JWT_SECRET}\n"
            f"DATABASE_URL={self.honeypots.DATABASE_URL}\n"
        )
        os.makedirs(os.path.dirname(env_file_path), exist_ok=True)
        with open(env_file_path, "w", encoding="utf-8") as f:
            f.write(env_content)
        files_created[env_file_path] = env_content

        # 2. Seed .aws/credentials
        aws_dir = os.path.join(workspace_path, ".aws")
        aws_cred_file = os.path.join(aws_dir, "credentials")
        aws_content = (
            f"[default]\n"
            f"aws_access_key_id = {self.honeypots.AWS_ACCESS_KEY_ID}\n"
            f"aws_secret_access_key = {self.honeypots.AWS_SECRET_ACCESS_KEY}\n"
        )
        os.makedirs(aws_dir, exist_ok=True)
        with open(aws_cred_file, "w", encoding="utf-8") as f:
            f.write(aws_content)
        files_created[aws_cred_file] = aws_content

        return files_created

    def check_honeypot_trigger(
        self,
        accessed_path: Optional[str] = None,
        accessed_env: Optional[str] = None,
        output_text: Optional[str] = None
    ) -> Tuple[bool, Optional[str]]:
        """
        Checks whether a file path read, env var read, or output stream contains
        a honeypot decoy trigger.
        Returns (is_triggered, triggered_decoy_name).
        """
        decoy_tokens = {
            self.honeypots.AWS_ACCESS_KEY_ID: "AWS_ACCESS_KEY_ID",
            self.honeypots.AWS_SECRET_ACCESS_KEY: "AWS_SECRET_ACCESS_KEY",
            self.honeypots.JWT_SECRET: "JWT_SECRET",
            self.honeypots.DATABASE_URL: "DATABASE_URL"
        }

        # Check accessed environment variable name directly
        if accessed_env and accessed_env in ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "JWT_SECRET", "DATABASE_URL"]:
            return True, f"ENV:{accessed_env}"

        # Check accessed file path
        if accessed_path:
            norm_path = accessed_path.replace("\\", "/")
            if ".env" in norm_path or ".aws/credentials" in norm_path:
                return True, f"FILE:{accessed_path}"

        # Check output/log text for credential harvesting or printing
        if output_text:
            for token, name in decoy_tokens.items():
                if token in output_text:
                    return True, f"EXFILTRATED_SECRET:{name}"

        return False, None
