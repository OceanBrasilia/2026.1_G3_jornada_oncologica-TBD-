export interface FieldConflict {
  fieldId: string;
  reason: string;
  isIgnored: boolean; // Para permitir que o profissional "ignore" a inativação
}
