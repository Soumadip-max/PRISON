"""
HTTP Telemetry ingestion endpoints for batch processing and DAG retrieval.
"""

from typing import List, Dict
from fastapi import APIRouter, HTTPException, Status
from services.telemetry.schemas.events import RawEbpfEvent, NormalizedEvent
from services.telemetry.schemas.graph import ExecutionDAG
from services.telemetry.pipeline.normalizer import EventNormalizer
from services.telemetry.pipeline.dag_builder import DAGBuilder
from services.telemetry.api.ws_telemetry import active_dag_builders

router = APIRouter(prefix="/api/v1/telemetry", tags=["Telemetry"])


@router.post("/events", response_model=List[NormalizedEvent], status_code=Status.HTTP_201_CREATED)
async def ingest_batch_events(raw_events: List[RawEbpfEvent]) -> List[NormalizedEvent]:
    """
    Ingest a batch of raw eBPF events from OSEN probes.
    """
    normalized_list: List[NormalizedEvent] = []
    for raw in raw_events:
        normalized = EventNormalizer.normalize(raw)
        normalized_list.append(normalized)

        exec_id = normalized.execution_id
        if exec_id not in active_dag_builders:
            active_dag_builders[exec_id] = DAGBuilder(exec_id)

        active_dag_builders[exec_id].add_event(normalized)

    return normalized_list


@router.get("/dag/{execution_id}", response_model=ExecutionDAG)
async def get_execution_dag(execution_id: str) -> ExecutionDAG:
    """
    Get the constructed Directed Acyclic Graph (DAG) for an execution run.
    """
    if execution_id not in active_dag_builders:
        raise HTTPException(
            status_code=Status.HTTP_404_NOT_FOUND,
            detail=f"Execution ID '{execution_id}' not found",
        )

    return active_dag_builders[execution_id].build()
