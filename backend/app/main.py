import uuid
from datetime import datetime, timezone
from typing import List
from uuid import UUID

import bcrypt
import shortuuid
from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app import business_rules, models, schemas
from app.config import settings
from app.database import get_db

# O banco de dados é gerenciado pelo Alembic.

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
        if not bcrypt.checkpw(req.password.encode("utf-8"), usuario.senha_hash.encode("utf-8")):
            raise HTTPException(status_code=401, detail="Credenciais inválidas")
    except ValueError:
        # Fallback caso a senha no banco não seja um hash bcrypt válido durante testes ou legados
        if req.password != usuario.senha_hash:
            raise HTTPException(status_code=401, detail="Credenciais inválidas") from None

    # Mocking token generation for now
    mock_token = str(uuid.uuid4())
    return {"access_token": mock_token, "token_type": "bearer"}


@app.get("/patients", response_model=List[schemas.PatientResponse])
def get_patients(
    skip: int = Query(0, ge=0, description="Número de registros a pular"),
    limit: int = Query(100, ge=1, le=1000, description="Limite de registros retornados"),
    db: Session = Depends(get_db),
):
    return db.query(models.Patient).offset(skip).limit(limit).all()


@app.get("/patients/{id}", response_model=schemas.PatientResponse)
def get_patient(id: UUID, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paciente não encontrado.")
    return patient


@app.post("/patients", response_model=schemas.PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient(patient: schemas.PatientCreate, db: Session = Depends(get_db)):
    db_patient = db.query(models.Patient).filter(models.Patient.cpf == patient.cpf).first()
    if db_patient:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Já existe um paciente cadastrado com este CPF."
        )

    # Gerar um codigo_publico seguro com shortuuid caso não seja fornecido
    codigo_publico = patient.codigo_publico or shortuuid.ShortUUID().random(length=8).upper()

    new_patient = models.Patient(
        codigo_publico=codigo_publico,
        nome_completo=patient.nome_completo,
        data_nascimento=patient.data_nascimento,
        cpf=patient.cpf,
        name=patient.name or patient.nome_completo,
        email=patient.email,
        diagnosis=patient.diagnosis,
        treatment_stage=patient.treatment_stage,
    )
    try:
        db.add(new_patient)
        db.commit()
        db.refresh(new_patient)
        return new_patient
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Erro de integridade ao cadastrar paciente (CPF ou código público duplicado).",
        ) from None


@app.get("/patients/{patient_id}/journeys", response_model=List[schemas.JornadaResponse])
def get_patient_journeys(
    patient_id: UUID,
    skip: int = Query(0, ge=0, description="Número de registros a pular"),
    limit: int = Query(100, ge=1, le=1000, description="Limite de registros retornados"),
    db: Session = Depends(get_db),
):
    db_patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not db_patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paciente não encontrado.")
    return db.query(models.Jornada).filter(models.Jornada.paciente_id == patient_id).offset(skip).limit(limit).all()


@app.get("/journeys", response_model=List[schemas.JornadaResponse])
def get_journeys(
    skip: int = Query(0, ge=0, description="Número de registros a pular"),
    limit: int = Query(100, ge=1, le=1000, description="Limite de registros retornados"),
    db: Session = Depends(get_db),
):
    return db.query(models.Jornada).offset(skip).limit(limit).all()


@app.get("/journeys/{id}", response_model=schemas.JornadaResponse)
def get_journey(id: UUID, db: Session = Depends(get_db)):
    journey = db.query(models.Jornada).filter(models.Jornada.id == id).first()
    if not journey:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Jornada não encontrada.")
    return journey


