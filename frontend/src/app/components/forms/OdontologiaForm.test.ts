import { describe, it, expect, beforeEach } from "vitest";
import {
  ODONTO_RISCO_MUCOSITE_OPCOES,
  ODONTO_DENTES_NATURAIS_OPCOES,
  ODONTO_PROTESE_OPCOES,
  ODONTO_DOR_DENTE_OPCOES,
  ODONTO_TABAGISTA_OPCOES,
  ODONTO_ETILISTA_OPCOES,
  ODONTO_VIA_ALIMENTACAO_OPCOES,
  ODONTO_TRAQUEOSTOMIA_OPCOES,
  ODONTO_XEROSTOMIA_OPCOES,
  ODONTO_ANTIRREABSORTIVOS_OPCOES,
  ODONTO_CARIES_OPCOES,
  ODONTO_MOBILIDADE_OPCOES,
  ODONTO_RISCO_ODONTOLOGICO_OPCOES,
  ODONTO_ENCAMINHAR_2857_OPCOES,
} from "./OdontologiaForm";
import { evaluateCondition } from "./shared/conditionalEngine";
import { formatarLabelCampo, FIELD_LABELS } from "../../consolidado/fieldLabels";
import { saveFormDraft, loadFormDraft, clearFormDraft } from "../../services/patientStorage";

