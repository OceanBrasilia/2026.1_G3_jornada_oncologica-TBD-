import { describe, it, expect } from "vitest";
import { mapRendaServicoSocialParaNutricao, mapRendaServicoSocialParaTerapiaOcupacional } from "./rendaMapping";

describe("mapRendaServicoSocialParaNutricao", () => {
  it("mapeia a mesma faixa quando existe equivalente exato", () => {
    expect(mapRendaServicoSocialParaNutricao("1 a 2 salários mínimos")).toBe("1 a 2 salários");
  });

  it("mapeia faixas sem renda/abaixo de 1 salário para a faixa mais baixa da Nutrição", () => {
    expect(mapRendaServicoSocialParaNutricao("Sem renda")).toBe("1 a 2 salários");
    expect(mapRendaServicoSocialParaNutricao("Menos de 1 salário mínimo")).toBe("1 a 2 salários");
  });

  it("mapeia a faixa mais alta para 'Mais de 4 salários'", () => {
    expect(mapRendaServicoSocialParaNutricao("Mais de 5 salários mínimos")).toBe("Mais de 4 salários");
  });

  it("valor desconhecido é devolvido sem alteração (não quebra)", () => {
    expect(mapRendaServicoSocialParaNutricao("valor que não existe")).toBe("valor que não existe");
  });
});

describe("mapRendaServicoSocialParaTerapiaOcupacional", () => {
  it("mapeia 'Sem renda' exatamente (a TO também tem essa opção)", () => {
    expect(mapRendaServicoSocialParaTerapiaOcupacional("Sem renda")).toBe("Sem renda");
  });

  it("mapeia a faixa mais alta para 'Mais de 3 salários mínimos'", () => {
    expect(mapRendaServicoSocialParaTerapiaOcupacional("Mais de 5 salários mínimos")).toBe("Mais de 3 salários mínimos");
  });

  it("valor desconhecido é devolvido sem alteração (não quebra)", () => {
    expect(mapRendaServicoSocialParaTerapiaOcupacional("valor que não existe")).toBe("valor que não existe");
  });
});
