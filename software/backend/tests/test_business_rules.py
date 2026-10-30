import uuid
from datetime import date

import pytest
from httpx import ASGITransport, AsyncClient

from app import business_rules, models
from app.database import get_db
from app.main import app

# ─── Fixtures ─────────────────────────────────────────────────────────────────


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


# ─── 1. Testes Unitários de IMC ───────────────────────────────────────────────


def test_calcular_imc_eutrofico():
    res = business_rules.calcular_imc(peso_kg=70.0, altura_m=1.75)
    assert res["imc"] == 22.86
    assert res["classificacao"] == "Eutrófico (Peso adequado)"
    assert res["grau_obesidade"] == 0


def test_calcular_imc_abaixo_do_peso():
    res = business_rules.calcular_imc(peso_kg=45.0, altura_m=1.70)
    assert res["imc"] == 15.57
    assert res["classificacao"] == "Abaixo do peso"
    assert res["grau_obesidade"] == 0


def test_calcular_imc_sobrepeso():
    res = business_rules.calcular_imc(peso_kg=80.0, altura_m=1.70)
    assert res["imc"] == 27.68
    assert res["classificacao"] == "Sobrepeso"
    assert res["grau_obesidade"] == 0


def test_calcular_imc_obesidade_graus():
    # Grau I
    res1 = business_rules.calcular_imc(peso_kg=95.0, altura_m=1.70)
    assert res1["classificacao"] == "Obesidade Grau I"
    assert res1["grau_obesidade"] == 1

    # Grau II
    res2 = business_rules.calcular_imc(peso_kg=110.0, altura_m=1.70)
    assert res2["classificacao"] == "Obesidade Grau II"
    assert res2["grau_obesidade"] == 2

    # Grau III
    res3 = business_rules.calcular_imc(peso_kg=130.0, altura_m=1.70)
    assert res3["classificacao"] == "Obesidade Grau III (Mórbida)"
    assert res3["grau_obesidade"] == 3


def test_calcular_imc_conversao_centimetros():
    # Altura fornecida como 175cm em vez de 1.75m
    res = business_rules.calcular_imc(peso_kg=70.0, altura_m=175.0)
    assert res["imc"] == 22.86
    assert res["altura_m"] == 1.75


def test_calcular_imc_valores_invalidos():
    with pytest.raises(ValueError, match="peso deve ser maior"):
        business_rules.calcular_imc(peso_kg=0, altura_m=1.70)

    with pytest.raises(ValueError, match="peso deve ser maior"):
        business_rules.calcular_imc(peso_kg=-50, altura_m=1.70)

    with pytest.raises(ValueError, match="altura deve ser maior"):
        business_rules.calcular_imc(peso_kg=70, altura_m=0)

    with pytest.raises(ValueError, match="altura deve ser maior"):
        business_rules.calcular_imc(peso_kg=70, altura_m=-1.70)


# ─── 2. Testes Unitários de IRPO / IGR (Psicologia) ───────────────────────────


def test_calcular_irpo_baixo_risco():
    # 27 itens todos com pontuação mínima de risco (itens diretos=1, itens proteção=5 -> invertidos para 1)
    respostas = {i: (5 if i in business_rules.ITENS_INVERTIDOS_IRPO else 1) for i in range(1, 28)}
    res = business_rules.calcular_escore_irpo(respostas)
    assert res["escore_total"] == 27
    assert res["igr"] == 1.0
    assert res["nivel_risco"] == "Baixo Risco"
    assert res["alerta_clinico"] is False
    assert len(res["itens_criticos"]) == 0


def test_calcular_irpo_alto_risco_e_alerta_clinico():
    # 27 itens todos com pontuação máxima de risco (itens diretos=5, itens proteção=1 -> invertidos para 5)
    respostas = {i: (1 if i in business_rules.ITENS_INVERTIDOS_IRPO else 5) for i in range(1, 28)}
    res = business_rules.calcular_escore_irpo(respostas)
    assert res["escore_total"] == 135
    assert res["igr"] == 5.0
    assert res["nivel_risco"] == "Alto Risco"
    assert res["alerta_clinico"] is True
    assert len(res["itens_criticos"]) == 27


def test_calcular_irpo_medio_risco():
    # Pontuações intermediárias (ex: 3 em todos os itens)
    respostas = {i: 3 for i in range(1, 28)}
    res = business_rules.calcular_escore_irpo(respostas)
    assert res["escore_total"] == 81
    assert res["igr"] == 3.0
    assert res["nivel_risco"] == "Médio Risco"
    assert res["alerta_clinico"] is False


