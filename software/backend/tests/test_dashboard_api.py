from datetime import datetime, timezone

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


def test_dashboard_jornadas_hoje_empty(client: TestClient):
    response = client.get("/dashboard/jornadas-hoje")
    assert response.status_code == 200
    assert response.json() == []


def test_dashboard_jornadas_hoje_with_data(client: TestClient, db_session: Session, jornada_seed):
    jornada, etapa = jornada_seed
    response = client.get("/dashboard/jornadas-hoje")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    item = data[0]
    assert item["jornada_id"] == str(jornada.id)
    assert item["jornada_codigo"] == "JORN-TESTE"
    assert item["paciente_nome"] == "João Testador"
    assert len(item["etapas"]) == 1
    assert item["etapas"][0]["nome_area"] == "Triagem"
    assert item["etapas"][0]["status"] == "PENDENTE"


def test_dashboard_coordenacao(client: TestClient, db_session: Session, jornada_seed, usuario_seed, area_seed):
    jornada, etapa = jornada_seed

    # Configura tempos e status na etapa para testar indicadores
    jornada.chegada_em = datetime.now(timezone.utc)
    jornada.iniciada_em = datetime.now(timezone.utc)
    etapa.status = "EM_ATENDIMENTO"
    etapa.profissional_responsavel_id = usuario_seed.id
    db_session.commit()

    response = client.get("/dashboard/coordenacao")
    assert response.status_code == 200
    data = response.json()
    assert data["total_dia"] == 1
    assert len(data["gargalos"]) >= 1
    assert data["gargalos"][0]["nome_area"] == "Triagem"
    assert data["gargalos"][0]["em_atendimento"] == 1
