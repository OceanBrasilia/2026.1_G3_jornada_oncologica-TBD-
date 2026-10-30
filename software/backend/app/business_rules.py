"""Módulo de Regras de Negócio Clínicas e Validações de Domínio.

Contém as funções de cálculo para:
1. IMC (Índice de Massa Corporal) e classificação nutricional
2. Escore IRPO (Inventário de Risco Psicológico em Oncologia) e IGR (Índice Global de Risco)
3. Escore ASG-PPP (Avaliação Subjetiva Global Produzida pelo Paciente / PG-SGA)
4. Validação e transição de ciclo de vida e status da Jornada Oncológica
"""

from typing import Any, Dict, List

from sqlalchemy.orm import Session

from app import models

# ─── 1. Cálculo do IMC (Índice de Massa Corporal) ────────────────────────────


def calcular_imc(peso_kg: float, altura_m: float) -> Dict[str, Any]:
    """Calcula o IMC e retorna o valor e a classificação clínica segundo a OMS.

    Fórmula: IMC = peso / (altura ** 2)

    Classificação:
    - < 18.5: Abaixo do peso
    - 18.5 - 24.9: Eutrófico (peso adequado)
    - 25.0 - 29.9: Sobrepeso
    - 30.0 - 34.9: Obesidade Grau I
    - 35.0 - 39.9: Obesidade Grau II
    - >= 40.0: Obesidade Grau III (Mórbida)
    """
    if peso_kg <= 0:
        raise ValueError("O peso deve ser maior que zero.")
    if altura_m <= 0:
        raise ValueError("A altura deve ser maior que zero.")
    if altura_m > 3.0:
        # Se fornecido em centímetros (ex: 170 ao invés de 1.70), converte para metros
        altura_m = altura_m / 100.0

    imc = round(peso_kg / (altura_m**2), 2)

    if imc < 18.5:
        classificacao = "Abaixo do peso"
        grau_obesidade = 0
    elif imc <= 24.9:
        classificacao = "Eutrófico (Peso adequado)"
        grau_obesidade = 0
    elif imc <= 29.9:
        classificacao = "Sobrepeso"
        grau_obesidade = 0
    elif imc <= 34.9:
        classificacao = "Obesidade Grau I"
        grau_obesidade = 1
    elif imc <= 39.9:
        classificacao = "Obesidade Grau II"
        grau_obesidade = 2
    else:
        classificacao = "Obesidade Grau III (Mórbida)"
        grau_obesidade = 3

    return {
        "peso_kg": peso_kg,
        "altura_m": altura_m,
        "imc": imc,
        "classificacao": classificacao,
        "grau_obesidade": grau_obesidade,
    }


# ─── 2. Cálculo do Escore IRPO e IGR (Psicologia) ─────────────────────────────

# Itens invertidos no IRPO (fatores de proteção, acolhimento e enfrentamento positivo)
# Nestes itens, responder 1 ("sempre") indica menor risco (pontua 1 se invertido para 5 - x + 1 ou normalizado)
# No padrão do seed IRPO, as opções invertidas já atribuem sempre=1, frequentemente=2, às vezes=3, raramente=4, nunca=5.
ITENS_INVERTIDOS_IRPO = {7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 25}


def calcular_escore_irpo(respostas: Dict[int, int]) -> Dict[str, Any]:
    """Calcula o Escore Total e o IGR (Índice Global de Risco) do IRPO (27 perguntas).

    Cada pergunta aceita valores de 1 a 5:
    - Itens de risco direto (1-6, 21-24, 26-27): 1 (nunca) a 5 (sempre).
    - Itens de proteção invertidos (7-20, 25): Se respondidos na escala 1 a 5, invertem (6 - valor) para alinhar a carga de risco.

    Retorna:
    - escore_total: Soma ponderada de todos os 27 itens (mínimo 27, máximo 135)
    - igr: Índice Global de Risco (escore_total / 27, escala 1.0 a 5.0)
    - nivel_risco: "Baixo Risco" (< 2.0), "Médio Risco" (2.0 a 3.49), "Alto Risco" (>= 3.5)
    - alerta_clinico: True se IGR >= 3.5 ou se algum item crítico de ideação/angústia for máximo
    - itens_criticos: lista dos números das questões que pontuaram risco alto (>= 4)
    """
    if not respostas:
        raise ValueError("É necessário fornecer ao menos uma resposta para o cálculo do IRPO.")

    total_pontos = 0
    itens_processados = 0
    itens_criticos: List[int] = []

    for num_item, valor in respostas.items():
        num_item = int(num_item)
        if not (1 <= valor <= 5):
            raise ValueError(f"O valor da resposta do item {num_item} deve estar entre 1 e 5.")

        # Se for item invertido e a resposta não tiver sido pré-invertida
        if num_item in ITENS_INVERTIDOS_IRPO:
            pontos_item = 6 - valor
        else:
            pontos_item = valor

        total_pontos += pontos_item
        itens_processados += 1

        if pontos_item >= 4:
            itens_criticos.append(num_item)

    if itens_processados == 0:
        raise ValueError("Nenhum item válido foi processado.")

    igr = round(total_pontos / itens_processados, 2)

    if igr < 2.0:
        nivel_risco = "Baixo Risco"
    elif igr < 3.5:
        nivel_risco = "Médio Risco"
    else:
        nivel_risco = "Alto Risco"

    alerta_clinico = bool(igr >= 3.5 or len(itens_criticos) >= 5)

    return {
        "itens_respondidos": itens_processados,
        "escore_total": total_pontos,
        "igr": igr,
        "nivel_risco": nivel_risco,
        "alerta_clinico": alerta_clinico,
        "itens_criticos": itens_criticos,
    }


