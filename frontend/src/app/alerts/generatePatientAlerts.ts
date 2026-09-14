import { AlertCategory, AlertLevel, PatientAlert } from "../types/alerts";
import { calculateIrpoTotal, classifyIrpoRisk, isIrpoCriticalRisk } from "../calculos/irpo";
import { calculateAsgPppTotal } from "../calculos/asgPpp";
import { DOR_INTENSA_NIVEL_2, ASG_PPP_NIVEL_2 } from "../config/alertThresholds";

type FormAnswers = Record<string, Record<string, any>>;

function asArray(val: any): string[] {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}

/**
 * Recalcula a lista inteira de alertas do paciente a partir das respostas
 * salvas de todas as especialidades. É a única fonte de alertas clínicos
 * automáticos do sistema — chamada de novo sempre que qualquer especialidade
 * salva o formulário (App.tsx), para não depender de lógica espalhada e
 * incremental como antes.
 *
 * RF-020: os alertas só destacam a informação e sugerem uma ação — nunca
 * tomam a decisão clínica pelo profissional.
 */
export function generatePatientAlerts(formAnswers: FormAnswers | undefined, now: () => string = () => new Date().toLocaleString("pt-BR")): PatientAlert[] {
  const answers = formAnswers || {};
  const alerts: PatientAlert[] = [];
  const createdAt = now();

  const enfermagem = answers["enfermagem"] || {};
  const medicina = answers["medicina"] || {};
  const nutricao = answers["nutricao"] || {};
  const psicologia = answers["psicologia"] || {};
  const fisioterapia = answers["fisioterapia"] || {};
  const fonoaudiologia = answers["fonoaudiologia"] || {};
  const servicoSocial = answers["servico-social"] || {};
  const terapiaOcupacional = answers["terapia-ocupacional"] || {};

  // ── Alergia ────────────────────────────────────────────────────────────
  const alergiaResposta = enfermagem["Alergia"] ?? medicina["Alergia"];
  if (alergiaResposta === "Sim") {
    const reacao = enfermagem["Reação alergica"] || medicina["Reação alergica"] || "";
    alerts.push({
      id: "alert-alergia",
      category: AlertCategory.ALLERGY,
      level: [AlertLevel.LEVEL_3],
      title: "Alergia reportada",
      description: reacao ? `Reação relatada: ${reacao}` : "Alergia registrada, sem detalhe de reação informado.",
      active: true,
      author: "Sistema (Enfermagem/Medicina)",
      createdAt,
      status: "aberto",
    });
  }

  // ── Dispositivos invasivos ─────────────────────────────────────────────
  const dispositivos = asArray(enfermagem["Dispositivos invasivos"]).filter(d => d !== "Nenhum" && d !== "Outro");
  if (dispositivos.length > 0) {
    alerts.push({
      id: "alert-dispositivos",
      category: AlertCategory.DEVICE_USAGE,
      level: [AlertLevel.LEVEL_3],
      title: "Uso de dispositivo(s)",
      description: `Paciente em uso de: ${dispositivos.join(", ")}.`,
      active: true,
      author: "Sistema (Enfermagem)",
      createdAt,
      status: "aberto",
    });
  }

  // ── Comorbidades ───────────────────────────────────────────────────────
  const comorbidades = asArray(enfermagem["Comorbidades"] ?? medicina["Comorbidades"] ?? fonoaudiologia["Comorbidades"]);
  if (comorbidades.length > 0) {
    alerts.push({
      id: "alert-comorbidades",
      category: AlertCategory.CLINICAL_RISK,
      level: [AlertLevel.LEVEL_3],
      title: "Comorbidade registrada",
      description: `Comorbidade(s): ${comorbidades.join(", ")}.`,
      active: true,
      author: "Sistema (Enfermagem/Medicina/Fonoaudiologia)",
      createdAt,
      status: "aberto",
    });
  }

  // ── Dor / sintoma intenso (breakout: sai do chip e vira Nível 2) ───────
  const dor = Math.max(
    parseInt(enfermagem["Avaliação da dor"] || "0", 10) || 0,
    parseInt(fisioterapia["escala_verbal_dor"] || "0", 10) || 0,
    parseInt(terapiaOcupacional["TO_Dor_Intensidade"] || "0", 10) || 0
  );
  if (dor >= DOR_INTENSA_NIVEL_2) {
    alerts.push({
      id: "alert-dor-intensa",
      category: AlertCategory.SEVERE_SYMPTOMS,
      level: [AlertLevel.LEVEL_2, AlertLevel.LEVEL_3],
      title: "Dor intensa relatada",
      description: `Nível de dor relatado: ${dor}/10.`,
      recommendedAction: "Avaliar e conduzir a dor conforme protocolo da equipe.",
      responsible: "Equipe assistencial",
      active: true,
      author: "Sistema (Enfermagem/Fisioterapia/Terapia Ocupacional)",
      createdAt,
      status: "aberto",
    });
  }

  // ── ASG-PPP (Nutrição) ──────────────────────────────────────────────────
  const asgTotal = calculateAsgPppTotal(nutricao);
  if (asgTotal >= ASG_PPP_NIVEL_2) {
    alerts.push({
      id: "alert-asg-ppp",
      category: AlertCategory.CLINICAL_RISK,
      level: [AlertLevel.LEVEL_2, AlertLevel.LEVEL_3, AlertLevel.LEVEL_4],
      title: "ASG-PPP indica necessidade de intervenção nutricional",
      description: `Escore ASG-PPP: ${asgTotal} pontos.`,
      recommendedAction: "Avaliação e intervenção nutricional.",
      responsible: "Nutrição",
      dueDate: "A definir pela Nutrição",
      active: true,
      author: "Sistema (Nutrição)",
      createdAt,
      status: "aberto",
    });
  } else if (asgTotal > 0) {
    alerts.push({
      id: "alert-asg-ppp",
      category: AlertCategory.CLINICAL_RISK,
      level: [AlertLevel.LEVEL_3],
      title: "ASG-PPP — triagem nutricional leve",
      description: `Escore ASG-PPP: ${asgTotal} pontos.`,
      active: true,
      author: "Sistema (Nutrição)",
      createdAt,
      status: "aberto",
    });
  }

  // ── IRPO (Psicologia) ───────────────────────────────────────────────────
  const hasSuicidalIdeation = psicologia["IdeacaoSuicida"] === "Sim";
  const irpoTotal = calculateIrpoTotal(psicologia);
  const irpoRisk = classifyIrpoRisk(irpoTotal);

  if (hasSuicidalIdeation) {
    alerts.push({
      id: "alert-irpo-ideacao",
      category: AlertCategory.PSYCHOSOCIAL_RISK,
      level: [AlertLevel.LEVEL_1, AlertLevel.LEVEL_3],
      title: "Ideação suicida ativa",
      description: "Paciente relatou ideação suicida no IRPO (questão 28).",
      recommendedAction: "Avaliação psicológica/psiquiátrica prioritária e registro de conduta.",
      responsible: "Psicologia/Psiquiatria",
      active: true,
      actionRequired: true,
      confidential: true,
      author: "Sistema (Psicologia)",
      createdAt,
      status: "aberto",
    });
  } else if (isIrpoCriticalRisk(irpoTotal)) {
    // IGR ≥ 70 sem ideação suicida ativa: Nível 2 (faixa), não mais Nível 1.
    alerts.push({
      id: "alert-irpo-risco-alto",
      category: AlertCategory.PSYCHOSOCIAL_RISK,
      level: [AlertLevel.LEVEL_2, AlertLevel.LEVEL_3, AlertLevel.LEVEL_4],
      title: "IRPO — risco psicológico elevado",
      description: `Índice Global de Risco: ${irpoTotal} pontos (${irpoRisk?.level}).`,
      recommendedAction: irpoRisk?.indication,
      responsible: "Psicologia",
      dueDate: "A definir pela Psicologia",
      active: true,
      confidential: true,
      author: "Sistema (Psicologia)",
      createdAt,
      status: "aberto",
    });
  } else if (irpoRisk) {
    alerts.push({
      id: "alert-irpo-risco",
      category: AlertCategory.PSYCHOSOCIAL_RISK,
      level: [AlertLevel.LEVEL_3],
      title: `IRPO — ${irpoRisk.level}`,
      description: `Índice Global de Risco: ${irpoTotal} pontos.`,
      active: true,
      confidential: true,
      author: "Sistema (Psicologia)",
      createdAt,
      status: "aberto",
    });
  }

  // ── Vulnerabilidade social (sinalização manual do Serviço Social) ───────
  if (servicoSocial["vulnerabilidadeSocialSinalizada"] === "Sim") {
    alerts.push({
      id: "alert-vulnerabilidade-social",
      category: AlertCategory.PSYCHOSOCIAL_RISK,
      level: [AlertLevel.LEVEL_3],
      title: "Vulnerabilidade social sinalizada",
      description: "Equipe de Serviço Social sinalizou vulnerabilidade social para acompanhamento.",
      responsible: "Serviço Social",
      active: true,
      confidential: true,
      author: "Serviço Social",
      createdAt,
      status: "aberto",
    });
  }

  // ── Acessibilidade / Comunicação ────────────────────────────────────────
  const motivosAcessibilidade: string[] = [];
  if (fisioterapia["restricaoAdm"] === "Sim") motivosAcessibilidade.push("Restrição de amplitude de movimento (Fisioterapia)");
  if (fonoaudiologia["alteracaoVocal"] === "Sim") motivosAcessibilidade.push("Alteração da qualidade vocal (Fonoaudiologia)");
  if (dispositivos.includes("Traqueostomia")) motivosAcessibilidade.push("Uso de traqueostomia (Enfermagem)");
  if (["Apenas acesso, sem facilidade", "Não possui acesso"].includes(servicoSocial["acessoInternet"])) {
    motivosAcessibilidade.push("Baixo letramento digital (Serviço Social)");
  }
  if (motivosAcessibilidade.length > 0) {
    alerts.push({
      id: "alert-acessibilidade",
      category: AlertCategory.ACCESSIBILITY,
      level: [AlertLevel.LEVEL_3],
      title: "Necessidade de acessibilidade/comunicação",
      description: motivosAcessibilidade.join("; "),
      active: true,
      author: "Sistema",
      createdAt,
      status: "aberto",
    });
  }

  return alerts;
}
