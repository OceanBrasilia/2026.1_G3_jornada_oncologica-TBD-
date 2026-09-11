import { describe, it, expect } from "vitest";
import {
  calculateBox1Score,
  calculateBox2Score,
  calculateBox3Score,
  calculateBox4Score,
  calculateBoxBScore,
  calculateBoxCScore,
  calculateBoxDScore,
  getTriageInfo,
} from "./asgPpp";

describe("calculateBox1Score (perda de peso)", () => {
  it("sem perda de peso, sem mudança recente, dá 0", () => {
    expect(calculateBox1Score("70", "70", "", "")).toBe(0);
  });

  it("perda de 10% em 1 mês + piora recente soma o ponto extra", () => {
    expect(calculateBox1Score("63", "70", "", "Diminuiu (1)")).toBe(5);
  });

  it("usa o dado de 6 meses quando não há dado de 1 mês", () => {
    // perda de 20% em 6 meses -> 4 pontos
    expect(calculateBox1Score("80", "", "100", "")).toBe(4);
  });

  it("sem nenhum dado de peso anterior, dá 0", () => {
    expect(calculateBox1Score("70", "", "", "")).toBe(0);
  });
});

describe("calculateBox3Score (sintomas)", () => {
  it("sem sintomas marcados, dá 0", () => {
    expect(calculateBox3Score([])).toBe(0);
  });

  it("soma a pontuação de cada sintoma marcado", () => {
    expect(calculateBox3Score(["Náusea (1)", "Vômito (3)"])).toBe(4);
  });
});

describe("calculateBox4Score (atividade)", () => {
  it("atividade normal dá 0", () => {
    expect(calculateBox4Score("Normal, sem nenhuma limitação (0)")).toBe(0);
  });

  it("opção desconhecida dá 0 (não quebra)", () => {
    expect(calculateBox4Score("texto que não existe na lista")).toBe(0);
  });
});

describe("calculateBoxBScore / calculateBoxCScore / calculateBoxDScore", () => {
  it("BoxB conta o número de doenças marcadas", () => {
    expect(calculateBoxBScore(["Câncer", "Diabetes"])).toBe(2);
    expect(calculateBoxBScore([])).toBe(0);
  });

  it("BoxC soma febre + duração da febre + corticoide", () => {
    expect(calculateBoxCScore(1, 1, 2)).toBe(4);
  });

  it("BoxD repassa o escore subjetivo do exame físico", () => {
    expect(calculateBoxDScore(3)).toBe(3);
  });
});

describe("getTriageInfo (faixas de triagem)", () => {
  it("0 a 1 ponto: sem necessidade de intervenção agora", () => {
    expect(getTriageInfo(0).text).toContain("0-1");
    expect(getTriageInfo(1).text).toContain("0-1");
  });

  it("2 a 3 pontos: educação do paciente", () => {
    expect(getTriageInfo(2).text).toContain("2-3");
    expect(getTriageInfo(3).text).toContain("2-3");
  });

  it("4 a 8 pontos: intervenção do nutricionista", () => {
    expect(getTriageInfo(4).text).toContain("4-8");
    expect(getTriageInfo(8).text).toContain("4-8");
  });

  it("9 ou mais: necessidade crítica", () => {
    expect(getTriageInfo(9).text).toContain("≥ 9");
    expect(getTriageInfo(20).text).toContain("≥ 9");
  });
});
