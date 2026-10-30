import { describe, it, expect } from "vitest";
import { buildEspecialidadesPdf } from "./buildEspecialidadesPdf";

const specialties = [
  { id: "enfermagem", name: "Enfermagem", status: "atendido" as const, professional: "Enfª. Patrícia Lima", completedTime: "09:10" },
  { id: "nutricao", name: "Nutrição", status: "pendente" as const },
  { id: "psicologia", name: "Psicologia", status: "nao-se-aplica" as const },
];

describe("buildEspecialidadesPdf", () => {
  it("especialidade preenchida traz detalhes, profissional e horário", () => {
    const result = buildEspecialidadesPdf(specialties, { enfermagem: { "Locomoção": "Sem auxílio" } }, "10/09/2026", true);
    const enf = result.find(r => r.nome === "Enfermagem")!;
    expect(enf.status).toBe("Preenchido");
    expect(enf.profissional).toBe("Enfª. Patrícia Lima");
    expect(enf.horario).toBe("10/09/2026 às 09:10");
    expect(enf.detalhes.length).toBeGreaterThan(0);
  });

  it("especialidade pendente ou não aplicável não traz detalhes nem profissional", () => {
    const result = buildEspecialidadesPdf(specialties, {}, "10/09/2026", true);
    const nutricao = result.find(r => r.nome === "Nutrição")!;
    const psicologia = result.find(r => r.nome === "Psicologia")!;
    expect(nutricao.status).toBe("Pendente");
    expect(nutricao.detalhes).toEqual([]);
    expect(nutricao.profissional).toBeUndefined();
    expect(psicologia.status).toBe("Não aplicável");
  });

  it("esconde o resumo da Psicologia de quem não pode ver conteúdo confidencial", () => {
    const answers: Record<string, any> = { IRPO_1: "Sempre" };
    const comAcesso = buildEspecialidadesPdf(
      [{ id: "psicologia", name: "Psicologia", status: "atendido" as const }],
      { psicologia: answers }, "10/09/2026", true
    );
    const semAcesso = buildEspecialidadesPdf(
      [{ id: "psicologia", name: "Psicologia", status: "atendido" as const }],
      { psicologia: answers }, "10/09/2026", false
    );
    expect(comAcesso[0].resumoPsicologia).not.toBeNull();
    expect(semAcesso[0].resumoPsicologia).toBeNull();
  });
});
