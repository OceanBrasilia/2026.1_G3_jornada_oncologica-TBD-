/**
 * A fonte padrão do PDF (Helvetica) só desenha os caracteres da tabela
 * WinAnsi (ASCII, acentos do português e alguns sinais). Fora dela, o PDF
 * troca o símbolo por uma letra errada (ex.: "≥ 9" saía como "e 9").
 * Por isso todo texto passa por aqui antes de ir para o PDF.
 */

const TROCAS: Record<string, string> = {
  "≥": ">=",
  "≤": "<=",
  "≠": "!=",
  "→": "->",
  "←": "<-",
  "↩": "",
  "✓": "",
  "✔": "",
  "✕": "x",
  "−": "-",
  "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4",
  "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9",
};

// Caracteres extras da WinAnsi além de ASCII e Latin-1 (U+00A0–U+00FF).
const EXTRAS_WINANSI = new Set("€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ");

function caractereSuportado(c: string): boolean {
  const code = c.codePointAt(0) ?? 0;
  return code === 0x09 || code === 0x0a || code === 0x0d
    || (code >= 0x20 && code <= 0x7e)
    || (code >= 0xa0 && code <= 0xff)
    || EXTRAS_WINANSI.has(c);
}

/** Troca símbolos que a fonte do PDF não desenha; o que não tiver troca vira "?". */
export function textoCompativelPdf(texto: string): string {
  let saida = "";
  for (const c of texto) {
    if (c in TROCAS) saida += TROCAS[c];
    else saida += caractereSuportado(c) ? c : "?";
  }
  return saida;
}

/** Aplica textoCompativelPdf em todos os textos de um objeto (listas e objetos aninhados). */
export function sanitizarParaPdf<T>(valor: T): T {
  if (typeof valor === "string") return textoCompativelPdf(valor) as T;
  if (Array.isArray(valor)) return valor.map(v => sanitizarParaPdf(v)) as T;
  if (valor && typeof valor === "object") {
    return Object.fromEntries(
      Object.entries(valor as Record<string, unknown>).map(([k, v]) => [k, sanitizarParaPdf(v)]),
    ) as T;
  }
  return valor;
}
