import { PatientAlert } from "../types/alerts";

/**
 * Ponto único de decisão de quem pode ver alertas confidenciais
 * (risco psíquico, violência, vulnerabilidade social — ver AGENTS.md).
 *
 * [CONFIRMAR COM A EQUIPE] Hoje o sistema só tem os perfis "recepcao",
 * "profissional" e "coordenacao" (mais o portal público, sem perfil).
 * Como decisão de partida: só "profissional" e "coordenacao" veem
 * alertas confidenciais; "recepcao" e o portal público/paciente nunca veem.
 * Ajustar aqui se a equipe definir outra regra de acesso por perfil.
 */
export function filterAlertsForRole(alerts: PatientAlert[], role: string | null): PatientAlert[] {
  const podeVerConfidencial = role === "profissional" || role === "coordenacao";
  if (podeVerConfidencial) return alerts;
  return alerts.filter(a => !a.confidential);
}
