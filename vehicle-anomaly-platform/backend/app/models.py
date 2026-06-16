from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime
from datetime import datetime
from .database import Base

class Telemetry(Base):
    __tablename__ = "telemetry"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(String, index=True)
    speed = Column(Float)
    rpm = Column(Float)
    engine_temp = Column(Float)
    exhaust_temp = Column(Float)
    nox = Column(Float)
    co2 = Column(Float)
    fuel_rate = Column(Float)
    engine_load = Column(Float)
    
    # Anomaly fields
    anomaly_score = Column(Float)
    is_anomaly = Column(Boolean, default=False)
    severity = Column(String)
    fault_type = Column(String)
    ai_explanation = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
