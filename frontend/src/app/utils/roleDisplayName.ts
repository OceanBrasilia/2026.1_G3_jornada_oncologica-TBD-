/**
 * Nome de exibição do profissional logado, a partir do perfil.
 *
 * [CONFIRMAR COM A EQUIPE] Hoje é um valor fixo por perfil (não há login
 * individual de verdade ainda) — mesmo comportamento que já existia
 * espalhado pelo código, só reunido num único lugar.
 */
export function nomeExibicaoPorPerfil(role: string | null): string {
  if (role === "recepcao") return "Carla Santos";
  if (role === "profissional") return "Dr. Rafael Costa";
  return "Ana Lima";
}
