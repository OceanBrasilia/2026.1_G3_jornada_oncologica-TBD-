import os
import sys
from datetime import date

import bcrypt
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app import models
from app.database import get_db
from app.main import app as main_app

# Add backend directory to sys.path to allow importing app module
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import app.models  # noqa: F401
from app.database import Base


@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


@pytest.fixture(scope="function")
def db_engine():
    # Use SQLite in-memory, recreated for each test for perfect isolation and no transaction warnings
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session(db_engine):
    Session = sessionmaker(bind=db_engine, autocommit=False, autoflush=False)
    session = Session()
    try:
        yield session
    finally:
        session.close()


# Fixture para configurar o TestClient com injeção do db_session em memória do pytest
@pytest.fixture(scope="function")
def client(db_session: Session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    main_app.dependency_overrides[get_db] = override_get_db
    yield TestClient(main_app)
    # Limpa as sobrescritas após o teste
    main_app.dependency_overrides.clear()


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
        senha_hash=bcrypt.hashpw(b"any", bcrypt.gensalt()).decode("utf-8"),
        perfil_id=perfil_seed.id,
        area_atendimento_id=area_seed.id,
    )
    db_session.add(usuario)
    db_session.commit()
    db_session.refresh(usuario)
    return usuario


@pytest.fixture
def paciente_seed(db_session: Session):
    paciente = models.Patient(
        codigo_publico="PAC-123", nome_completo="João Testador", data_nascimento=date(1990, 1, 1), cpf="12345678901"
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
        jornada_id=jornada.id, area_atendimento_id=area_seed.id, status="PENDENTE", ordem=1, prioridade=1
    )
    db_session.add(etapa)
    db_session.commit()
    db_session.refresh(etapa)

    return jornada, etapa


# --- Testes de Autenticação (/login) ---