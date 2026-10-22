import { describe, expect, it } from "vitest";
import { sanitizarParaPdf, textoCompativelPdf } from "./textoPdf";

describe("textoCompativelPdf", () => {
  it("troca o símbolo de maior ou igual (achado 12: '≥ 9' saía como 'e 9')", () => {
    expect(textoCompativelPdf("≥ 9: Necessidade crítica")).toBe(">= 9: Necessidade crítica");
    expect(textoCompativelPdf("≤ 3")).toBe("<= 3");
  });

  it("troca números subscritos", () => {
    expect(textoCompativelPdf("Saturação O₂")).toBe("Saturação O2");
  });

  it("mantém acentos, travessão, ponto médio e sinal de grau", () => {
    const texto = "Ação · Coração — 38,3º · 36,8°C · Não informado";
    expect(textoCompativelPdf(texto)).toBe(texto);
  });

  it("troca por '?' o que a fonte não desenha e não tem troca definida", () => {
    expect(textoCompativelPdf("dor 😢")).toBe("dor ?");
  });
});

describe("sanitizarParaPdf", () => {
  it("percorre objetos e listas, sem mexer em números", () => {
    expect(sanitizarParaPdf({ a: "≥ 70", b: ["O₂", 5], c: { d: "ok" }, idade: 59 }))
      .toEqual({ a: ">= 70", b: ["O2", 5], c: { d: "ok" }, idade: 59 });
  });
});
