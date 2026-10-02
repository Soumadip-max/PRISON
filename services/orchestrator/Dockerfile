FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (including docker CLI fallback tools)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    git \
    && rm -rf /var/lib/apt/lists/*

COPY services/orchestrator/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy services
COPY services /app/services
COPY tests /app/tests
COPY run_tests.py /app/run_tests.py

ENV PYTHONPATH=/app
ENV PORT=8000
ENV PRISON_DEV_MODE=true

EXPOSE 8000

HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "services.orchestrator.main:app", "--host", "0.0.0.0", "--port", "8000"]
