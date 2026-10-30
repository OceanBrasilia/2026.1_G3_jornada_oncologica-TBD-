/**
 * Motor único de campos condicionais dos formulários (Passo 2 da Issue 6).
 * A condição fica declarada aqui (ex.: showIf), nunca espalhada em `if` na tela.
 */
export type Condition =
  | { campo: string; igual: string }
  | { campo: string; diferente: string }
  | { campo: string; "contém": string }
  | { E: Condition[] }
  | { OU: Condition[] };

export function evaluateCondition(data: Record<string, any>, condition: Condition): boolean {
  if ("E" in condition) {
    return condition.E.every((c) => evaluateCondition(data, c));
  }
  if ("OU" in condition) {
    return condition.OU.some((c) => evaluateCondition(data, c));
  }

  const value = data?.[condition.campo];

  if ("igual" in condition) {
    return value === condition.igual;
  }
  if ("diferente" in condition) {
    return value !== condition.diferente;
  }
  if ("contém" in condition) {
    return Array.isArray(value) && value.includes(condition["contém"]);
  }
  return false;
}
