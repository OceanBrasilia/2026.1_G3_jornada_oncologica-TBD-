from typing import List
from uuid import UUID

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app import models, schemas
from app.config import settings
from app.database import get_db

# O banco de dados agora é gerenciado pelo Alembic.
# A criação dinâmica de tabelas foi removida para evitar conflitos de migração.

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
    db_patient = db.query(models.Patient).filter(models.Patient.cpf == patient.cpf).first()
    if db_patient:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe um paciente cadastrado com este CPF."
        )
    
    new_patient = models.Patient(
        codigo_publico=patient.codigo_publico,
        nome_completo=patient.nome_completo,
        data_nascimento=patient.data_nascimento,
        cpf=patient.cpf,
        name=patient.name or patient.nome_completo,
        email=patient.email,
        diagnosis=patient.diagnosis,
        treatment_stage=patient.treatment_stage
    )
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    return new_patient

@app.get("/patients/{patient_id}", response_model=schemas.PatientResponse)
def get_patient(patient_id: UUID, db: Session = Depends(get_db)):
    db_patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not db_patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente não encontrado."
        )
    return db_patient

@app.get("/journeys", response_model=List[schemas.JornadaResponse])
def get_journeys(db: Session = Depends(get_db)):
    return db.query(models.Jornada).all()

@app.get("/journeys/{journey_id}", response_model=schemas.JornadaResponse)
def get_journey(journey_id: UUID, db: Session = Depends(get_db)):
    db_journey = db.query(models.Jornada).filter(models.Jornada.id == journey_id).first()
    if not db_journey:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Jornada não encontrada."
        )
    return db_journey

@app.post("/journeys", response_model=schemas.JornadaResponse, status_code=status.HTTP_201_CREATED)
def create_journey(journey: schemas.JornadaCreate, db: Session = Depends(get_db)):
    db_patient = db.query(models.Patient).filter(models.Patient.id == journey.paciente_id).first()
    if not db_patient:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Paciente associado não existe."
        )
    
    db_user = db.query(models.Usuario).filter(models.Usuario.id == journey.criado_por_id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário criador não existe."
        )
        
    new_journey = models.Jornada(
        paciente_id=journey.paciente_id,
        criado_por_id=journey.criado_por_id,
        codigo=journey.codigo,
        data_acolhimento=journey.data_acolhimento,
        status="AGUARDANDO",
        diagnostico_principal=journey.diagnostico_principal,
        fase_tratamento=journey.fase_tratamento,
        origem=journey.origem,
        observacao_geral=journey.observacao_geral
    )
    db.add(new_journey)
    db.commit()
    db.refresh(new_journey)
    return new_journey

@app.get("/patients/{patient_id}/journeys", response_model=List[schemas.JornadaResponse])
def get_patient_journeys(patient_id: UUID, db: Session = Depends(get_db)):
    db_patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not db_patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente não encontrado."
        )
    return db.query(models.Jornada).filter(models.Jornada.paciente_id == patient_id).all()

