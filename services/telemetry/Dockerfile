# Stage 1: Build dependencies
FROM python:3.11-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY services/telemetry/requirements.txt /app/requirements.txt
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: Production runtime
FROM python:3.11-slim AS runner

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Add a non-root user
RUN addgroup --system appgroup && adduser --system --group appuser

COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY services/telemetry /app/services/telemetry

RUN chown -R appuser:appgroup /app
USER appuser

ENV PYTHONPATH=/app
ENV PORT=8001

EXPOSE 8001

HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8001/health || exit 1

CMD ["uvicorn", "services.telemetry.main:app", "--host", "0.0.0.0", "--port", "8001"]
