import React from 'react';
import { ClipboardList } from 'lucide-react';
import { PatientAlert, AlertLevel } from '../../types/alerts';

interface PendencyListProps {
  alerts: PatientAlert[];
}

/**
 * Nível 4 da arquitetura de alertas: cartão de tarefa/pendência com
 * responsável e prazo, gerado por alertas que precisam de acompanhamento
 * por outra especialidade (ex.: ASG-PPP -> Nutrição, IRPO -> Psicologia).
 */
export const PendencyList: React.FC<PendencyListProps> = ({ alerts }) => {
  const pendencies = alerts.filter(
    a => a.active && a.level.includes(AlertLevel.LEVEL_4) && a.status !== 'resolvido'
  );

  if (pendencies.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-[#D5E6F3] shadow-sm p-5 mb-4">
      <h3 className="font-bold text-[#1A2332] mb-3 text-sm flex items-center gap-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
        <ClipboardList size={16} className="text-[#1B6CA8]" /> Pendências geradas por alertas
      </h3>
      <div className="space-y-3">
        {pendencies.map(p => (
          <div key={p.id} className="border border-[#EEF2F7] rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-[#1A2332]">{p.title}</p>
              <p className="text-xs text-[#6B7A8D]">{p.description}</p>
            </div>
            <div className="text-xs text-left sm:text-right shrink-0">
              {p.responsible && <div className="font-bold text-[#1B6CA8]">{p.responsible}</div>}
              {p.dueDate && <div className="text-[#8A9EB9]">{p.dueDate}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
