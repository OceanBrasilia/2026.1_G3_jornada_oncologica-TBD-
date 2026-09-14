import { describe, it, expect } from "vitest";
import { calculateIMC } from "./imc";

describe("calculateIMC", () => {
  it("calcula corretamente com peso e altura normais", () => {
    expect(calculateIMC("68", "1.63")).toBe("25.6");
  });

  it("aceita vírgula decimal (formato brasileiro)", () => {
    expect(calculateIMC("68", "1,63")).toBe("25.6");
  });

  it("converte altura digitada em centímetros para metros", () => {
    expect(calculateIMC("68", "163")).toBe("25.6");
  });

  it("mostra — quando o peso está vazio", () => {
    expect(calculateIMC("", "1.63")).toBe("—");
  });

  it("mostra — quando a altura está vazia", () => {
    expect(calculateIMC("68", "")).toBe("—");
  });

  it("mostra — quando o peso é zero", () => {
    expect(calculateIMC("0", "1.63")).toBe("—");
  });

  it("mostra — quando a altura é zero", () => {
    expect(calculateIMC("68", "0")).toBe("—");
  });

  it("mostra — para peso negativo", () => {
    expect(calculateIMC("-5", "1.63")).toBe("—");
  });

  it("arredonda para 1 casa decimal", () => {
    expect(calculateIMC("100", "2")).toBe("25.0");
  });
});
