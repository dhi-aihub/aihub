FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1
WORKDIR /app

# system packages needed for git and building packages
RUN apt-get update || true; \
    rm -rf /var/lib/apt/lists/*; \
    set -eux; \
    for i in 1 2 3; do \
      apt-get update && apt-get install -y --no-install-recommends \
        git build-essential curl ca-certificates apt-transport-https wget && break; \
      echo "apt failed, cleaning and retrying ($i)"; \
      apt-get clean; rm -rf /var/lib/apt/lists/*; sleep 2; \
    done; \
    rm -rf /var/lib/apt/lists/*

# copy project
COPY . /app

# install python deps (use base requirements; change to with_pytorch.txt for GPU image)
RUN pip install --upgrade pip setuptools wheel && \
    pip install ./airena-grader && \
    pip install ./airena-gym && \
    pip install requests dotenv zmq psutil celery

EXPOSE 15921

# default entry: start the worker package
CMD ["python", "-m", "airena_worker"]