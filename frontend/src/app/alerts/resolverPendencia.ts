/**
 * Regra de quem pode resolver uma pendência (Nível 4): só membros da equipe
 * responsável pelo alerta (decisão da equipe em 30/09/2026).
 *
 * O login ainda não informa a equipe do usuário. Enquanto isso, a equipe
 * chega como `null` e o resultado é "equipe-desconhecida": a tela pede que a
 * pessoa confirme que faz parte da equipe responsável antes de resolver.
 */
export type PermissaoResolverPendencia = "permitido" | "outra-equipe" | "equipe-desconhecida";

const normalizar = (texto: string) =>
  texto.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();

/** "Psicologia/Psiquiatria" → ["Psicologia", "Psiquiatria"] */
export function equipesResponsaveis(responsavel?: string): string[] {
  return (responsavel ?? "").split("/").map(e => e.trim()).filter(Boolean);
}

export function podeResolverPendencia(
  responsavel: string | undefined,
  equipeUsuario: string | null,
): PermissaoResolverPendencia {
  if (!equipeUsuario) return "equipe-desconhecida";
  const equipe = normalizar(equipeUsuario);
  return equipesResponsaveis(responsavel).some(e => normalizar(e) === equipe)
    ? "permitido"
    : "outra-equipe";
}
