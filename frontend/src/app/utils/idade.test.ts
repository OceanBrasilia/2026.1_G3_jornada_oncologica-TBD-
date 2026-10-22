import { describe, expect, it } from "vitest";
import { calcularIdade } from "./idade";

// Datas locais (mês começa em 0 no construtor do Date)
const em = (ano: number, mes: number, dia: number) => new Date(ano, mes - 1, dia, 10, 0);

describe("calcularIdade", () => {
  it("caso Maria: nascida em 20/12/1966 tem 59 anos em 30/09/2026", () => {
    expect(calcularIdade("1966-12-20", em(2026, 9, 30))).toBe(59);
  });

  it("completa o ano no próprio dia do aniversário", () => {
    expect(calcularIdade("1966-09-30", em(2026, 9, 30))).toBe(60);
  });

  it("não completa o ano na véspera do aniversário", () => {
    expect(calcularIdade("1966-10-01", em(2026, 9, 30))).toBe(59);
  });

  it("nascido em 29/02 completa o ano em 01/03 nos anos não bissextos", () => {
    expect(calcularIdade("2000-02-29", em(2026, 2, 28))).toBe(25);
    expect(calcularIdade("2000-02-29", em(2026, 3, 1))).toBe(26);
  });

  it("aceita data com horário vinda do servidor", () => {
    expect(calcularIdade("1966-12-20T00:00:00", em(2026, 9, 30))).toBe(59);
  });

  it("retorna 0 para data vazia ou inválida", () => {
    expect(calcularIdade("", em(2026, 9, 30))).toBe(0);
    expect(calcularIdade(null, em(2026, 9, 30))).toBe(0);
    expect(calcularIdade("20/12/1966", em(2026, 9, 30))).toBe(0);
  });
});
