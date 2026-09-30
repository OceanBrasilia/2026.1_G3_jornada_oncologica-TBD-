type StatusEspecialidade = "atendido" | "pendente" | "em-atendimento" | "nao-se-aplica";
type StatusPaciente = "aguardando" | "em-atendimento" | "pendente" | "finalizado";

/**
 * Status geral do paciente depois que uma especialidade salva o formulário.
 *
 * Regra atual: sai de "aguardando" para "em-atendimento" assim que alguma
 * especialidade (fora a Recepção) estiver atendida ou em atendimento. Nunca
 * volta atrás e nunca muda um status que já não seja "aguardando".
 *
 * [CONFIRMAR COM A EQUIPE] "finalizado" e "pendente" não são calculados aqui:
 * falta definir se a jornada termina sozinha quando todas as especialidades
 * concluem ou se alguém a encerra, e o que "pendente" significa para o paciente.
 */
export function statusGeralAposAtendimento(
  statusAtual: StatusPaciente,
  especialidades: { id: string; status: StatusEspecialidade }[],
): StatusPaciente {
  if (statusAtual !== "aguardando") return statusAtual;
  const comecou = especialidades.some(
    e => e.id !== "recepcao" && (e.status === "atendido" || e.status === "em-atendimento"),
  );
  return comecou ? "em-atendimento" : statusAtual;
}
