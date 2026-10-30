/**
 * Sanitiza um texto para uso seguro como parte de um nome de arquivo,
 * removendo acentos, caracteres proibidos em sistemas de arquivos
 * (\ / : * ? " < > |) e substituindo espaços por sublinhados (_).
 */
export function sanitizarParaNomeArquivo(texto: string): string {
  if (!texto) return "";
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos e cedilhas
    .replace(/[/\\:*?"<>|]/g, "") // remove caracteres proibidos em sistemas operacionais
    .replace(/[^\w\s-]/g, "") // remove símbolos especiais adicionais
    .trim()
    .replace(/\s+/g, "_"); // substitui espaços por _
}

export type FormatoExportacao = "pdf" | "docx";
export type TipoConteudoExportacao = "completo" | "especialidade";

export interface OpcoesNomeArquivo {
  pacienteNome: string;
  prontuario: string;
  tipo: TipoConteudoExportacao;
  especialidadeNome?: string;
  formato: FormatoExportacao;
}

/**
 * Gera o nome automático do arquivo para exportação conforme os requisitos:
 * - Documento completo: [Nome_Paciente]_Prontuario_[Prontuario]_Completo.[ext]
 * - Por especialidade: [Nome_Paciente]_Prontuario_[Prontuario]_[Especialidade].[ext]
 *
 * Exemplos:
 * - Maria_Silva_Prontuario_123456_Completo.docx
 * - Joao_Souza_Prontuario_98765_Psicologia.docx
 * - Joao_Souza_Prontuario_98765_Completo.pdf
 */
export function gerarNomeArquivoExportacao({
  pacienteNome,
  prontuario,
  tipo,
  especialidadeNome,
  formato,
}: OpcoesNomeArquivo): string {
  const nomeLimpo = sanitizarParaNomeArquivo(pacienteNome) || "Paciente";
  const prontuarioLimpo = sanitizarParaNomeArquivo(prontuario) || "SemProntuario";
  const sufixo =
    tipo === "especialidade" && especialidadeNome
      ? sanitizarParaNomeArquivo(especialidadeNome)
      : "Completo";
  const ext = formato.toLowerCase().replace(".", "");
  return `${nomeLimpo}_Prontuario_${prontuarioLimpo}_${sufixo}.${ext}`;
}
