import { describe, it, expect } from "vitest";
import { evaluateCondition } from "./conditionalEngine";

describe("evaluateCondition — igual", () => {
  it("verdadeiro quando o valor bate", () => {
    expect(evaluateCondition({ tratamentoPrevio: "Cirurgia" }, { campo: "tratamentoPrevio", igual: "Cirurgia" })).toBe(true);
  });

  it("falso quando o valor é diferente", () => {
    expect(evaluateCondition({ tratamentoPrevio: "Não" }, { campo: "tratamentoPrevio", igual: "Cirurgia" })).toBe(false);
  });

  it("falso quando o campo nunca foi respondido", () => {
    expect(evaluateCondition({}, { campo: "tratamentoPrevio", igual: "Cirurgia" })).toBe(false);
  });
});

describe("evaluateCondition — diferente", () => {
  it("verdadeiro quando o valor é diferente", () => {
    expect(evaluateCondition({ demandaAmbulatorial: "Sim" }, { campo: "demandaAmbulatorial", diferente: "Outro" })).toBe(true);
  });

  it("falso quando o valor é igual", () => {
    expect(evaluateCondition({ demandaAmbulatorial: "Outro" }, { campo: "demandaAmbulatorial", diferente: "Outro" })).toBe(false);
  });
});

describe("evaluateCondition — contém (múltipla escolha)", () => {
  it("verdadeiro quando o array contém o valor", () => {
    expect(evaluateCondition({ sintomas: ["Náusea (1)", "Vômito (3)"] }, { campo: "sintomas", "contém": "Vômito (3)" })).toBe(true);
  });

  it("falso quando o array não contém o valor", () => {
    expect(evaluateCondition({ sintomas: ["Náusea (1)"] }, { campo: "sintomas", "contém": "Vômito (3)" })).toBe(false);
  });

  it("falso quando o campo não é um array", () => {
    expect(evaluateCondition({ sintomas: "Náusea (1)" }, { campo: "sintomas", "contém": "Náusea (1)" })).toBe(false);
  });
});

describe("evaluateCondition — E / OU", () => {
  it("E: só é verdadeiro quando todas as condições batem", () => {
    const condition = { E: [
      { campo: "usaSonda", igual: "Sim" as const },
      { campo: "tipoSonda", diferente: "" as const },
    ]};
    expect(evaluateCondition({ usaSonda: "Sim", tipoSonda: "Nasoentérica" }, condition)).toBe(true);
    expect(evaluateCondition({ usaSonda: "Sim", tipoSonda: "" }, condition)).toBe(false);
    expect(evaluateCondition({ usaSonda: "Não", tipoSonda: "Nasoentérica" }, condition)).toBe(false);
  });

  it("OU: verdadeiro quando pelo menos uma condição bate (ex.: incontinência urinária OU fecal)", () => {
    const condition = { OU: [
      { campo: "incontinencia", igual: "Urinária" as const },
      { campo: "incontinencia", igual: "Fecal" as const },
    ]};
    expect(evaluateCondition({ incontinencia: "Urinária" }, condition)).toBe(true);
    expect(evaluateCondition({ incontinencia: "Fecal" }, condition)).toBe(true);
    expect(evaluateCondition({ incontinencia: "Não" }, condition)).toBe(false);
  });

  it("combinações aninhadas de E e OU funcionam", () => {
    const condition = {
      E: [
        { campo: "tratamentoPrevio", igual: "Cirurgia" as const },
        { OU: [
          { campo: "linfedema", igual: "Sim" as const },
          { campo: "linfedema", igual: "Outro" as const },
        ]},
      ],
    };
    expect(evaluateCondition({ tratamentoPrevio: "Cirurgia", linfedema: "Sim" }, condition)).toBe(true);
    expect(evaluateCondition({ tratamentoPrevio: "Cirurgia", linfedema: "Não" }, condition)).toBe(false);
    expect(evaluateCondition({ tratamentoPrevio: "Não", linfedema: "Sim" }, condition)).toBe(false);
  });
});
