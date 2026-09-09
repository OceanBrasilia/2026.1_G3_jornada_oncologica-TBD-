export function calculateIMC(weightStr: string, heightStr: string): string {
  const w = parseFloat(weightStr.replace(",", "."));
  const h = parseFloat(heightStr.replace(",", "."));
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
  
  const current = parseFloat(currentStr.replace(",", ".")) || 0;
  const oneMonth = parseFloat(oneMonthStr.replace(",", ".")) || 0;
  const sixMonths = parseFloat(sixMonthsStr.replace(",", ".")) || 0;
  
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
  
  if (recentWeightChange === "diminuiu") {
    score += 1;
  }
  
  return score;
}

export function calculateBox2Score(intakeChangeStr: string, currentEatingStr: string): number {
  const intakeScores: Record<string, number> = {
    "sem mudanças": 0,
    "mais que o normal": 0,
    "menos que o normal": 1,
  };
  
  const currentEatingScores: Record<string, number> = {
    "comida normal em menor quantidade": 1,
    "comida normal em pouca quantidade": 2,
    "apenas líquidos": 3,
    "apenas suplementos nutricionais": 3,
    "muito pouco de qualquer comida": 4,
    "apenas alimentos pela sonda ou veia": 0,
  };

  const s1 = intakeScores[intakeChangeStr] ?? 0;
  const s2 = currentEatingScores[currentEatingStr] ?? 0;
  return Math.max(s1, s2);
}

export function calculateBox3Score(symptoms: string[]): number {
  const scores: Record<string, number> = {
    "sem problemas para se alimentar": 0,
    "sem apetite": 3,
    "náusea": 1,
    "vômito": 3,
    "constipação": 1,
    "diarreia": 3,
    "feridas na boca": 2,
    "boca seca": 1,
    "problemas para engolir": 2,
    "alimentos com gosto estranho/sem gosto": 1,
    "rapidamente me sinto satisfeito": 1,
    "cheiros me enjoam": 1,
    "dor": 3,
    "outros": 1
  };
  
  let total = 0;
  for (const s of symptoms) {
    total += (scores[s] ?? 0);
  }
  return total;
}

export function calculateBox4Score(activityStr: string): number {
  const scores: Record<string, number> = {
    "normal, sem limitação": 0,
    "capaz de manter quase todas as atividades normais": 1,
    "ficando na cama/cadeira menos da metade do dia": 2,
    "capaz de fazer pouca atividade, maior parte do tempo na cama/cadeira": 3,
    "acamado, raramente fora da cama": 3,
  };
  return scores[activityStr] ?? 0;
}

export function calculateBoxBScore(diseases: string[]): number {
  return diseases.length;
}

export function calculateBoxCScore(feverScore: number, corticoScore: number): number {
  return feverScore + corticoScore;
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