@app.post("/journeys", response_model=schemas.JornadaResponse, status_code=status.HTTP_201_CREATED)
def create_journey(req: schemas.JornadaCreate, db: Session = Depends(get_db)):
    # Validate paciente_id
    patient = db.query(models.Patient).filter(models.Patient.id == req.paciente_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paciente não encontrado.")

    # Validate criado_por_id
    usuario = db.query(models.Usuario).filter(models.Usuario.id == req.criado_por_id).first()
    if not usuario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário (criador) não encontrado.")

    # Gerar um código automático caso não seja fornecido
    codigo = req.codigo or f"JORN-{shortuuid.ShortUUID().random(length=6).upper()}"
    data_acolhimento = req.data_acolhimento or datetime.now(timezone.utc).date()

    new_journey = models.Jornada(
        paciente_id=req.paciente_id,
        criado_por_id=req.criado_por_id,
        codigo=codigo,
        data_acolhimento=data_acolhimento,
        status="AGUARDANDO",
        diagnostico_principal=req.diagnostico_principal,
        fase_tratamento=req.fase_tratamento,
        origem=req.origem,
        observacao_geral=req.observacao_geral,
        criado_em=datetime.now(timezone.utc),
    )
    try:
        db.add(new_journey)
        db.commit()
        db.refresh(new_journey)
        return new_journey
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe uma jornada com este código ou ocorreu erro de integridade referencial.",
        ) from None


@app.patch("/journeys/{id}/steps/{step_id}", response_model=schemas.EtapaJornadaResponse)
def update_journey_step(id: UUID, step_id: UUID, req: schemas.JourneyStepUpdate, db: Session = Depends(get_db)):
    # Buscar jornada
    journey = db.query(models.Jornada).filter(models.Jornada.id == id).first()
    if not journey:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Jornada não encontrada.")

    # Buscar etapa
    step = (
        db.query(models.EtapaJornada)
        .filter(models.EtapaJornada.id == step_id, models.EtapaJornada.jornada_id == id)
        .first()
    )
    if not step:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Etapa não encontrada nesta jornada.")

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

    # Avalia e atualiza status global da jornada (Issue 8)
    business_rules.avaliar_e_atualizar_status_jornada(journey, db)

    return step


# Aliases em português e Consulta Pública ──────────────────────────────────


@app.get("/pacientes", response_model=List[schemas.PatientResponse])
def get_pacientes(
    skip: int = Query(0, ge=0, description="Número de registros a pular"),
    limit: int = Query(100, ge=1, le=1000, description="Limite de registros retornados"),
    db: Session = Depends(get_db),
):
    return get_patients(skip=skip, limit=limit, db=db)


@app.get("/pacientes/{id}", response_model=schemas.PatientResponse)
def get_paciente(id: UUID, db: Session = Depends(get_db)):
    return get_patient(id=id, db=db)


@app.post("/pacientes", response_model=schemas.PatientResponse, status_code=status.HTTP_201_CREATED)
def create_paciente(patient: schemas.PatientCreate, db: Session = Depends(get_db)):
    return create_patient(patient=patient, db=db)


@app.get("/pacientes/{id_ou_nome}/jornada")
def get_paciente_jornada_publica(id_ou_nome: str, db: Session = Depends(get_db)):
    # Busca paciente por UUID, código público, CPF ou nome
    paciente = None
    try:
        val_uuid = UUID(id_ou_nome)
        paciente = db.query(models.Patient).filter(models.Patient.id == val_uuid).first()
    except (ValueError, AttributeError):
        pass

    if not paciente:
        paciente = (
            db.query(models.Patient)
            .filter(
                (models.Patient.codigo_publico.ilike(id_ou_nome.strip()))
                | (models.Patient.cpf == id_ou_nome.strip())
                | (models.Patient.nome_completo.ilike(f"%{id_ou_nome.strip()}%"))
                | (models.Patient.name.ilike(f"%{id_ou_nome.strip()}%"))
            )
            .first()
        )

    if not paciente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente não encontrado para consulta pública de jornada.",
        )

    # Busca a jornada ativa/mais recente do paciente
    jornada = (
        db.query(models.Jornada)
        .filter(models.Jornada.paciente_id == paciente.id)
        .order_by(models.Jornada.criado_em.desc())
        .first()
    )

    etapas_list = []
    if jornada and jornada.etapas:
        etapas_sorted = sorted(jornada.etapas, key=lambda e: e.ordem)
        for etapa in etapas_sorted:
            nome_area = etapa.area_atendimento.nome if etapa.area_atendimento else "Especialidade"
            etapas_list.append(
                {
                    "id": str(etapa.id),
                    "area_id": str(etapa.area_atendimento_id),
                    "nome": nome_area,
                    "status": etapa.status,
                    "ordem": etapa.ordem,
                    "iniciada_em": etapa.iniciada_em.isoformat() if etapa.iniciada_em else None,
                    "finalizada_em": etapa.finalizada_em.isoformat() if etapa.finalizada_em else None,
                }
            )

    return {
        "paciente": {
            "id": str(paciente.id),
            "codigo_publico": paciente.codigo_publico,
            "nome_completo": paciente.nome_completo,
            "data_nascimento": paciente.data_nascimento.isoformat() if paciente.data_nascimento else None,
        },
        "jornada": {
            "id": str(jornada.id) if jornada else None,
            "codigo": jornada.codigo if jornada else None,
            "status": jornada.status if jornada else "AGUARDANDO",
            "data_acolhimento": jornada.data_acolhimento.isoformat()
            if (jornada and jornada.data_acolhimento)
            else None,
            "etapas": etapas_list,
        }
        if jornada
        else None,
    }


