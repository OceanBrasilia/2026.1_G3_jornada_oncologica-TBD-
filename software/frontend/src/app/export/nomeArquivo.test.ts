import { describe, it, expect } from "vitest";
import { sanitizarParaNomeArquivo, gerarNomeArquivoExportacao } from "./nomeArquivo";

describe("sanitizarParaNomeArquivo", () => {
  it("remove acentos e caracteres especiais proibidos", () => {
    expect(sanitizarParaNomeArquivo("Maria da Conceição Silva")).toBe("Maria_da_Conceicao_Silva");
    expect(sanitizarParaNomeArquivo("João: O'Connor / Santos?")).toBe("Joao_OConnor_Santos");
    expect(sanitizarParaNomeArquivo("Alergia <Grave> *Crítica*")).toBe("Alergia_Grave_Critica");
  });

  it("substitui múltiplos espaços por um único underscore", () => {
    expect(sanitizarParaNomeArquivo("  Ana    Beatriz   ")).toBe("Ana_Beatriz");
  });

  it("preserva hífens e underscores", () => {
    expect(sanitizarParaNomeArquivo("HUB-12345")).toBe("HUB-12345");
  });

  it("lida com texto vazio ou nulo graciosamente", () => {
    expect(sanitizarParaNomeArquivo("")).toBe("");
  });
});

describe("gerarNomeArquivoExportacao", () => {
  it("gera nome correto para documento completo em DOCX", () => {
    const nome = gerarNomeArquivoExportacao({
      pacienteNome: "Maria Silva",
      prontuario: "123456",
      tipo: "completo",
      formato: "docx",
    });
    expect(nome).toBe("Maria_Silva_Prontuario_123456_Completo.docx");
  });

  it("gera nome correto para documento completo em PDF", () => {
    const nome = gerarNomeArquivoExportacao({
      pacienteNome: "João Souza",
      prontuario: "98765",
      tipo: "completo",
      formato: "pdf",
    });
    expect(nome).toBe("Joao_Souza_Prontuario_98765_Completo.pdf");
  });

  it("gera nome correto para documento por especialidade em DOCX", () => {
    const nome = gerarNomeArquivoExportacao({
      pacienteNome: "João Souza",
      prontuario: "98765",
      tipo: "especialidade",
      especialidadeNome: "Psicologia",
      formato: "docx",
    });
    expect(nome).toBe("Joao_Souza_Prontuario_98765_Psicologia.docx");
  });

  it("gera nome sanitizado para especialidades com acento e espaço em PDF", () => {
    const nome = gerarNomeArquivoExportacao({
      pacienteNome: "Maria da Conceição",
      prontuario: "HUB-456",
      tipo: "especialidade",
      especialidadeNome: "Nutrição",
      formato: "pdf",
    });
    expect(nome).toBe("Maria_da_Conceicao_Prontuario_HUB-456_Nutricao.pdf");

    const nome2 = gerarNomeArquivoExportacao({
      pacienteNome: "Carlos Eduardo",
      prontuario: "78910",
      tipo: "especialidade",
      especialidadeNome: "Serviço Social",
      formato: "docx",
    });
    expect(nome2).toBe("Carlos_Eduardo_Prontuario_78910_Servico_Social.docx");
  });

  it("usa fallbacks se paciente ou prontuário forem vazios", () => {
    const nome = gerarNomeArquivoExportacao({
      pacienteNome: "",
      prontuario: "",
      tipo: "completo",
      formato: "pdf",
    });
    expect(nome).toBe("Paciente_Prontuario_SemProntuario_Completo.pdf");
  });
});
