from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class PatientBase(BaseModel):
    name: str
    email: str
    diagnosis: Optional[str] = None
    treatment_stage: Optional[str] = "Diagnóstico"

class PatientCreate(PatientBase):
    pass

class PatientResponse(PatientBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