# ─── 3. Cálculo do Escore ASG-PPP (Nutrição - PG-SGA) ─────────────────────────


def calcular_escore_asg_ppp(
    pontos_bloco1_peso: int = 0,
    pontos_bloco2_ingestao: int = 0,
    pontos_bloco3_sintomas: int = 0,
    pontos_bloco4_capacidade: int = 0,
    pontos_adicionais_estresse: int = 0,
) -> Dict[str, Any]:
    """Calcula o escore numérico e a categoria nutricional da ASG-PPP (PG-SGA).

    Critérios de pontuação:
    - Escore Total = soma dos 4 blocos preenchidos pelo paciente + fator de estresse.

    Classificação Global (Categorias):
    - 0 a 1 ponto: Categoria A (Bem nutrido / Sem risco iminente)
    - 2 a 8 pontos: Categoria B (Moderadamente desnutrido ou com risco/suspeita de desnutrição)
    - >= 9 pontos: Categoria C (Gravemente desnutrido / Necessidade crítica)

    Recomendações de Intervenção:
    - 0 a 1: Nenhuma intervenção necessária no momento; reavaliação de rotina.
    - 2 a 3: Educação nutricional ao paciente e família com orientações farmacológicas conforme indicado.
    - 4 a 8: Intervenção nutricional pelo nutricionista, em conjunto com enfermagem ou médico.
    - >= 9: Necessidade crítica de intervenção nutricional e controle sintomático agressivo.
    """
    blocos = [
        pontos_bloco1_peso,
        pontos_bloco2_ingestao,
        pontos_bloco3_sintomas,
        pontos_bloco4_capacidade,
        pontos_adicionais_estresse,
    ]
    for p in blocos:
        if p < 0:
            raise ValueError("A pontuação de cada bloco da ASG-PPP não pode ser negativa.")

    escore_total = sum(blocos)

    if escore_total <= 1:
        categoria = "Categoria A (Bem nutrido)"
        recomendacao = "Nenhuma intervenção necessária no momento; reavaliação de rotina."
        intervencao_critica = False
    elif escore_total <= 3:
        categoria = "Categoria B (Moderadamente desnutrido ou com risco)"
        recomendacao = "Educação nutricional ao paciente e família com orientações conforme sintomas."
        intervencao_critica = False
    elif escore_total <= 8:
        categoria = "Categoria B (Moderadamente desnutrido / Risco nutricional acentuado)"
        recomendacao = "Intervenção nutricional individualizada por nutricionista em conjunto com a equipe."
        intervencao_critica = False
    else:
        categoria = "Categoria C (Gravemente desnutrido)"
        recomendacao = "Necessidade crítica de intervenção nutricional e controle sintomático agressivo."
        intervencao_critica = True

    return {
        "escore_total": escore_total,
        "pontos_por_bloco": {
            "bloco1_peso": pontos_bloco1_peso,
            "bloco2_ingestao": pontos_bloco2_ingestao,
            "bloco3_sintomas": pontos_bloco3_sintomas,
            "bloco4_capacidade": pontos_bloco4_capacidade,
            "adicionais_estresse": pontos_adicionais_estresse,
        },
        "categoria": categoria,
        "recomendacao_intervencao": recomendacao,
        "intervencao_critica": intervencao_critica,
    }


# ─── 4. Validação e Transição de Status da Jornada ────────────────────────────


def avaliar_status_jornada(etapas: List[models.EtapaJornada]) -> str:
    """Avalia o conjunto de etapas de uma jornada e retorna o status consolidado.

    Regras de transição:
    1. Se não houver etapas cadastradas -> "AGUARDANDO"
    2. Se TODAS as etapas estiverem em ("ATENDIDO", "NAO_SE_APLICA") -> "FINALIZADO"
    3. Se houver pelo menos uma etapa em "EM_ATENDIMENTO" ou pelo menos uma "ATENDIDO"
       (mas ainda com pendências) -> "EM_ATENDIMENTO"
    4. Se todas as etapas estiverem em "PENDENTE" -> "AGUARDANDO"
    """
    if not etapas:
        return "AGUARDANDO"

    status_set = {etapa.status for etapa in etapas}

    # Condição de finalização: todas as etapas foram atendidas ou dispensadas
    if status_set.issubset({"ATENDIDO", "NAO_SE_APLICA"}):
        return "FINALIZADO"

    # Se alguma estiver em atendimento ou parte já foi atendida
    if "EM_ATENDIMENTO" in status_set or "ATENDIDO" in status_set or "NAO_SE_APLICA" in status_set:
        return "EM_ATENDIMENTO"

    return "AGUARDANDO"


def avaliar_e_atualizar_status_jornada(jornada: models.Jornada, db: Session) -> str:
    """Inspeciona as etapas da jornada no banco e atualiza o status consolidado da jornada."""
    novo_status = avaliar_status_jornada(jornada.etapas)
    if jornada.status != novo_status:
        jornada.status = novo_status
        db.add(jornada)
        db.commit()
        db.refresh(jornada)
    return jornada.status
