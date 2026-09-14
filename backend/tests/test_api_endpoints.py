import uuid
from datetime import date

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app import models

# --- Testes de Autenticação (/login) ---


def test_login_success(client: TestClient, usuario_seed):
    response = client.post("/login", json={"email": "drteste@example.com", "password": "any"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client: TestClient, usuario_seed):
    response = client.post("/login", json={"email": "drteste@example.com", "password": "wrong"})
    assert response.status_code == 401
    assert response.json()["detail"] == "Credenciais inválidas"


def test_login_failure(client: TestClient):
    response = client.post("/login", json={"email": "inexistente@example.com", "password": "any"})
    assert response.status_code == 401
    assert response.json()["detail"] == "Credenciais inválidas"


# --- Testes CRUD Pacientes (/patients) ---


def test_create_patient_success(client: TestClient):
    payload = {"nome_completo": "Maria Nova", "data_nascimento": "1985-05-15", "cpf": "09876543210"}
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
        "cpf": paciente_seed.cpf,  # Mesmo CPF do seed
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
    payload = {"paciente_id": str(paciente_seed.id), "criado_por_id": str(usuario_seed.id)}
    response = client.post("/journeys", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["status"] == "AGUARDANDO"
    assert data["paciente_id"] == str(paciente_seed.id)


def test_create_journey_invalid_patient_fk(client: TestClient, usuario_seed):
    payload = {
        "paciente_id": str(uuid.uuid4()),  # Inexistente
        "criado_por_id": str(usuario_seed.id),
    }
    response = client.post("/journeys", json=payload)
    assert response.status_code == 404
    assert response.json()["detail"] == "Paciente não encontrado."


def test_create_journey_invalid_user_fk(client: TestClient, paciente_seed):
    payload = {
        "paciente_id": str(paciente_seed.id),
        "criado_por_id": str(uuid.uuid4()),  # Inexistente
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
        "observacao": "Iniciando atendimento de teste",
    }

    response = client.patch(f"/journeys/{jornada.id}/steps/{etapa.id}", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Checa retorno da API
    assert data["status"] == "EM_ATENDIMENTO"
    assert data["iniciada_em"] is not None
    assert data["observacao"] == "Iniciando atendimento de teste"
    assert data["profissional_responsavel_id"] == str(usuario_seed.id)


def test_update_journey_step_invalid_status(client: TestClient, jornada_seed):
    jornada, etapa = jornada_seed
    payload = {"status": "INVALIDO"}
    response = client.patch(f"/journeys/{jornada.id}/steps/{etapa.id}", json=payload)
    assert response.status_code == 422  # Erro do pydantic


def test_update_journey_step_state_reversal(client: TestClient, jornada_seed, usuario_seed):
    jornada, etapa = jornada_seed

    # Avança para EM_ATENDIMENTO
    client.patch(f"/journeys/{jornada.id}/steps/{etapa.id}", json={"status": "EM_ATENDIMENTO"})

    # Retorna para PENDENTE
    response = client.patch(f"/journeys/{jornada.id}/steps/{etapa.id}", json={"status": "PENDENTE"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "PENDENTE"
    assert data["iniciada_em"] is None
    assert data["finalizada_em"] is None


# --- Teste aprofundado direto no Banco de Dados: Chaves Estrangeiras ---


def test_database_foreign_key_enforcement(db_session: Session, usuario_seed):
    """
    Testa se o banco de dados de teste (com PRAGMA foreign_keys=ON)
    realmente barra cadastros diretos (sem a proteção da API) que violam integridade relacional.
    """
    invalid_patient_id = uuid.uuid4()

    # Tentando forçar uma jornada com UUID falso de paciente direto pelo SQLAlchemy
    invalid_journey = models.Jornada(
        paciente_id=invalid_patient_id, criado_por_id=usuario_seed.id, codigo="JORN-INV", data_acolhimento=date.today()
    )

    db_session.add(invalid_journey)

    with pytest.raises(IntegrityError):
        # O SQLite emite o erro relacional aqui devido ao PRAGMA que ativamos
        db_session.commit()

    # Rollback para deixar a session limpa
    db_session.rollback()
