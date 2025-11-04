# backend/Dockerfile
FROM python:3.11-slim AS base

# System deps (optional but handy)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps
# Copy only requirements first to leverage layer cache
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r /app/requirements.txt

# Now copy the app
COPY . /app

# Expose the FastAPI port
EXPOSE 8000

# Healthcheck (simple)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s CMD \
  curl -f http://localhost:8000/docs || exit 1

# Run uvicorn
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
