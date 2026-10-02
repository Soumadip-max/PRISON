"""
Redis stream manager for real-time event streaming between OSEN probes and TRACECOMMON telemetry pipeline.
"""

import json
import os
from typing import Any, Dict, Optional, List

try:
    import redis.asyncio as aioredis
except ImportError:
    aioredis = None


class RedisStreamManager:
    """
    Manages publishing and consuming real-time eBPF telemetry events.
    Includes in-memory fallback if Redis is unavailable.
    """

    def __init__(self, redis_url: Optional[str] = None):
        self.redis_url = redis_url or os.getenv("REDIS_URL", "redis://localhost:6379")
        self._redis = None
        self._in_memory_queue: List[Dict[str, Any]] = []

    async def connect(self) -> None:
        """Establish Redis connection if library is installed."""
        if aioredis:
            try:
                self._redis = aioredis.from_url(self.redis_url, decode_responses=True)
                await self._redis.ping()
            except Exception:
                # Fallback to in-memory mode if Redis server is down
                self._redis = None

    async def publish_event(self, stream_key: str, event_data: Dict[str, Any]) -> str:
        """Publish an eBPF event to Redis stream or in-memory fallback."""
        serialized = {k: json.dumps(v) if isinstance(v, (dict, list)) else str(v) for k, v in event_data.items()}
        if self._redis:
            try:
                return await self._redis.xadd(stream_key, serialized)
            except Exception:
                pass
        
        # In-memory fallback
        self._in_memory_queue.append(event_data)
        return f"mem-{len(self._in_memory_queue)}"

    async def get_recent_events(self) -> List[Dict[str, Any]]:
        """Retrieve events from memory buffer."""
        return list(self._in_memory_queue)

    async def close(self) -> None:
        """Close Redis connection."""
        if self._redis:
            await self._redis.close()
