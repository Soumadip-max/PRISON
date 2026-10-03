"""
GitHub App Authentication Handler (MODULE 1).

Manages short-lived GitHub App Installation Access Tokens for private
repository access inside ephemeral Firecracker sandboxes.
"""

import os
import time
import logging
from typing import Optional

logger = logging.getLogger(__name__)


class GitHubAppAuthHandler:
    """
    Handles short-lived GitHub App Installation Access Token lifecycle.

    Tokens are used exclusively for a single clone operation inside the
    ephemeral microVM sandbox. They are never persisted to disk or database.
    """

    def __init__(
        self,
        installation_token: Optional[str] = None,
        github_token: Optional[str] = None,
    ):
        # Short-lived GitHub App Installation Access Token (preferred)
        self.installation_token = installation_token
        # Fallback: GitHub PAT for ANAKIN patching (narrower scope)
        self.github_pat = github_token or os.getenv("GITHUB_TOKEN")
        self._created_at: float = time.time()

    @classmethod
    def from_webhook_header(cls, auth_header: Optional[str]) -> "GitHubAppAuthHandler":
        """
        Extract short-lived token from the X-GitHub-Token header sent by a
        GitHub App webhook. This token is ephemeral (typically valid for 1h).
        """
        token = None
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.removeprefix("Bearer ").strip()
        return cls(installation_token=token)

    def get_clone_token(self) -> Optional[str]:
        """
        Return the best available token for cloning a private repository.
        Priority: Installation token > PAT > None (public repo, no auth).
        """
        return self.installation_token or self.github_pat

    def build_authenticated_clone_url(self, repo_clone_url: str) -> str:
        """
        Injects the short-lived token into the HTTPS clone URL so `git clone`
        can authenticate without writing credentials to disk.

        Example:
            https://github.com/org/repo.git
            -> https://x-access-token:<token>@github.com/org/repo.git
        """
        token = self.get_clone_token()
        if token and repo_clone_url.startswith("https://"):
            # Strip existing credentials if any
            url_part = repo_clone_url.removeprefix("https://")
            if "@" in url_part:
                url_part = url_part.split("@", 1)[1]
            return f"https://x-access-token:{token}@{url_part}"
        return repo_clone_url

    def is_token_available(self) -> bool:
        """True if any authentication token is present."""
        return bool(self.get_clone_token())

    def token_age_seconds(self) -> float:
        """Returns how old (in seconds) this token handler instance is."""
        return time.time() - self._created_at

    def revoke(self) -> None:
        """
        Immediately zero out token references from memory.
        Called in cleanup hooks after sandbox teardown.
        """
        self.installation_token = None
        self.github_pat = None
        logger.info("[AUTH] Short-lived token references purged from memory.")
