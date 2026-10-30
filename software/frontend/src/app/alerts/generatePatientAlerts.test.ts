import { describe, it, expect } from "vitest";
import { generatePatientAlerts } from "./generatePatientAlerts";
import { AlertCategory, AlertLevel } from "../types/alerts";
import { irpoQuestions } from "../calculos/irpo";

const FIXED_NOW = () => "01/01/2026 10:00";

function findAlert(alerts: ReturnType<typeof generatePatientAlerts>, id: string) {
  return alerts.find(a => a.id === id);
}

describe("generatePatientAlerts — sem nenhuma resposta", () => {
  it("não gera nenhum alerta quando não há respostas", () => {
    expect(generatePatientAlerts(undefined, FIXED_NOW)).toEqual([]);
    expect(generatePatientAlerts({}, FIXED_NOW)).toEqual([]);
  });
});

describe("generatePatientAlerts — alergia, dispositivos, comorbidades", () => {
  it("gera alerta de alergia (Nível 3) quando Enfermagem registra Alergia = Sim", () => {
    const alerts = generatePatientAlerts({ enfermagem: { Alergia: "Sim", "Reação alergica": "Dipirona" } }, FIXED_NOW);
    const a = findAlert(alerts, "alert-alergia");
    expect(a?.level).toEqual([AlertLevel.LEVEL_3]);
    expect(a?.description).toContain("Dipirona");
  });

  it("não gera alerta de alergia quando a resposta é Nega", () => {
    const alerts = generatePatientAlerts({ enfermagem: { Alergia: "Nega" } }, FIXED_NOW);
    expect(findAlert(alerts, "alert-alergia")).toBeUndefined();
  });

  it("gera alerta de dispositivos, ignorando 'Nenhum' e 'Outro'", () => {
    const alerts = generatePatientAlerts({ enfermagem: { "Dispositivos invasivos": ["Nenhum", "Port-a-cath"] } }, FIXED_NOW);
    const a = findAlert(alerts, "alert-dispositivos");
    expect(a?.description).toContain("Port-a-cath");
    expect(a?.description).not.toContain("Nenhum");
  });

  it("gera alerta de comorbidades quando a lista não está vazia", () => {
    const alerts = generatePatientAlerts({ enfermagem: { Comorbidades: ["Diabetes Mellitus (DM)"] } }, FIXED_NOW);
    expect(findAlert(alerts, "alert-comorbidades")?.category).toBe(AlertCategory.CLINICAL_RISK);
  });
});

describe("generatePatientAlerts — dor intensa (breakout Nível 2)", () => {
  it("dor abaixo do limite gera só Nível 3... na verdade não gera nada (sem alerta de dor abaixo do limite)", () => {
    const alerts = generatePatientAlerts({ enfermagem: { "Avaliação da dor": "5" } }, FIXED_NOW);
    expect(findAlert(alerts, "alert-dor-intensa")).toBeUndefined();
  });

  it("dor >= 8 vira Nível 2 (breakout)", () => {
    const alerts = generatePatientAlerts({ fisioterapia: { escala_verbal_dor: "9" } }, FIXED_NOW);
    const a = findAlert(alerts, "alert-dor-intensa");
    expect(a?.level).toEqual([AlertLevel.LEVEL_2, AlertLevel.LEVEL_3]);
  });

  it("usa o maior valor entre as especialidades que registram dor", () => {
    const alerts = generatePatientAlerts({
      enfermagem: { "Avaliação da dor": "2" },
      "terapia-ocupacional": { TO_Dor_Intensidade: "8" },
    }, FIXED_NOW);
    expect(findAlert(alerts, "alert-dor-intensa")).toBeDefined();
  });
});

describe("generatePatientAlerts — ASG-PPP", () => {
  it("escore 0 não gera alerta", () => {
    const alerts = generatePatientAlerts({ nutricao: {} }, FIXED_NOW);
    expect(findAlert(alerts, "alert-asg-ppp")).toBeUndefined();
  });

  it("escore baixo (>0 e <4) gera só Nível 3", () => {
    const alerts = generatePatientAlerts({ nutricao: { sintomas: ["Náusea (1)"] } }, FIXED_NOW);
    const a = findAlert(alerts, "alert-asg-ppp");
    expect(a?.level).toEqual([AlertLevel.LEVEL_3]);
  });

  it("escore >= 4 gera Nível 2 + Nível 4 (pendência) para Nutrição", () => {
    const alerts = generatePatientAlerts({ nutricao: { sintomas: ["Vômito (3)", "Diarreia (3)"] } }, FIXED_NOW);
    const a = findAlert(alerts, "alert-asg-ppp");
    expect(a?.level).toEqual([AlertLevel.LEVEL_2, AlertLevel.LEVEL_3, AlertLevel.LEVEL_4]);
    expect(a?.responsible).toBe("Nutrição");
  });
});

