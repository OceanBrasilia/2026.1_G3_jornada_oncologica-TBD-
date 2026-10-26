/**
 * Cálculos do instrumento ASG-PPP (Avaliação Subjetiva Global Produzida pelo Próprio Paciente - Scored PG-SGA)
 *
 * Caixa 1: Peso e Anexo 1 (Perda de peso)
 * Caixa 2: Ingestão alimentar
 * Caixa 3: Sintomas
 * Caixa 4: Atividade e função
 * Caixa B: Condições clínicas
 * Caixa C: Anexo 3 (Demanda metabólica: Estresse/Febre + Corticosteroides)
 * Caixa D: Exame físico
 */

/**
 * 2, 3 e 4. Cálculo do percentual de perda de peso
 * Fórmula: ((peso_recente - peso_atual) / peso_recente) * 100
 * Denominador: sempre o peso recente
 * Retorna null se dados forem insuficientes ou inválidos (evita divisão por zero, NaN, Infinity)
 */
export function calculateWeightLossPercentage(
  pesoRecenteRaw: string | number | undefined | null,
  pesoAtualRaw: string | number | undefined | null
): number | null {
  if (
    pesoRecenteRaw === undefined ||
    pesoRecenteRaw === null ||
    pesoRecenteRaw === "" ||
    pesoAtualRaw === undefined ||
    pesoAtualRaw === null ||
    pesoAtualRaw === ""
  ) {
    return null;
  }

  const pesoRecente =
    typeof pesoRecenteRaw === "number"
      ? pesoRecenteRaw
      : parseFloat(String(pesoRecenteRaw).replace(",", "."));
  const pesoAtual =
    typeof pesoAtualRaw === "number"
      ? pesoAtualRaw
      : parseFloat(String(pesoAtualRaw).replace(",", "."));

  if (
    isNaN(pesoRecente) ||
    isNaN(pesoAtual) ||
    pesoRecente <= 0 ||
    pesoAtual <= 0
  ) {
    return null;
  }

  const diff = pesoRecente - pesoAtual;
  const percentage = (diff / pesoRecente) * 100;

  // Evita erros de ponto flutuante e padroniza precisão numérica com 1 casa decimal
  return Number(percentage.toFixed(1));
}

/** Formata o percentual de perda de peso para exibição amigável na interface (ex: 10% ou 10,5%) */
export function formatWeightLossPercentage(percentage: number | null): string {
  if (percentage === null || isNaN(percentage)) {
    return "—";
  }
  const formatted = percentage.toString().replace(".", ",");
  return `${formatted}%`;
}

/**
 * 5. Anexo 1 — Pontuação de perda de peso conforme tabela oficial da ASG-PPP
 * Período: "1m" (1 mês ou inferior a 1 mês) OU "6m" (até 6 meses)
 * Retorna de 0 a 4 pontos
 */
export function calculateAnexo1Score(
  weightLossPercentage: number | null,
  periodo: "1m" | "6m" | string = "1m"
): number {
  if (
    weightLossPercentage === null ||
    isNaN(weightLossPercentage) ||
    weightLossPercentage < 2.0
  ) {
    return 0;
  }

  const is6m =
    periodo === "6m" ||
    periodo === "6 meses" ||
    periodo === "até 6 meses" ||
    periodo === "6M";

  if (is6m) {
    if (weightLossPercentage >= 20.0) return 4;
    if (weightLossPercentage >= 10.0) return 3;
    if (weightLossPercentage >= 6.0) return 2;
    if (weightLossPercentage >= 2.0) return 1;
    return 0;
  } else {
    // 1 mês ou inferior a 1 mês
    if (weightLossPercentage >= 10.0) return 4;
    if (weightLossPercentage >= 5.0) return 3;
    if (weightLossPercentage >= 3.0) return 2;
    if (weightLossPercentage >= 2.0) return 1;
    return 0;
  }
}

/**
 * 6 e 7. Pontuação da Caixa 1
 * Soma os pontos do Anexo 1 (0 a 4) com a variação das 2 últimas semanas (0 ou 1 ponto se diminuiu).
 * Retorna de 0 a 5 pontos.
 */
export function calculateBox1ScoreFromAnexo1(
  anexo1Score: number,
  recentWeightChange: string
): number {
  let score = anexo1Score || 0;
  if (
    recentWeightChange === "Diminuiu (1)" ||
    recentWeightChange === "Diminuiu"
  ) {
    score += 1;
  }
  return score;
}

