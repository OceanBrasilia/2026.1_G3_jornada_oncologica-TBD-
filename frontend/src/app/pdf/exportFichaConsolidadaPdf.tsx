import { pdf } from "@react-pdf/renderer";
import { FichaConsolidadaPdf, type FichaConsolidadaPdfProps } from "./FichaConsolidadaPdf";
import { sanitizarParaPdf } from "./textoPdf";
import { gerarNomeArquivoExportacao } from "../export/nomeArquivo";

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * ficha_[identificador]_[AAAAMMDD-HHMM].pdf — mantido para retrocompatibilidade
 * com rotinas de testes anteriores.
 */
export function nomeArquivoFichaPdf(patientId: string, agora: Date = new Date(), versao?: number): string {
  const aaaa = agora.getFullYear();
  const mm = pad2(agora.getMonth() + 1);
  const dd = pad2(agora.getDate());
  const hh = pad2(agora.getHours());
  const min = pad2(agora.getMinutes());
  const v = versao ? `v${versao}_` : "";
  return `ficha_${patientId}_${v}${aaaa}${mm}${dd}-${hh}${min}.pdf`;
}

export type ExportarFichaResultado = { ok: true; nomeArquivo?: string } | { ok: false; erro: string };

/**
 * Gera o PDF da Ficha Consolidada ou Especialidade e dispara o download no navegador.
 * Nunca lança exceção — devolve { ok: false, erro } em caso de falha, para a
 * tela mostrar uma mensagem clara sem perder nada do que já estava na tela.
 */
export async function exportarFichaConsolidadaPdf(props: FichaConsolidadaPdfProps & { exportDate?: Date }): Promise<ExportarFichaResultado> {
  try {
    const nomeFinal =
      props.nomeArquivo ||
      gerarNomeArquivoExportacao({
        pacienteNome: props.patient.name,
        prontuario: props.patient.id,
        tipo: props.tipo ?? (props.especialidades.length === 1 && props.especialidadeNome ? "especialidade" : "completo"),
        especialidadeNome: props.especialidadeNome ?? (props.especialidades.length === 1 ? props.especialidades[0]?.nome : undefined),
        formato: "pdf",
      });

    // Troca símbolos que a fonte do PDF não desenha (ex.: "≥" saía como "e").
    const blob = await pdf(<FichaConsolidadaPdf {...sanitizarParaPdf(props)} />).toBlob();
    if (typeof window !== "undefined" && typeof document !== "undefined" && window.URL?.createObjectURL) {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = nomeFinal;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
    return { ok: true, nomeArquivo: nomeFinal };
  } catch (erro) {
    console.error("Falha ao gerar o PDF da Ficha Consolidada:", erro);
    return { ok: false, erro: "Não foi possível gerar o PDF agora. Tente novamente em instantes." };
  }
}
