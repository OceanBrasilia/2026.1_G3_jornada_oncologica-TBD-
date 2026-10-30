import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { PatientAlert, AlertLevel } from '../../types/alerts';
import { AlertMeta } from './AlertMeta';

interface GlobalCriticalAlertProps {
  alerts: PatientAlert[];
}

export const GlobalCriticalAlert: React.FC<GlobalCriticalAlertProps> = ({ alerts }) => {
  const [acknowledged, setAcknowledged] = useState(false);

  // Filter alerts that are active and require a LEVEL_1 (Modal)
  const criticalAlerts = alerts.filter(a => a.active && a.level.includes(AlertLevel.LEVEL_1));

  // Reset acknowledged state if critical alerts change
  useEffect(() => {
    if (criticalAlerts.length > 0) {
      setAcknowledged(false);
    }
  }, [criticalAlerts.length]);

  if (criticalAlerts.length === 0 || acknowledged) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div role="alertdialog" aria-modal="true" aria-labelledby="alerta-critico-titulo" className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl animate-in fade-in zoom-in duration-200 border-t-8 border-red-600">
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-red-100 p-3 rounded-full shrink-0">
            <AlertTriangle className="text-red-600 h-8 w-8" />
          </div>
          <h3 id="alerta-critico-titulo" className="text-xl font-black text-red-700 leading-tight">ALERTA CRÍTICO DE RISCO</h3>
        </div>
        
        <div className="text-gray-700 mb-6 space-y-3">
          {criticalAlerts.map(alert => (
            <div key={alert.id}>
              <p>• <strong>{alert.title}:</strong> {alert.description}</p>
              {alert.recommendedAction && (
                <p className="text-sm text-red-800 mt-1 ml-3"><strong>Ação sugerida:</strong> {alert.recommendedAction}</p>
              )}
              <AlertMeta alert={alert} compacto className="text-gray-600 mt-1.5 ml-3" />
            </div>
          ))}
          
          <div className="mt-4 bg-red-50 p-3 rounded-lg border border-red-200 flex gap-2">
            <AlertTriangle size={20} className="text-red-600 shrink-0" />
            <p className="text-red-800 font-bold text-sm">
              Ação Necessária: Atenção imediata aos riscos acima.
            </p>
          </div>
        </div>
        
        <button 
          type="button"
          onClick={() => setAcknowledged(true)}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition shadow-md hover:shadow-lg active:scale-[0.98]"
        >
          Ciente, continuar atendimento
        </button>
      </div>
    </div>
  );
};
