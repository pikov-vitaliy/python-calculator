FROM python:3.12-slim

WORKDIR /app

COPY app.py .

ENV PYTHONUNBUFFERED=1

ENTRYPOINT ["python", "-u", "app.py"]
