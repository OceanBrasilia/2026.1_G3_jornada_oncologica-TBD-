import uuid
from datetime import datetime, timezone
from typing import List
from uuid import UUID

import bcrypt
import shortuuid
from dateutil.relativedelta import relativedelta
from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
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


# ─── Aliases em português e Consulta Pública ──────────────────────────────────


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


# ─── Endpoints de Cálculos Clínicos (Issue 8) ─────────────────────────────────


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


@app.post("/journeys/{id}/forms/{id_especialidade}", status_code=status.HTTP_201_CREATED)
def submit_form(
    id: uuid.UUID,
    id_especialidade: uuid.UUID,
    req: schemas.PreenchimentoCreate,
    db: Session = Depends(get_db)
):
    journey = db.query(models.Jornada).filter(models.Jornada.id == id).first()
    if not journey:
        raise HTTPException(status_code=404, detail="Jornada não encontrada.")
    
    step = db.query(models.EtapaJornada).filter(
        models.EtapaJornada.jornada_id == id,
        models.EtapaJornada.area_atendimento_id == id_especialidade
    ).first()
    if not step:
        raise HTTPException(status_code=404, detail="Especialidade/Etapa não encontrada nesta jornada.")
        
    preenchimento = models.PreenchimentoFormulario(
        etapa_jornada_id=step.id,
        formulario_versao_id=req.formulario_versao_id,
        profissional_id=req.profissional_id,
        status="FINALIZADO"
    )
    db.add(preenchimento)
    db.flush()
    
    for r in req.respostas:
        nova_resposta = models.Resposta(
            preenchimento_id=preenchimento.id,
            campo_formulario_id=r.campo_formulario_id,
            valor_texto=r.valor_texto,
            valor_numero=r.valor_numero,
            valor_booleano=r.valor_booleano,
            valor_data=r.valor_data
        )
        db.add(nova_resposta)
        
    db.commit()
    return {"message": "Formulário salvo com sucesso.", "preenchimento_id": str(preenchimento.id)}

@app.get("/journeys/{id}/consolidated", response_model=schemas.ResumoConsolidadoResponse)
def get_consolidated_resume(id: uuid.UUID, db: Session = Depends(get_db)):
    journey = db.query(models.Jornada).filter(models.Jornada.id == id).first()
    if not journey:
        raise HTTPException(status_code=404, detail="Jornada não encontrada.")
        
    paciente = journey.patient
    hoje = datetime.now(timezone.utc).date()
    delta = relativedelta(hoje, paciente.data_nascimento)
    idade_exata = f"{delta.years} anos, {delta.months} meses e {delta.days} dias"
    
    # Busca preenchimentos da jornada
    preenchimentos = db.query(models.PreenchimentoFormulario).join(
        models.EtapaJornada
    ).filter(
        models.EtapaJornada.jornada_id == id
    ).all()
    
    especialidades_list = []
    
    for p in preenchimentos:
        area_nome = p.etapa_jornada.area_atendimento.nome
        prof_nome = p.profissional.nome if p.profissional else None
        
        pontuacao_total = 0
        peso = None
        altura = None
        
        resumo_respostas = []
        
        for resposta in p.respostas:
            campo = resposta.campo_formulario
            
            valor_exibicao = ""
            pontuacao_item = None
            
            if resposta.valor_texto is not None:
                valor_exibicao = resposta.valor_texto
                for opcao in campo.opcoes:
                    if opcao.valor == resposta.valor_texto:
                        pontuacao_item = opcao.pontuacao
                        break
            elif resposta.valor_numero is not None:
                valor_exibicao = str(resposta.valor_numero)
            elif resposta.valor_booleano is not None:
                valor_exibicao = "Sim" if resposta.valor_booleano else "Não"
            elif resposta.valor_data is not None:
                valor_exibicao = resposta.valor_data.strftime("%Y-%m-%d")
                
            if pontuacao_item is not None:
                pontuacao_total += pontuacao_item
                
            nome_lower = campo.nome.lower()
            if "peso" in nome_lower and resposta.valor_numero is not None:
                peso = float(resposta.valor_numero)
            if "altura" in nome_lower and resposta.valor_numero is not None:
                altura = float(resposta.valor_numero)
                
            resumo_respostas.append(schemas.ResumoCampoResponse(
                campo=campo.nome,
                valor=valor_exibicao,
                pontuacao=pontuacao_item
            ))
            
        imc_calc = None
        if peso is not None and altura is not None and altura > 0:
            imc_calc = round(peso / (altura ** 2), 2)
            
        especialidades_list.append(schemas.ResumoEspecialidadeResponse(
            area_atendimento_nome=area_nome,
            profissional_nome=prof_nome,
            pontuacao_total=pontuacao_total,
            imc_calculado=imc_calc,
            respostas=resumo_respostas
        ))
        
    return schemas.ResumoConsolidadoResponse(
        jornada_id=journey.id,
        paciente_nome=paciente.nome_completo,
        idade_exata=idade_exata,
        especialidades=especialidades_list
    )

@app.get("/journeys/{id}/print", response_class=HTMLResponse)
def print_consolidated_resume(id: uuid.UUID, db: Session = Depends(get_db)):
    data = get_consolidated_resume(id, db)
    
    html = f"<html><head><title>Resumo Clínico - {data.paciente_nome}</title>"
    html += "<style>body { font-family: Arial, sans-serif; padding: 20px; } h1 { border-bottom: 2px solid #333; } .especialidade { margin-top: 20px; padding: 10px; border: 1px solid #ddd; } .especialidade h2 { margin-top: 0; } table { width: 100%; border-collapse: collapse; margin-top: 10px; } th, td { border: 1px solid #ccc; padding: 8px; text-align: left; } th { background-color: #f9f9f9; } @media print { body { padding: 0; } .especialidade { page-break-inside: avoid; } }</style></head>"
    html += f"<body><h1>Resumo Consolidado - Jornada</h1><p><strong>Paciente:</strong> {data.paciente_nome}</p><p><strong>Idade:</strong> {data.idade_exata}</p><hr>"
    
    for esp in data.especialidades:
        html += f"<div class='especialidade'><h2>{esp.area_atendimento_nome}</h2><p><strong>Profissional:</strong> {esp.profissional_nome or 'Não informado'}</p><p><strong>Pontuação Total (Score/Risco):</strong> {esp.pontuacao_total}</p>"
        if esp.imc_calculado:
            html += f"<p><strong>IMC Calculado:</strong> {esp.imc_calculado}</p>"
            
        html += "<table><tr><th>Campo</th><th>Resposta</th><th>Pontuação</th></tr>"
        for resp in esp.respostas:
            pont_str = str(resp.pontuacao) if resp.pontuacao is not None else "-"
            html += f"<tr><td>{resp.campo}</td><td>{resp.valor}</td><td>{pont_str}</td></tr>"
        html += "</table></div>"
        
    html += "</body><script>window.onload = function() { window.print(); }</script></html>"
    return HTMLResponse(content=html)