@app.get("/jornadas", response_model=List[schemas.JornadaResponse])
def get_jornadas(
    skip: int = Query(0, ge=0, description="Número de registros a pular"),
    limit: int = Query(100, ge=1, le=1000, description="Limite de registros retornados"),
    db: Session = Depends(get_db),
):
    return get_journeys(skip=skip, limit=limit, db=db)


@app.get("/jornadas/{id}", response_model=schemas.JornadaResponse)
def get_jornada(id: UUID, db: Session = Depends(get_db)):
    return get_journey(id=id, db=db)


@app.post("/jornadas", response_model=schemas.JornadaResponse, status_code=status.HTTP_201_CREATED)
def create_jornada(req: schemas.JornadaCreate, db: Session = Depends(get_db)):
    return create_journey(req=req, db=db)


# Endpoints de Cálculos Clínicos (Issue 8) ─────────────────────────────────


@app.post("/calculos/imc")
def calcular_imc_endpoint(req: schemas.IMCRequest):
    try:
        return business_rules.calcular_imc(peso_kg=req.peso_kg, altura_m=req.altura_m)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from None


@app.post("/calculos/irpo")
def calcular_irpo_endpoint(req: schemas.IRPORequest):
    try:
        return business_rules.calcular_escore_irpo(respostas=req.respostas)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from None