def test_calcular_irpo_validacoes():
    # Resposta vazia
    with pytest.raises(ValueError, match="ao menos uma resposta"):
        business_rules.calcular_escore_irpo({})

    # Resposta fora do intervalo 1..5
    with pytest.raises(ValueError, match="entre 1 e 5"):
        business_rules.calcular_escore_irpo({1: 0})

    with pytest.raises(ValueError, match="entre 1 e 5"):
        business_rules.calcular_escore_irpo({1: 6})


# ─── 3. Testes Unitários de ASG-PPP (Nutrição - PG-SGA) ───────────────────────


def test_calcular_asg_ppp_categoria_a():
    res = business_rules.calcular_escore_asg_ppp(
        pontos_bloco1_peso=0,
        pontos_bloco2_ingestao=0,
        pontos_bloco3_sintomas=1,
        pontos_bloco4_capacidade=0,
    )
    assert res["escore_total"] == 1
    assert "Categoria A" in res["categoria"]
    assert res["intervencao_critica"] is False


def test_calcular_asg_ppp_categoria_b():
    # Escore entre 2 e 8
    res = business_rules.calcular_escore_asg_ppp(
        pontos_bloco1_peso=2,
        pontos_bloco2_ingestao=1,
        pontos_bloco3_sintomas=2,
        pontos_bloco4_capacidade=1,
    )
    assert res["escore_total"] == 6
    assert "Categoria B" in res["categoria"]
    assert res["intervencao_critica"] is False


def test_calcular_asg_ppp_categoria_c_critica():
    # Escore >= 9
    res = business_rules.calcular_escore_asg_ppp(
        pontos_bloco1_peso=3,
        pontos_bloco2_ingestao=3,
        pontos_bloco3_sintomas=4,
        pontos_bloco4_capacidade=2,
    )
    assert res["escore_total"] == 12
    assert "Categoria C" in res["categoria"]
    assert res["intervencao_critica"] is True
    assert "crítica" in res["recomendacao_intervencao"].lower()


def test_calcular_asg_ppp_valores_negativos():
    with pytest.raises(ValueError, match="não pode ser negativa"):
        business_rules.calcular_escore_asg_ppp(pontos_bloco1_peso=-1)


# ─── 4. Testes de Transição de Status da Jornada ─────────────────────────────


def test_avaliar_status_jornada_vazia():
    assert business_rules.avaliar_status_jornada([]) == "AGUARDANDO"


def test_avaliar_status_jornada_todas_pendentes():
    etapas = [
        models.EtapaJornada(status="PENDENTE"),
        models.EtapaJornada(status="PENDENTE"),
    ]
    assert business_rules.avaliar_status_jornada(etapas) == "AGUARDANDO"


def test_avaliar_status_jornada_em_atendimento():
    etapas = [
        models.EtapaJornada(status="ATENDIDO"),
        models.EtapaJornada(status="PENDENTE"),
    ]
    assert business_rules.avaliar_status_jornada(etapas) == "EM_ATENDIMENTO"

    etapas2 = [
        models.EtapaJornada(status="EM_ATENDIMENTO"),
        models.EtapaJornada(status="PENDENTE"),
    ]
    assert business_rules.avaliar_status_jornada(etapas2) == "EM_ATENDIMENTO"


def test_avaliar_status_jornada_todas_finalizadas_ou_dispensadas():
    etapas = [
        models.EtapaJornada(status="ATENDIDO"),
        models.EtapaJornada(status="NAO_SE_APLICA"),
        models.EtapaJornada(status="ATENDIDO"),
    ]
    assert business_rules.avaliar_status_jornada(etapas) == "FINALIZADO"


# ─── 5. Testes de Integração de Ciclo de Vida da Jornada via API ─────────────


