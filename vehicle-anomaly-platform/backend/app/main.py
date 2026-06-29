from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
import json
from . import models, schemas, database, anomaly, ai_service
from .websocket_manager import manager
from fastapi.middleware.cors import CORSMiddleware

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Vehicle Fault & Emission Anomaly Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Vehicle Fault & Emission Anomaly Detection API is running"}

@app.post("/telemetry", response_model=schemas.TelemetryResponse)
async def create_telemetry(telemetry: schemas.TelemetryCreate, db: Session = Depends(database.get_db)):
    data_dict = telemetry.model_dump()
    
    # Run anomaly detection
    anomaly_result = anomaly.detect_anomalies(data_dict)
    
    ai_explanation = None
    if anomaly_result["is_anomaly"]:
        ai_explanation = ai_service.generate_fault_explanation(data_dict, anomaly_result)

    db_telemetry = models.Telemetry(
        **data_dict,
        anomaly_score=anomaly_result["anomaly_score"],
        is_anomaly=anomaly_result["is_anomaly"],
        severity=anomaly_result["severity"],
        fault_type=anomaly_result["fault_type"],
        ai_explanation=ai_explanation
    )
    
    db.add(db_telemetry)
    db.commit()
    db.refresh(db_telemetry)

    response_schema = schemas.TelemetryResponse.model_validate(db_telemetry)

    # Broadcast via websocket
    await manager.broadcast(response_schema.model_dump_json())

    return response_schema

@app.get("/telemetry/latest", response_model=List[schemas.TelemetryResponse])
def read_latest_telemetry(db: Session = Depends(database.get_db)):
    return db.query(models.Telemetry).order_by(desc(models.Telemetry.created_at)).limit(20).all()

@app.get("/telemetry/history", response_model=List[schemas.TelemetryResponse])
def read_telemetry_history(db: Session = Depends(database.get_db)):
    return db.query(models.Telemetry).order_by(desc(models.Telemetry.created_at)).limit(1000).all()

@app.get("/telemetry/{vehicle_id}", response_model=List[schemas.TelemetryResponse])
def read_vehicle_telemetry(vehicle_id: str, db: Session = Depends(database.get_db)):
    return db.query(models.Telemetry).filter(models.Telemetry.vehicle_id == vehicle_id).order_by(desc(models.Telemetry.created_at)).limit(100).all()

@app.get("/alerts", response_model=List[schemas.AlertResponse])
def read_alerts(db: Session = Depends(database.get_db)):
    return db.query(models.Telemetry).filter(models.Telemetry.is_anomaly == True).order_by(desc(models.Telemetry.created_at)).limit(500).all()

@app.get("/vehicles")
def read_vehicles(db: Session = Depends(database.get_db)):
    vehicles = db.query(models.Telemetry.vehicle_id).distinct().all()
    return [v[0] for v in vehicles]

@app.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
