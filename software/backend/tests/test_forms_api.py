from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app import models


def test_form_submission_and_consolidated(client: TestClient, db_session: Session, jornada_seed, usuario_seed, paciente_seed, area_seed):
    jornada, etapa = jornada_seed
    
    # Setup Form
    formulario = models.Formulario(nome="Form Teste")
    db_session.add(formulario)
    db_session.commit()
    db_session.refresh(formulario)
    
    versao = models.FormularioVersao(formulario_id=formulario.id, criado_por_id=usuario_seed.id, versao=1)
    db_session.add(versao)
    db_session.commit()
    db_session.refresh(versao)
    
    campo_peso = models.CampoFormulario(formulario_versao_id=versao.id, nome="Peso (kg)", tipo="NUMERO", ordem_exibicao=1)
    campo_altura = models.CampoFormulario(formulario_versao_id=versao.id, nome="Altura (m)", tipo="NUMERO", ordem_exibicao=2)
    campo_risco = models.CampoFormulario(formulario_versao_id=versao.id, nome="Risco Nutricional", tipo="SELECAO_UNICA", ordem_exibicao=3)
    
    db_session.add_all([campo_peso, campo_altura, campo_risco])
    db_session.commit()
    db_session.refresh(campo_peso)
    db_session.refresh(campo_altura)
    db_session.refresh(campo_risco)
    
    opcao_alto = models.CampoOpcao(campo_formulario_id=campo_risco.id, valor="Alto", pontuacao=10)
    db_session.add(opcao_alto)
    db_session.commit()
    
    # POST answers
    payload = {
        "formulario_versao_id": str(versao.id),
        "profissional_id": str(usuario_seed.id),
        "respostas": [
            {"campo_formulario_id": str(campo_peso.id), "valor_numero": 70.0},
            {"campo_formulario_id": str(campo_altura.id), "valor_numero": 1.75},
            {"campo_formulario_id": str(campo_risco.id), "valor_texto": "Alto"}
        ]
    }
    
    response = client.post(f"/journeys/{jornada.id}/forms/{area_seed.id}", json=payload)
    assert response.status_code == 201
    
    # GET consolidated
    res_cons = client.get(f"/journeys/{jornada.id}/consolidated")
    assert res_cons.status_code == 200
    data = res_cons.json()
    
    assert data["jornada_id"] == str(jornada.id)
    assert "anos" in data["idade_exata"]
    assert len(data["especialidades"]) == 1
    
    esp = data["especialidades"][0]
    assert esp["area_atendimento_nome"] == area_seed.nome
    assert esp["pontuacao_total"] == 10
    
    imc = 70.0 / (1.75 ** 2)
    assert esp["imc_calculado"] == round(imc, 2)
    assert len(esp["respostas"]) == 3

def test_print_html_endpoint(client: TestClient, jornada_seed):
    jornada, _ = jornada_seed
    response = client.get(f"/journeys/{jornada.id}/print")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]
    assert "<html>" in response.text
    assert "Resumo Consolidado" in response.text


def test_print_html_endpoint_with_answers_and_xss_sanitization(
    client: TestClient, db_session: Session, jornada_seed, usuario_seed, paciente_seed, area_seed
):
    jornada, etapa = jornada_seed

    formulario = models.Formulario(nome="Form Impressao")
    db_session.add(formulario)
    db_session.commit()

    versao = models.FormularioVersao(formulario_id=formulario.id, criado_por_id=usuario_seed.id, versao=1)
    db_session.add(versao)
    db_session.commit()

    campo_pergunta = models.CampoFormulario(
        formulario_versao_id=versao.id, nome="Sintoma <script>alert(1)</script>", tipo="TEXTO", ordem_exibicao=1
    )
    campo_peso = models.CampoFormulario(
        formulario_versao_id=versao.id, nome="Peso (kg)", tipo="NUMERO", ordem_exibicao=2
    )
    campo_altura = models.CampoFormulario(
        formulario_versao_id=versao.id, nome="Altura (cm)", tipo="NUMERO", ordem_exibicao=3
    )
    db_session.add_all([campo_pergunta, campo_peso, campo_altura])
    db_session.commit()

    payload = {
        "formulario_versao_id": str(versao.id),
        "profissional_id": str(usuario_seed.id),
        "respostas": [
            {"campo_formulario_id": str(campo_pergunta.id), "valor_texto": "<b>Dor intensa & febre</b>"},
            {"campo_formulario_id": str(campo_peso.id), "valor_numero": 80.0},
            {"campo_formulario_id": str(campo_altura.id), "valor_numero": 180.0},
        ],
    }

    res_post = client.post(f"/journeys/{jornada.id}/forms/{area_seed.id}", json=payload)
    assert res_post.status_code == 201

    # Verify consolidated normalizes height in cm (180 -> 1.80, imc = 80 / (1.8^2) = 24.69)
    res_cons = client.get(f"/journeys/{jornada.id}/consolidated")
    assert res_cons.status_code == 200
    cons_data = res_cons.json()
    assert cons_data["especialidades"][0]["imc_calculado"] == 24.69

    # Verify print endpoint renders properly and escapes HTML
    res_print = client.get(f"/journeys/{jornada.id}/print")
    assert res_print.status_code == 200
    assert "<script>alert(1)</script>" not in res_print.text
    assert "&lt;script&gt;alert(1)&lt;/script&gt;" in res_print.text
    assert "&lt;b&gt;Dor intensa &amp; febre&lt;/b&gt;" in res_print.text
    assert "IMC Calculado:" in res_print.text
    assert "24.69" in res_print.text