@app.post("/calculos/asg-ppp")
def calcular_asg_ppp_endpoint(req: schemas.ASGPPPRequest):
    try:
        return business_rules.calcular_escore_asg_ppp(
            pontos_bloco1_peso=req.bloco1_peso,
            pontos_bloco2_ingestao=req.bloco2_ingestao,
            pontos_bloco3_sintomas=req.bloco3_sintomas,
            pontos_bloco4_capacidade=req.bloco4_capacidade,
            pontos_adicionais_estresse=req.adicionais_estresse,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from None


# Endpoints de Dashboard de Atendimento (Issue 5) ──────────────────────────


@app.get("/dashboard/jornadas-hoje", response_model=List[schemas.DashboardJornadaItem])
def get_dashboard_jornadas_hoje(db: Session = Depends(get_db)):
    """Retorna todas as jornadas de hoje com dados completos de paciente e etapas."""
    hoje = datetime.now(timezone.utc).date()
    jornadas = (
        db.query(models.Jornada)
        .filter(models.Jornada.data_acolhimento == hoje)
        .order_by(models.Jornada.chegada_em.asc().nullslast())
        .all()
    )

    result = []
    for j in jornadas:
        paciente = j.paciente
        if not paciente:
            continue

        etapas_sorted = sorted(j.etapas, key=lambda e: e.ordem)
        etapas_out = []
        for etapa in etapas_sorted:
            nome_area = etapa.area_atendimento.nome if etapa.area_atendimento else "Especialidade"
            prof_nome = None
            if etapa.profissional_responsavel:
                prof_nome = etapa.profissional_responsavel.nome
            etapas_out.append(
                schemas.EtapaDashboardItem(
                    area_id=str(etapa.area_atendimento_id),
                    nome_area=nome_area,
                    status=etapa.status,
                    ordem=etapa.ordem,
                    profissional_nome=prof_nome,
                    iniciada_em=etapa.iniciada_em,
                    finalizada_em=etapa.finalizada_em,
                )
            )

        result.append(
            schemas.DashboardJornadaItem(
                jornada_id=str(j.id),
                jornada_codigo=j.codigo or "",
                jornada_status=j.status,
                data_acolhimento=j.data_acolhimento,
                chegada_em=j.chegada_em,
                paciente_id=str(paciente.id),
                paciente_nome=paciente.nome_completo,
                paciente_cpf=paciente.cpf,
                paciente_codigo_publico=paciente.codigo_publico,
                paciente_data_nascimento=paciente.data_nascimento,
                diagnostico=j.diagnostico_principal or paciente.diagnosis,
                etapas=etapas_out,
            )
        )

    return result


@app.get("/dashboard/coordenacao", response_model=schemas.DashboardCoordenacaoResponse)
def get_dashboard_coordenacao(db: Session = Depends(get_db)):
    """Retorna indicadores agregados do dia para a coordenação."""
    from collections import defaultdict

    hoje = datetime.now(timezone.utc).date()
    jornadas = db.query(models.Jornada).filter(models.Jornada.data_acolhimento == hoje).all()

    total_dia = len(jornadas)
    por_status: dict = defaultdict(int)
    tempos_espera = []
    gargalos: dict = defaultdict(lambda: {"pendentes": 0, "em_atendimento": 0})
    tempos_por_area: dict = defaultdict(list)

    agora = datetime.now(timezone.utc)

    for j in jornadas:
        por_status[j.status] += 1

        # Tempo de espera: chegada até início do primeiro atendimento ou agora
        if j.chegada_em:
            referencia = j.iniciada_em or agora
            delta = (referencia - j.chegada_em).total_seconds() / 60.0
            if delta >= 0:
                tempos_espera.append(delta)

        # Gargalos e tempos por especialidade
        for etapa in j.etapas:
            nome_area = etapa.area_atendimento.nome if etapa.area_atendimento else "Desconhecida"
            if etapa.status == "PENDENTE":
                gargalos[nome_area]["pendentes"] += 1
            elif etapa.status == "EM_ATENDIMENTO":
                gargalos[nome_area]["em_atendimento"] += 1
            elif etapa.status == "ATENDIDO" and etapa.iniciada_em and etapa.finalizada_em:
                minutos = (etapa.finalizada_em - etapa.iniciada_em).total_seconds() / 60.0
                if minutos >= 0:
                    tempos_por_area[nome_area].append(minutos)

    tempo_medio_espera = (sum(tempos_espera) / len(tempos_espera)) if tempos_espera else None

    gargalos_list = [
        schemas.GargaloEspecialidade(
            nome_area=nome,
            pendentes=dados["pendentes"],
            em_atendimento=dados["em_atendimento"],
        )
        for nome, dados in gargalos.items()
        if dados["pendentes"] > 0 or dados["em_atendimento"] > 0
    ]
    gargalos_list.sort(key=lambda g: g.pendentes + g.em_atendimento, reverse=True)

    tempo_medio_list = [
        schemas.TempoMedioEspecialidade(
            nome_area=nome,
            tempo_medio_minutos=sum(tempos) / len(tempos),
        )
        for nome, tempos in tempos_por_area.items()
        if tempos
    ]
    tempo_medio_list.sort(key=lambda t: t.tempo_medio_minutos, reverse=True)

    return schemas.DashboardCoordenacaoResponse(
        total_dia=total_dia,
        por_status=dict(por_status),
        tempo_medio_espera_minutos=tempo_medio_espera,
        gargalos=gargalos_list,
        tempo_medio_por_especialidade=tempo_medio_list,
    )
