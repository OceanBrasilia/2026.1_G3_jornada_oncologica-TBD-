export const IMC_FORMULA = "IMC = peso / altura²";

/**
 * Calcula o IMC a partir do peso (kg) e da altura (m).
 * Se a altura vier maior que 3, assume que foi digitada em centímetros
 * (ex.: "163") e converte para metros (1,63) antes de calcular.
 */
export function calculateIMC(weightStr: string, heightStr: string): string {
  const weight = parseFloat((weightStr || "").replace(",", "."));
  let height = parseFloat((heightStr || "").replace(",", "."));

  if (!(weight > 0) || !(height > 0)) {
    return "—";
  }

  if (height > 3) {
    height = height / 100;
  }

  const imc = weight / (height * height);
  return imc.toFixed(1);
}