/**
 * Cálculo integrado da Caixa 1 utilizando os dados do Anexo 1
 */
export function calculateBox1Score(
  currentStr: string,
  oneMonthStr: string,
  sixMonthsStr: string,
  recentWeightChange: string,
  preferredPeriod?: string
): number {
  // Determinar o período e peso recente aplicável
  let periodo: "1m" | "6m" = "1m";
  let pesoRecenteStr = oneMonthStr;

  const has1m = Boolean(oneMonthStr && parseFloat(String(oneMonthStr).replace(",", ".")) > 0);
  const has6m = Boolean(sixMonthsStr && parseFloat(String(sixMonthsStr).replace(",", ".")) > 0);

  if (preferredPeriod === "6m" && has6m) {
    periodo = "6m";
    pesoRecenteStr = sixMonthsStr;
  } else if (!has1m && has6m) {
    periodo = "6m";
    pesoRecenteStr = sixMonthsStr;
  } else {
    periodo = "1m";
    pesoRecenteStr = oneMonthStr;
  }

  const lossPercentage = calculateWeightLossPercentage(pesoRecenteStr, currentStr);
  const anexo1Points = calculateAnexo1Score(lossPercentage, periodo);
  return calculateBox1ScoreFromAnexo1(anexo1Points, recentWeightChange);
}

/**
 * 8. Caixa 2 — Ingestão alimentar
 * Na ASG-PPP, a pontuação da Caixa 2 é estritamente o valor mais alto assinalado pelo paciente (0 a 4 pontos).
 * Não reutiliza valores da Caixa 1 nem duplica soma.
 */
export function calculateBox2Score(intakeChangeStr: string, currentEatingStr: string): number {
  const intakeScores: Record<string, number> = {
    "Sem mudanças (0)": 0,
    "Mais que o normal (0)": 0,
    "Menos que o normal (1)": 1,
    "Sem mudanças": 0,
    "Mais que o normal": 0,
    "Menos que o normal": 1,
  };

  const currentEatingScores: Record<string, number> = {
    "Comida normal (alimentos sólidos) em menor quantidade (1)": 1,
    "Comida normal (alimentos sólidos) em pouca quantidade (2)": 2,
    "Apenas líquidos (3)": 3,
    "Apenas suplementos nutricionais (3)": 3,
    "Muito pouco de qualquer comida (4)": 4,
    "Apenas alimentos pela sonda ou pela veia (0)": 0,
    "Comida normal, porém em menor quantidade": 1,
    "Pouco alimento sólido": 2,
    "Apenas líquidos": 3,
    "Apenas suplementos": 3,
    "Muito pouco de qualquer comida": 4,
  };

  const s1 = intakeScores[intakeChangeStr] ?? 0;
  const s2 = currentEatingScores[currentEatingStr] ?? 0;
  return Math.max(s1, s2);
}

export function calculateBox3Score(symptoms: string[]): number {
  const scores: Record<string, number> = {
    "Sem problemas para se alimentar (0)": 0,
    "Sem apetite, apenas sem vontade de comer (3)": 3,
    "Náusea (1)": 1,
    "Vômito (3)": 3,
    "Constipação (1)": 1,
    "Diarreia (3)": 3,
    "Feridas na boca (2)": 2,
    "Boca seca (1)": 1,
    "Dificuldade para engolir (2)": 2,
    "Problemas para engolir (2)": 2,
    "Os alimentos têm gosto estranho ou não têm gosto (1)": 1,
    "Rapidamente me sinto satisfeito (1)": 1,
    "Os cheiros me enjoam (1)": 1,
    "Dor; onde? (3)": 3,
    "Outros** (1)": 1,
  };

  let total = 0;
  for (const s of symptoms) {
    total += (scores[s] ?? 0);
  }
  return total;
}

export function calculateBox4Score(activityStr: string): number {
  const scores: Record<string, number> = {
    "Normal, sem nenhuma limitação (0)": 0,
    "Não totalmente normal, mas capaz de manter quase todas as atividades normais (1)": 1,
    "Não me sentindo bem para a maioria das coisas, mas ficando na cama ou na cadeira menos da metade do dia (2)": 2,
    "Capaz de fazer pouca atividade, e passando a maior parte do tempo na cadeira ou na cama (3)": 3,
    "Bastante tempo acamado, raramente fora da cama (3)": 3,
  };
  return scores[activityStr] ?? 0;
}

