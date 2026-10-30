type StatusEspecialidade = "atendido" | "pendente" | "em-atendimento" | "nao-se-aplica";
type StatusPaciente = "aguardando" | "em-atendimento" | "pendente" | "finalizado";

/**
 * Status geral do paciente a partir do status de cada especialidade.
 * Regras definidas pela equipe em 30/09/2026:
 * - "pendente" (na especialidade) = o paciente ainda não passou por ela;
 * - a jornada finaliza quando todas as especialidades aplicáveis terminam
 *   ("não se aplica" não conta).
 *
 * - aguardando:     só a Recepção atendeu;
 * - em-atendimento: alguma especialidade está em atendimento (rascunho salvo);
 * - pendente:       já passou por alguma, nenhuma em andamento, e ainda faltam
 *                   especialidades aplicáveis;
 * - finalizado:     todas as especialidades aplicáveis estão atendidas.
 */
export function statusGeralDoPaciente(
  especialidades: { id: string; status: StatusEspecialidade }[],
): StatusPaciente {
  const aplicaveis = especialidades.filter(e => e.status !== "nao-se-aplica");
  const semRecepcao = aplicaveis.filter(e => e.id !== "recepcao");

  if (aplicaveis.length > 0 && aplicaveis.every(e => e.status === "atendido")) return "finalizado";
  if (semRecepcao.some(e => e.status === "em-atendimento")) return "em-atendimento";
  if (semRecepcao.some(e => e.status === "atendido")) return "pendente";
  return "aguardando";
}
