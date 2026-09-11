export enum AlertLevel {
  LEVEL_1 = 1, // Modal Interruptivo (Perigos imediatos)
  LEVEL_2 = 2, // Faixa/Banner (Persistente no topo)
  LEVEL_3 = 3, // Badges Visuais (Fixos no cartão do paciente)
}

export enum AlertCategory {
  CLINICAL_RISK = 'CLINICAL_RISK',
  ACCESSIBILITY = 'ACCESSIBILITY',
  DEVICE_USAGE = 'DEVICE_USAGE',
  PSYCHOSOCIAL_RISK = 'PSYCHOSOCIAL_RISK',
  ALLERGY = 'ALLERGY',
  SEVERE_SYMPTOMS = 'SEVERE_SYMPTOMS',
}

export interface PatientAlert {
  id: string;
  category: AlertCategory;
  level: AlertLevel[]; // Um alerta pode disparar múltiplos níveis (ex: Psicossocial dispara L1 e L3)
  title: string;
  description: string;
  active: boolean;
  actionRequired?: boolean;
}