describe("OdontologiaForm — Critérios de Aceite e Instrumento de Acolhimento", () => {
  describe("1. Identificação e Dados Iniciais", () => {
    it("valida que os dados compartilhados do paciente estão mapeados nos rótulos", () => {
      expect(formatarLabelCampo("Data do atendimento")).toBe("Data do atendimento");
      expect(formatarLabelCampo("Diagnóstico Oncológico e Localização do Tumor (CID)")).toBe(
        "Diagnóstico Oncológico e Localização do Tumor (CID)"
      );
    });
  });

  describe("2. Contexto Oncológico", () => {
    it("possui campo Diagnóstico Oncológico e Localização do Tumor (CID) mapeado", () => {
      expect(FIELD_LABELS["Diagnóstico Oncológico e Localização do Tumor (CID)"]).toBeDefined();
    });

    it("possui exatamente as 6 opções especificadas para Risco de Mucosite", () => {
      expect(ODONTO_RISCO_MUCOSITE_OPCOES).toEqual([
        "Baixo",
        "Moderado",
        "Alto",
        "Depende do quimioterápico, paciente ainda não sabe o protocolo",
        "Ainda não sabe se vai fazer quimioterapia",
        "Outro",
      ]);
    });

    it("dispara condicional quando Risco de Mucosite for 'Outro'", () => {
      const dataOutro = { "Risco de Mucosite": "Outro" };
      const dataBaixo = { "Risco de Mucosite": "Baixo" };

      expect(evaluateCondition(dataOutro, { campo: "Risco de Mucosite", igual: "Outro" })).toBe(true);
      expect(evaluateCondition(dataBaixo, { campo: "Risco de Mucosite", igual: "Outro" })).toBe(false);
    });
  });

  describe("3. Condição Odontológica e Fatores Associados", () => {
    it("valida opções de Dentes Naturais (Sim / Não)", () => {
      expect(ODONTO_DENTES_NATURAIS_OPCOES).toEqual(["Sim", "Não"]);
    });

    it("valida opções de Próteses (Sim / Não / Outro)", () => {
      expect(ODONTO_PROTESE_OPCOES).toEqual(["Sim", "Não", "Outro"]);
      expect(evaluateCondition({ "Usa próteses?": "Outro" }, { campo: "Usa próteses?", igual: "Outro" })).toBe(true);
      expect(evaluateCondition({ "Usa próteses?": "Sim" }, { campo: "Usa próteses?", igual: "Outro" })).toBe(false);
    });

    it("valida opções de Dor de Dente (Sim / Não / Outro)", () => {
      expect(ODONTO_DOR_DENTE_OPCOES).toEqual(["Sim", "Não", "Outro"]);
      expect(evaluateCondition({ "Tem dor de dente?": "Outro" }, { campo: "Tem dor de dente?", igual: "Outro" })).toBe(true);
      expect(evaluateCondition({ "Tem dor de dente?": "Não" }, { campo: "Tem dor de dente?", igual: "Outro" })).toBe(false);
    });

    it("valida opções de Tabagismo (Sim / Não / Ex-tabagista / Outro)", () => {
      expect(ODONTO_TABAGISTA_OPCOES).toEqual(["Sim", "Não", "Ex-tabagista", "Outro"]);
      expect(evaluateCondition({ Tabagista: "Outro" }, { campo: "Tabagista", igual: "Outro" })).toBe(true);
    });

    it("valida opções de Etilismo (Sim / Não / Ex-etilista / Socialmente / Outro)", () => {
      expect(ODONTO_ETILISTA_OPCOES).toEqual(["Sim", "Não", "Ex-etilista", "Socialmente", "Outro"]);
      expect(ODONTO_ETILISTA_OPCOES).toContain("Socialmente");
      expect(evaluateCondition({ Etilista: "Outro" }, { campo: "Etilista", igual: "Outro" })).toBe(true);
    });

    it("valida opções de Via de Alimentação (Via oral / Via sonda / Ambos)", () => {
      expect(ODONTO_VIA_ALIMENTACAO_OPCOES).toEqual(["Via oral", "Via sonda", "Ambos"]);
    });

    it("valida opções de Traqueostomia (Sim / Não)", () => {
      expect(ODONTO_TRAQUEOSTOMIA_OPCOES).toEqual(["Sim", "Não"]);
    });

    it("valida opções de Xerostomia (Sim / Não)", () => {
      expect(ODONTO_XEROSTOMIA_OPCOES).toEqual(["Sim", "Não"]);
    });

    it("valida opções de Medicamentos antirreabsortivos e condicionais de especificação", () => {
      expect(ODONTO_ANTIRREABSORTIVOS_OPCOES).toEqual(["Sim", "Não", "Sem previsão", "Outro"]);

      // Se Sim -> abre campo para qual medicamento
      const dataSim = { "Medicamentos antirreabsortivos": "Sim" };
      expect(evaluateCondition(dataSim, { campo: "Medicamentos antirreabsortivos", igual: "Sim" })).toBe(true);

      // Se Outro -> abre campo para especificação
      const dataOutro = { "Medicamentos antirreabsortivos": "Outro" };
      expect(evaluateCondition(dataOutro, { campo: "Medicamentos antirreabsortivos", igual: "Outro" })).toBe(true);

      // Se Não -> nenhum condicional ativo
      const dataNao = { "Medicamentos antirreabsortivos": "Não" };
      expect(evaluateCondition(dataNao, { campo: "Medicamentos antirreabsortivos", igual: "Sim" })).toBe(false);
      expect(evaluateCondition(dataNao, { campo: "Medicamentos antirreabsortivos", igual: "Outro" })).toBe(false);
    });

    it("possui rótulo amigável para Acesso Odontológico na UBS", () => {
      expect(FIELD_LABELS["Acesso odontológico UBS"]).toBe("Acesso odontológico na UBS");
    });

    it("valida opções de Cáries cavitadas e condicionais", () => {
      expect(ODONTO_CARIES_OPCOES).toEqual(["Sim", "Não", "Não foi possível avaliar", "Outro"]);

      // Se Sim -> abre quais dentes
      expect(evaluateCondition({ "Cáries cavitadas": "Sim" }, { campo: "Cáries cavitadas", igual: "Sim" })).toBe(true);
      expect(evaluateCondition({ "Cáries cavitadas": "Não" }, { campo: "Cáries cavitadas", igual: "Sim" })).toBe(false);
      expect(evaluateCondition({ "Cáries cavitadas": "Não foi possível avaliar" }, { campo: "Cáries cavitadas", igual: "Sim" })).toBe(false);

      // Se Outro -> abre especificação
      expect(evaluateCondition({ "Cáries cavitadas": "Outro" }, { campo: "Cáries cavitadas", igual: "Outro" })).toBe(true);
    });

    it("valida opções de Mobilidade dentária e condicionais", () => {
      expect(ODONTO_MOBILIDADE_OPCOES).toEqual(["Sim", "Não", "Não foi possível avaliar", "Outro"]);

      // Se Sim -> abre quais dentes
      expect(evaluateCondition({ "Mobilidade dentária": "Sim" }, { campo: "Mobilidade dentária", igual: "Sim" })).toBe(true);
      expect(evaluateCondition({ "Mobilidade dentária": "Não" }, { campo: "Mobilidade dentária", igual: "Sim" })).toBe(false);
      expect(evaluateCondition({ "Mobilidade dentária": "Não foi possível avaliar" }, { campo: "Mobilidade dentária", igual: "Sim" })).toBe(false);

      // Se Outro -> abre especificação
      expect(evaluateCondition({ "Mobilidade dentária": "Outro" }, { campo: "Mobilidade dentária", igual: "Outro" })).toBe(true);
    });
  });

  describe("4. Avaliação e Encaminhamento", () => {
    it("possui exatamente as 3 classificações de risco odontológico com descrições fiéis", () => {
      expect(ODONTO_RISCO_ODONTOLOGICO_OPCOES.length).toBe(3);

      const baixo = ODONTO_RISCO_ODONTOLOGICO_OPCOES.find((r) => r.valor === "BAIXO");
      expect(baixo).toBeDefined();
      expect(baixo?.descricao).toBe("Sem focos infecciosos aparentes.");

      const moderado = ODONTO_RISCO_ODONTOLOGICO_OPCOES.find((r) => r.valor === "MODERADO");
      expect(moderado).toBeDefined();
      expect(moderado?.descricao).toBe(
        "Necessita de tratamento odontológico eletivo antes ou durante o tratamento oncológico."
      );

      const alto = ODONTO_RISCO_ODONTOLOGICO_OPCOES.find((r) => r.valor === "ALTO");
      expect(alto).toBeDefined();
      expect(alto?.descricao).toBe(
        "Presença de foco infeccioso, dor, abscesso, raiz residual, lesão suspeita ou necessidade de atendimento prioritário."
      );
    });

    it("possui seleção única com opções exatas para Encaminhar para 2857?", () => {
      expect(ODONTO_ENCAMINHAR_2857_OPCOES).toEqual(["SIM", "NÃO"]);
      expect(FIELD_LABELS["Encaminhar para 2857?"]).toBe("Encaminhar para 2857?");
    });
  });

  describe("5. Persistência de Dados e Rascunhos", () => {
    const patientId = "PAC-ODONTO-TEST";
    const specId = "odontologia";

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

    it("salva, recupera e persiste respostas completas da avaliação odontológica", () => {
      const answers = {
        "Diagnóstico Oncológico e Localização do Tumor (CID)": "Carcinoma espinocelular de língua (C02.9)",
        "Risco de Mucosite": "Alto",
        "Tem dentes naturais?": "Sim",
        "Usa próteses?": "Sim",
        "Tem dor de dente?": "Sim",
        "Tem dor de dente? (outro)": "Região do molar inferior direito",
        Tabagista: "Ex-tabagista",
        Etilista: "Socialmente",
        "Qual a via de alimentação?": "Via oral",
        "Tem traqueostomia?": "Não",
        Xerostomia: "Sim",
        "Medicamentos antirreabsortivos": "Sim",
        "Medicamento antirreabsortivo (qual)": "Ácido zoledrônico 4mg",
        "Acesso odontológico UBS": "UBS 1 Asa Norte, com acolhimento odontológico às quartas",
        "Cáries cavitadas": "Sim",
        "Dentes com cáries cavitadas": "46 e 47 com cavitação oclusal",
        "Mobilidade dentária": "Não",
        "Classificação do Risco Odontológico": "ALTO",
        "Encaminhar para 2857?": "SIM",
        Observações: "Adequação de meio bucal prioritária antes da radioterapia.",
      };

      saveFormDraft(patientId, specId, answers);
      const loaded = loadFormDraft(patientId, specId);

      expect(loaded).toEqual(answers);
      expect(loaded?.["Classificação do Risco Odontológico"]).toBe("ALTO");
      expect(loaded?.["Encaminhar para 2857?"]).toBe("SIM");
      expect(loaded?.["Medicamento antirreabsortivo (qual)"]).toBe("Ácido zoledrônico 4mg");
      expect(loaded?.["Dentes com cáries cavitadas"]).toBe("46 e 47 com cavitação oclusal");
    });
  });
});