export function calculateBoxBScore(diseases: string[]): number {
  return diseases.length;
}

/**
 * 9, 10 e 12. Bloco 1 do Anexo 3 — Estresse / Febre / Duração da febre
 * Agrupa nível de estresse, presença de febre e duração da febre em uma classificação única:
 * Baixo = 1 ponto, Moderado = 2 pontos, Alto = 3 pontos, Sem estresse = 0 pontos.
 */
export function calculateEstresseFebreScore(
  estresseLevel?: string,
  febreRaw?: string | number,
  duracaoRaw?: string | number
): { nivel: "Sem estresse" | "Baixo" | "Moderado" | "Alto"; pontos: number } {
  let score = 0;

  // Se nível de estresse explícito foi selecionado
  const estresseStr = String(estresseLevel || "").toLowerCase();
  if (estresseStr.includes("alto") || estresseStr.startsWith("3")) {
    score = 3;
  } else if (estresseStr.includes("moderado") || estresseStr.startsWith("2")) {
    score = 2;
  } else if (estresseStr.includes("baixo") || estresseStr.startsWith("1")) {
    score = 1;
  } else {
    // Deriva do maior nível entre febre e duração da febre
    const parseScore = (v: any): number => {
      if (typeof v === "number") return v;
      const s = String(v || "");
      if (s.startsWith("3") || s.includes("Alto")) return 3;
      if (s.startsWith("2") || s.includes("Moderado")) return 2;
      if (s.startsWith("1") || s.includes("Baixo")) return 1;
      return 0;
    };
    const fScore = parseScore(febreRaw);
    const dScore = parseScore(duracaoRaw);
    score = Math.max(fScore, dScore);
  }

  const mapNivel: Record<number, "Sem estresse" | "Baixo" | "Moderado" | "Alto"> = {
    0: "Sem estresse",
    1: "Baixo",
    2: "Moderado",
    3: "Alto",
  };

  return {
    nivel: mapNivel[score] || "Sem estresse",
    pontos: score,
  };
}

/**
 * 11 e 12. Bloco 2 do Anexo 3 — Corticoide
 * Dose baixa = 1 ponto, Dose moderada = 2 pontos, Dose alta = 3 pontos, Nenhum = 0 pontos.
 */
export function calculateCorticoideScore(corticoideRaw: string | number | undefined | null): number {
  if (typeof corticoideRaw === "number") {
    return Math.min(3, Math.max(0, corticoideRaw));
  }
  const s = String(corticoideRaw || "");
  if (s.startsWith("3") || s.toLowerCase().includes("dose alta") || s.toLowerCase().includes("alto")) return 3;
  if (s.startsWith("2") || s.toLowerCase().includes("dose moderada") || s.toLowerCase().includes("moderado")) return 2;
  if (s.startsWith("1") || s.toLowerCase().includes("dose baixa") || s.toLowerCase().includes("baixo")) return 1;
  return 0;
}

/**
 * 10, 11 e 12. Soma do Anexo 3 (Demanda metabólica / Bloco C)
 * Total = (Bloco Estresse/Febre: 1, 2 ou 3) + (Corticoide: 1, 2 ou 3)
 * Exemplo: Estresse/Febre Moderado (2) + Corticoide Alto (3) = 5 pontos
 *
 * Suporta chamada com 2 parâmetros: (blocoEstresseFebrePontos, corticoidePontos)
 * e também com 3 parâmetros: (febre, duracaoFebre, corticoide) mantendo compatibilidade
 */
export function calculateBoxCScore(
  arg1: number | string,
  arg2?: number | string,
  arg3?: number | string
): number {
  if (arg3 !== undefined) {
    // Chamada com (febre, duracao_febre, corticoide):
    // Agrupa febre e duração em uma única pontuação e soma com corticoide
    const parseScore = (v: any): number => {
      if (typeof v === "number") return v;
      const s = String(v || "");
      if (s.startsWith("3") || s.includes("Alto")) return 3;
      if (s.startsWith("2") || s.includes("Moderado")) return 2;
      if (s.startsWith("1") || s.includes("Baixo")) return 1;
      return 0;
    };
    const febrePontos = parseScore(arg1);
    const duracaoPontos = parseScore(arg2);
    const corticoPontos = calculateCorticoideScore(arg3);
    const estresseFebrePontos = Math.max(febrePontos, duracaoPontos);
    return estresseFebrePontos + corticoPontos;
  }

  // Chamada com (blocoEstresseFebrePontos, corticoidePontos)
  const estresseFebrePontos = typeof arg1 === "number" ? arg1 : calculateEstresseFebreScore(String(arg1)).pontos;
  const corticoPontos = calculateCorticoideScore(arg2);
  return estresseFebrePontos + corticoPontos;
}

