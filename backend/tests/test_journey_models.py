import datetime

import pytest
from sqlalchemy.exc import IntegrityError

from app.models import (
    AreaAtendimento,
    ContatoPaciente,
    EtapaJornada,
    Jornada,
    JornadaAcompanhante,
    Patient,
    Perfil,
    Usuario,
)


def _setup_user(db_session):
    perfil = Perfil(codigo="MEDICO")
    db_session.add(perfil)
    db_session.commit()
    user = Usuario(nome="Dr. House", perfil_id=perfil.id)
    db_session.add(user)
    db_session.commit()
    return user


def test_create_patient(db_session):
    # Test patient creation
    patient = Patient(
        codigo_publico="PAC-001",
        nome_completo="José da Silva",
        data_nascimento=datetime.date(1980, 5, 20),
        cpf="12345678900",
        treatment_stage="Tratamento Ativo"
    )
    db_session.add(patient)
    db_session.commit()

    assert patient.id is not None
    assert patient.codigo_publico == "PAC-001"
    assert patient.nome_completo == "José da Silva"
    assert patient.data_nascimento == datetime.date(1980, 5, 20)
    assert patient.cpf == "12345678900"
    assert patient.treatment_stage == "Tratamento Ativo"
    assert patient.created_at is not None


def test_create_contato_paciente(db_session):
    patient = Patient(
        codigo_publico="PAC-002",
        nome_completo="Maria Silva",
        data_nascimento=datetime.date(1990, 8, 15),
        cpf="98765432100"
    )
    db_session.add(patient)
    db_session.commit()

    contato = ContatoPaciente(
        paciente_id=patient.id,
        nome="João Silva",
        relacao="Filho",
        telefone="11999998888",
        contato_emergencia=True,
        cuidador=True
    )
    db_session.add(contato)
    db_session.commit()

    assert contato.id is not None
    assert contato.paciente_id == patient.id
    assert contato.nome == "João Silva"
    assert contato.relacao == "Filho"
    assert contato.contato_emergencia is True
    assert contato.cuidador is True
    assert contato.ativo is True
    assert contato.patient == patient
    assert patient.contacts == [contato]


def test_create_jornada(db_session):
    user = _setup_user(db_session)
    patient = Patient(
        codigo_publico="PAC-003",
        nome_completo="Carlos Souza",
        data_nascimento=datetime.date(1975, 10, 10),
        cpf="11122233344"
    )
    db_session.add(patient)
    db_session.commit()

    jornada = Jornada(
        paciente_id=patient.id,
        criado_por_id=user.id,
        codigo="JORN-2026-001",
        data_acolhimento=datetime.date(2026, 8, 21),
        diagnostico_principal="C50 - Neoplasia maligna da mama"
    )
    db_session.add(jornada)
    db_session.commit()

    assert jornada.id is not None
    assert jornada.paciente_id == patient.id
    assert jornada.criado_por_id == user.id
    assert jornada.codigo == "JORN-2026-001"
    assert jornada.data_acolhimento == datetime.date(2026, 8, 21)
    assert jornada.status == "AGUARDANDO"  # default status
    assert jornada.diagnostico_principal == "C50 - Neoplasia maligna da mama"
    assert jornada.criado_em is not None
    assert jornada.atualizado_em is not None
    assert jornada.patient == patient
    assert jornada.criado_por == user


def test_patient_cascade_delete(db_session):
    user = _setup_user(db_session)
    patient = Patient(
        codigo_publico="PAC-004",
        nome_completo="Lucas Neto",
        data_nascimento=datetime.date(1985, 12, 1),
        cpf="55566677788"
    )
    db_session.add(patient)
    db_session.commit()

    contato = ContatoPaciente(
        paciente_id=patient.id,
        nome="Rita Neto",
        relacao="Mãe"
    )
    jornada = Jornada(
        paciente_id=patient.id,
        criado_por_id=user.id,
        codigo="JORN-2026-002",
        data_acolhimento=datetime.date(2026, 8, 21)
    )
    db_session.add_all([contato, jornada])
    db_session.commit()

    # Verify rows exist
    contato_id = contato.id
    jornada_id = jornada.id
    assert db_session.query(ContatoPaciente).filter_by(id=contato_id).first() is not None
    assert db_session.query(Jornada).filter_by(id=jornada_id).first() is not None

    # Delete Patient
    db_session.delete(patient)
    db_session.commit()

    # Verify they were cascade deleted
    assert db_session.query(ContatoPaciente).filter_by(id=contato_id).first() is None
    assert db_session.query(Jornada).filter_by(id=jornada_id).first() is None