@pytest.mark.anyio
async def test_integracao_transicao_automatica_jornada_finalizada(client, db_session):
    # Setup paciente e áreas
    perfil = models.Perfil(id=uuid.uuid4(), codigo="ADMIN")
    usuario = models.Usuario(id=uuid.uuid4(), nome="Admin Teste", perfil_id=perfil.id)
    paciente = models.Patient(
        id=uuid.uuid4(),
        codigo_publico="CAO-JORN-001",
        nome_completo="Paciente Ciclo Completo",
        data_nascimento=date(1988, 4, 12),
        cpf="111.999.888-77",
    )
    area1 = models.AreaAtendimento(id=uuid.uuid4(), nome="Enfermagem", tipo="ENFERMAGEM", ordem_padrao=1)
    area2 = models.AreaAtendimento(id=uuid.uuid4(), nome="Medicina", tipo="MEDICINA", ordem_padrao=2)
    area3 = models.AreaAtendimento(id=uuid.uuid4(), nome="Nutrição", tipo="NUTRICAO", ordem_padrao=3)

    db_session.add_all([perfil, usuario, paciente, area1, area2, area3])
    db_session.commit()

    # Criar jornada
    jornada = models.Jornada(
        id=uuid.uuid4(),
        paciente_id=paciente.id,
        criado_por_id=usuario.id,
        codigo="JORN-TEST-001",
        data_acolhimento=date(2026, 9, 1),
        status="AGUARDANDO",
    )
    db_session.add(jornada)
    db_session.commit()

    etapa1 = models.EtapaJornada(
        id=uuid.uuid4(), jornada_id=jornada.id, area_atendimento_id=area1.id, status="PENDENTE", ordem=1, prioridade=1
    )
    etapa2 = models.EtapaJornada(
        id=uuid.uuid4(), jornada_id=jornada.id, area_atendimento_id=area2.id, status="PENDENTE", ordem=2, prioridade=1
    )
    etapa3 = models.EtapaJornada(
        id=uuid.uuid4(), jornada_id=jornada.id, area_atendimento_id=area3.id, status="PENDENTE", ordem=3, prioridade=1
    )
    db_session.add_all([etapa1, etapa2, etapa3])
    db_session.commit()

    # 1. Inicialmente: status deve ser AGUARDANDO
    res_jornada = await client.get(f"/journeys/{jornada.id}")
    assert res_jornada.json()["status"] == "AGUARDANDO"

    # 2. Atende etapa 1 -> Jornada deve transicionar para EM_ATENDIMENTO
    res_step1 = await client.patch(f"/journeys/{jornada.id}/steps/{etapa1.id}", json={"status": "ATENDIDO"})
    assert res_step1.status_code == 200
    res_jornada = await client.get(f"/journeys/{jornada.id}")
    assert res_jornada.json()["status"] == "EM_ATENDIMENTO"

    # 3. Marca etapa 2 como NAO_SE_APLICA -> Jornada continua EM_ATENDIMENTO (falta etapa 3)
    res_step2 = await client.patch(f"/journeys/{jornada.id}/steps/{etapa2.id}", json={"status": "NAO_SE_APLICA"})
    assert res_step2.status_code == 200
    res_jornada = await client.get(f"/journeys/{jornada.id}")
    assert res_jornada.json()["status"] == "EM_ATENDIMENTO"

    # 4. Atende etapa 3 (última) -> Jornada deve transicionar automaticamente para FINALIZADO
    res_step3 = await client.patch(f"/journeys/{jornada.id}/steps/{etapa3.id}", json={"status": "ATENDIDO"})
    assert res_step3.status_code == 200
    res_jornada = await client.get(f"/journeys/{jornada.id}")
    assert res_jornada.json()["status"] == "FINALIZADO"

    # 5. Se reabrir uma etapa para PENDENTE -> Jornada volta a ficar EM_ATENDIMENTO
    await client.patch(f"/journeys/{jornada.id}/steps/{etapa3.id}", json={"status": "PENDENTE"})
    res_jornada = await client.get(f"/journeys/{jornada.id}")
    assert res_jornada.json()["status"] == "EM_ATENDIMENTO"


# ─── 6. Testes dos Endpoints HTTP de Cálculos Clínicos ────────────────────────


@pytest.mark.anyio
async def test_endpoint_calculo_imc(client):
    res = await client.post("/calculos/imc", json={"peso_kg": 72.5, "altura_m": 1.75})
    assert res.status_code == 200
    data = res.json()
    assert data["imc"] == 23.67
    assert data["classificacao"] == "Eutrófico (Peso adequado)"

    # Erro de validação
    res_err = await client.post("/calculos/imc", json={"peso_kg": -10, "altura_m": 1.75})
    assert res_err.status_code == 400


@pytest.mark.anyio
async def test_endpoint_calculo_irpo(client):
    respostas = {i: 2 for i in range(1, 28)}
    res = await client.post("/calculos/irpo", json={"respostas": respostas})
    assert res.status_code == 200
    data = res.json()
    assert "igr" in data
    assert "nivel_risco" in data

    # Erro de validação
    res_err = await client.post("/calculos/irpo", json={"respostas": {1: 10}})
    assert res_err.status_code == 400


@pytest.mark.anyio
async def test_endpoint_calculo_asg_ppp(client):
    res = await client.post(
        "/calculos/asg-ppp",
        json={
            "bloco1_peso": 3,
            "bloco2_ingestao": 2,
            "bloco3_sintomas": 4,
            "bloco4_capacidade": 1,
            "adicionais_estresse": 0,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["escore_total"] == 10
    assert "Categoria C" in data["categoria"]
    assert data["intervencao_critica"] is True