export function calculateBoxDScore(subjectiveScore: number): number {
  return subjectiveScore || 0;
}

/**
 * 14 e 15. Soma o escore total da ASG-PPP (A = Caixas 1-4, B, C, D)
 * com recálculo automático e sem duplicação de pontos.
 */
export function calculateAsgPppTotal(answers: Record<string, any>): number {
  const box1 = calculateBox1Score(
    answers.peso || "",
    answers.peso_1m || "",
    answers.peso_6m || "",
    answers.peso_var_2sem || "",
    answers.periodo_perda_peso || ""
  );
  const box2 = calculateBox2Score(answers.ingestao_mudanca || "", answers.ingestao_atual || "");
  const box3 = calculateBox3Score(answers.sintomas || []);
  const box4 = calculateBox4Score(answers.atividade || "");
  const boxB = calculateBoxBScore(answers.doencas || []);

  const estresseFebre = calculateEstresseFebreScore(
    answers.estresse_metabolico,
    answers.febre,
    answers.duracao_febre
  );
  const corticoidePontos = calculateCorticoideScore(answers.corticoide);
  const boxC = calculateBoxCScore(estresseFebre.pontos, corticoidePontos);

  const boxD = calculateBoxDScore(parseInt(answers.exame_fisico || "0", 10));
  return box1 + box2 + box3 + box4 + boxB + boxC + boxD;
}

export function getTriageInfo(total: number) {
  if (total <= 1) {
    return {
      text: "0-1: Não há necessidade de intervenção neste momento. Reavaliar de forma rotineira.",
      color: "bg-green-100 text-green-800 border-green-200",
    };
  }
  if (total <= 3) {
    return {
      text: "2-3: Educação do paciente e familiares, com intervenção farmacológica se adequado.",
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    };
  }
  if (total <= 8) {
    return {
      text: "4-8: Necessita de intervenção pelo nutricionista juntamente com enfermeiro/médico.",
      color: "bg-orange-100 text-orange-800 border-orange-200",
    };
  }

  return {
    text: "≥ 9: Necessidade crítica de melhora no manuseio dos sintomas e/ou opções de intervenção nutricional.",
    color: "bg-red-100 text-red-800 border-red-200",
  };
}

/**
 * Verifica se o questionário ASG-PPP foi efetivamente respondido.
 */
export function isAsgPppPreenchido(answers: Record<string, any> | undefined): boolean {
  if (!answers) return false;
  const hasBox1 = Boolean(
    answers.peso_1m ||
      answers["Peso há 1 mês (kg)"] ||
      answers.peso_6m ||
      answers["Peso há 6 meses (kg)"] ||
      answers.peso_var_2sem ||
      answers["Mudança de peso nas últimas 2 semanas"]
  );
  const hasBox2 = Boolean(
    answers.ingestao_mudanca ||
      answers.ingestao_atual ||
      answers["Mudança na alimentação"] ||
      answers["Alimentação atual"]
  );
  const hasBox3 = Boolean(
    (Array.isArray(answers.sintomas) && answers.sintomas.length > 0) ||
      (Array.isArray(answers["Sintomas"]) && answers["Sintomas"].length > 0)
  );
  const hasBox4 = Boolean(
    answers.atividade || answers["Atividade"] || answers["Atividade e Função"]
  );
  const hasBoxB = Boolean(
    (Array.isArray(answers.doencas) && answers.doencas.length > 0) ||
      (Array.isArray(answers["Doenças"]) && answers["Doenças"].length > 0)
  );
  const hasBoxC = Boolean(
    answers.estresse_metabolico ||
      answers.febre ||
      answers.duracao_febre ||
      answers.corticoide ||
      answers["Febre"] ||
      answers["Duração da febre"] ||
      answers["Uso de corticoide"]
  );
  const hasBoxD = Boolean(answers.exame_fisico || answers["Exame Físico Subjetivo"]);
  return hasBox1 || hasBox2 || hasBox3 || hasBox4 || hasBoxB || hasBoxC || hasBoxD;
}
