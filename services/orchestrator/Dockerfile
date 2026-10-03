FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
# - git: for cloning private repos with short-lived tokens (MODULE 1)
# - semgrep: static analysis fallback when Firecracker KVM unavailable (MODULE 2)
# - curl, ca-certificates: health checks and LLM API calls
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Semgrep CLI (MODULE 2 — static fallback)
RUN pip install --no-cache-dir semgrep

COPY services/orchestrator/requirements.txt /app/requirements.txt

# Install Python deps including httpx for LLM provider calls (MODULE 3)
RUN pip install --no-cache-dir -r requirements.txt httpx

# Copy services
COPY services /app/services
COPY tests /app/tests
COPY run_tests.py /app/run_tests.py

ENV PYTHONPATH=/app
ENV PORT=8000
ENV PRISON_DEV_MODE=true

# --- LLM Provider (MODULE 3) ---
# Priority: DEEPSEEK_API_KEY > OPENAI_API_KEY > ANTHROPIC_API_KEY > rule-based
ENV DEEPSEEK_API_KEY=""
ENV OPENAI_API_KEY=""
ENV ANTHROPIC_API_KEY=""

# --- GitHub App Auth (MODULE 1) ---
ENV GITHUB_TOKEN=""
ENV GITHUB_APP_ID=""
ENV GITHUB_APP_INSTALLATION_ID=""

# --- Privacy & Execution Mode (MODULE 2 & 5) ---
ENV PRISON_EXECUTION_MODE=AUTO
ENV PRISON_DATA_RETENTION_POLICY=PURGED

EXPOSE 8000

HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "services.orchestrator.main:app", "--host", "0.0.0.0", "--port", "8000"]
