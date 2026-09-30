import { pdf } from "@react-pdf/renderer";
import { FichaConsolidadaPdf, type FichaConsolidadaPdfProps } from "./FichaConsolidadaPdf";
import { sanitizarParaPdf } from "./textoPdf";

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * ficha_[identificador]_[AAAAMMDD-HHMM].pdf — nunca usa o nome do paciente
 * no nome do arquivo (privacidade). Com a versão: ficha_[id]_v[N]_[AAAAMMDD-HHMM].pdf,
 * para duas exportações no mesmo minuto não ficarem com o mesmo nome.
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

export type ExportarFichaResultado = { ok: true } | { ok: false; erro: string };

/**
 * Gera o PDF da Ficha Consolidada e dispara o download no navegador.
 * Nunca lança exceção — devolve { ok: false, erro } em caso de falha, para a
 * tela mostrar uma mensagem clara sem perder nada do que já estava na tela.
 */
export async function exportarFichaConsolidadaPdf(props: FichaConsolidadaPdfProps): Promise<ExportarFichaResultado> {
  try {
    // Troca símbolos que a fonte do PDF não desenha (ex.: "≥" saía como "e").
    const blob = await pdf(<FichaConsolidadaPdf {...sanitizarParaPdf(props)} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nomeArquivoFichaPdf(props.patient.id, new Date(), props.versao);
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
