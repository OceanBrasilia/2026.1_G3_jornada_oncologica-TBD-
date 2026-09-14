import { AlertCategory, AlertLevel, PatientAlert } from '../types/alerts';

export const mockPatientAlerts: PatientAlert[] = [
  {
    id: 'alert-001',
    category: AlertCategory.PSYCHOSOCIAL_RISK,
    level: [AlertLevel.LEVEL_1, AlertLevel.LEVEL_3], // Comportamento duplo
    title: 'Risco Psicossocial Identificado',
    description: 'Paciente relata ideação suicida durante a triagem. Acionar psicologia imediatamente.',
    active: true,
    actionRequired: true,
  },
  {
    id: 'alert-002',
    category: AlertCategory.DEVICE_USAGE,
    level: [AlertLevel.LEVEL_3],
    title: 'Uso de SNE',
    description: 'Paciente em uso de Sonda Nasoentérica.',
    active: true,
  },
  {
    id: 'alert-003',
    category: AlertCategory.CLINICAL_RISK,
    level: [AlertLevel.LEVEL_3],
    title: 'Risco Clínico',
    description: 'Histórico de problemas cardíacos severos.',
    active: true,
  },
  {
    id: 'alert-004',
    category: AlertCategory.ALLERGY,
    level: [AlertLevel.LEVEL_3],
    title: 'Alergia a Dipirona',
    description: 'Paciente possui alergia severa a Dipirona.',
    active: true,
  },
  {
    id: 'alert-005',
    category: AlertCategory.SEVERE_SYMPTOMS,
    level: [AlertLevel.LEVEL_3],
    title: 'Dor Intensa',
    description: 'Paciente relatou dor nível 9 na chegada.',
    active: true,
  },
  {
    id: 'alert-006',
    category: AlertCategory.ACCESSIBILITY,
    level: [AlertLevel.LEVEL_3],
    title: 'Deficiência Visual',
    description: 'Paciente precisa de auxílio para leitura.',
    active: true,
  }
];
