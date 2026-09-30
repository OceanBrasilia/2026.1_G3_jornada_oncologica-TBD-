import { describe, expect, it } from "vitest";
import { statusGeralAposAtendimento } from "./statusPaciente";

const esp = (enfermagem: "atendido" | "pendente" | "em-atendimento" | "nao-se-aplica") => [
  { id: "recepcao", status: "atendido" as const },
  { id: "enfermagem", status: enfermagem },
  { id: "nutricao", status: "pendente" as const },
];

describe("statusGeralAposAtendimento", () => {
  it("continua aguardando quando só a Recepção atendeu", () => {
    expect(statusGeralAposAtendimento("aguardando", esp("pendente"))).toBe("aguardando");
  });

  it("passa para em atendimento quando uma especialidade é atendida", () => {
    expect(statusGeralAposAtendimento("aguardando", esp("atendido"))).toBe("em-atendimento");
  });

  it("passa para em atendimento quando há rascunho salvo", () => {
    expect(statusGeralAposAtendimento("aguardando", esp("em-atendimento"))).toBe("em-atendimento");
  });

  it("'não se aplica' não conta como atendimento", () => {
    expect(statusGeralAposAtendimento("aguardando", esp("nao-se-aplica"))).toBe("aguardando");
  });

  it("nunca muda um status que já não é 'aguardando'", () => {
    expect(statusGeralAposAtendimento("finalizado", esp("pendente"))).toBe("finalizado");
    expect(statusGeralAposAtendimento("pendente", esp("atendido"))).toBe("pendente");
  });
});
