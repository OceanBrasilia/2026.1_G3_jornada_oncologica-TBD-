import { useState, useMemo, useCallback } from 'react';

// Simulando dados que viriam do backend / contexto do paciente
// Em um cenário real, isso viria via props ou Context API (ex: patient.conditions)
export const mockPatientConditions = ['SNE', 'TRAQUEOSTOMIA'];

export interface FieldStatus {
  /** Aviso de que a pergunta pode não fazer sentido nessa situação — o campo continua editável, nunca é bloqueado. */
  hint?: string;
}

/**
 * Em vez de desabilitar a pergunta, avisa quando ela pode não se aplicar à
 * situação do paciente (ex.: pergunta sobre paladar com paciente em uso de
 * SNE). O profissional decide: continua vendo o aviso, ou dispensa e segue
 * respondendo normalmente — a pergunta nunca fica bloqueada, para evitar
 * esconder algo que ainda pode ser relevante.
 */
export function useClinicalConflicts(patientConditions: string[] = mockPatientConditions) {
  const [dispensados, setDispensados] = useState<string[]>([]);

  const conflicts = useMemo(() => {
    const currentConflicts: Record<string, string> = {};

    if (patientConditions.includes('SNE')) {
      currentConflicts['paladar'] = 'Paciente em uso de via alternativa (SNE) — essa pergunta pode não se aplicar.';
    }

    if (patientConditions.includes('TRAQUEOSTOMIA')) {
      currentConflicts['escala_verbal_dor'] = 'Paciente traqueostomizado — resposta verbal pode não ser possível.';
    }

    if (patientConditions.includes('MASCULINO')) {
      currentConflicts['gravidez'] = 'Não se aplica ao sexo masculino, mas o campo continua disponível.';
    }

    return currentConflicts;
  }, [patientConditions]);

  const getFieldStatus = useCallback((fieldName: string): FieldStatus => {
    const hint = conflicts[fieldName];
    if (hint && !dispensados.includes(fieldName)) {
      return { hint };
    }
    return {};
  }, [conflicts, dispensados]);

  const dismissHint = useCallback((fieldName: string) => {
    setDispensados((prev) => [...prev, fieldName]);
  }, []);

  return { getFieldStatus, dismissHint };
}
