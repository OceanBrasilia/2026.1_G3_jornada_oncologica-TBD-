from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List

from app.database import engine, Base, get_db
from app.config import settings
from app import models, schemas

# Cria as tabelas no banco de dados se não existirem
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Erro ao criar tabelas no banco de dados: {e}")

app = FastAPI(title=settings.PROJECT_NAME)

# Configura o CORS para permitir requisições do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especifique as origens permitidas de forma restrita
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": f"Bem-vindo à API do projeto {settings.PROJECT_NAME}!"}

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        # Executa um ping simples no banco de dados para checar a saúde
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": str(e)}

@app.get("/patients", response_model=List[schemas.PatientResponse])
def get_patients(db: Session = Depends(get_db)):
    return db.query(models.Patient).all()

@app.post("/patients", response_model=schemas.PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient(patient: schemas.PatientCreate, db: Session = Depends(get_db)):
    db_patient = db.query(models.Patient).filter(models.Patient.email == patient.email).first()
    if db_patient:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe um paciente cadastrado com este e-mail."
        )
    
    new_patient = models.Patient(
        name=patient.name,
        email=patient.email,
        diagnosis=patient.diagnosis,
        treatment_stage=patient.treatment_stage
    )
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    return new_patient
