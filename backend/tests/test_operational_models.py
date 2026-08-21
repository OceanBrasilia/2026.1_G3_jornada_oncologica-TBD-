import datetime
from decimal import Decimal
from app.models import (
    Perfil,
    Usuario,
    Patient,
    Jornada,
    AreaAtendimento,
    EtapaJornada,
    DadoCompartilhadoDef,
    DadoCompartilhado,
    Pendencia,
    Encaminhamento,
    RegistroProfissional,
    Anexo,
    FichaConsolidada,
    RegistroAuditoria
)


def _setup_base_env(db_session):
    perfil = Perfil(codigo="ADMIN")
    db_session.add(perfil)
    db_session.commit()
    user = Usuario(nome="Dr. John Watson", perfil_id=perfil.id)
    patient = Patient(
        codigo_publico="PAC-999",
        nome_completo="Sherlock Holmes",
        data_nascimento=datetime.date(1854, 1, 6),
        cpf="12312312312"
    )
    area = AreaAtendimento(nome="Geral", tipo="OPERACIONAL", ordem_padrao=1)
    db_session.add_all([user, patient, area])
    db_session.commit()

    jornada = Jornada(
        paciente_id=patient.id,
        criado_por_id=user.id,
        codigo="JORN-999",
        data_acolhimento=datetime.date(2026, 8, 21)
    )
    db_session.add(jornada)
    db_session.commit()

    etapa = EtapaJornada(
        jornada_id=jornada.id,
        area_atendimento_id=area.id,
        ordem=1,
        prioridade=1
    )
    db_session.add(etapa)
    db_session.commit()

    return user, patient, area, jornada, etapa


def test_dado_compartilhado(db_session):
    user, patient, _, journey, _ = _setup_base_env(db_session)

    # Definition
    definition = DadoCompartilhadoDef(nome="Alergias", tipo="TEXTO")
    db_session.add(definition)
    db_session.commit()

    assert definition.id is not None
    assert definition.ativo is True

    # Shared Data
    data = DadoCompartilhado(
        definicao_id=definition.id,
        paciente_id=patient.id,
        jornada_id=journey.id,
        registrado_por_id=user.id,
        valor_texto="Alergia a penicilina",
        atual=True
    )
    db_session.add(data)
    db_session.commit()

    assert data.id is not None
    assert data.valor_texto == "Alergia a penicilina"
    assert data.atual is True
    assert data.definicao == definition
    assert data.patient == patient
    assert data.jornada == journey
    assert data.registrado_por == user


def test_pendencia(db_session):
    user, _, area, journey, etapa = _setup_base_env(db_session)

    pendencia = Pendencia(
        jornada_id=journey.id,
        etapa_origem_id=etapa.id,
        area_destino_id=area.id,
        usuario_responsavel_id=user.id,
        descricao="Aguardando liberação de leito",
        prioridade="ALTA"
    )
    db_session.add(pendencia)
    db_session.commit()

    assert pendencia.id is not None
    assert pendencia.descricao == "Aguardando liberação de leito"
    assert pendencia.status == "PENDENTE"  # default
    assert pendencia.jornada == journey
    assert pendencia.etapa_origem == etapa
    assert pendencia.area_destino == area
    assert pendencia.usuario_responsavel == user


def test_encaminhamento(db_session):
    user, _, area, journey, etapa = _setup_base_env(db_session)

    encaminhamento = Encaminhamento(
        jornada_id=journey.id,
        etapa_origem_id=etapa.id,
        criado_por_id=user.id,
        area_destino_id=area.id,
        status="PENDENTE"
    )
    db_session.add(encaminhamento)
    db_session.commit()

    assert encaminhamento.id is not None
    assert encaminhamento.jornada == journey
    assert encaminhamento.etapa_origem == etapa
    assert encaminhamento.criado_por == user
    assert encaminhamento.area_destino == area


def test_registro_profissional(db_session):
    user, _, _, _, etapa = _setup_base_env(db_session)

    registro = RegistroProfissional(
        etapa_jornada_id=etapa.id,
        autor_id=user.id,
        tipo="EVOLUCAO",
        texto="Paciente estável, sem queixas."
    )
    db_session.add(registro)
    db_session.commit()

    assert registro.id is not None
    assert registro.tipo == "EVOLUCAO"
    assert registro.texto == "Paciente estável, sem queixas."
    assert registro.etapa_jornada == etapa
    assert registro.autor == user


def test_anexo(db_session):
    _, patient, _, journey, etapa = _setup_base_env(db_session)

    anexo = Anexo(
        paciente_id=patient.id,
        jornada_id=journey.id,
        etapa_jornada_id=etapa.id,
        nome="exame.pdf",
        caminho="/uploads/exame.pdf",
        hash="abc123hash"
    )
    db_session.add(anexo)
    db_session.commit()

    assert anexo.id is not None
    assert anexo.nome == "exame.pdf"
    assert anexo.caminho == "/uploads/exame.pdf"
    assert anexo.hash == "abc123hash"
    assert anexo.patient == patient
    assert anexo.jornada == journey
    assert anexo.etapa_jornada == etapa


def test_ficha_consolidada(db_session):
    user, _, _, journey, _ = _setup_base_env(db_session)

    ficha = FichaConsolidada(
        jornada_id=journey.id,
        gerada_por_id=user.id,
        versao=1,
        caminho_arquivo="/reports/ficha_consolidada_v1.pdf",
        hash_arquivo="def456hash"
    )
    db_session.add(ficha)
    db_session.commit()

    assert ficha.id is not None
    assert ficha.versao == 1
    assert ficha.caminho_arquivo == "/reports/ficha_consolidada_v1.pdf"
    assert ficha.hash_arquivo == "def456hash"
    assert ficha.jornada == journey
    assert ficha.gerada_por == user


def test_registro_auditoria(db_session):
    user, _, _, _, _ = _setup_base_env(db_session)

    auditoria = RegistroAuditoria(
        usuario_id=user.id,
        acao="CRIAR_PACIENTE",
        detalhe="Criou o paciente Sherlock Holmes"
    )
    db_session.add(auditoria)
    db_session.commit()

    assert auditoria.id is not None
    assert auditoria.acao == "CRIAR_PACIENTE"
    assert auditoria.detalhe == "Criou o paciente Sherlock Holmes"
    assert auditoria.usuario == user
