import { describe, it, expect } from "vitest";
import { isEspecialidadePreenchida } from "./ExportDocumentModal";

describe("isEspecialidadePreenchida", () => {
  it("reconhece status 'atendido' como preenchido", () => {
    expect(isEspecialidadePreenchida({ id: "enfermagem", status: "atendido" })).toBe(true);
  });

  it("reconhece status 'em-atendimento' como preenchido", () => {
    expect(isEspecialidadePreenchida({ id: "medicina", status: "em-atendimento" })).toBe(true);
  });

  it("identifica especialidade pendente com respostas como preenchida", () => {
    const formAnswers = {
      nutricao: { peso: "70", altura: "1.75" },
    };
    expect(isEspecialidadePreenchida({ id: "nutricao", status: "pendente" }, formAnswers)).toBe(true);
  });

  it("identifica especialidade pendente sem respostas ou só com campos técnicos como não preenchida", () => {
    const formAnswers = {
      nutricao: { _updatedAt: "10:00" },
    };
    expect(isEspecialidadePreenchida({ id: "nutricao", status: "pendente" }, formAnswers)).toBe(false);
    expect(isEspecialidadePreenchida({ id: "psicologia", status: "pendente" }, {})).toBe(false);
  });
});
