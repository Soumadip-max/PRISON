"""
PRISON Telemetry & eBPF Event Ingestion Service (`TRACECOMMON` Track).
Exposed on port 8001.
"""

from fastapi import FastAPI, status
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

app = FastAPI(
    title="PRISON Telemetry & eBPF Service",
    description="TRACECOMMON Telemetry Pipeline & Event Aggregator",
    version="0.1.0"
)

# In-memory telemetry log store
telemetry_store: List[Dict[str, Any]] = []


class TelemetryEventPayload(BaseModel):
    sandbox_id: str
    repo_name: str
    pr_number: int
    commit_sha: str
    status: str
    total_events: int
    events: List[Dict[str, Any]] = []
    honeypot_triggered: bool = False
    triggered_decoy: Optional[str] = None


@app.get("/")
def read_root():
    return {
        "service": "PRISON Telemetry & eBPF Engine",
        "status": "ONLINE",
        "track": "TRACECOMMON"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.post("/api/v1/telemetry/events", status_code=status.HTTP_201_CREATED)
def ingest_telemetry(payload: TelemetryEventPayload):
    telemetry_store.append(payload.model_dump())
    return {
        "status": "INGESTED",
        "sandbox_id": payload.sandbox_id,
        "event_count": payload.total_events
    }


@app.get("/api/v1/telemetry/events")
def get_telemetry_events():
    return {
        "count": len(telemetry_store),
        "telemetry": telemetry_store
    }