describe("generatePatientAlerts — IRPO", () => {
  function irpoAnswers(overrides: Record<string, string>) {
    return { psicologia: { ...overrides } };
  }

  it("ideação suicida ativa vira Nível 1, confidencial", () => {
    const alerts = generatePatientAlerts(irpoAnswers({ IdeacaoSuicida: "Sim" }), FIXED_NOW);
    const a = findAlert(alerts, "alert-irpo-ideacao");
    expect(a?.level).toEqual([AlertLevel.LEVEL_1, AlertLevel.LEVEL_3]);
    expect(a?.confidential).toBe(true);
  });

  it("IGR >= 70 SEM ideação suicida vira Nível 2 (não mais Nível 1)", () => {
    const answers: Record<string, string> = {};
    // 27 respostas "Sempre" em padrão A dão 5 pontos cada (>=70 fácil)
    for (let i = 1; i <= 27; i++) answers[`IRPO_${i}`] = "Sempre";
    const alerts = generatePatientAlerts(irpoAnswers(answers), FIXED_NOW);
    expect(findAlert(alerts, "alert-irpo-ideacao")).toBeUndefined();
    const a = findAlert(alerts, "alert-irpo-risco-alto");
    expect(a?.level).toEqual([AlertLevel.LEVEL_2, AlertLevel.LEVEL_3, AlertLevel.LEVEL_4]);
    expect(a?.confidential).toBe(true);
    expect(a?.responsible).toBe("Psicologia");
  });

  it("risco baixo/moderado gera só um chip informativo (Nível 3)", () => {
    // Respostas que minimizam o escore: "Nunca" nas questões padrão A e
    // "Sempre" nas padrão B (protetivas) — dá um escore bem abaixo de 55.
    const answers: Record<string, string> = {};
    irpoQuestions.forEach(q => {
      answers[`IRPO_${q.id}`] = q.padrao === "A" ? "Nunca" : "Sempre";
    });
    const alerts = generatePatientAlerts(irpoAnswers(answers), FIXED_NOW);
    expect(findAlert(alerts, "alert-irpo-risco-alto")).toBeUndefined();
    const a = findAlert(alerts, "alert-irpo-risco");
    expect(a?.level).toEqual([AlertLevel.LEVEL_3]);
  });

  it("sem nenhuma resposta do IRPO, não gera alerta", () => {
    const alerts = generatePatientAlerts(irpoAnswers({}), FIXED_NOW);
    expect(findAlert(alerts, "alert-irpo-ideacao")).toBeUndefined();
    expect(findAlert(alerts, "alert-irpo-risco-alto")).toBeUndefined();
    expect(findAlert(alerts, "alert-irpo-risco")).toBeUndefined();
  });
});

describe("generatePatientAlerts — vulnerabilidade social (sinalização manual)", () => {
  it("gera alerta confidencial quando o Serviço Social sinaliza", () => {
    const alerts = generatePatientAlerts({ "servico-social": { vulnerabilidadeSocialSinalizada: "Sim" } }, FIXED_NOW);
    const a = findAlert(alerts, "alert-vulnerabilidade-social");
    expect(a?.confidential).toBe(true);
    expect(a?.author).toBe("Serviço Social");
  });

  it("não gera alerta quando a resposta é Não ou não respondida", () => {
    expect(findAlert(generatePatientAlerts({ "servico-social": { vulnerabilidadeSocialSinalizada: "Não" } }, FIXED_NOW), "alert-vulnerabilidade-social")).toBeUndefined();
    expect(findAlert(generatePatientAlerts({ "servico-social": {} }, FIXED_NOW), "alert-vulnerabilidade-social")).toBeUndefined();
  });
});

describe("generatePatientAlerts — acessibilidade/comunicação", () => {
  it("dispara com restrição de amplitude de movimento (Fisioterapia)", () => {
    const alerts = generatePatientAlerts({ fisioterapia: { restricaoAdm: "Sim" } }, FIXED_NOW);
    expect(findAlert(alerts, "alert-acessibilidade")?.description).toContain("Fisioterapia");
  });

  it("dispara com alteração da qualidade vocal (Fonoaudiologia)", () => {
    const alerts = generatePatientAlerts({ fonoaudiologia: { alteracaoVocal: "Sim" } }, FIXED_NOW);
    expect(findAlert(alerts, "alert-acessibilidade")?.description).toContain("Fonoaudiologia");
  });

  it("dispara com traqueostomia (Enfermagem)", () => {
    const alerts = generatePatientAlerts({ enfermagem: { "Dispositivos invasivos": ["Traqueostomia"] } }, FIXED_NOW);
    expect(findAlert(alerts, "alert-acessibilidade")?.description).toContain("traqueostomia");
  });

  it("dispara com baixo letramento digital (Serviço Social)", () => {
    const alerts = generatePatientAlerts({ "servico-social": { acessoInternet: "Não possui acesso" } }, FIXED_NOW);
    expect(findAlert(alerts, "alert-acessibilidade")?.description).toContain("letramento digital");
  });

  it("combina todos os motivos presentes num único alerta", () => {
    const alerts = generatePatientAlerts({
      fisioterapia: { restricaoAdm: "Sim" },
      fonoaudiologia: { alteracaoVocal: "Sim" },
    }, FIXED_NOW);
    const a = findAlert(alerts, "alert-acessibilidade");
    expect(a?.description).toContain("Fisioterapia");
    expect(a?.description).toContain("Fonoaudiologia");
  });

  it("não dispara quando nenhum motivo está presente", () => {
    const alerts = generatePatientAlerts({ fisioterapia: { restricaoAdm: "Não" } }, FIXED_NOW);
    expect(findAlert(alerts, "alert-acessibilidade")).toBeUndefined();
  });
});
