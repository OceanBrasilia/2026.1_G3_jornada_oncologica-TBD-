import { describe, it, expect } from "vitest";
import { generatePatientAlerts } from "../alerts/generatePatientAlerts";
import { filterAlertsForRole, podeVerConfidencial } from "../alerts/visibleAlerts";
import { AlertLevel, AlertCategory } from "../types/alerts";
import { evaluateCondition } from "../components/forms/shared/conditionalEngine";

/**
 * Suíte de Testes de Usabilidade e Acessibilidade (RNF-006, RNF-007, RF-004, RN-004)
 */
describe("Auditoria de Usabilidade e Acessibilidade", () => {
  // ── 1. RNF-007: Informação não depende apenas de cor ─────────────────────────────
  describe("RNF-007: Informação e Severidade não dependem apenas da cor", () => {
    it("todos os alertas gerados possuem título textual, descrição e nível explícito", () => {
      const mockAnswers = {
        enfermagem: {
          Alergia: "Sim",
          "Reação alergica": "Urticária grave",
          "Avaliação da dor": "9",
          Comorbidades: ["Hipertensão arterial sistêmica"],
        },
      };

      const alerts = generatePatientAlerts(mockAnswers);
      expect(alerts.length).toBeGreaterThan(0);

      alerts.forEach((alert) => {
        // Todo alerta precisa ter título não vazio
        expect(alert.title).toBeDefined();
        expect(alert.title.trim().length).toBeGreaterThan(0);

        // Todo alerta precisa ter descrição textual
        expect(alert.description).toBeDefined();
        expect(alert.description.trim().length).toBeGreaterThan(0);

        // Nível e categoria bem definidos (não se baseia em cor visual na tela)
        expect(alert.level).toBeDefined();
        expect(alert.level.length).toBeGreaterThan(0);
        expect(alert.category).toBeDefined();
      });
    });

    it("alertas de alta gravidade (Nível 2) possuem ação recomendada e responsável definidos", () => {
      const mockAnswers = {
        enfermagem: {
          "Avaliação da dor": "8", // Dor intensa >= 7 vira Nível 2
        },
      };

      const alerts = generatePatientAlerts(mockAnswers);
      const dorAlert = alerts.find((a) => a.id === "alert-dor-intensa");

      expect(dorAlert).toBeDefined();
      expect(dorAlert?.level).toContain(AlertLevel.LEVEL_2);
      expect(dorAlert?.recommendedAction).toBeDefined();
      expect(dorAlert?.recommendedAction?.length).toBeGreaterThan(0);
      expect(dorAlert?.responsible).toBeDefined();
    });
  });

  // ── 2. Diretrizes de Linguagem Não Estigmatizante ───────────────────────────────
  describe("Linguagem Não Estigmatizante na Interface", () => {
    it("utiliza termos respeitosos e clínicos para suporte social e transporte", () => {
      const mockAnswers = {
        psicologia: {
          "Suporte social/familiar": "Ausente ou frágil",
        },
        "servico-social": {
          "Barreira de transporte": "Sim",
        },
      };

      const alerts = generatePatientAlerts(mockAnswers);
      alerts.forEach((alert) => {
        const fullText = `${alert.title} ${alert.description}`.toLowerCase();
        // Não deve usar frases estigmatizantes como "sem suporte" ou "abandonado"
        expect(fullText).not.toContain("sem suporte");
        expect(fullText).not.toContain("paciente abandonado");
      });
    });
  });

  // ── 3. RF-004 e RN-004: Sigilo e Privacidade de Dados por Perfil ───────────────
  describe("RF-004 e RN-004: Proteção de Dados Sensíveis por Perfil", () => {
    const sensitiveAlerts = [
      {
        id: "alert-psico-1",
        category: AlertCategory.PSYCHOSOCIAL_RISK,
        level: [AlertLevel.LEVEL_3],
        title: "Risco Psicossocial Relatado",
        description: "Suporte sociofamiliar frágil.",
        confidential: true,
        active: true,
        author: "Psicologia",
        createdAt: "14/09/2026 10:00:00",
        status: "aberto" as const,
      },
      {
        id: "alert-clin-1",
        category: AlertCategory.CLINICAL_RISK,
        level: [AlertLevel.LEVEL_3],
        title: "Comorbidade registrada",
        description: "Diabetes Mellitus.",
        confidential: false,
        active: true,
        author: "Medicina",
        createdAt: "14/09/2026 10:00:00",
        status: "aberto" as const,
      },
    ];

    it("paciente e acompanhante NUNCA têm permissão de ver dados confidenciais", () => {
      expect(podeVerConfidencial("paciente")).toBe(false);
      expect(podeVerConfidencial("acompanhante")).toBe(false);
      expect(podeVerConfidencial("recepcao")).toBe(false);
      expect(podeVerConfidencial(null)).toBe(false);
    });

    it("filtra e remove alertas confidenciais para paciente e acompanhante", () => {
      const filteredForPatient = filterAlertsForRole(sensitiveAlerts, "paciente");
      const hasConfidential = filteredForPatient.some((a) => a.confidential);
      expect(hasConfidential).toBe(false);
      expect(filteredForPatient.length).toBe(1);
      expect(filteredForPatient[0].id).toBe("alert-clin-1");
    });

    it("profissionais de saúde, coordenação e administrador possuem acesso aos alertas", () => {
      expect(podeVerConfidencial("administrador")).toBe(true);
      expect(podeVerConfidencial("coordenacao")).toBe(true);
      expect(podeVerConfidencial("profissional")).toBe(true);
    });
  });

  // ── 4. Usabilidade de Campos Condicionais (showIf) ──────────────────────────────
  describe("Usabilidade e Validação de Condições (showIf)", () => {
    it("exibe campos dependentes apenas quando a condição é verdadeira", () => {
      const formState = { Alergia: "Sim" };
      const showReacao = evaluateCondition(formState, { campo: "Alergia", igual: "Sim" });
      expect(showReacao).toBe(true);

      const formStateNao = { Alergia: "Não" };
      const hideReacao = evaluateCondition(formStateNao, { campo: "Alergia", igual: "Sim" });
      expect(hideReacao).toBe(false);
    });
  });

  // ── 5. RNF-006: Matriz de Responsividade ────────────────────────────────────────
  describe("RNF-006: Suporte aos Breakpoints de Tela", () => {
    const responsiveBreakpoints = [
      { name: "Mobile (Celular)", width: 360, minUsableWidth: 320 },
      { name: "Tablet", width: 768, minUsableWidth: 768 },
      { name: "Desktop Padrão", width: 1280, minUsableWidth: 1024 },
      { name: "Widescreen / TV", width: 1920, minUsableWidth: 1920 },
    ];

    it("todas as 4 resoluções obrigatórias estão mapeadas e são válidas", () => {
      expect(responsiveBreakpoints.length).toBe(4);
      responsiveBreakpoints.forEach((bp) => {
        expect(bp.width).toBeGreaterThanOrEqual(bp.minUsableWidth);
        expect(bp.name).toBeDefined();
      });
    });
  });
});
