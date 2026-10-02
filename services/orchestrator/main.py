"""
PRISON Core Engine FastAPI Application.
Main entry point for Orchestrator service.
"""

from fastapi import FastAPI
from services.orchestrator.webhook_router import router as webhook_router

app = FastAPI(
    title="PRISON Core Engine",
    description="Pull Request Isolation & Security Observation Network Core detonate engine API",
    version="0.1.0"
)

app.include_router(webhook_router)


@app.get("/")
def read_root():
    return {
        "service": "PRISON Engine Core",
        "status": "ONLINE",
        "tracks": ["MANTITUP (Isolation & Honeypots)", "OSEN (Kernel Observability)", "GitHub Ingestion Engine"]
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
