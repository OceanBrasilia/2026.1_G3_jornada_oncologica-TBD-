import { buildDetalhesEspecialidade, buildResumoNutricao, buildResumoPsicologia, statusLabel, type SpecStatusResumo } from "../consolidado/buildConsolidatedView";
import type { EspecialidadePdf } from "./FichaConsolidadaPdf";

export interface SpecialtyLike {
  id: string;
  name: string;
  status: SpecStatusResumo;
  professional?: string;
  completedTime?: string;
}

/**
 * Monta a lista de especialidades no formato que o PDF da Ficha Consolidada
 * espera — a mesma lógica usada na tela (resumo calculado de IMC/ASG-PPP/
 * IRPO, campos confidenciais filtrados por perfil), para nunca duplicar
 * essa regra entre a tela e o PDF, nem entre os diferentes botões de
 * exportar do sistema.
 */
export function buildEspecialidadesPdf(
  specialties: SpecialtyLike[],
  formAnswers: Record<string, Record<string, any>> | undefined,
  patientDate: string,
  temAcessoConfidencial: boolean
): EspecialidadePdf[] {
  return specialties.map(sp => {
    const preenchido = sp.status === "atendido" || sp.status === "em-atendimento";
    const answers = preenchido ? formAnswers?.[sp.id] : undefined;
    return {
      nome: sp.name,
      status: statusLabel(sp.status),
      profissional: preenchido ? sp.professional : undefined,
      horario: preenchido && sp.completedTime ? `${patientDate} às ${sp.completedTime}` : undefined,
      detalhes: preenchido ? buildDetalhesEspecialidade(sp.id, answers, temAcessoConfidencial) : [],
      resumoNutricao: preenchido && sp.id === "nutricao" ? buildResumoNutricao(answers) : null,
      resumoPsicologia: preenchido && sp.id === "psicologia" && temAcessoConfidencial ? buildResumoPsicologia(answers) : null,
    };
  });
}
