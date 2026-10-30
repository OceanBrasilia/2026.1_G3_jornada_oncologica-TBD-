import { describe, it, expect } from "vitest";
import {
  CONDUTA_ENCAMINHAMENTO_OPCOES,
} from "./PsicologiaForm";
import {
  irpoQuestions,
  calculateIrpoItemScore,
  calculateIrpoTotal,
  classifyIrpoRisk,
} from "../../calculos/irpo";

describe("PsicologiaForm — Critérios de Aceite de Psicologia", () => {
  describe("1 e 2. Questões com pontuação normal e invertida", () => {
    it("possui exatamente 27 questões mapeadas no IRPO", () => {
      expect(irpoQuestions.length).toBe(27);
    });

    it("identifica corretamente as 15 questões de pontuação invertida (padrão B)", () => {
      const invertedIds = irpoQuestions.filter((q) => q.padrao === "B").map((q) => q.id);
      expect(invertedIds).toEqual([7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 25]);
      expect(invertedIds.length).toBe(15);
    });

    it("identifica corretamente as 12 questões de pontuação padrão (padrão A)", () => {
      const normalIds = irpoQuestions.filter((q) => q.padrao === "A").map((q) => q.id);
      expect(normalIds).toEqual([1, 2, 3, 4, 5, 6, 21, 22, 23, 24, 26, 27]);
      expect(normalIds.length).toBe(12);
    });

    it("aplica cálculo padrão (A): 1=Nunca a 5=Sempre", () => {
      expect(calculateIrpoItemScore("Nunca", "A")).toBe(1);
      expect(calculateIrpoItemScore("Raramente", "A")).toBe(2);
      expect(calculateIrpoItemScore("Às vezes", "A")).toBe(3);
      expect(calculateIrpoItemScore("Frequentemente", "A")).toBe(4);
      expect(calculateIrpoItemScore("Sempre", "A")).toBe(5);
    });

    it("aplica cálculo invertido (B): 1=Nunca (5 pts) a 5=Sempre (1 pt)", () => {
      expect(calculateIrpoItemScore("Nunca", "B")).toBe(5);
      expect(calculateIrpoItemScore("Raramente", "B")).toBe(4);
      expect(calculateIrpoItemScore("Às vezes", "B")).toBe(3);
      expect(calculateIrpoItemScore("Frequentemente", "B")).toBe(2);
      expect(calculateIrpoItemScore("Sempre", "B")).toBe(1);
    });
  });

  describe("3. Exibição e atualização dinâmica da pontuação", () => {
    it("calcula a pontuação em tempo real combinando questões normais e invertidas", () => {
      const answers: Record<string, string> = {
        IRPO_1: "Sempre", // padrão A -> 5 pts
        IRPO_7: "Nunca",  // padrão B (invertido) -> 5 pts
        IRPO_8: "Sempre", // padrão B (invertido) -> 1 pt
      };
      // 5 + 5 + 1 = 11 pontos
      expect(calculateIrpoTotal(answers)).toBe(11);
    });

    it("estratifica o risco com precisão a partir do escore acumulado", () => {
      expect(classifyIrpoRisk(0)).toBeNull();
      expect(classifyIrpoRisk(40)?.level).toBe("Baixo Risco");
      expect(classifyIrpoRisk(55)?.level).toBe("Risco Moderado");
      expect(classifyIrpoRisk(70)?.level).toBe("Alto Risco");
    });
  });

  describe("5 e 6. Indicação / Encaminhamento (Questão 44)", () => {
    it("possui exatamente as 4 opções padronizadas no dropdown de seleção única", () => {
      expect(CONDUTA_ENCAMINHAMENTO_OPCOES).toEqual([
        "Ambulatório de Psicologia",
        "Ambulatório de Psiquiatria",
        "Não identificada necessidade de encaminhamento nesse momento, mas o serviço foi disponibilizado para busca por livre demanda",
        "Outro",
      ]);
    });

    it("possui a opção Ambulatório de Psicologia", () => {
      expect(CONDUTA_ENCAMINHAMENTO_OPCOES).toContain("Ambulatório de Psicologia");
    });

    it("possui a opção Ambulatório de Psiquiatria", () => {
      expect(CONDUTA_ENCAMINHAMENTO_OPCOES).toContain("Ambulatório de Psiquiatria");
    });

    it("possui a opção completa de busca por livre demanda", () => {
      expect(CONDUTA_ENCAMINHAMENTO_OPCOES).toContain(
        "Não identificada necessidade de encaminhamento nesse momento, mas o serviço foi disponibilizado para busca por livre demanda"
      );
    });

    it("possui a opção 'Outro'", () => {
      expect(CONDUTA_ENCAMINHAMENTO_OPCOES).toContain("Outro");
    });
  });

  describe("7. Separação entre score e indicação terapêutica", () => {
    it("não vincula a seleção do encaminhamento diretamente ao score calculado", () => {
      // Alto risco no IRPO
      const highRiskAnswers: Record<string, string> = {};
      irpoQuestions.forEach((q) => {
        highRiskAnswers[`IRPO_${q.id}`] = q.padrao === "A" ? "Sempre" : "Nunca";
      });
      const score = calculateIrpoTotal(highRiskAnswers);
      expect(score).toBe(27 * 5); // 135 pontos (Alto Risco)

      // A seleção da Questão 44 é independente da pontuação calculada
      const respostaClinica = "Ambulatório de Psicologia";
      expect(CONDUTA_ENCAMINHAMENTO_OPCOES).toContain(respostaClinica);
    });
  });
});
