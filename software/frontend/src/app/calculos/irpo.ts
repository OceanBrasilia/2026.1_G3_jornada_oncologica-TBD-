export interface IrpoQuestion {
  id: number;
  text: string;
  padrao: "A" | "B";
}

export const irpoQuestions: IrpoQuestion[] = [
  { id: 1, text: "Tenho me sentido muito ansioso(a) por causa do meu tratamento.", padrao: "A" },
  { id: 2, text: "Tenho medo do que pode acontecer comigo.", padrao: "A" },
  { id: 3, text: "Sinto dificuldade de controlar minha preocupação com a doença.", padrao: "A" },
  { id: 4, text: "Tenho sentido tristeza ou desânimo com frequência.", padrao: "A" },
  { id: 5, text: "Tenho vontade de chorar sem saber o motivo.", padrao: "A" },
  { id: 6, text: "Tenho tido pensamentos negativos sobre o futuro.", padrao: "A" },
  { id: 7, text: "Sinto que posso contar com alguém quando estou triste.", padrao: "B" },
  { id: 8, text: "Tenho recebido apoio emocional da minha família.", padrao: "B" },
  { id: 9, text: "Tenho amigos ou pessoas próximas que me escutam quando preciso.", padrao: "B" },
  { id: 10, text: "Sinto que as pessoas ao meu redor entendem o que estou passando.", padrao: "B" },
  { id: 11, text: "Tenho me sentido acolhido(a) pela equipe de saúde.", padrao: "B" },
  { id: 12, text: "Tenho buscado informações sobre o meu tratamento.", padrao: "B" },
  { id: 13, text: "Tento manter uma atitude positiva frente à doença.", padrao: "B" },
  { id: 14, text: "Procuro fazer atividades que me ajudam a relaxar ou distrair.", padrao: "B" },
  { id: 15, text: "Tento manter minha rotina o máximo possível.", padrao: "B" },
  { id: 16, text: "Busco conversar abertamente sobre meus sentimentos.", padrao: "B" },
  { id: 17, text: "Tenho alguém que me acompanha às consultas e exames.", padrao: "B" },
  { id: 18, text: "Recebo ajuda prática (financeira, transporte, alimentação etc.) quando preciso.", padrao: "B" },
  { id: 19, text: "Sinto que minha família está organizada para me ajudar.", padrao: "B" },
  { id: 20, text: "Tenho recebido os cuidados de que preciso desde a descoberta do diagnóstico.", padrao: "B" },
  { id: 21, text: "Sinto que minha doença mudou completamente quem eu sou.", padrao: "A" },
  { id: 22, text: "Tenho me sentido um peso para minha família.", padrao: "A" },
  { id: 23, text: "Acho que minha vida perdeu o sentido por causa da doença.", padrao: "A" },
  { id: 24, text: "Tenho dificuldade em aceitar meu diagnóstico.", padrao: "A" },
  { id: 25, text: "Sinto que minha saúde pode melhorar.", padrao: "B" },
  { id: 26, text: "Evito falar sobre minha doença.", padrao: "A" },
  { id: 27, text: "Tenho medo constante da morte.", padrao: "A" },
];

const scoreMapA: Record<string, number> = {
  Nunca: 1,
  Raramente: 2,
  "Às vezes": 3,
  Frequentemente: 4,
  Sempre: 5,
};

const scoreMapB: Record<string, number> = {
  Nunca: 5,
  Raramente: 4,
  "Às vezes": 3,
  Frequentemente: 2,
  Sempre: 1,
};

export function calculateIrpoItemScore(answer: string, padrao: "A" | "B"): number {
  if (!answer) return 0;
  return padrao === "A" ? (scoreMapA[answer] || 0) : (scoreMapB[answer] || 0);
}

/**
 * Soma o escore das 27 questões a partir do objeto de respostas do formulário
 * (chaves no formato "IRPO_1".."IRPO_27").
 */
export function calculateIrpoTotal(answers: Record<string, string>): number {
  let total = 0;
  irpoQuestions.forEach((q) => {
    const answer = answers[`IRPO_${q.id}`];
    total += calculateIrpoItemScore(answer, q.padrao);
  });
  return total;
}

export interface IrpoRisk {
  level: string;
  color: string;
  indication: string;
}

// [CONFIRMAR COM A EQUIPE] Pontos de corte do IGR (55 e 70) replicados exatamente
// como estavam no código original — confirmar com a Psicologia se são esses mesmo.
export function classifyIrpoRisk(total: number): IrpoRisk | null {
  if (total === 0) return null;
  if (total < 55) return { level: "Baixo Risco", color: "bg-green-100 text-green-800 border-green-200", indication: "psicoeducação e orientações breves" };
  if (total <= 69) return { level: "Risco Moderado", color: "bg-yellow-100 text-yellow-800 border-yellow-200", indication: "psicoterapia breve focada em enfrentamento" };
  return { level: "Alto Risco", color: "bg-red-100 text-red-800 border-red-200", indication: "psicoterapia intensiva e avaliação psiquiátrica" };
}

export const IRPO_CRITICAL_THRESHOLD = 70;

export function isIrpoCriticalRisk(total: number): boolean {
  return total >= IRPO_CRITICAL_THRESHOLD;
}
