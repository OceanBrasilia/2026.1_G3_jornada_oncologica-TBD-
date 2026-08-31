import uuid
from datetime import datetime, timezone
from typing import List

import bcrypt
import shortuuid
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app import models, schemas
from app.config import settings
from app.database import Base, engine, get_db

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

@app.post("/login")
def login(req: schemas.LoginRequest, db: Session = Depends(get_db)):
    usuario = db.query(models.Usuario).filter(models.Usuario.email == req.email).first()
    
    if not usuario or not usuario.senha_hash:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
        
    try:
        # Verifica a senha com bcrypt
        if not bcrypt.checkpw(req.password.encode('utf-8'), usuario.senha_hash.encode('utf-8')):
            raise HTTPException(status_code=401, detail="Credenciais inválidas")
    except ValueError:
        # Fallback caso a senha no banco não seja um hash bcrypt válido durante testes ou legados
        if req.password != usuario.senha_hash:
            raise HTTPException(status_code=401, detail="Credenciais inválidas") from None
    
    # Mocking token generation for now
    mock_token = str(uuid.uuid4())
    return {"access_token": mock_token, "token_type": "bearer"}

@app.get("/patients", response_model=List[schemas.PatientResponse])
def get_patients(db: Session = Depends(get_db)):
    return db.query(models.Patient).all()

@app.get("/patients/{id}", response_model=schemas.PatientResponse)
def get_patient(id: uuid.UUID, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Paciente não encontrado.")
    return patient

@app.post("/patients", response_model=schemas.PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient(patient: schemas.PatientCreate, db: Session = Depends(get_db)):
    db_patient = db.query(models.Patient).filter(models.Patient.cpf == patient.cpf).first()
    if db_patient:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe um paciente cadastrado com este CPF."
        )
    
    # Gerar um codigo_publico seguro com shortuuid
    codigo_publico = shortuuid.ShortUUID().random(length=8).upper()

    new_patient = models.Patient(
        codigo_publico=codigo_publico,
        nome_completo=patient.nome_completo,
        data_nascimento=patient.data_nascimento,
        cpf=patient.cpf,
        name=patient.name,
        email=patient.email,
        diagnosis=patient.diagnosis,
        treatment_stage=patient.treatment_stage
    )
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    return new_patient

@app.post("/journeys", response_model=schemas.JornadaResponse, status_code=status.HTTP_201_CREATED)
def create_journey(req: schemas.JourneyCreateRequest, db: Session = Depends(get_db)):
    # Validate paciente_id
    patient = db.query(models.Patient).filter(models.Patient.id == req.paciente_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Paciente não encontrado.")
    
    # Validate criado_por_id
    usuario = db.query(models.Usuario).filter(models.Usuario.id == req.criado_por_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário (criador) não encontrado.")
    
    # Gerar um código automático seguro para a jornada
    codigo = f"JORN-{shortuuid.ShortUUID().random(length=6).upper()}"

    new_journey = models.Jornada(
        paciente_id=req.paciente_id,
        criado_por_id=req.criado_por_id,
        codigo=codigo,
        data_acolhimento=datetime.now(timezone.utc).date(),
        criado_em=datetime.now(timezone.utc)
    )
    db.add(new_journey)
    db.commit()
    db.refresh(new_journey)
    return new_journey

@app.get("/journeys/{id}", response_model=schemas.JornadaResponse)
def get_journey(id: uuid.UUID, db: Session = Depends(get_db)):
    journey = db.query(models.Jornada).filter(models.Jornada.id == id).first()
    if not journey:
        raise HTTPException(status_code=404, detail="Jornada não encontrada.")
    return journey

@app.patch("/journeys/{id}/steps/{step_id}", response_model=schemas.EtapaJornadaResponse)
def update_journey_step(
    id: uuid.UUID,
    step_id: uuid.UUID,
    req: schemas.JourneyStepUpdate,
    db: Session = Depends(get_db)
):
    # Buscar jornada
    journey = db.query(models.Jornada).filter(models.Jornada.id == id).first()
    if not journey:
        raise HTTPException(status_code=404, detail="Jornada não encontrada.")
    
    # Buscar etapa
    step = db.query(models.EtapaJornada).filter(
        models.EtapaJornada.id == step_id,
        models.EtapaJornada.jornada_id == id
    ).first()
    if not step:
        raise HTTPException(status_code=404, detail="Etapa não encontrada nesta jornada.")
    
    update_data = req.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(step, key, value)
    
    # Lógica de negócio sobre status -> datas
    if req.status == "PENDENTE":
        step.iniciada_em = None
        step.finalizada_em = None
    elif req.status == "EM_ATENDIMENTO":
        step.finalizada_em = None
        if not step.iniciada_em:
            step.iniciada_em = datetime.now(timezone.utc)
    elif req.status in ["ATENDIDO", "NAO_SE_APLICA"]:
        if not step.finalizada_em:
            step.finalizada_em = datetime.now(timezone.utc)

    db.commit()
    db.refresh(step)
    return step

