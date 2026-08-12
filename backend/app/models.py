from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    diagnosis = Column(String, nullable=True)
    treatment_stage = Column(String, default="Diagnóstico")
    created_at = Column(DateTime, default=datetime.utcnow)
