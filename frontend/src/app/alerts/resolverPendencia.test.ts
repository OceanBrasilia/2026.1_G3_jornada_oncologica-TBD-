import { describe, expect, it } from "vitest";
import { equipesResponsaveis, podeResolverPendencia } from "./resolverPendencia";

describe("podeResolverPendencia", () => {
  it("permite quando a equipe do usuário é a responsável", () => {
    expect(podeResolverPendencia("Nutrição", "Nutrição")).toBe("permitido");
  });

  it("ignora maiúsculas e acentos", () => {
    expect(podeResolverPendencia("Nutrição", "nutricao")).toBe("permitido");
  });

  it("aceita qualquer uma das equipes quando há mais de uma responsável", () => {
    expect(podeResolverPendencia("Psicologia/Psiquiatria", "Psiquiatria")).toBe("permitido");
  });

  it("bloqueia quando o usuário é de outra equipe", () => {
    expect(podeResolverPendencia("Nutrição", "Fisioterapia")).toBe("outra-equipe");
  });

  it("bloqueia quando a pendência não tem responsável definido", () => {
    expect(podeResolverPendencia(undefined, "Nutrição")).toBe("outra-equipe");
  });

  it("pede confirmação quando a equipe do usuário ainda não é conhecida", () => {
    expect(podeResolverPendencia("Nutrição", null)).toBe("equipe-desconhecida");
  });
});

describe("equipesResponsaveis", () => {
  it("separa equipes por barra", () => {
    expect(equipesResponsaveis("Psicologia/Psiquiatria")).toEqual(["Psicologia", "Psiquiatria"]);
    expect(equipesResponsaveis(undefined)).toEqual([]);
  });
});
