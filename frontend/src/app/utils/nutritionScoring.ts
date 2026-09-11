export function calculateIMC(weightStr: string, heightStr: string): string {
  const w = parseFloat((weightStr || "").replace(",", "."));
  const h = parseFloat((heightStr || "").replace(",", "."));
  if (w > 0 && h > 0) {
    return (w / (h * h)).toFixed(2);
  }
  return "";
}

export function calculateBox1Score(
  currentStr: string,
  oneMonthStr: string,
  sixMonthsStr: string,
  recentWeightChange: string
): number {
  let score = 0;
  
  const current = parseFloat((currentStr || "").replace(",", ".")) || 0;
  const oneMonth = parseFloat((oneMonthStr || "").replace(",", ".")) || 0;
  const sixMonths = parseFloat((sixMonthsStr || "").replace(",", ".")) || 0;
  
  if (oneMonth > 0 && current > 0) {
    const loss = ((oneMonth - current) / oneMonth) * 100;
    if (loss >= 10) score = 4;
    else if (loss >= 5) score = 3;
    else if (loss >= 3) score = 2;
    else if (loss >= 2) score = 1;
  } else if (sixMonths > 0 && current > 0) {
    const loss = ((sixMonths - current) / sixMonths) * 100;
    if (loss >= 20) score = 4;
    else if (loss >= 10) score = 3;
    else if (loss >= 6) score = 2;
    else if (loss >= 2) score = 1;
  }
  
  if (recentWeightChange === "Diminuiu (1)") {
    score += 1;
  }
  
  return score;
}

export function calculateBox2Score(intakeChangeStr: string, currentEatingStr: string): number {
  const intakeScores: Record<string, number> = {
    "Sem mudanças (0)": 0,
    "Mais que o normal (0)": 0,
    "Menos que o normal (1)": 1,
  };
  
  const currentEatingScores: Record<string, number> = {
    "Comida normal (alimentos sólidos) em menor quantidade (1)": 1,
    "Comida normal (alimentos sólidos) em pouca quantidade (2)": 2,
    "Apenas líquidos (3)": 3,
    "Apenas suplementos nutricionais (3)": 3,
    "Muito pouco de qualquer comida (4)": 4,
    "Apenas alimentos pela sonda ou pela veia (0)": 0,
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
    "Problemas para engolir (2)": 2, // Alternative just in case
    "Os alimentos têm gosto estranho ou não têm gosto (1)": 1,
    "Rapidamente me sinto satisfeito (1)": 1,
    "Os cheiros me enjoam (1)": 1,
    "Dor; onde? (3)": 3,
    "Outros** (1)": 1
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

export function calculateBoxCScore(feverScore: number, feverDurationScore: number, corticoScore: number): number {
  return feverScore + feverDurationScore + corticoScore;
}

export function calculateBoxDScore(subjectiveScore: number): number {
  return subjectiveScore;
}

export function getTriageInfo(total: number) {
  if (total <= 1) return {
    text: "0-1: Não há necessidade de intervenção neste momento. Reavaliar de forma rotineira.",
    color: "bg-green-100 text-green-800 border-green-200"
  };
  if (total <= 3) return {
    text: "2-3: Educação do paciente e familiares, com intervenção farmacológica se adequado.",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200"
  };
  if (total <= 8) return {
    text: "4-8: Necessita de intervenção pelo nutricionista juntamente com enfermeiro/médico.",
    color: "bg-orange-100 text-orange-800 border-orange-200"
  };
  
  return {
    text: "≥ 9: Necessidade crítica de melhora no manuseio dos sintomas e/ou opções de intervenção nutricional.",
    color: "bg-red-100 text-red-800 border-red-200"
  };
}
