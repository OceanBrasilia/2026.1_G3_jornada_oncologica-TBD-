import { describe, it, expect } from "vitest";
import {
  ESCOLARIDADE_OPCOES,
  LOCAL_DIAGNOSTICO_OPCOES,
  ACOMPANHAMENTO_OPCOES,
  PARENTESCO_OPCOES,
  NIVEL_SUPORTE_OPCOES,
  COMO_VEM_HUB_OPCOES,
  RENDA_OPCOES,
  PROGRAMAS_BENEFICIOS_OPCOES,
  ORIENTACOES_OPCOES,
  PROFISSIONAIS_OPCOES,
  formatarCuidadores,
  normalizarRespostasServicoSocial,
  CuidadorItem,
} from "./ServicoSocialForm";

describe("ServicoSocialForm — Critérios de Aceite de Assistência Social", () => {
  describe("1. Escolaridade", () => {
    it("possui opções completas e organizadas em sequência lógica", () => {
      expect(ESCOLARIDADE_OPCOES).toContain("Analfabeto");
      expect(ESCOLARIDADE_OPCOES).toContain("Analfabeto, mas assina o próprio nome");
      expect(ESCOLARIDADE_OPCOES).toContain("Sem escolaridade");
      expect(ESCOLARIDADE_OPCOES).toContain("Ensino Fundamental incompleto");
      expect(ESCOLARIDADE_OPCOES).toContain("Ensino Fundamental");
      expect(ESCOLARIDADE_OPCOES).toContain("Ensino Médio incompleto");
      expect(ESCOLARIDADE_OPCOES).toContain("Ensino Médio");
      expect(ESCOLARIDADE_OPCOES).toContain("Ensino Superior incompleto");
      expect(ESCOLARIDADE_OPCOES).toContain("Ensino Superior");
      expect(ESCOLARIDADE_OPCOES).toContain("Pós-graduação");
      expect(ESCOLARIDADE_OPCOES).toContain("Outro");

      // Ordem lógica de progressão
      const idxAnalfabeto = ESCOLARIDADE_OPCOES.indexOf("Analfabeto");
      const idxAssina = ESCOLARIDADE_OPCOES.indexOf("Analfabeto, mas assina o próprio nome");
      const idxFundInc = ESCOLARIDADE_OPCOES.indexOf("Ensino Fundamental incompleto");
      const idxFund = ESCOLARIDADE_OPCOES.indexOf("Ensino Fundamental");
      const idxMedInc = ESCOLARIDADE_OPCOES.indexOf("Ensino Médio incompleto");
      const idxMed = ESCOLARIDADE_OPCOES.indexOf("Ensino Médio");
      const idxSupInc = ESCOLARIDADE_OPCOES.indexOf("Ensino Superior incompleto");
      const idxSup = ESCOLARIDADE_OPCOES.indexOf("Ensino Superior");
      const idxPos = ESCOLARIDADE_OPCOES.indexOf("Pós-graduação");

      expect(idxAnalfabeto).toBeLessThan(idxAssina);
      expect(idxAssina).toBeLessThan(idxFundInc);
      expect(idxFundInc).toBeLessThan(idxFund);
      expect(idxFund).toBeLessThan(idxMedInc);
      expect(idxMedInc).toBeLessThan(idxMed);
      expect(idxMed).toBeLessThan(idxSupInc);
      expect(idxSupInc).toBeLessThan(idxSup);
      expect(idxSup).toBeLessThan(idxPos);
    });

    it("contempla opção específica de alfabetização para quem assina o próprio nome", () => {
      expect(ESCOLARIDADE_OPCOES).toContain("Analfabeto, mas assina o próprio nome");
    });
  });

  describe("2. Diagnóstico / origem", () => {
    it("inclui SES-DF entre as opções de local do diagnóstico", () => {
      expect(LOCAL_DIAGNOSTICO_OPCOES).toContain("SES-DF");
      expect(LOCAL_DIAGNOSTICO_OPCOES).toContain("HUB");
      expect(LOCAL_DIAGNOSTICO_OPCOES).toContain("Outro Hospital Público");
      expect(LOCAL_DIAGNOSTICO_OPCOES).toContain("Hospital Particular");
      expect(LOCAL_DIAGNOSTICO_OPCOES).toContain("Outro");
    });
  });

  describe("3. Acompanhamento", () => {
    it("possui opções estruturadas para registrar a condição de acompanhamento", () => {
      expect(ACOMPANHAMENTO_OPCOES).toContain("Acompanhado(a)");
      expect(ACOMPANHAMENTO_OPCOES).toContain("Desacompanhado(a)");
      expect(ACOMPANHAMENTO_OPCOES).toContain("Acompanhado(a) esporadicamente");
      expect(ACOMPANHAMENTO_OPCOES).toContain("Outro");
    });
  });

  describe("4. Nomenclatura Cônjuge ou companheiro(a)", () => {
    it("utiliza 'Cônjuge ou companheiro(a)' e não apenas 'Cônjuge'", () => {
      expect(PARENTESCO_OPCOES).toContain("Cônjuge ou companheiro(a)");
      expect(PARENTESCO_OPCOES).not.toContain("Cônjuge");
    });
  });

  describe("5 e 14. Nível de suporte familiar", () => {
    it("possui exatamente as 6 opções padronizadas pela equipe", () => {
      expect(NIVEL_SUPORTE_OPCOES).toEqual([
        "Excelente — vários cuidadores",
        "Satisfatório — 2 cuidadores",
        "Restrito — apenas 1 cuidador",
        "Precário — sem cuidador direto, mas há um pequeno suporte",
        "Não possui — sem cuidadores e sem suporte",
        "Outro",
      ]);
    });
  });

  describe("6 e 7. Cuidadores e contatos múltiplos", () => {
    it("formata múltiplos cuidadores no padrão 'Nome — Grau de parentesco — Telefone'", () => {
      const cuidadores: CuidadorItem[] = [
        {
          id: "1",
          nome: "Maria da Silva",
          parentesco: "Filha",
          telefone: "(61) 99999-9999",
        },
        {
          id: "2",
          nome: "João da Silva",
          parentesco: "Cônjuge ou companheiro(a)",
          telefone: "(61) 98888-8888",
        },
      ];

      const formatado = formatarCuidadores(cuidadores);
      expect(formatado).toBe(
        "Maria da Silva — Filha — (61) 99999-9999\nJoão da Silva — Cônjuge ou companheiro(a) — (61) 98888-8888"
      );
    });

    it("formata especificação de parentesco quando 'Outro' for selecionado", () => {
      const cuidadores: CuidadorItem[] = [
        {
          id: "1",
          nome: "Carlos Santos",
          parentesco: "Outro",
          parentescoOutro: "Vizinho solidário",
          telefone: "(61) 97777-7777",
        },
      ];

      const formatado = formatarCuidadores(cuidadores);
      expect(formatado).toBe("Carlos Santos — Outro (Vizinho solidário) — (61) 97777-7777");
    });

    it("ignora itens completamente vazios na formatação", () => {
      const cuidadores: CuidadorItem[] = [
        { id: "1", nome: "", parentesco: "", telefone: "" },
        { id: "2", nome: "Ana Paula", parentesco: "Irmã(ã)", telefone: "(61) 96666-6666" },
      ];

      const formatado = formatarCuidadores(cuidadores);
      expect(formatado).toBe("Ana Paula — Irmã(ã) — (61) 96666-6666");
    });
  });

  describe("8. Deslocamento para o HUB", () => {
    it("inclui a opção 'Uber' mantendo as demais", () => {
      expect(COMO_VEM_HUB_OPCOES).toContain("Uber");
      expect(COMO_VEM_HUB_OPCOES).toContain("Transporte Público");
      expect(COMO_VEM_HUB_OPCOES).toContain("Transporte Particular");
      expect(COMO_VEM_HUB_OPCOES).toContain("TFD");
      expect(COMO_VEM_HUB_OPCOES).toContain("Outro");
    });
  });

  describe("9 e 10. Rendas individual e familiar", () => {
    it("utiliza 'Até 1 Salário Mínimo' e faixas padronizadas", () => {
      expect(RENDA_OPCOES).toContain("Até 1 Salário Mínimo");
      expect(RENDA_OPCOES).not.toContain("1 Salário Mínimo");
      expect(RENDA_OPCOES).toContain("Sem renda");
      expect(RENDA_OPCOES).toContain("1,2 a 3 Salários Mínimos");
      expect(RENDA_OPCOES).toContain("Acima de 3 Salários Mínimos");
      expect(RENDA_OPCOES).toContain("Não quis responder");
      expect(RENDA_OPCOES).toContain("Outro");
    });
  });

  describe("12. Benefícios, recursos e programas sociais", () => {
    it("utiliza exatamente a nomenclatura 'PTNED'", () => {
      expect(PROGRAMAS_BENEFICIOS_OPCOES).toContain("PTNED");
      expect(ORIENTACOES_OPCOES).toContain("PTNED");
    });

    it("substitui 'Farmácia de Alto Custo' por 'Farmácia Especializada'", () => {
      expect(PROGRAMAS_BENEFICIOS_OPCOES).toContain("Farmácia Especializada");
      expect(ORIENTACOES_OPCOES).toContain("Farmácia Especializada");
      expect(PROGRAMAS_BENEFICIOS_OPCOES).not.toContain("Farmácia de Alto Custo");
      expect(ORIENTACOES_OPCOES).not.toContain("Farmácia de Alto Custo");
    });

    it("mantém TFD sem duplicidade", () => {
      expect(PROGRAMAS_BENEFICIOS_OPCOES).toContain("TFD");
      expect(ORIENTACOES_OPCOES).toContain("TFD");
    });

    it("migra registros pré-existentes de nomenclaturas legadas ao carregar", () => {
      const legados = {
        orientacoesEncaminhamentos: [
          "Farmácia de Alto Custo",
          "Programa de Transporte a Pessoas com Necessidades Especiais do DF - PTNED",
          "Tratamento Fora de Domicílio (TFD)",
        ],
        programasBeneficios: [
          "Farmácia de Alto Custo",
          "Tratamento Fora de Domicílio (TFD)",
        ],
      };

      const normalizado = normalizarRespostasServicoSocial(legados);
      expect(normalizado.orientacoesEncaminhamentos).toContain("Farmácia Especializada");
      expect(normalizado.orientacoesEncaminhamentos).toContain("PTNED");
      expect(normalizado.orientacoesEncaminhamentos).toContain("TFD");
      expect(normalizado.orientacoesEncaminhamentos).not.toContain("Farmácia de Alto Custo");

      expect(normalizado.programasBeneficios).toContain("Farmácia Especializada");
      expect(normalizado.programasBeneficios).toContain("TFD");
    });
  });

  describe("13. Profissionais que realizaram o atendimento", () => {
    it("contém a equipe completa com Liana, Rafaela, Anna, Luana, Est. Douglas e Giorgia", () => {
      expect(PROFISSIONAIS_OPCOES).toContain("Liana");
      expect(PROFISSIONAIS_OPCOES).toContain("Rafaela");
      expect(PROFISSIONAIS_OPCOES).toContain("Anna");
      expect(PROFISSIONAIS_OPCOES).toContain("Luana");
      expect(PROFISSIONAIS_OPCOES).toContain("Est. Douglas");
      expect(PROFISSIONAIS_OPCOES).toContain("Giorgia");
      expect(PROFISSIONAIS_OPCOES).toContain("Outro");
    });

    it("recupera assistenteSocial legado em formato textual para seleção múltipla", () => {
      const legado = {
        assistenteSocial: "Liana, Rafaela",
      };

      const normalizado = normalizarRespostasServicoSocial(legado);
      expect(normalizado.profissionaisAtendimento).toEqual(["Liana", "Rafaela"]);
    });
  });
});
