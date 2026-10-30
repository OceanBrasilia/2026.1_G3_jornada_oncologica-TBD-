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
  className?: string;
  /** Sempre em uma coluna (para espaços estreitos). */
  compacto?: boolean;
  /** Mostra o prazo, quando o alerta tiver um (usado no cartão de pendência, Nível 4). */
  mostrarPrazo?: boolean;
}

/**
 * Dados do alerta exibidos junto ao título, motivo e ação recomendada:
 * gravidade, responsável, data/hora, autor e estado. O prazo só aparece no
 * cartão de pendência (Nível 4), e só quando o alerta tiver um.
 */
export function AlertMeta({ alert, className = '', compacto = false, mostrarPrazo = false }: AlertMetaProps) {
  // Um alerta pode disparar vários níveis (ex.: Nível 1 + chip de Nível 3); a
  // gravidade é a do nível mais alto, para ser a mesma em qualquer lugar da tela.
  const nivelMaisAlto = Math.min(...alert.level) as AlertLevel;
  const itens: [string, string][] = [
    ['Gravidade', GRAVIDADE_POR_NIVEL[nivelMaisAlto] ?? 'Não definida'],
    ['Responsável', alert.responsible || 'Não definido'],
    ...(mostrarPrazo && alert.dueDate ? [['Prazo', alert.dueDate] as [string, string]] : []),
    ['Gerado em', alert.createdAt || 'Não registrado'],
    ['Autor', alert.author || 'Não registrado'],
    ['Estado', ESTADO[alert.status ?? 'aberto']],
  ];

  return (
    <dl className={`grid grid-cols-[auto_1fr] ${compacto ? '' : 'sm:grid-cols-[auto_1fr_auto_1fr]'} gap-x-3 gap-y-0.5 text-[11px] ${className}`}>
      {itens.map(([rotulo, valor]) => (
        <div key={rotulo} className="contents">
          <dt className="font-semibold">{rotulo}:</dt>
          <dd>{valor}</dd>
        </div>
      ))}
    </dl>
  );
}
