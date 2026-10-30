import React from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import { PatientAlert, AlertLevel } from '../../types/alerts';
import { AlertMeta } from './AlertMeta';

interface Level2BannerProps {
  alerts: PatientAlert[];
  onAcknowledge: (alertId: string) => void;
}

/**
 * Nível 2 da arquitetura de alertas: faixa persistente no topo, que fica
 * visível até o profissional registrar ciência (ou um plano). Diferente do
 * Nível 1, não interrompe/bloqueia a tela.
 */
export const Level2Banner: React.FC<Level2BannerProps> = ({ alerts, onAcknowledge }) => {
  const activeLevel2 = alerts.filter(
    a => a.active && a.level.includes(AlertLevel.LEVEL_2) && a.status !== 'ciente' && a.status !== 'resolvido'
  );

  if (activeLevel2.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {activeLevel2.map(alert => (
        <div key={alert.id} className="w-full bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2">
            <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-900">{alert.title}</p>
              <p className="text-xs text-amber-800">{alert.description}</p>
              {alert.recommendedAction && (
                <p className="text-xs text-amber-700 mt-1"><strong>Ação sugerida:</strong> {alert.recommendedAction}</p>
              )}
              {alert.level.includes(AlertLevel.LEVEL_4) ? (
                // Os detalhes ficam no cartão de pendência, para não repetir.
                <p className="text-xs text-amber-800 mt-1">
                  <strong>Pendência criada para:</strong> {alert.responsible || 'equipe responsável'} (detalhes em "Pendências geradas por alertas")
                </p>
              ) : (
                <AlertMeta alert={alert} className="text-amber-800 mt-1.5" />
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onAcknowledge(alert.id)}
            className="shrink-0 inline-flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition"
          >
            <Check size={14} /> Registrar ciência
          </button>
        </div>
      ))}
    </div>
  );
};
