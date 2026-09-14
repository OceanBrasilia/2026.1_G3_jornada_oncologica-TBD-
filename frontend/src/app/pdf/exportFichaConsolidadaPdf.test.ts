import { describe, it, expect } from "vitest";
import { nomeArquivoFichaPdf } from "./exportFichaConsolidadaPdf";

describe("nomeArquivoFichaPdf", () => {
  it("segue o formato ficha_[id]_[AAAAMMDD-HHMM].pdf", () => {
    const data = new Date(2026, 8, 11, 14, 5); // 11/09/2026 14:05 (mês é 0-indexado)
    expect(nomeArquivoFichaPdf("CAO-2024-0002", data)).toBe("ficha_CAO-2024-0002_20260911-1405.pdf");
  });

  it("segue sempre o padrão ficha_<id>_<AAAAMMDD-HHMM>.pdf, sem espaço para o nome do paciente", () => {
    const data = new Date(2026, 0, 1, 0, 0);
    const nome = nomeArquivoFichaPdf("CAO-2024-0099", data);
    expect(nome).toMatch(/^ficha_CAO-2024-0099_\d{8}-\d{4}\.pdf$/);
  });

  it("preenche com zero à esquerda horas/minutos/dia/mês de um dígito", () => {
    const data = new Date(2026, 0, 5, 3, 7); // 05/01/2026 03:07
    expect(nomeArquivoFichaPdf("ID1", data)).toBe("ficha_ID1_20260105-0307.pdf");
  });
});
