import { calculateIMC, IMC_FORMULA } from "../calculos/imc";
import { calculateAsgPppTotal, getTriageInfo, isAsgPppPreenchido } from "../calculos/asgPpp";
import { calculateIrpoTotal, classifyIrpoRisk, irpoQuestions, type IrpoRisk } from "../calculos/irpo";
import { formatarLabelCampo } from "./fieldLabels";

export type SpecStatusResumo = "atendido" | "pendente" | "em-atendimento" | "nao-se-aplica";

/**
 * Campos que, quando preenchidos por qualquer especialidade, são dados
 * compartilhados (RF-006/RF-009) — aparecem uma única vez no bloco
 * "Dados gerais" da Ficha Consolidada, em vez de repetidos em cada seção.
 *
 * Só entram aqui campos onde já confirmamos que TODAS as especialidades que
 * os usam perguntam a mesma coisa, do mesmo jeito (mesmo tipo de campo —
 * seleção/texto/múltipla escolha — e, quando é seleção, as mesmas opções).
 *
 * "Ocupação/Trabalho" (situação profissional, vem do bloco compartilhado
 * ReusedDataAccordion.tsx, presente em todos os formulários) e "Profissão"
 * (a profissão em si, texto livre — Odontologia e Serviço Social) eram, até
 * 2026-09-11, o MESMO campo por engano — a Enfermagem ainda tinha uma
 * pergunta própria e redundante de situação profissional, e Odontologia/
 * Serviço Social escreviam texto livre na mesma chave da situação
 * profissional. Corrigido: agora são duas chaves diferentes.
 */
export const CAMPOS_COMPARTILHADOS = [
  "peso", "altura", "Alergia", "Reação alergica", "Comorbidades", "Outras doenças",
  "tabagismo", "etilismo", "medicacoes", "Diagnóstico", "Escolaridade", "Estado civil",
  "Sexo", "Ocupação/Trabalho", "Profissão",
];

/**
 * Campos confidenciais por especialidade (risco psíquico, vulnerabilidade
 * social — ver AGENTS.md). Só aparecem na Ficha Consolidada para quem pode
 * ver conteúdo confidencial (mesma regra de frontend/src/app/alerts/visibleAlerts.ts).
 */
export const CAMPOS_CONFIDENCIAIS: Record<string, string[]> = {
  psicologia: [
    "IdeacaoSuicida", "PlanejamentoSuicida", "CondutaAdotadaAlerta",
    ...irpoQuestions.map(q => `IRPO_${q.id}`),
  ],
  "servico-social": ["vulnerabilidadeSocialSinalizada"],
};

/** Campos "brutos" que alimentam um escore calculado — substituídos pelo card de resultado. */
const CAMPOS_SUBSTITUIDOS_POR_RESUMO: Record<string, string[]> = {
  nutricao: ["peso_1m", "peso_6m", "peso_var_2sem", "ingestao_mudanca", "ingestao_atual", "sintomas", "atividade", "doencas", "febre", "duracao_febre", "corticoide", "exame_fisico"],
  psicologia: irpoQuestions.map(q => `IRPO_${q.id}`),
};

function isCampoTecnico(campo: string): boolean {
  return campo === "_updatedAt" || campo.endsWith("_suppressed") || campo.endsWith("_isOther") || campo.endsWith("_append");
}

function valorVazio(valor: any): boolean {
  if (valor === undefined || valor === null) return true;
  if (Array.isArray(valor)) return valor.length === 0;
  return String(valor).trim() === "" || valor === "—";
}

function formatarValor(valor: any): string {
  return Array.isArray(valor) ? valor.join(", ") : String(valor);
}

export interface DadoGeral {
  campo: string;
  label: string;
  valor: string;
  origem: string;
}

/** Monta o bloco "Dados gerais": o primeiro valor preenchido de cada campo compartilhado, e quem preencheu. */
export function buildDadosGerais(
  formAnswers: Record<string, Record<string, any>> | undefined,
  specialties: { id: string; name: string }[]
): DadoGeral[] {
  const resultado: DadoGeral[] = [];
  for (const campo of CAMPOS_COMPARTILHADOS) {
    for (const spec of specialties) {
      const valor = formAnswers?.[spec.id]?.[campo];
      if (!valorVazio(valor)) {
        resultado.push({ campo, label: formatarLabelCampo(campo), valor: formatarValor(valor), origem: spec.name });
        break;
      }
    }
  }
  return resultado;
}

export interface DivergenciaCampo {
  valor: string;
  especialidades: string[];
}

export interface InfoCompartilhada {
  campo: string;
  label: string;
  valor: string;
  origem: string;
  divergente: boolean;
  outrasRespostas: DivergenciaCampo[];
}

