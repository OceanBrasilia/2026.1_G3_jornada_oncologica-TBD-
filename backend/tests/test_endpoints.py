import pytest
import uuid
from datetime import date
from httpx import ASGITransport, AsyncClient
from app.main import app
from app.database import get_db
from app import models

@pytest.fixture
def anyio_backend():
    return "asyncio"

@pytest.fixture
async def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()

@pytest.mark.anyio
async def test_health_check(client):
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

@pytest.mark.anyio
async def test_patients_crud(client):
    # GET /patients (vazio)
    response = await client.get("/patients")
    assert response.status_code == 200
    assert response.json() == []

    # POST /patients (criar paciente)
    patient_data = {
        "codigo_publico": "CAO-TEST-0001",
        "nome_completo": "Paciente de Teste Endpoints",
        "data_nascimento": "1990-05-15",
        "cpf": "111.222.333-44",
        "name": "Paciente de Teste Endpoints",
        "email": "testepaciente@email.com",
        "diagnosis": "Câncer de Teste",
        "treatment_stage": "Diagnóstico"
    }
    response = await client.post("/patients", json=patient_data)
    assert response.status_code == 201
    created_patient = response.json()
    assert created_patient["nome_completo"] == patient_data["nome_completo"]
    assert "id" in created_patient

    # GET /patients/{id}
    patient_id = created_patient["id"]
    response = await client.get(f"/patients/{patient_id}")
    assert response.status_code == 200
    assert response.json()["cpf"] == patient_data["cpf"]

    # GET /patients/{invalid_id}
    response = await client.get(f"/patients/{uuid.uuid4()}")
    assert response.status_code == 404

    # POST /patients (CPF duplicado)
    response = await client.post("/patients", json=patient_data)
    assert response.status_code == 400
    assert "CPF" in response.json()["detail"]

@pytest.mark.anyio
async def test_journeys_endpoints(client, db_session):
    # Criar um perfil de profissional para associar ao usuario criador
    perfil = models.Perfil(id=uuid.uuid4(), codigo="PROFISSIONAL")
    db_session.add(perfil)
    
    # Criar usuário criador
    usuario = models.Usuario(
        id=uuid.uuid4(),
        nome="Médico Teste",
        email="medicoteste@hospital.com.br",
        senha_hash="dummy",
        perfil_id=perfil.id
    )
    db_session.add(usuario)
    
    # Criar paciente
    paciente = models.Patient(
        id=uuid.uuid4(),
        codigo_publico="CAO-TEST-JOURNEY",
        nome_completo="Paciente de Jornada Teste",
        data_nascimento=date(1985, 12, 10),
        cpf="555.666.777-88",
        name="Paciente de Jornada Teste",
        email="pacientejornada@email.com",
        diagnosis="Tumor de Teste"
    )
    db_session.add(paciente)
    db_session.commit()

    # GET /journeys (vazio)
    response = await client.get("/journeys")
    assert response.status_code == 200
    assert response.json() == []

    # POST /journeys
    journey_data = {
        "paciente_id": str(paciente.id),
        "criado_por_id": str(usuario.id),
        "codigo": "CAO-2026-0099",
        "data_acolhimento": "2026-08-28",
        "diagnostico_principal": "Tumor de Teste",
        "fase_tratamento": "Acolhimento",
        "origem": "Consultório do Teste",
        "observacao_geral": "Iniciando testes"
    }
    response = await client.post("/journeys", json=journey_data)
    assert response.status_code == 201
    created_journey = response.json()
    assert created_journey["codigo"] == journey_data["codigo"]
    assert created_journey["status"] == "AGUARDANDO"

    # GET /journeys
    response = await client.get("/journeys")
    assert response.status_code == 200
    assert len(response.json()) == 1

    # GET /journeys/{id}
    journey_id = created_journey["id"]
    response = await client.get(f"/journeys/{journey_id}")
    assert response.status_code == 200
    assert response.json()["codigo"] == journey_data["codigo"]

    # GET /patients/{id}/journeys
    response = await client.get(f"/patients/{paciente.id}/journeys")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["id"] == journey_id

    # POST /journeys (paciente inválido)
    invalid_journey = journey_data.copy()
    invalid_journey["paciente_id"] = str(uuid.uuid4())
    response = await client.post("/journeys", json=invalid_journey)
    assert response.status_code == 400
