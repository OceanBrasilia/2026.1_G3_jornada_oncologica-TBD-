/**
 * Nome de exibição do profissional logado, a partir do perfil.
 *
 * O servidor ainda não informa o nome de quem entrou (o /login devolve só o
 * token). Enquanto isso, mostra o perfil com "identificação pendente" em vez
 * de um nome fixo, para não atribuir registros a outra pessoa.
 * Quando o login devolver o nome do usuário, trocar por esse nome aqui.
 */
export function nomeExibicaoPorPerfil(role: string | null): string {
  if (role === "recepcao") return "Recepção (identificação pendente)";
  if (role === "profissional") return "Profissional (identificação pendente)";
  if (role === "administrador") return "Administração (identificação pendente)";
  return "Coordenação (identificação pendente)";
}