/**
 * Como buildDadosGerais, mas também aponta divergência: quando duas ou mais
 * especialidades preenchem o mesmo campo compartilhado com valores
 * diferentes, mostra o primeiro valor como principal e o resto como
 * divergência — só para sinalizar, nunca decide qual está "certo"
 * (cada especialidade mantém autonomia sobre o que registrou).
 */
export function buildInformacoesCompartilhadas(
  formAnswers: Record<string, Record<string, any>> | undefined,
  specialties: { id: string; name: string }[]
): InfoCompartilhada[] {
  const resultado: InfoCompartilhada[] = [];

  for (const campo of CAMPOS_COMPARTILHADOS) {
    const porValor = new Map<string, string[]>();
    let primeiroValor: string | null = null;
    let primeiraOrigem = "";

    for (const spec of specialties) {
      const valor = formAnswers?.[spec.id]?.[campo];
      if (valorVazio(valor)) continue;
      const valorFormatado = formatarValor(valor);
      if (primeiroValor === null) {
        primeiroValor = valorFormatado;
        primeiraOrigem = spec.name;
      }
      const lista = porValor.get(valorFormatado) || [];
      lista.push(spec.name);
      porValor.set(valorFormatado, lista);
    }

    if (primeiroValor === null) continue;

    const outrasRespostas: DivergenciaCampo[] = Array.from(porValor.entries())
      .filter(([valor]) => valor !== primeiroValor)
      .map(([valor, especialidades]) => ({ valor, especialidades }));

    resultado.push({
      campo,
      label: formatarLabelCampo(campo),
      valor: primeiroValor,
      origem: primeiraOrigem,
      divergente: outrasRespostas.length > 0,
      outrasRespostas,
    });
  }

  return resultado;
}

export interface LinhaDetalhe {
  campo: string;
  label: string;
  valor: string;
}

/**
 * Monta as linhas de leitura de uma especialidade para a Ficha Consolidada:
 * sem campos técnicos, sem campos vazios/escondidos por condicional, sem
 * repetir campos que já estão em "Dados gerais", sem os campos brutos que
 * viraram um card de resultado calculado, e sem campos confidenciais para
 * quem não pode vê-los.
 */
export function buildDetalhesEspecialidade(
  specId: string,
  answers: Record<string, any> | undefined,
  podeVerConfidencial: boolean
): LinhaDetalhe[] {
  if (!answers) return [];
  const confidenciais = CAMPOS_CONFIDENCIAIS[specId] || [];
  const substituidos = CAMPOS_SUBSTITUIDOS_POR_RESUMO[specId] || [];

  const linhas: LinhaDetalhe[] = [];
  for (const [campo, valor] of Object.entries(answers)) {
    if (isCampoTecnico(campo)) continue;
    if (valorVazio(valor)) continue;
    if (CAMPOS_COMPARTILHADOS.includes(campo)) continue;
    if (substituidos.includes(campo)) continue;
    if (confidenciais.includes(campo) && !podeVerConfidencial) continue;
    linhas.push({ campo, label: formatarLabelCampo(campo), valor: formatarValor(valor) });
  }
  return linhas;
}

export interface ResumoNutricao {
  imc: string;
  imcFormula: string;
  asgTotal: number | null;
  asgTriage: { text: string; color: string } | null;
  asgPreenchido: boolean;
}

/** Resultado calculado de IMC + ASG-PPP, com fórmula/classificação (RF-021). Null se nada foi preenchido. */
export function buildResumoNutricao(answers: Record<string, any> | undefined): ResumoNutricao | null {
  if (!answers) return null;
  const imc = calculateIMC(answers.peso || "", answers.altura || "");
  const asgPreenchido = isAsgPppPreenchido(answers);
  const asgTotal = asgPreenchido ? calculateAsgPppTotal(answers) : null;
  if (imc === "—" && !asgPreenchido) return null;
  return {
    imc,
    imcFormula: IMC_FORMULA,
    asgTotal,
    asgTriage: asgTotal !== null ? getTriageInfo(asgTotal) : null,
    asgPreenchido,
  };
}

export interface ResumoPsicologia {
  irpoTotal: number;
  irpoRisk: IrpoRisk | null;
  respondidas: number;
}

/** Resultado calculado do IRPO, com escore + classificação. Null se nenhuma questão foi respondida. */
export function buildResumoPsicologia(answers: Record<string, any> | undefined): ResumoPsicologia | null {
  if (!answers) return null;
  const respondidas = irpoQuestions.filter(q => answers[`IRPO_${q.id}`]).length;
  if (respondidas === 0) return null;
  const irpoTotal = calculateIrpoTotal(answers);
  return { irpoTotal, irpoRisk: classifyIrpoRisk(irpoTotal), respondidas };
}

export function statusLabel(status: SpecStatusResumo): string {
  switch (status) {
    case "atendido": return "Preenchido";
    case "em-atendimento": return "Preenchido (em andamento)";
    case "pendente": return "Pendente";
    case "nao-se-aplica": return "Não aplicável";
    default: return status;
  }
}
