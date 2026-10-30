import { describe, it, expect } from "vitest";
import {
  irpoQuestions,
  calculateIrpoItemScore,
  calculateIrpoTotal,
  classifyIrpoRisk,
  isIrpoCriticalRisk,
} from "./irpo";

describe("calculateIrpoItemScore", () => {
  it("questão padrão A: 'Sempre' vale o máximo (5)", () => {
    expect(calculateIrpoItemScore("Sempre", "A")).toBe(5);
  });

  it("questão padrão A: 'Nunca' vale o mínimo (1)", () => {
    expect(calculateIrpoItemScore("Nunca", "A")).toBe(1);
  });

  it("questão padrão B (invertida): 'Sempre' vale o mínimo (1)", () => {
    expect(calculateIrpoItemScore("Sempre", "B")).toBe(1);
  });

  it("questão padrão B (invertida): 'Nunca' vale o máximo (5)", () => {
    expect(calculateIrpoItemScore("Nunca", "B")).toBe(5);
  });

  it("sem resposta, dá 0", () => {
    expect(calculateIrpoItemScore("", "A")).toBe(0);
  });
});

describe("calculateIrpoTotal", () => {
  it("existem exatamente 27 questões no instrumento", () => {
    expect(irpoQuestions.length).toBe(27);
  });

  it("sem nenhuma resposta, o total é 0", () => {
    expect(calculateIrpoTotal({})).toBe(0);
  });

  it("respondendo 'Nunca' em todas as questões padrão A (1 ponto cada) e padrão B (5 pontos cada)", () => {
    const answers: Record<string, string> = {};
    irpoQuestions.forEach((q) => {
      answers[`IRPO_${q.id}`] = "Nunca";
    });
    const countA = irpoQuestions.filter((q) => q.padrao === "A").length;
    const countB = irpoQuestions.filter((q) => q.padrao === "B").length;
    expect(calculateIrpoTotal(answers)).toBe(countA * 1 + countB * 5);
  });
});

describe("classifyIrpoRisk", () => {
  it("total 0 (nada respondido ainda): sem classificação", () => {
    expect(classifyIrpoRisk(0)).toBeNull();
  });

  it("total 54: Baixo Risco (limite inferior da faixa seguinte)", () => {
    expect(classifyIrpoRisk(54)?.level).toBe("Baixo Risco");
  });

  it("total 55: Risco Moderado (início da faixa)", () => {
    expect(classifyIrpoRisk(55)?.level).toBe("Risco Moderado");
  });

  it("total 69: ainda Risco Moderado (fim da faixa)", () => {
    expect(classifyIrpoRisk(69)?.level).toBe("Risco Moderado");
  });

  it("total 70: Alto Risco (início da faixa)", () => {
    expect(classifyIrpoRisk(70)?.level).toBe("Alto Risco");
  });
});

describe("isIrpoCriticalRisk", () => {
  it("69 pontos não é crítico", () => {
    expect(isIrpoCriticalRisk(69)).toBe(false);
  });

  it("70 pontos é crítico", () => {
    expect(isIrpoCriticalRisk(70)).toBe(true);
  });
});
