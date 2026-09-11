export enum AlertLevel {
  LEVEL_1 = 1, // Modal Interruptivo (Perigos imediatos)
  LEVEL_2 = 2, // Faixa/Banner (Persistente no topo, até registrar ciência)
  LEVEL_3 = 3, // Badges Visuais (Fixos no cartão do paciente)
  LEVEL_4 = 4, // Cartão de Pendência (responsável + prazo)
}

export enum AlertCategory {
  CLINICAL_RISK = 'CLINICAL_RISK',
  ACCESSIBILITY = 'ACCESSIBILITY',
  DEVICE_USAGE = 'DEVICE_USAGE',
  PSYCHOSOCIAL_RISK = 'PSYCHOSOCIAL_RISK',
  ALLERGY = 'ALLERGY',
  SEVERE_SYMPTOMS = 'SEVERE_SYMPTOMS',
}

export type AlertStatus = 'aberto' | 'ciente' | 'resolvido';

export interface PatientAlert {
  id: string;
  category: AlertCategory;
  level: AlertLevel[]; // Um alerta pode disparar múltiplos níveis (ex: Psicossocial dispara L1 e L3)
  title: string;
  description: string; // motivo/origem do alerta
  active: boolean;
  actionRequired?: boolean;
  /** Ação recomendada para quem for atender o alerta (RF-020: nunca uma decisão clínica automática, só uma sugestão). */
  recommendedAction?: string;
  /** Quem deveria agir (ex.: "Psicologia", "Nutrição"). Usado principalmente nos alertas de Nível 2 e 4. */
  responsible?: string;
  /** Prazo sugerido, em texto livre (ex.: "Até o fim do atendimento de hoje"). Usado principalmente no Nível 4. */
  dueDate?: string;
  /** Quando o alerta foi gerado/atualizado pela última vez. */
  createdAt?: string;
  /** Quem/o que gerou o alerta (ex.: "Sistema (Psicologia)" para automáticos, ou o nome do profissional para sinalizações manuais). */
  author?: string;
  /** true = nunca aparece no portal do paciente/acompanhante, e é restrito por perfil nas telas internas. */
  confidential?: boolean;
  /** Estado do acompanhamento do alerta — usado principalmente no Nível 2 ("fica até registrar ciência ou plano") e no Nível 4. */
  status?: AlertStatus;
}
