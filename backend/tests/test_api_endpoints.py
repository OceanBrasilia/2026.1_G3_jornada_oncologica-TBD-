import uuid
from datetime import date, datetime

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app import models
from app.database import get_db
from app.main import app

# Fixture para configurar o TestClient com injeção do db_session em memória do pytest
@pytest.fixture(scope="function")
def client(db_session: Session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    # Limpa as sobrescritas após o teste
    app.dependency_overrides.clear()


# --- Fixtures para Seed de Banco de Dados ---

@pytest.fixture
def perfil_seed(db_session: Session):
    perfil = models.Perfil(codigo="ADM", ativo=True)
    db_session.add(perfil)
    db_session.commit()
    db_session.refresh(perfil)
    return perfil


@pytest.fixture
def area_seed(db_session: Session):
    area = models.AreaAtendimento(nome="Triagem", tipo="ASSISTENCIAL", ordem_padrao=1)
    db_session.add(area)
    db_session.commit()
    db_session.refresh(area)
    return area


@pytest.fixture
def usuario_seed(db_session: Session, perfil_seed, area_seed):
    usuario = models.Usuario(
        nome="Dr. Teste",
        email="drteste@example.com",
        senha_hash="hashfalso",  # A API de login (para MVP) só checa se existe o e-mail no banco
        perfil_id=perfil_seed.id,
        area_atendimento_id=area_seed.id
    )
    db_session.add(usuario)
    db_session.commit()
    db_session.refresh(usuario)
    return usuario


@pytest.fixture
def paciente_seed(db_session: Session):
    paciente = models.Patient(
        codigo_publico="PAC-123",
        nome_completo="João Testador",
        data_nascimento=date(1990, 1, 1),
        cpf="12345678901"
    )
    db_session.add(paciente)
    db_session.commit()
    db_session.refresh(paciente)
    return paciente


@pytest.fixture
def jornada_seed(db_session: Session, paciente_seed, usuario_seed, area_seed):
    jornada = models.Jornada(
        paciente_id=paciente_seed.id,
        criado_por_id=usuario_seed.id,
        codigo="JORN-TESTE",
        data_acolhimento=date.today(),
    )
    db_session.add(jornada)
    db_session.commit()
    db_session.refresh(jornada)

    etapa = models.EtapaJornada(
        jornada_id=jornada.id,
        area_atendimento_id=area_seed.id,
        status="PENDENTE",
        ordem=1,
        prioridade=1
    )
    db_session.add(etapa)
    db_session.commit()
    db_session.refresh(etapa)

    return jornada, etapa


# --- Testes de Autenticação (/login) ---

def test_login_success(client: TestClient, usuario_seed):
    response = client.post("/login", json={"email": "drteste@example.com", "password": "any"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_failure(client: TestClient):
    response = client.post("/login", json={"email": "inexistente@example.com", "password": "any"})
    assert response.status_code == 401
    assert response.json()["detail"] == "Credenciais inválidas"


# --- Testes CRUD Pacientes (/patients) ---

def test_create_patient_success(client: TestClient):
    payload = {
        "nome_completo": "Maria Nova",
        "data_nascimento": "1985-05-15",
        "cpf": "09876543210"
    }
    response = client.post("/patients", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["nome_completo"] == "Maria Nova"
    assert "codigo_publico" in data  # Gerado automaticamente pela API


def test_create_patient_cpf_conflict(client: TestClient, paciente_seed):
    payload = {
        "nome_completo": "Outro João",
        "data_nascimento": "1990-01-01",
        "cpf": paciente_seed.cpf  # Mesmo CPF do seed
    }
    response = client.post("/patients", json=payload)
    assert response.status_code == 400
    assert "Já existe um paciente cadastrado com este CPF" in response.json()["detail"]


def test_get_patients(client: TestClient, paciente_seed):
    response = client.get("/patients")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["cpf"] == paciente_seed.cpf


def test_get_patient_by_id(client: TestClient, paciente_seed):
    response = client.get(f"/patients/{paciente_seed.id}")
    assert response.status_code == 200
    assert response.json()["cpf"] == paciente_seed.cpf


def test_get_patient_not_found(client: TestClient):
    fake_id = str(uuid.uuid4())
    response = client.get(f"/patients/{fake_id}")
    assert response.status_code == 404


# --- Testes de Jornadas e Etapas (/journeys) ---

def test_create_journey_success(client: TestClient, paciente_seed, usuario_seed):
    payload = {
        "paciente_id": str(paciente_seed.id),
        "criado_por_id": str(usuario_seed.id)
    }
    response = client.post("/journeys", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["status"] == "AGUARDANDO"
    assert data["paciente_id"] == str(paciente_seed.id)


def test_create_journey_invalid_patient_fk(client: TestClient, usuario_seed):
    payload = {
        "paciente_id": str(uuid.uuid4()),  # Inexistente
        "criado_por_id": str(usuario_seed.id)
    }
    response = client.post("/journeys", json=payload)
    assert response.status_code == 404
    assert response.json()["detail"] == "Paciente não encontrado."


def test_create_journey_invalid_user_fk(client: TestClient, paciente_seed):
    payload = {
        "paciente_id": str(paciente_seed.id),
        "criado_por_id": str(uuid.uuid4())  # Inexistente
    }
    response = client.post("/journeys", json=payload)
    assert response.status_code == 404
    assert response.json()["detail"] == "Usuário (criador) não encontrado."


def test_get_journey_by_id(client: TestClient, jornada_seed):
    jornada, _ = jornada_seed
    response = client.get(f"/journeys/{jornada.id}")
    assert response.status_code == 200
    assert response.json()["codigo"] == jornada.codigo


def test_update_journey_step(client: TestClient, jornada_seed, usuario_seed):
    jornada, etapa = jornada_seed
    
    # A etapa está como PENDENTE na seed
    assert etapa.status == "PENDENTE"
    assert etapa.iniciada_em is None

    payload = {
        "status": "EM_ATENDIMENTO",
        "profissional_responsavel_id": str(usuario_seed.id),
        "observacao": "Iniciando atendimento de teste"
    }

    response = client.patch(f"/journeys/{jornada.id}/steps/{etapa.id}", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    # Checa retorno da API
    assert data["status"] == "EM_ATENDIMENTO"
    assert data["iniciada_em"] is not None
    assert data["observacao"] == "Iniciando atendimento de teste"
    assert data["profissional_responsavel_id"] == str(usuario_seed.id)


# --- Teste aprofundado direto no Banco de Dados: Chaves Estrangeiras ---

def test_database_foreign_key_enforcement(db_session: Session, usuario_seed):
    """
    Testa se o banco de dados de teste (com PRAGMA foreign_keys=ON) 
    realmente barra cadastros diretos (sem a proteção da API) que violam integridade relacional.
    """
    invalid_patient_id = uuid.uuid4()
    
    # Tentando forçar uma jornada com UUID falso de paciente direto pelo SQLAlchemy
    invalid_journey = models.Jornada(
        paciente_id=invalid_patient_id, 
        criado_por_id=usuario_seed.id,
        codigo="JORN-INV",
        data_acolhimento=date.today()
    )
    
    db_session.add(invalid_journey)
    
    with pytest.raises(IntegrityError):
        # O SQLite emite o erro relacional aqui devido ao PRAGMA que ativamos
        db_session.commit()
    
    # Rollback para deixar a session limpa
    db_session.rollback()
