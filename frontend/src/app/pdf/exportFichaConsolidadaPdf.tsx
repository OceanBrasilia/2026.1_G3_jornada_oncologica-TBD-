import { pdf } from "@react-pdf/renderer";
import { FichaConsolidadaPdf, type FichaConsolidadaPdfProps } from "./FichaConsolidadaPdf";

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * ficha_[identificador]_[AAAAMMDD-HHMM].pdf — nunca usa o nome do paciente
 * no nome do arquivo (privacidade).
 */
export function nomeArquivoFichaPdf(patientId: string, agora: Date = new Date()): string {
  const aaaa = agora.getFullYear();
  const mm = pad2(agora.getMonth() + 1);
  const dd = pad2(agora.getDate());
  const hh = pad2(agora.getHours());
  const min = pad2(agora.getMinutes());
  return `ficha_${patientId}_${aaaa}${mm}${dd}-${hh}${min}.pdf`;
}

export type ExportarFichaResultado = { ok: true } | { ok: false; erro: string };

/**
 * Gera o PDF da Ficha Consolidada e dispara o download no navegador.
 * Nunca lança exceção — devolve { ok: false, erro } em caso de falha, para a
 * tela mostrar uma mensagem clara sem perder nada do que já estava na tela.
 */
export async function exportarFichaConsolidadaPdf(props: FichaConsolidadaPdfProps): Promise<ExportarFichaResultado> {
  try {
    const blob = await pdf(<FichaConsolidadaPdf {...props} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nomeArquivoFichaPdf(props.patient.id);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return { ok: true };
  } catch (erro) {
    console.error("Falha ao gerar o PDF da Ficha Consolidada:", erro);
    return { ok: false, erro: "Não foi possível gerar o PDF agora. Tente novamente em instantes." };
  }
}
