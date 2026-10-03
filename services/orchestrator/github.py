"""
GitHub PR Fetcher — parses PR URLs and fetches diffs.
Follows redirects and handles merged/closed PRs gracefully.
"""
import httpx
import logging
from typing import Tuple

logger = logging.getLogger(__name__)

_DIFF_ENDPOINTS = [
    "https://patch-diff.githubusercontent.com/raw/{owner}/{repo}/pull/{pr_number}.diff",
    "https://github.com/{owner}/{repo}/pull/{pr_number}.diff",
]


class GitHubPRFetcher:
    def parse_url(self, url: str) -> Tuple[str, str, int]:
        """
        Parses https://github.com/owner/repo/pull/123 into owner, repo, pr_number.
        Handles trailing slashes, query strings, and fragments.
        """
        try:
            # Strip query and fragment
            clean = url.split("?")[0].split("#")[0].rstrip("/")
            parts = clean.split("/")
            pull_idx = parts.index("pull")
            owner = parts[pull_idx - 2]
            repo  = parts[pull_idx - 1]
            pr_number = int(parts[pull_idx + 1])
            return owner, repo, pr_number
        except (ValueError, IndexError) as e:
            raise ValueError(f"Invalid GitHub PR URL format: {url!r}") from e

    async def fetch_pr_diff(self, url: str) -> str:
        """
        Fetches the unified diff of a PR.
        Tries multiple endpoints and follows redirects (httpx follows by default).
        """
        owner, repo, pr_number = self.parse_url(url)

        async with httpx.AsyncClient(
            follow_redirects=True,
            timeout=15.0,
            headers={"User-Agent": "PRISON-Security-Scanner/1.0"},
        ) as client:
            for template in _DIFF_ENDPOINTS:
                diff_url = template.format(owner=owner, repo=repo, pr_number=pr_number)
                try:
                    resp = await client.get(diff_url)
                    if resp.status_code == 200 and resp.text.strip():
                        logger.info(
                            f"[GitHub] Fetched diff from {diff_url} "
                            f"({len(resp.text)} bytes)"
                        )
                        return resp.text
                    logger.debug(
                        f"[GitHub] {diff_url} returned {resp.status_code} — trying next"
                    )
                except Exception as e:
                    logger.debug(f"[GitHub] {diff_url} error: {e}")
                    continue

        raise Exception(
            f"Could not fetch diff for {owner}/{repo}#{pr_number} "
            f"from any endpoint. PR may be private, deleted, or empty."
        )
