FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY process_image.py .

RUN chmod +x process_image.py

RUN mkdir -p /data/input /data/output

ENV PYTHONUNBUFFERED=1

ENTRYPOINT ["python", "process_image.py"]
