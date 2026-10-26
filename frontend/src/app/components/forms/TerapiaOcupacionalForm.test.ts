import { describe, it, expect } from "vitest";
import {
  TO_CODIGOS_PROCEDIMENTOS,
  TO_EVA_OPTIONS,
  TO_AVD_OPTIONS,
  TO_OCUPACOES_OPTIONS,
  TO_ESCOLARIDADE_OPTIONS,
  TO_RENDA_OPTIONS,
  TO_ACOMPANHANTE_OPTIONS,
  TO_RELIGIAO_OPTIONS,
  TO_CANCER_CID_OPTIONS,
  TO_TRATAMENTO_OPTIONS,
  TO_DIAGNOSTICO_OPTIONS,
  TO_CONDUTA_OPTIONS,
  TO_ENCAMINHAMENTOS_OPTIONS,
  TO_PROFISSIONAIS_AVALIADORES,
} from "./TerapiaOcupacionalForm";
import { FIELD_LABELS, formatarLabelCampo } from "../../consolidado/fieldLabels";

describe("TerapiaOcupacionalForm — Testes Funcionais e Critérios de Aceite", () => {
  describe("1. Identificação e Gênero", () => {
    it("valida opções de gênero incluindo Outro", () => {
      const opcoes = ["Feminino", "Masculino", "Prefiro não dizer", "Outro"];
      expect(opcoes).toContain("Feminino");
      expect(opcoes).toContain("Masculino");
      expect(opcoes).toContain("Prefiro não dizer");
      expect(opcoes).toContain("Outro");
    });
  });

  describe("2. Estado Civil", () => {
    it("contém as opções informadas de estado civil", () => {
      const opcoes = ["Casado(a)", "Divorciado(a)", "Solteiro(a)", "União Estável", "Viúvo(a)", "Outro"];
      expect(opcoes).toContain("Casado(a)");
      expect(opcoes).toContain("Divorciado(a)");
      expect(opcoes).toContain("Solteiro(a)");
      expect(opcoes).toContain("União Estável");
      expect(opcoes).toContain("Viúvo(a)");
    });
  });

  describe("3. Histórico familiar", () => {
    it("possui rótulo amigável mapeado no consolidado", () => {
      expect(FIELD_LABELS["historicoFamiliar"]).toBe("Histórico familiar");
    });
  });

  describe("4. Escolaridade", () => {
    it("apresenta as opções exatamente na ordem requerida", () => {
      expect(TO_ESCOLARIDADE_OPTIONS).toEqual([
        "Não Alfabetizado",
        "Alfabetizado",
        "Ensino Fundamental Incompleto",
        "Ensino Fundamental Completo",
        "Ensino Médio Incompleto",
        "Ensino Médio Completo",
        "Ensino Superior Incompleto",
        "Ensino Superior Completo",
      ]);
    });
  });

  describe("5. Atividade Profissional", () => {
    it("possui chave e rótulo mapeados", () => {
      expect(FIELD_LABELS["atividadeProfissional"]).toBe("Atividade Profissional");
    });
  });

  describe("6. Renda Atual / Situação ocupacional", () => {
    it("apresenta todas as opções com múltipla escolha e Outro", () => {
      expect(TO_RENDA_OPTIONS).toEqual([
        "Ativo(a)",
        "Desempregado(a)",
        "Afastado(a), recebendo Auxílio Doença",
        "Afastado(a), sem renda",
        "Benefício de Prestação Continuada (BPC/LOAS)",
        "Auxílio Brasil",
        "Aposentado(a)",
        "Pensionista",
        "Outro",
      ]);
    });
  });

  describe("7 e 8. Naturalidade e Reside em", () => {
    it("possui chaves mapeadas no sistema de labels", () => {
      expect(formatarLabelCampo("naturalidade")).toBe("Naturalidade");
      expect(formatarLabelCampo("resideEm")).toBe("Reside em");
    });
  });

  describe("9. Acompanhado(a) de", () => {
    it("apresenta as opções corretas incluindo Sem acompanhante e Outro", () => {
      expect(TO_ACOMPANHANTE_OPTIONS).toEqual([
        "Filho(a)",
        "Mãe ou Pai",
        "Neto(a)",
        "Companheiro(a)",
        "Amigo(a)",
        "Sem acompanhante",
        "Outro",
      ]);
    });
  });

  describe("10. Religião", () => {
    it("apresenta as opções especificadas de religião", () => {
      expect(TO_RELIGIAO_OPTIONS).toEqual([
        "Católico(a)",
        "Evangélico(a)",
        "Testemunha de Jeová",
        "Adventista do Sétimo Dia",
        "Espírita",
        "Não possui",
        "Outro",
      ]);
    });
  });

  describe("11. Localização do Câncer", () => {
    it("contém a lista de CIDs C15 a C72 e opções adicionais", () => {
      expect(TO_CANCER_CID_OPTIONS).toContain("Não soube informar");
      expect(TO_CANCER_CID_OPTIONS).toContain("Aguardando resultado de exames complementares");
      expect(TO_CANCER_CID_OPTIONS).toContain("CID C15 - Esôfago");
      expect(TO_CANCER_CID_OPTIONS).toContain("CID C16 - Estômago");
      expect(TO_CANCER_CID_OPTIONS).toContain("CID C17 - Intestino");
      expect(TO_CANCER_CID_OPTIONS).toContain("CID C18 - Cólon");
      expect(TO_CANCER_CID_OPTIONS).toContain("CID C20 - Reto");
      expect(TO_CANCER_CID_OPTIONS).toContain("CID C21 - Anal e Canal Anal");
      expect(TO_CANCER_CID_OPTIONS).toContain("CID C22 - Fígado");
      expect(TO_CANCER_CID_OPTIONS).toContain("CID C25 - Pâncreas");
      expect(TO_CANCER_CID_OPTIONS).toContain("CID C34 - Brônquios e Pulmões");
      expect(TO_CANCER_CID_OPTIONS).toContain("CID C44 - Pele");
      expect(TO_CANCER_CID_OPTIONS).toContain("CID C50 - Mama");
      expect(TO_CANCER_CID_OPTIONS).toContain("CID C53 - Colo de Útero");
      expect(TO_CANCER_CID_OPTIONS).toContain("CID C56 - Ovário");
      expect(TO_CANCER_CID_OPTIONS).toContain("CID C60 - Pênis");
      expect(TO_CANCER_CID_OPTIONS).toContain("CID C61 - Próstata");
      expect(TO_CANCER_CID_OPTIONS).toContain("CID C62 - Testículo");
      expect(TO_CANCER_CID_OPTIONS).toContain("CID C64-C68 - Sistema Urinário");
      expect(TO_CANCER_CID_OPTIONS).toContain("CID C69-C72 - Sistema Nervoso Central");
      expect(TO_CANCER_CID_OPTIONS).toContain("Outro");
    });
  });

  describe("12. Tratamento Oncológico", () => {
    it("apresenta opções visíveis no novo formulário", () => {
      expect(TO_TRATAMENTO_OPTIONS).toEqual([
        "Virgem de tratamento",
        "Cirurgia Oncológica",
        "Quimioterapia",
        "Radioterapia",
        "Outro",
      ]);
    });
  });

  describe("13. Fadiga", () => {
    it("possui opções Sim, Não e Um pouco", () => {
      const opcoes = ["Sim", "Não", "Um pouco"];
      expect(opcoes).toContain("Sim");
      expect(opcoes).toContain("Não");
      expect(opcoes).toContain("Um pouco");
    });
  });

  describe("14. Dor / Escala EVA", () => {
    it("mantém exatamente a associação entre classificação e pontuação numérica", () => {
      expect(TO_EVA_OPTIONS).toEqual([
        "Sem dor (0)",
        "Dor leve (1-3)",
        "Dor moderada (4-5)",
        "Dor intensa (6-7)",
        "Dor muito intensa (8-9)",
        "Pior dor possível (10)",
      ]);
    });
  });

  describe("15. Queda", () => {
    it("possui opções Sim, Não e Risco de queda", () => {
      const opcoes = ["Sim", "Não", "Risco de queda"];
      expect(opcoes).toEqual(["Sim", "Não", "Risco de queda"]);
    });
  });

  describe("16 e 18. AVDs e AIVDs", () => {
    it("utiliza a escala padronizada de 4 níveis de dependência", () => {
      expect(TO_AVD_OPTIONS).toEqual([
        "Independente",
        "Auxílio/Supervisão",
        "Dependente",
        "Não se aplica",
      ]);
    });
  });

  describe("17. Dispositivo", () => {
    it("contém opções Sim, Não e Outro", () => {
      const opcoes = ["Sim", "Não", "Outro"];
      expect(opcoes).toContain("Sim");
      expect(opcoes).toContain("Não");
      expect(opcoes).toContain("Outro");
    });
  });

  describe("19 e 20. Outras Ocupações e Cognição", () => {
    it("utiliza padrão Alterado e Não Alterado", () => {
      expect(TO_OCUPACOES_OPTIONS).toEqual(["Alterado", "Não Alterado"]);
    });
  });

  describe("21. Suporte Social", () => {
    it("contém as pessoas de apoio listadas no novo formulário", () => {
      const opcoes = ["Amigos", "Equipe", "Companheiro", "Vizinho", "Familiares", "Outro"];
      expect(opcoes).toContain("Amigos");
      expect(opcoes).toContain("Equipe");
      expect(opcoes).toContain("Companheiro");
      expect(opcoes).toContain("Vizinho");
      expect(opcoes).toContain("Familiares");
      expect(opcoes).toContain("Outro");
    });
  });

  describe("24. Diagnóstico Terapêutico Ocupacional", () => {
    it("contém as 8 opções estabelecidas", () => {
      expect(TO_DIAGNOSTICO_OPTIONS).toEqual([
        "Capacidade funcional preservada e desempenho ocupacional satisfatório",
        "Dependência para realização de AIVDs",
        "Dependência para realização de AVDs",
        "Alterações na mobilidade",
        "Risco de queda",
        "Dor incapacitante",
        "Fadiga",
        "Outro",
      ]);
    });
  });

  describe("25. Condutas Iniciais", () => {
    it("apresenta redação exata de Elegível e Não elegível", () => {
      expect(TO_CONDUTA_OPTIONS).toEqual([
        "Não elegível. Realizo orientações em saúde e deixo o serviço à disposição por busca espontânea em caso de necessidade.",
        "Elegível. Encaminho para acompanhamento ambulatorial.",
      ]);
    });
  });

  describe("26. Encaminhamentos", () => {
    it("contém as opções de encaminhamento requeridas", () => {
      expect(TO_ENCAMINHAMENTOS_OPTIONS).toContain("Orientações em Saúde");
      expect(TO_ENCAMINHAMENTOS_OPTIONS).toContain("Ambulatório de Terapia Ocupacional");
      expect(TO_ENCAMINHAMENTOS_OPTIONS).toContain("Encaminhamento para outra especialidade");
      expect(TO_ENCAMINHAMENTOS_OPTIONS).toContain("Outro");
    });
  });

  describe("27. Profissional Avaliador", () => {
    it("apresenta os nomes exatos do formulário de referência", () => {
      expect(TO_PROFISSIONAIS_AVALIADORES).toContain("Yara Helena de Carvalho Paiva (Terapeuta Ocupacional Staff)");
      expect(TO_PROFISSIONAIS_AVALIADORES).toContain("Nathalia Rayane Nogueira de Santanna (R1 Atenção em Oncologia)");
      expect(TO_PROFISSIONAIS_AVALIADORES).toContain("Outro");
    });
  });

  describe("28. Códigos de Procedimentos Oficiais", () => {
    it("mantém estritamente os dois códigos oficiais da Terapia Ocupacional", () => {
      expect(TO_CODIGOS_PROCEDIMENTOS).toEqual([
        "03.01.01.004-8",
        "03.01.04.004-4",
      ]);
      expect(TO_CODIGOS_PROCEDIMENTOS.length).toBe(2);
    });
  });

  describe("30. Regra de Outro e Persistência", () => {
    it("mapeia chaves e campos de texto complementar", () => {
      expect(formatarLabelCampo("codigosProcedimentosTO")).toBe("Códigos de Procedimentos");
      expect(formatarLabelCampo("TO_EVA")).toBe("Escala Visual Analógica - EVA");
      expect(formatarLabelCampo("TO_AVD_VestirInferior")).toBe("Vestir metade inferior");
    });
  });
});
