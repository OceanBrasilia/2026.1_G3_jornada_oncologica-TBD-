import { describe, it, expect } from "vitest";
import {
  calculateWeightLossPercentage,
  formatWeightLossPercentage,
  calculateAnexo1Score,
  calculateBox1ScoreFromAnexo1,
  calculateBox1Score,
  calculateBox2Score,
  calculateBox3Score,
  calculateBox4Score,
  calculateBoxBScore,
  calculateEstresseFebreScore,
  calculateCorticoideScore,
  calculateBoxCScore,
  calculateBoxDScore,
  calculateAsgPppTotal,
  getTriageInfo,
  isAsgPppPreenchido,
} from "./asgPpp";

describe("ASG-PPP — Testes de Regras de Negócio e Cálculos de Nutrição", () => {
  describe("2, 3 e 4. Cálculo do Percentual de Perda de Peso", () => {
    it("calcula exatamente 10% para peso recente 70 e peso atual 63 (exemplo do prompt)", () => {
      // Diferença = 70 - 63 = 7 -> 7 / 70 = 0.10 -> 10%
      const loss = calculateWeightLossPercentage("70", "63");
      expect(loss).toBe(10);
      expect(formatWeightLossPercentage(loss)).toBe("10%");
    });

    it("calcula perda pequena com precisão decimal (ex.: 10,5%)", () => {
      // 70 - 62.65 = 7.35 / 70 = 10.5%
      const loss = calculateWeightLossPercentage("70", "62.65");
      expect(loss).toBe(10.5);
      expect(formatWeightLossPercentage(loss)).toBe("10,5%");
    });

    it("retorna 0 quando não há perda de peso (peso manteve ou aumentou)", () => {
      expect(calculateWeightLossPercentage("70", "70")).toBe(0);
      expect(calculateWeightLossPercentage("70", "75")).toBe(-7.1);
    });

    it("retorna null para campos vazios, nulos ou indefinidos sem quebrar", () => {
      expect(calculateWeightLossPercentage("", "63")).toBeNull();
      expect(calculateWeightLossPercentage("70", "")).toBeNull();
      expect(calculateWeightLossPercentage(undefined, "63")).toBeNull();
      expect(calculateWeightLossPercentage("70", null)).toBeNull();
    });

    it("retorna null e evita divisão por zero se peso recente for zero ou negativo", () => {
      expect(calculateWeightLossPercentage("0", "63")).toBeNull();
      expect(calculateWeightLossPercentage("-70", "63")).toBeNull();
      expect(calculateWeightLossPercentage("0", "0")).toBeNull();
    });

    it("retorna null para valores não numéricos ou inválidos", () => {
      expect(calculateWeightLossPercentage("abc", "63")).toBeNull();
      expect(calculateWeightLossPercentage("70", "xyz")).toBeNull();
    });

    it("calcula dinamicamente após alteração de peso", () => {
      let loss = calculateWeightLossPercentage("80", "76"); // 4/80 = 5%
      expect(loss).toBe(5);
      loss = calculateWeightLossPercentage("80", "72"); // 8/80 = 10%
      expect(loss).toBe(10);
    });
  });

  describe("5, 6 e 7. Anexo 1 e Caixa 1", () => {
    it("pontua o Anexo 1 em 1 mês conforme as faixas clínicas", () => {
      // 1 mês: < 2% = 0, 2-2.9% = 1, 3-4.9% = 2, 5-9.9% = 3, >= 10% = 4
      expect(calculateAnexo1Score(1.5, "1m")).toBe(0);
      expect(calculateAnexo1Score(2.5, "1m")).toBe(1);
      expect(calculateAnexo1Score(4.0, "1m")).toBe(2);
      expect(calculateAnexo1Score(7.5, "1m")).toBe(3);
      expect(calculateAnexo1Score(10.0, "1m")).toBe(4);
      expect(calculateAnexo1Score(15.0, "1m")).toBe(4);
    });

    it("pontua o Anexo 1 em 6 meses conforme as faixas clínicas", () => {
      // 6 meses: < 2% = 0, 2-5.9% = 1, 6-9.9% = 2, 10-19.9% = 3, >= 20% = 4
      expect(calculateAnexo1Score(1.8, "6m")).toBe(0);
      expect(calculateAnexo1Score(4.5, "6m")).toBe(1);
      expect(calculateAnexo1Score(8.0, "6m")).toBe(2);
      expect(calculateAnexo1Score(15.0, "6m")).toBe(3);
      expect(calculateAnexo1Score(20.0, "6m")).toBe(4);
    });

    it("Caixa 1 utiliza corretamente os pontos do Anexo 1", () => {
      // Anexo 1 = 3 pontos, sem piora recente = 3
      expect(calculateBox1ScoreFromAnexo1(3, "Ficou igual (0)")).toBe(3);
      // Anexo 1 = 3 pontos, com piora recente (Diminuiu (1)) = 4
      expect(calculateBox1ScoreFromAnexo1(3, "Diminuiu (1)")).toBe(4);
      // Anexo 1 = 4 pontos, com piora recente = 5 (máximo da Caixa 1)
      expect(calculateBox1ScoreFromAnexo1(4, "Diminuiu (1)")).toBe(5);
    });

    it("calculateBox1Score integrado une Anexo 1 e Caixa 1 sem duplicação", () => {
      // 70kg recente, 63kg atual -> 10% perda em 1m (4 pts) + Diminuiu (1 pt) = 5 pts
      expect(calculateBox1Score("63", "70", "", "Diminuiu (1)")).toBe(5);
      // 100kg em 6m, 80kg atual -> 20% perda em 6m (4 pts) + sem piora = 4 pts
      expect(calculateBox1Score("80", "", "100", "Ficou igual (0)")).toBe(4);
    });
  });

  describe("8. Caixa 2 — Ingestão Alimentar", () => {
    it("avalia as respostas da Caixa 2 sem reutilizar Caixa 1 e sem duplicar pontos", () => {
      // Apenas mudança marcada
      expect(calculateBox2Score("Menos que o normal (1)", "")).toBe(1);
      // Alimentos sólidos em menor quantidade (1)
      expect(calculateBox2Score("Sem mudanças (0)", "Comida normal (alimentos sólidos) em menor quantidade (1)")).toBe(1);
      // Pega a maior pontuação assinalada (máximo 4 pontos)
      expect(calculateBox2Score("Menos que o normal (1)", "Muito pouco de qualquer comida (4)")).toBe(4);
      expect(calculateBox2Score("Menos que o normal (1)", "Apenas suplementos nutricionais (3)")).toBe(3);
    });

    it("atualiza imediatamente após alteração das opções da Caixa 2", () => {
      let score = calculateBox2Score("Sem mudanças (0)", "Comida normal (alimentos sólidos) em pouca quantidade (2)");
      expect(score).toBe(2);
      score = calculateBox2Score("Menos que o normal (1)", "Apenas líquidos (3)");
      expect(score).toBe(3);
    });
  });

  describe("9, 10, 11 e 12. Anexo 3 — Estresse, Febre e Corticoide", () => {
    it("trata Estresse, Febre e Duração da febre como um bloco único com classificação de 1 a 3 pontos", () => {
      // Baixo = 1
      expect(calculateEstresseFebreScore("Baixo").pontos).toBe(1);
      expect(calculateEstresseFebreScore("Baixo").nivel).toBe("Baixo");

      // Moderado = 2
      expect(calculateEstresseFebreScore("Moderado").pontos).toBe(2);
      expect(calculateEstresseFebreScore("Moderado").nivel).toBe("Moderado");

      // Alto = 3
      expect(calculateEstresseFebreScore("Alto").pontos).toBe(3);
      expect(calculateEstresseFebreScore("Alto").nivel).toBe("Alto");

      // Nenhum = 0
      expect(calculateEstresseFebreScore("Nenhum (0)").pontos).toBe(0);
      expect(calculateEstresseFebreScore("Nenhum (0)").nivel).toBe("Sem estresse");
    });

    it("NÃO soma individualmente febre + duração da febre; agrupa no maior nível", () => {
      // Febre moderada (2) e duração baixa (1) -> nível do bloco é Moderado (2 pontos), NÃO 3 pontos
      const res = calculateEstresseFebreScore("", "2 = Moderado / ≥ 38,3º e < 38,9º", "1 = Baixo / < 72 horas");
      expect(res.pontos).toBe(2);
      expect(res.nivel).toBe("Moderado");
    });

    it("avalia o Corticoide separadamente: Baixo = 1, Moderado = 2, Alto = 3", () => {
      expect(calculateCorticoideScore("1 = Baixo / Dose baixa (< 10 mg prednisona/dia)")).toBe(1);
      expect(calculateCorticoideScore("2 = Moderado / Dose moderada (≥ 10 e < 30 mg prednisona/dia)")).toBe(2);
      expect(calculateCorticoideScore("3 = Alto / Dose alta (≥ 30 mg prednisona/dia)")).toBe(3);
      expect(calculateCorticoideScore("0 = Nenhum / Sem corticosteroides")).toBe(0);
    });

    it("combina Estresse/Febre e Corticoide conforme o exemplo do prompt (Moderado 2 + Corticoide Alto 3 = 5)", () => {
      // Bloco Estresse/Febre = Moderado (2)
      // Corticoide = Alto (3)
      // Total = 5 pontos
      expect(calculateBoxCScore(2, 3)).toBe(5);
    });

    it("calculateBoxCScore com 3 argumentos agrupa febre/duração e soma com corticoide", () => {
      // febre 1, duracao 1, corticoide 2 -> max(1, 1) + 2 = 1 + 2 = 3 (e NÃO 1 + 1 + 2 = 4)
      expect(calculateBoxCScore(1, 1, 2)).toBe(3);
      // febre 2, duracao 2, corticoide 3 -> max(2, 2) + 3 = 2 + 3 = 5
      expect(calculateBoxCScore(2, 2, 3)).toBe(5);
    });
  });

  describe("14 e 15. Escore Total ASG-PPP e Integração Global", () => {
    it("calcula o escore total combinando todos os blocos corrigidos", () => {
      const answers = {
        peso: "63",
        peso_1m: "70", // 10% perda em 1m -> Anexo 1 = 4 pts
        peso_var_2sem: "Diminuiu (1)", // +1 pt -> Caixa 1 = 5 pts
        ingestao_mudanca: "Menos que o normal (1)",
        ingestao_atual: "Comida normal (alimentos sólidos) em menor quantidade (1)", // Caixa 2 = 1 pt
        sintomas: ["Náusea (1)", "Vômito (3)"], // Caixa 3 = 4 pts
        atividade: "Normal, sem nenhuma limitação (0)", // Caixa 4 = 0 pts
        doencas: ["Câncer (1)"], // Caixa B = 1 pt
        estresse_metabolico: "2 = Moderado (2 pontos)", // Bloco 1 = 2 pts
        corticoide: "3 = Alto / Dose alta (≥ 30 mg prednisona/dia)", // Bloco 2 = 3 pts -> Caixa C = 5 pts
        exame_fisico: "1", // Caixa D = 1 pt
      };
      // Total: Caixa 1 (5) + Caixa 2 (1) + Caixa 3 (4) + Caixa 4 (0) + Caixa B (1) + Caixa C (5) + Caixa D (1) = 17 pontos
      const total = calculateAsgPppTotal(answers);
      expect(total).toBe(17);
      expect(getTriageInfo(total).text).toContain("≥ 9");
    });
  });

  describe("Detecção de preenchimento (isAsgPppPreenchido)", () => {
    it("retorna false quando vazio ou sem campos específicos de ASG-PPP", () => {
      expect(isAsgPppPreenchido(undefined)).toBe(false);
      expect(isAsgPppPreenchido({})).toBe(false);
      expect(isAsgPppPreenchido({ peso: "70", altura: "1.75" })).toBe(false);
    });

    it("retorna true quando campos de perda de peso, ingestão ou sintomas são preenchidos", () => {
      expect(isAsgPppPreenchido({ peso_1m: "65" })).toBe(true);
      expect(isAsgPppPreenchido({ ingestao_mudanca: "Menos que o normal (1)" })).toBe(true);
      expect(isAsgPppPreenchido({ sintomas: ["Náusea (1)"] })).toBe(true);
      expect(isAsgPppPreenchido({ estresse_metabolico: "1 = Baixo (1 ponto)" })).toBe(true);
    });
  });
});
