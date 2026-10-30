import { PatientAlert } from "../types/alerts";

/**
 * Ponto único de decisão de quem pode ver conteúdo confidencial no sistema
 * inteiro — alertas e também dados brutos de especialidades sensíveis na
 * Ficha Consolidada (risco psíquico, violência, vulnerabilidade social —
 * ver AGENTS.md).
 *
 * [CONFIRMAR COM A EQUIPE] Hoje o sistema só tem os perfis "recepcao",
 * "profissional" e "coordenacao" (mais o portal público, sem perfil).
 * Como decisão de partida: só "profissional" e "coordenacao" veem
 * conteúdo confidencial; "recepcao" e o portal público/paciente nunca veem.
 * Ajustar aqui se a equipe definir outra regra de acesso por perfil.
 */
export function podeVerConfidencial(role: string | null): boolean {
  return role === "profissional" || role === "coordenacao" || role === "administrador";
}

export function filterAlertsForRole(alerts: PatientAlert[], role: string | null): PatientAlert[] {
  if (podeVerConfidencial(role)) return alerts;
  return alerts.filter(a => !a.confidential);
}
