import datetime
from decimal import Decimal

import pytest
from sqlalchemy.exc import IntegrityError

from app.models import (
    AreaAtendimento,
    CampoFormulario,
    CampoOpcao,
    EtapaJornada,
    Formulario,
    FormularioVersao,
    Jornada,
    Patient,
    Perfil,
    PreenchimentoFormulario,
    Resposta,
    Usuario,
)


def _setup_stage_and_user(db_session):
    # Setup profile and user
    perfil = Perfil(codigo="MEDICO")
    db_session.add(perfil)
    db_session.commit()
    user = Usuario(nome="Dr. Gregory", perfil_id=perfil.id)
    db_session.add(user)
    db_session.commit()

    # Setup patient and journey
    patient = Patient(
        codigo_publico="PAC-100",
        nome_completo="Carlos Alberto",
        data_nascimento=datetime.date(1970, 5, 5),
        cpf="12398745611",
    )
    area = AreaAtendimento(nome="Acolhimento", tipo="ASSISTENCIAL", ordem_padrao=1)
    db_session.add_all([patient, area])
    db_session.commit()

    jornada = Jornada(
        paciente_id=patient.id, criado_por_id=user.id, codigo="JORN-100", data_acolhimento=datetime.date(2026, 8, 21)
    )
    db_session.add(jornada)
    db_session.commit()

    etapa = EtapaJornada(
        jornada_id=jornada.id, area_atendimento_id=area.id, profissional_responsavel_id=user.id, ordem=1, prioridade=1
    )
    db_session.add(etapa)
    db_session.commit()

    return user, etapa


def test_create_formulario_and_version(db_session):
    user, _ = _setup_stage_and_user(db_session)

    # Test Formulario
    form = Formulario(nome="Ficha de Triagem")
    db_session.add(form)
    db_session.commit()

    assert form.id is not None
    assert form.nome == "Ficha de Triagem"
    assert form.ativo is True

    # Test FormularioVersao
    versao = FormularioVersao(formulario_id=form.id, criado_por_id=user.id, versao=1)
    db_session.add(versao)
    db_session.commit()

    assert versao.id is not None
    assert versao.formulario_id == form.id
    assert versao.criado_por_id == user.id
    assert versao.versao == 1
    assert versao.ativo is True
    assert versao.formulario == form
    assert versao.criado_por == user


def test_create_campo_and_opcao(db_session):
    user, _ = _setup_stage_and_user(db_session)
    form = Formulario(nome="Escala de Dor")
    db_session.add(form)
    db_session.commit()
    versao = FormularioVersao(formulario_id=form.id, criado_por_id=user.id, versao=1)
    db_session.add(versao)
    db_session.commit()

    # Test CampoFormulario
    campo = CampoFormulario(
        formulario_versao_id=versao.id, nome="Qual a intensidade da dor?", tipo="SELECAO_UNICA", ordem_exibicao=1
    )
    db_session.add(campo)
    db_session.commit()

    assert campo.id is not None
    assert campo.formulario_versao_id == versao.id
    assert campo.nome == "Qual a intensidade da dor?"
    assert campo.tipo == "SELECAO_UNICA"
    assert campo.ordem_exibicao == 1
    assert campo.ativo_versao is True
    assert campo.formulario_versao == versao

    # Test CampoOpcao
    opcao = CampoOpcao(campo_formulario_id=campo.id, valor="Dor Forte", pontuacao=3)
    db_session.add(opcao)
    db_session.commit()

    assert opcao.id is not None
    assert opcao.campo_formulario_id == campo.id
    assert opcao.valor == "Dor Forte"
    assert opcao.pontuacao == 3
    assert opcao.campo_formulario == campo
    assert campo.opcoes == [opcao]


def test_preenchimento_and_respostas(db_session):
    user, etapa = _setup_stage_and_user(db_session)
    form = Formulario(nome="Anamnese")
    db_session.add(form)
    db_session.commit()
    versao = FormularioVersao(formulario_id=form.id, criado_por_id=user.id, versao=1)
    db_session.add(versao)
    db_session.commit()

    campo_txt = CampoFormulario(formulario_versao_id=versao.id, nome="Queixas", tipo="TEXTO", ordem_exibicao=1)
    campo_num = CampoFormulario(formulario_versao_id=versao.id, nome="Idade Aparente", tipo="NUMERO", ordem_exibicao=2)
    campo_bool = CampoFormulario(formulario_versao_id=versao.id, nome="Febre?", tipo="BOOLEANO", ordem_exibicao=3)
    campo_date = CampoFormulario(formulario_versao_id=versao.id, nome="Última Consulta", tipo="DATA", ordem_exibicao=4)
    db_session.add_all([campo_txt, campo_num, campo_bool, campo_date])
    db_session.commit()

    # Create Preenchimento
    preenchimento = PreenchimentoFormulario(
        etapa_jornada_id=etapa.id, formulario_versao_id=versao.id, profissional_id=user.id
    )
    db_session.add(preenchimento)
    db_session.commit()

    assert preenchimento.id is not None
    assert preenchimento.status == "RASCUNHO"  # default
    assert preenchimento.etapa_jornada == etapa
    assert preenchimento.formulario_versao == versao
    assert preenchimento.profissional == user

    # Create Respostas
    resp1 = Resposta(
        preenchimento_id=preenchimento.id, campo_formulario_id=campo_txt.id, valor_texto="Dor de cabeça constante"
    )
    resp2 = Resposta(preenchimento_id=preenchimento.id, campo_formulario_id=campo_num.id, valor_numero=Decimal("45.5"))
    resp3 = Resposta(preenchimento_id=preenchimento.id, campo_formulario_id=campo_bool.id, valor_booleano=True)
    resp4 = Resposta(
        preenchimento_id=preenchimento.id, campo_formulario_id=campo_date.id, valor_data=datetime.date(2026, 8, 1)
    )
    db_session.add_all([resp1, resp2, resp3, resp4])
    db_session.commit()

    assert resp1.id is not None
    assert resp1.valor_texto == "Dor de cabeça constante"
    assert resp2.valor_numero == Decimal("45.5")
    assert resp3.valor_booleano is True
    assert resp4.valor_data == datetime.date(2026, 8, 1)

    assert resp1.preenchimento == preenchimento
    assert resp1.campo_formulario == campo_txt
    assert set(preenchimento.respostas) == {resp1, resp2, resp3, resp4}


def test_resposta_duplicate_constraint(db_session):
    user, etapa = _setup_stage_and_user(db_session)
    form = Formulario(nome="Form Unico")
    db_session.add(form)
    db_session.commit()
    versao = FormularioVersao(formulario_id=form.id, criado_por_id=user.id, versao=1)
    db_session.add(versao)
    db_session.commit()

    campo = CampoFormulario(formulario_versao_id=versao.id, nome="Pergunta Unica", tipo="TEXTO", ordem_exibicao=1)
    db_session.add(campo)
    db_session.commit()

    preenchimento = PreenchimentoFormulario(
        etapa_jornada_id=etapa.id, formulario_versao_id=versao.id, profissional_id=user.id
    )
    db_session.add(preenchimento)
    db_session.commit()

    # Create two responses for the same question/filling
    resp1 = Resposta(preenchimento_id=preenchimento.id, campo_formulario_id=campo.id, valor_texto="Primeira resposta")
    resp2 = Resposta(preenchimento_id=preenchimento.id, campo_formulario_id=campo.id, valor_texto="Segunda resposta")

    db_session.add_all([resp1, resp2])

    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()
