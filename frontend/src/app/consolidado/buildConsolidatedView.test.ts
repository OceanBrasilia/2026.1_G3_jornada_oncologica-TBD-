import { describe, it, expect } from "vitest";
import {
  buildDadosGerais,
  buildDetalhesEspecialidade,
  buildResumoNutricao,
  buildResumoPsicologia,
  statusLabel,
} from "./buildConsolidatedView";
import { irpoQuestions } from "../calculos/irpo";

const specialties = [
  { id: "enfermagem", name: "Enfermagem" },
  { id: "nutricao", name: "Nutrição" },
  { id: "psicologia", name: "Psicologia" },
  { id: "servico-social", name: "Serviço Social" },
];

describe("buildDadosGerais", () => {
  it("pega o primeiro valor preenchido de cada campo compartilhado e registra a origem", () => {
    const formAnswers = {
      enfermagem: { Alergia: "Sim", tabagismo: "Não" },
      nutricao: { peso: "68", tabagismo: "Sim" },
    };
    const dados = buildDadosGerais(formAnswers, specialties);
    const alergia = dados.find(d => d.campo === "Alergia");
    expect(alergia?.valor).toBe("Sim");
    expect(alergia?.origem).toBe("Enfermagem");

    const tabagismo = dados.find(d => d.campo === "tabagismo");
    expect(tabagismo?.origem).toBe("Enfermagem"); // enfermagem vem antes de nutricao na lista

    const peso = dados.find(d => d.campo === "peso");
    expect(peso?.origem).toBe("Nutrição");
  });

  it("não inclui campos que nenhuma especialidade preencheu", () => {
    const dados = buildDadosGerais({}, specialties);
    expect(dados).toEqual([]);
  });

  it("ignora valores vazios ('' ou '—') ao procurar quem preencheu", () => {
    const formAnswers = {
      enfermagem: { Alergia: "" },
      nutricao: { Alergia: "Sim" },
    };
    const dados = buildDadosGerais(formAnswers, specialties);
    expect(dados.find(d => d.campo === "Alergia")?.origem).toBe("Nutrição");
  });
});

describe("buildDetalhesEspecialidade", () => {
  it("remove campos técnicos (_suppressed, _isOther, _append, _updatedAt)", () => {
    const linhas = buildDetalhesEspecialidade("enfermagem", {
      "Locomoção": "Sem auxílio",
      "Escolaridade_suppressed": true,
      "algumTexto_isOther": "false",
      "algumTexto_append": "nada",
      "_updatedAt": "10:00",
    }, true);
    expect(linhas).toEqual([{ campo: "Locomoção", valor: "Sem auxílio" }]);
  });

  it("remove campos vazios", () => {
    const linhas = buildDetalhesEspecialidade("enfermagem", { "MMII": "", "Disfagia": [] }, true);
    expect(linhas).toEqual([]);
  });

  it("não repete campos que já aparecem em Dados gerais", () => {
    const linhas = buildDetalhesEspecialidade("enfermagem", { Alergia: "Sim", "Locomoção": "Sem auxílio" }, true);
    expect(linhas).toEqual([{ campo: "Locomoção", valor: "Sem auxílio" }]);
  });

  it("esconde os campos confidenciais de quem não pode ver", () => {
    const answers = { IdeacaoSuicida: "Sim", "Fase do tratamento": "Tratamento" };
    const comAcesso = buildDetalhesEspecialidade("psicologia", answers, true);
    const semAcesso = buildDetalhesEspecialidade("psicologia", answers, false);
    expect(comAcesso.some(l => l.campo === "IdeacaoSuicida")).toBe(true);
    expect(semAcesso.some(l => l.campo === "IdeacaoSuicida")).toBe(false);
    // campo não-confidencial continua visível para os dois
    expect(semAcesso.some(l => l.campo === "Fase do tratamento")).toBe(true);
  });

  it("esconde as 27 respostas brutas do IRPO (substituídas pelo card de resultado)", () => {
    const answers: Record<string, string> = { IRPO_1: "Sempre", IRPO_2: "Nunca" };
    const linhas = buildDetalhesEspecialidade("psicologia", answers, true);
    expect(linhas.some(l => l.campo.startsWith("IRPO_"))).toBe(false);
  });
});

describe("buildResumoNutricao", () => {
  it("retorna null quando nada foi preenchido", () => {
    expect(buildResumoNutricao({})).toBeNull();
    expect(buildResumoNutricao(undefined)).toBeNull();
  });

  it("calcula IMC e escore ASG-PPP com fórmula e classificação", () => {
    const resumo = buildResumoNutricao({ peso: "68", altura: "1.63", sintomas: ["Vômito (3)"] });
    expect(resumo?.imc).toBe("25.6");
    expect(resumo?.imcFormula).toContain("altura");
    expect(resumo?.asgTotal).toBe(3);
    expect(resumo?.asgTriage.text).toContain("2-3");
  });
});

describe("buildResumoPsicologia", () => {
  it("retorna null quando nenhuma questão foi respondida", () => {
    expect(buildResumoPsicologia({})).toBeNull();
  });

  it("calcula o escore e a classificação quando há respostas", () => {
    const answers: Record<string, string> = {};
    irpoQuestions.forEach(q => { answers[`IRPO_${q.id}`] = "Nunca"; });
    const resumo = buildResumoPsicologia(answers);
    expect(resumo?.respondidas).toBe(27);
    expect(resumo?.irpoRisk).not.toBeNull();
  });
});

describe("statusLabel", () => {
  it("traduz os status em texto legível", () => {
    expect(statusLabel("atendido")).toBe("Preenchido");
    expect(statusLabel("pendente")).toBe("Pendente");
    expect(statusLabel("nao-se-aplica")).toBe("Não aplicável");
  });
});
