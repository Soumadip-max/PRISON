"""
WebSocket telemetry ingestion endpoint for live OSEN eBPF event streams.
"""

from typing import Dict
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import ValidationError

from services.telemetry.pipeline.dag_builder import DAGBuilder
from services.telemetry.pipeline.normalizer import EventNormalizer
from services.telemetry.schemas.events import RawEbpfEvent

router = APIRouter()

# Active DAG builders per execution_id
active_dag_builders: Dict[str, DAGBuilder] = {}


@router.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    """
    WebSocket connection handling real-time eBPF events from OSEN probes.
    """
    await websocket.accept()
    try:
        while True:
            raw_data = await websocket.receive_json()
            try:
                raw_event = RawEbpfEvent(**raw_data)
            except ValidationError as e:
                await websocket.send_json({"status": "error", "message": str(e)})
                continue

            # Normalize event
            normalized = EventNormalizer.normalize(raw_event)

            # Get or create DAGBuilder for execution run
            exec_id = normalized.execution_id
            if exec_id not in active_dag_builders:
                active_dag_builders[exec_id] = DAGBuilder(exec_id)

            builder = active_dag_builders[exec_id]
            node = builder.add_event(normalized)
            current_dag = builder.build()

            # Respond with normalized event confirmation and updated node info
            await websocket.send_json({
                "status": "processed",
                "event_id": normalized.event_id,
                "node": node.model_dump(mode="json"),
                "has_honeypot_hit": current_dag.has_honeypot_hit,
                "has_malicious_node": current_dag.has_malicious_node,
            })
    except WebSocketDisconnect:
        pass
