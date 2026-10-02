"""
FastAPI Main Application for TRACECOMMON Telemetry Service.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from services.telemetry.api.router import api_router

app = FastAPI(
    title="PRISON - TRACECOMMON Telemetry Service",
    description="Ingests, normalizes, and indexes eBPF kernel events into structured execution DAGs.",
    version="1.0.0",
)

# Enable CORS for dashboard visualizer
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "TRACECOMMON Telemetry"}
