import { useState, useMemo, useCallback } from 'react';

// Simulando dados que viriam do backend / contexto do paciente
// Em um cenário real, isso viria via props ou Context API (ex: patient.conditions)
export const mockPatientConditions = ['SNE', 'TRAQUEOSTOMIA'];

export interface FieldStatus {
  disabled: boolean;
  placeholder?: string;
  canIgnore?: boolean;
}

export function useClinicalConflicts(patientConditions: string[] = mockPatientConditions) {
  const [ignoredConflicts, setIgnoredConflicts] = useState<string[]>([]);

  const conflicts = useMemo(() => {
    const currentConflicts: Record<string, string> = {};

    if (patientConditions.includes('SNE')) {
      currentConflicts['paladar'] = 'Bloqueado: Paciente em uso de via alternativa (SNE).';
    }
    
    if (patientConditions.includes('TRAQUEOSTOMIA')) {
      currentConflicts['escala_verbal_dor'] = 'Bloqueado: Paciente traqueostomizado (impossibilidade verbal).';
    }
    
    if (patientConditions.includes('MASCULINO')) {
      currentConflicts['gravidez'] = 'Bloqueado: Não aplicável ao sexo masculino.';
    }

    return currentConflicts;
  }, [patientConditions]);

  const getFieldStatus = useCallback((fieldName: string): FieldStatus => {
    const conflictReason = conflicts[fieldName];
    const isIgnored = ignoredConflicts.includes(fieldName);

    if (conflictReason && !isIgnored) {
      return {
        disabled: true,
        placeholder: conflictReason,
        canIgnore: true, // Permitir ignorar a inativação
      };
    }
    
    return { disabled: false };
  }, [conflicts, ignoredConflicts]);

  const ignoreConflict = useCallback((fieldName: string) => {
    setIgnoredConflicts((prev) => [...prev, fieldName]);
  }, []);

  return { getFieldStatus, ignoreConflict };
}
