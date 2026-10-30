import { describe, expect, it } from "vitest";
import { statusGeralDoPaciente } from "./statusPaciente";

type S = "atendido" | "pendente" | "em-atendimento" | "nao-se-aplica";
const esp = (enfermagem: S, nutricao: S = "pendente") => [
  { id: "recepcao", status: "atendido" as S },
  { id: "enfermagem", status: enfermagem },
  { id: "nutricao", status: nutricao },
];

describe("statusGeralDoPaciente", () => {
  it("aguardando quando só a Recepção atendeu", () => {
    expect(statusGeralDoPaciente(esp("pendente"))).toBe("aguardando");
  });

  it("em atendimento quando há especialidade com rascunho salvo", () => {
    expect(statusGeralDoPaciente(esp("em-atendimento"))).toBe("em-atendimento");
    expect(statusGeralDoPaciente(esp("atendido", "em-atendimento"))).toBe("em-atendimento");
  });

  it("pendente quando já passou por alguma e ainda faltam especialidades", () => {
    expect(statusGeralDoPaciente(esp("atendido", "pendente"))).toBe("pendente");
  });

  it("finalizado quando todas as aplicáveis estão atendidas", () => {
    expect(statusGeralDoPaciente(esp("atendido", "atendido"))).toBe("finalizado");
  });

  it("'não se aplica' fica fora da conta", () => {
    expect(statusGeralDoPaciente(esp("atendido", "nao-se-aplica"))).toBe("finalizado");
    expect(statusGeralDoPaciente(esp("nao-se-aplica", "pendente"))).toBe("aguardando");
  });

  it("volta a em atendimento se um formulário concluído for reaberto como rascunho", () => {
    expect(statusGeralDoPaciente(esp("em-atendimento", "atendido"))).toBe("em-atendimento");
  });
});