def test_jornada_acompanhante(db_session):
    user = _setup_user(db_session)
    patient = Patient(
        codigo_publico="PAC-005",
        nome_completo="Beatriz Cruz",
        data_nascimento=datetime.date(1995, 3, 3),
        cpf="22233344455"
    )
    db_session.add(patient)
    db_session.commit()

    contato = ContatoPaciente(paciente_id=patient.id, nome="Pedro Cruz", relacao="Cônjuge")
    jornada = Jornada(
        paciente_id=patient.id,
        criado_por_id=user.id,
        codigo="JORN-2026-003",
        data_acolhimento=datetime.date(2026, 8, 21)
    )
    db_session.add_all([contato, jornada])
    db_session.commit()

    # Link companion to journey
    acompanhante = JornadaAcompanhante(
        jornada_id=jornada.id,
        contato_paciente_id=contato.id,
        observacao="Precisa de auxílio de locomoção"
    )
    db_session.add(acompanhante)
    db_session.commit()

    # Verify links
    assert acompanhante.jornada == jornada
    assert acompanhante.contato_paciente == contato
    assert acompanhante.observacao == "Precisa de auxílio de locomoção"
    assert jornada.acompanhantes == [acompanhante]
    assert contato.acompanhamentos == [acompanhante]


def test_etapa_jornada(db_session):
    user = _setup_user(db_session)
    patient = Patient(
        codigo_publico="PAC-006",
        nome_completo="Marcos Silva",
        data_nascimento=datetime.date(1960, 1, 1),
        cpf="44455566677"
    )
    area = AreaAtendimento(nome="Radioterapia", tipo="ASSISTENCIAL", ordem_padrao=3)
    db_session.add_all([patient, area])
    db_session.commit()

    jornada = Jornada(
        paciente_id=patient.id,
        criado_por_id=user.id,
        codigo="JORN-2026-004",
        data_acolhimento=datetime.date(2026, 8, 21)
    )
    db_session.add(jornada)
    db_session.commit()

    etapa = EtapaJornada(
        jornada_id=jornada.id,
        area_atendimento_id=area.id,
        profissional_responsavel_id=user.id,
        ordem=1,
        prioridade=2
    )
    db_session.add(etapa)
    db_session.commit()

    assert etapa.id is not None
    assert etapa.jornada_id == jornada.id
    assert etapa.area_atendimento_id == area.id
    assert etapa.status == "PENDENTE"  # default status
    assert etapa.ordem == 1
    assert etapa.prioridade == 2
    assert etapa.jornada == jornada
    assert etapa.area_atendimento == area
    assert etapa.profissional_responsavel == user


def test_etapa_jornada_unique_constraint(db_session):
    user = _setup_user(db_session)
    patient = Patient(
        codigo_publico="PAC-007",
        nome_completo="Julia Santos",
        data_nascimento=datetime.date(2000, 2, 2),
        cpf="77788899900"
    )
    area = AreaAtendimento(nome="Psicologia", tipo="ASSISTENCIAL", ordem_padrao=4)
    db_session.add_all([patient, area])
    db_session.commit()

    jornada = Jornada(
        paciente_id=patient.id,
        criado_por_id=user.id,
        codigo="JORN-2026-005",
        data_acolhimento=datetime.date(2026, 8, 21)
    )
    db_session.add(jornada)
    db_session.commit()

    etapa1 = EtapaJornada(
        jornada_id=jornada.id,
        area_atendimento_id=area.id,
        ordem=1,
        prioridade=1
    )
    db_session.add(etapa1)
    db_session.commit()

    # Try creating duplicate stage (same journey, same area)
    etapa2 = EtapaJornada(
        jornada_id=jornada.id,
        area_atendimento_id=area.id,
        ordem=2,
        prioridade=1
    )
    db_session.add(etapa2)
    
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()
