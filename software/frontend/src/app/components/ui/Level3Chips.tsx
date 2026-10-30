import { PatientAlert, AlertLevel, AlertCategory } from '../../types/alerts';
import { AlertBadge } from './AlertBadge';

/** Ordem dos eixos: os 4 da Nota Técnica, depois as categorias de breakout. */
const ORDEM_EIXOS: AlertCategory[] = [
  AlertCategory.CLINICAL_RISK,
  AlertCategory.ACCESSIBILITY,
  AlertCategory.DEVICE_USAGE,
  AlertCategory.PSYCHOSOCIAL_RISK,
  AlertCategory.ALLERGY,
  AlertCategory.SEVERE_SYMPTOMS,
];

/** Agrupa os alertas ativos de Nível 3 por eixo, na ordem de ORDEM_EIXOS. */
export function agruparChipsPorEixo(alerts: PatientAlert[]): [AlertCategory, PatientAlert[]][] {
  const nivel3 = alerts.filter(a => a.active && a.level.includes(AlertLevel.LEVEL_3));
  return ORDEM_EIXOS
    .map(eixo => [eixo, nivel3.filter(a => a.category === eixo)] as [AlertCategory, PatientAlert[]])
    .filter(([, lista]) => lista.length > 0);
}

/**
 * Nível 3 da arquitetura de alertas: um chip por eixo, com os detalhes de
 * todos os alertas daquele eixo ao clicar.
 */
export function Level3Chips({ alerts, className = '' }: { alerts: PatientAlert[]; className?: string }) {
  const grupos = agruparChipsPorEixo(alerts);
  if (grupos.length === 0) return null;

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {grupos.map(([eixo, lista]) => (
        <AlertBadge key={eixo} category={eixo} alerts={lista} />
      ))}
    </div>
  );
}
