FROM python:3.12-slim

WORKDIR /app

# Install system dependencies for psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv for fast dependency resolution
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Copy project definition and install dependencies
COPY pyproject.toml .
RUN uv pip install --system --no-cache -r pyproject.toml || true

# Copy source code
COPY . .

# Install all dependencies directly into system python
RUN uv pip install --system fastapi uvicorn "pydantic[email]" pydantic-settings sqlalchemy psycopg2-binary flask flask-admin flask-sqlalchemy a2wsgi "passlib[bcrypt]" "python-jose[cryptography]" python-multipart bcrypt

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
