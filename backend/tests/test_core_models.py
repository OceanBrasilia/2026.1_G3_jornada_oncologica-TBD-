import pytest
from sqlalchemy.exc import IntegrityError
from app.models import Perfil, AreaAtendimento, Usuario


def test_create_perfil(db_session):
    # Test creating a profile with default values
    perfil = Perfil(codigo="MEDICO")
    db_session.add(perfil)
    db_session.commit()

    assert perfil.id is not None
    assert perfil.codigo == "MEDICO"
    assert perfil.ativo is True  # default value


def test_unique_perfil_codigo(db_session):
    # Test unique constraint on perfil.codigo
    perfil1 = Perfil(codigo="ADMIN")
    db_session.add(perfil1)
    db_session.commit()

    perfil2 = Perfil(codigo="ADMIN")
    db_session.add(perfil2)
    
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()


def test_create_area_atendimento(db_session):
    # Test creating AreaAtendimento
    area = AreaAtendimento(
        nome="Quimioterapia",
        tipo="ASSISTENCIAL",
        ordem_padrao=1,
        meta_tempo_minutos=60
    )
    db_session.add(area)
    db_session.commit()

    assert area.id is not None
    assert area.nome == "Quimioterapia"
    assert area.tipo == "ASSISTENCIAL"
    assert area.ordem_padrao == 1
    assert area.meta_tempo_minutos == 60
    assert area.ativa is True  # default value


def test_create_usuario(db_session):
    # Setup profile and area
    perfil = Perfil(codigo="ENFERMEIRO")
    area = AreaAtendimento(nome="Triagem", tipo="OPERACIONAL", ordem_padrao=2)
    db_session.add_all([perfil, area])
    db_session.commit()

    # Test creating a user linked to profile and area
    usuario = Usuario(
        nome="Ana Silva",
        perfil_id=perfil.id,
        area_atendimento_id=area.id
    )
    db_session.add(usuario)
    db_session.commit()

    assert usuario.id is not None
    assert usuario.nome == "Ana Silva"
    assert usuario.perfil_id == perfil.id
    assert usuario.area_atendimento_id == area.id

    # Verify relationships
    assert usuario.perfil == perfil
    assert usuario.area_atendimento == area
    assert perfil.usuarios == [usuario]
    assert area.usuarios == [usuario]


def test_usuario_missing_perfil(db_session):
    # Test that creating a user without a profile raises IntegrityError
    usuario = Usuario(nome="Sem Perfil")
    db_session.add(usuario)
    
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()
