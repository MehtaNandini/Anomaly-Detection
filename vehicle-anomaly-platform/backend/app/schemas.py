from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class TelemetryCreate(BaseModel):
    vehicle_id: str
    speed: float
    rpm: float
    engine_temp: float
    exhaust_temp: float
    nox: float
    co2: float
    fuel_rate: float
    engine_load: float

class TelemetryResponse(TelemetryCreate):
    id: int
    anomaly_score: float
    is_anomaly: bool
    severity: str
    fault_type: str
    ai_explanation: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class AlertResponse(BaseModel):
    id: int
    vehicle_id: str
    severity: str
    fault_type: str
    created_at: datetime
    ai_explanation: Optional[str] = None

    class Config:
        from_attributes = True

class VehicleSummary(BaseModel):
    vehicle_id: str
