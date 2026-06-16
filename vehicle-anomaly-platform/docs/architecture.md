# Architecture Overview

## Components

1. **Backend (FastAPI)**: Handles ingestion of telemetry, stores it in PostgreSQL, performs rule-based anomaly detection, calls Gemini AI to explain the anomaly, and broadcasts events through a WebSocket.
2. **Database (PostgreSQL)**: Persists all incoming telemetry and calculated anomalies.
3. **Simulator**: Python script that artificially generates fleet data (RPM, Speed, NOx, CO2, etc) and injects anomalies to simulate failing vehicles.
4. **Frontend (React)**: Subscribes to the WebSocket to live-update the dashboard with flashing alerts, custom sparkline charts, and AI text cards.

## Data Flow
- Simulator -> POST `/telemetry` -> Backend
- Backend -> PostgreSQL (Save)
- Backend -> Gemini API (If Anomaly)
- Backend -> WebSocket Broadcast -> Frontend
