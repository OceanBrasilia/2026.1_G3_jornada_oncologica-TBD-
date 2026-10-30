import { describe, it, expect, beforeEach } from "vitest";
import {
  MEDICINA_ECOG_OPCOES,
  MEDICINA_ESTADIAMENTO_OPCOES,
  MEDICINA_INVESTIMENTO_OPCOES,
  MEDICINA_MENOPAUSA_OPCOES,
  MEDICINA_ATIVIDADE_FISICA_OPCOES,
} from "./MedicinaForm";
import { formatarLabelCampo, FIELD_LABELS } from "../../consolidado/fieldLabels";
import { saveFormDraft, loadFormDraft, clearFormDraft } from "../../services/patientStorage";

describe("MedicinaForm — Critérios de Aceite e Ajustes da Especialidade", () => {
  describe("1. Exame Físico — ECOG / Performance, Peso e Altura", () => {
    it("possui opções da escala ECOG padronizadas de 0 a 4", () => {
      expect(MEDICINA_ECOG_OPCOES).toEqual(["0", "1", "2", "3", "4"]);
    });

    it("possui rótulo amigável mapeado para ECOG / Performance", () => {
      expect(FIELD_LABELS["ECOG / Performance"]).toBe("ECOG / Performance");
      expect(formatarLabelCampo("ECOG / Performance")).toBe("ECOG / Performance");
    });

    it("utiliza chaves padronizadas de peso e altura compartilhadas", () => {
      expect(FIELD_LABELS["peso"]).toBe("Peso aferido (kg)");
      expect(FIELD_LABELS["altura"]).toBe("Altura (m)");
    });
  });

  describe("2. Antecedentes e Histórico Gestacional", () => {
    it("possui rótulos mapeados para todos os campos do Histórico Gestacional", () => {
      expect(FIELD_LABELS["Gestação"]).toBe("Gestação (G)");
      expect(FIELD_LABELS["Parto"]).toBe("Parto (P)");
      expect(FIELD_LABELS["Aborto"]).toBe("Aborto (A)");
      expect(FIELD_LABELS["DUM"]).toBe("DUM (Data da última menstruação)");
      expect(FIELD_LABELS["Menopausa"]).toBe("Menopausa");
    });

    it("valida opções de Menopausa (Não / Sim)", () => {
      expect(MEDICINA_MENOPAUSA_OPCOES).toEqual(["Não", "Sim"]);
    });
  });

  describe("3. Hábitos e Atividade Física", () => {
    it("possui rótulo amigável para Atividade Física", () => {
      expect(FIELD_LABELS["Atividade física"]).toBe("Atividade física");
    });

    it("valida opções de Atividade Física seguindo o padrão de hábitos (Não / Sim)", () => {
      expect(MEDICINA_ATIVIDADE_FISICA_OPCOES).toEqual(["Não", "Sim"]);
    });
  });

  describe("4. Diagnóstico, Estadiamento e Conduta", () => {
    it("valida opções de Estadiamento", () => {
      expect(MEDICINA_ESTADIAMENTO_OPCOES).toEqual(["I", "II", "III", "IV", "Não se aplica"]);
    });

    it("valida opções de Investimento", () => {
      expect(MEDICINA_INVESTIMENTO_OPCOES).toEqual(["Pleno", "Proporcional", "Medidas de conforto"]);
    });
  });

  describe("5. Persistência de Dados e Rascunhos", () => {
    const patientId = "PAC-MED-001";
    const specId = "medicina";

    beforeEach(() => {
      const store: Record<string, string> = {};
      // @ts-expect-error Mocking global window.localStorage in node test environment
      globalThis.window = {
        localStorage: {
          getItem: (key: string) => store[key] ?? null,
          setItem: (key: string, value: string) => {
            store[key] = String(value);
          },
          removeItem: (key: string) => {
            delete store[key];
          },
          clear: () => {
            for (const k of Object.keys(store)) delete store[k];
          },
        },
      };
      clearFormDraft(patientId, specId);
    });

    it("salva, recupera e persiste os dados clínicos de Medicina, incluindo Gestacional, ECOG e Hábitos", () => {
      const answers: Record<string, string> = {
        "Diagnóstico": "Carcinoma de Mama",
        "Estadiamento": "IIA",
        "Tipo histológico": "Carcinoma ductal invasivo",
        "História oncológica": "Nódulo diagnosticado há 4 meses.",
        "Tratamento em curso": "Planejada quimioterapia neoadjuvante",
        "Situação atual": "Bom estado geral.",
        "ECOG / Performance": "1",
        "peso": "68",
        "altura": "1.63",
        "Gestação": "3",
        "Parto": "2",
        "Aborto": "1",
        "DUM": "2021-08-15",
        "Menopausa": "Sim",
        "Atividade física": "Sim",
        "ACV": "RCR 2T sem sopros",
        "AR": "MV limpo",
        "ABD": "Indolor",
        "MMII": "Sem edema",
        "Resultado anatomopatológico": "Grau 2, RE+, RP+",
        "Exames complementares": "Mamografia e biópsia anexadas",
        "Impressão diagnóstica": "Estágio IIA",
        "Conduta": "Iniciar quimioterapia",
        "Investimento": "Pleno",
        "Observações": "Acompanhamento regular.",
      };

      saveFormDraft(patientId, specId, answers);
      const loaded = loadFormDraft(patientId, specId);

      expect(loaded).toEqual(answers);
      expect(loaded?.["ECOG / Performance"]).toBe("1");
      expect(loaded?.["peso"]).toBe("68");
      expect(loaded?.["altura"]).toBe("1.63");
      expect(loaded?.["Gestação"]).toBe("3");
      expect(loaded?.["Parto"]).toBe("2");
      expect(loaded?.["Aborto"]).toBe("1");
      expect(loaded?.["DUM"]).toBe("2021-08-15");
      expect(loaded?.["Menopausa"]).toBe("Sim");
      expect(loaded?.["Atividade física"]).toBe("Sim");
    });
  });
});
