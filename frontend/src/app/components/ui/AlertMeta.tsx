import { PatientAlert, AlertLevel, AlertStatus } from '../../types/alerts';

/** Gravidade conforme a arquitetura de alertas da Nota Técnica (um nível = uma gravidade). */
const GRAVIDADE_POR_NIVEL: Record<AlertLevel, string> = {
  [AlertLevel.LEVEL_1]: 'Crítica (Nível 1)',
  [AlertLevel.LEVEL_2]: 'Alta (Nível 2)',
  [AlertLevel.LEVEL_3]: 'Informativa (Nível 3)',
  [AlertLevel.LEVEL_4]: 'Pendência (Nível 4)',
};

const ESTADO: Record<AlertStatus, string> = {
  aberto: 'Aberto',
  ciente: 'Ciente',
  resolvido: 'Resolvido',
};

interface AlertMetaProps {
  alert: PatientAlert;
  /** Nível em que o alerta está sendo exibido (um alerta pode disparar vários níveis). */
  nivel: AlertLevel;
  className?: string;
}

/**
 * Campos que todo alerta deve mostrar (Nota Técnica): gravidade, responsável,
 * prazo, data/hora, autor e estado. Título, motivo e ação recomendada ficam
 * com cada componente de nível, porque cada um os destaca de um jeito.
 *
 * [CONFIRMAR COM A EQUIPE] O prazo vem do próprio alerta; quando não houver,
 * aparece "Não definido" (o sistema não inventa prazo clínico).
 */
export function AlertMeta({ alert, nivel, className = '' }: AlertMetaProps) {
  const itens: [string, string][] = [
    ['Gravidade', GRAVIDADE_POR_NIVEL[nivel]],
    ['Responsável', alert.responsible || 'Não definido'],
    ['Prazo', alert.dueDate || 'Não definido'],
    ['Gerado em', alert.createdAt || 'Não registrado'],
    ['Autor', alert.author || 'Não registrado'],
    ['Estado', ESTADO[alert.status ?? 'aberto']],
  ];

  return (
    <dl className={`grid grid-cols-[auto_1fr] sm:grid-cols-[auto_1fr_auto_1fr] gap-x-3 gap-y-0.5 text-[11px] ${className}`}>
      {itens.map(([rotulo, valor]) => (
        <div key={rotulo} className="contents">
          <dt className="font-semibold">{rotulo}:</dt>
          <dd>{valor}</dd>
        </div>
      ))}
    </dl>
  );
}
