import { describe, it, expect } from "vitest";
import { exportarDocumentoDocx } from "./exportDocumentoDocx";

describe("exportarDocumentoDocx", () => {
  const patientMock = {
    id: "HUB-12345",
    name: "Maria Silva",
    age: 58,
    diagnosis: "Neoplasia Maligna de Mama",
    cid: "C50.9",
    date: "22/10/2026",
    arrivalTime: "08:30",
  };

  it("gera documento completo com sucesso", async () => {
    const resultado = await exportarDocumentoDocx({
      patient: patientMock,
      geradoEm: "22/10/2026 às 10:00",
      versao: 1,
      exportadoPor: "Enfermeiro Acolhedor",
      dadosCompartilhados: [{ campo: "peso", label: "Peso", valor: "68 kg", origem: "Enfermagem" }],
      divergencias: [],
      especialidades: [
        {
          nome: "Enfermagem",
          status: "Preenchido",
          profissional: "Enf. Ana",
          horario: "22/10/2026 às 09:00",
          detalhes: [{ campo: "Locomoção", label: "Locomoção", valor: "Sem auxílio" }],
        },
      ],
      tipo: "completo",
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.nomeArquivo).toBe("Maria_Silva_Prontuario_HUB-12345_Completo.docx");
    }
  });

  it("gera documento individual por especialidade com sucesso", async () => {
    const resultado = await exportarDocumentoDocx({
      patient: patientMock,
      geradoEm: "22/10/2026 às 10:00",
      versao: 1,
      exportadoPor: "Psicólogo Clínico",
      dadosCompartilhados: [],
      divergencias: [],
      especialidades: [
        {
          nome: "Psicologia",
          status: "Preenchido",
          profissional: "Psi. Marcos",
          horario: "22/10/2026 às 09:30",
          detalhes: [{ campo: "Humor", label: "Humor", valor: "Eutímico" }],
          resumoPsicologia: {
            irpoTotal: 12,
            irpoRisk: { level: "Baixo Risco", indication: "Acompanhamento de rotina", color: "green" },
            respondidas: 27,
          },
        },
      ],
      tipo: "especialidade",
      especialidadeNome: "Psicologia",
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.nomeArquivo).toBe("Maria_Silva_Prontuario_HUB-12345_Psicologia.docx");
    }
  });

  it("aceita nome de arquivo pré-definido", async () => {
    const resultado = await exportarDocumentoDocx({
      patient: patientMock,
      geradoEm: "22/10/2026 às 10:00",
      versao: 1,
      exportadoPor: "Nutricionista",
      dadosCompartilhados: [],
      divergencias: [],
      especialidades: [
        {
          nome: "Nutrição",
          status: "Preenchido",
          detalhes: [],
          resumoNutricao: {
            imc: "24.5",
            imcFormula: "peso / altura²",
            asgTotal: 3,
            asgTriage: { text: "Sem risco nutricional grave", color: "green" },
            asgPreenchido: true,
          },
        },
      ],
      tipo: "especialidade",
      especialidadeNome: "Nutrição",
      nomeArquivo: "Arquivo_Customizado.docx",
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.nomeArquivo).toBe("Arquivo_Customizado.docx");
    }
  });
});
