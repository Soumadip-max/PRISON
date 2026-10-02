"""
API Router for TRACECOMMON Telemetry Service.
"""

from fastapi import APIRouter
from services.telemetry.api import http_ingest, ws_telemetry

api_router = APIRouter()
api_router.include_router(http_ingest.router)
api_router.include_router(ws_telemetry.router)
