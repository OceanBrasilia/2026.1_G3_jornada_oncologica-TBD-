import uuid
from datetime import date

import pytest
from httpx import ASGITransport, AsyncClient

from app import models
from app.database import get_db
from app.main import app


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
        "treatment_stage": "Diagnóstico",
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
        perfil_id=perfil.id,
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
        diagnosis="Tumor de Teste",
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
        "observacao_geral": "Iniciando testes",
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
    assert response.status_code == 404

    # POST /journeys (código duplicado - teste de IntegrityError)
    dup_journey = journey_data.copy()
    response = await client.post("/journeys", json=dup_journey)
    assert response.status_code == 400
    assert "já existe" in response.json()["detail"].lower() or "integridade" in response.json()["detail"].lower()


@pytest.mark.anyio
async def test_pagination_endpoints(client, db_session):
    # Criar múltiplos pacientes
    for i in range(5):
        patient = models.Patient(
            id=uuid.uuid4(),
            codigo_publico=f"CAO-PAGE-{i:04d}",
            nome_completo=f"Paciente Paginado {i}",
            data_nascimento=date(1990, 1, 1),
            cpf=f"999.888.777-{i:02d}",
            name=f"Paciente Paginado {i}",
            email=f"page{i}@email.com",
            diagnosis="Diagnóstico Paginado",
        )
        db_session.add(patient)
    db_session.commit()

    # Testar paginação skip=0, limit=2
    response = await client.get("/patients?skip=0&limit=2")
    assert response.status_code == 200
    assert len(response.json()) == 2

    # Testar paginação skip=2, limit=2
    response = await client.get("/patients?skip=2&limit=2")
    assert response.status_code == 200
    assert len(response.json()) == 2

    # Testar paginação skip=4, limit=2
    response = await client.get("/patients?skip=4&limit=2")
    assert response.status_code == 200
    assert len(response.json()) == 1


@pytest.mark.anyio
async def test_portuguese_aliases_and_public_journey(client, db_session):
    # Criar paciente via /pacientes
    paciente_payload = {
        "codigo_publico": "CAO-PUB-001",
        "nome_completo": "Paciente Publico Teste",
        "data_nascimento": "1985-10-20",
        "cpf": "123.456.789-00",
        "name": "Paciente Publico Teste",
        "email": "publico@email.com",
        "diagnosis": "Câncer de Teste",
    }
    res_post = await client.post("/pacientes", json=paciente_payload)
    assert res_post.status_code == 201
    paciente_id = res_post.json()["id"]

    # Listar via /pacientes
    res_list = await client.get("/pacientes")
    assert res_list.status_code == 200
    assert any(p["id"] == paciente_id for p in res_list.json())

    # Obter via /pacientes/{id}
    res_get = await client.get(f"/pacientes/{paciente_id}")
    assert res_get.status_code == 200
    assert res_get.json()["nome_completo"] == "Paciente Publico Teste"

    # Consulta pública por código público
    res_pub = await client.get("/pacientes/CAO-PUB-001/jornada")
    assert res_pub.status_code == 200
    pub_data = res_pub.json()
    assert pub_data["paciente"]["nome_completo"] == "Paciente Publico Teste"
    assert pub_data["paciente"]["codigo_publico"] == "CAO-PUB-001"

    # Consulta pública por CPF
    res_pub_cpf = await client.get("/pacientes/123.456.789-00/jornada")
    assert res_pub_cpf.status_code == 200
    assert res_pub_cpf.json()["paciente"]["id"] == paciente_id

    # Consulta pública inexistente
    res_pub_404 = await client.get("/pacientes/INEXISTENTE/jornada")
    assert res_pub_404.status_code == 404
