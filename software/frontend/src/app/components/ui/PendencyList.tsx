import React, { useState } from 'react';
import { ClipboardList, CheckCircle } from 'lucide-react';
import { PatientAlert, AlertLevel } from '../../types/alerts';
import { AlertMeta } from './AlertMeta';
import { podeResolverPendencia, PermissaoResolverPendencia } from '../../alerts/resolverPendencia';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './alert-dialog';

interface PendencyListProps {
  alerts: PatientAlert[];
  /** Sem esta função a lista é só leitura (ex.: Ficha Consolidada). */
  onResolve?: (alertId: string) => void;
  /** Equipe do usuário logado; `null` enquanto o login não informar. */
  equipeUsuario?: string | null;
}

/**
 * Nível 4 da arquitetura de alertas: cartão de tarefa/pendência com
 * responsável e prazo, gerado por alertas que precisam de acompanhamento
 * por outra especialidade (ex.: ASG-PPP -> Nutrição, IRPO -> Psicologia).
 * Só a equipe responsável pode marcar a pendência como resolvida.
 */
export const PendencyList: React.FC<PendencyListProps> = ({ alerts, onResolve, equipeUsuario = null }) => {
  const [pedido, setPedido] = useState<{ alerta: PatientAlert; permissao: PermissaoResolverPendencia } | null>(null);

  const pendencies = alerts.filter(
    a => a.active && a.level.includes(AlertLevel.LEVEL_4) && a.status !== 'resolvido'
  );

  if (pendencies.length === 0) return null;

  const equipe = pedido?.alerta.responsible || 'responsável';

  return (
    <div className="bg-white rounded-2xl border border-[#D5E6F3] shadow-sm p-5 mb-4">
      <h3 className="font-bold text-[#1A2332] mb-3 text-sm flex items-center gap-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
        <ClipboardList size={16} className="text-[#1B6CA8]" /> Pendências geradas por alertas
      </h3>
      <div className="space-y-3">
        {pendencies.map(p => (
          <div key={p.id} className="border border-[#EEF2F7] rounded-xl p-3">
            <p className="text-sm font-semibold text-[#1A2332]">{p.title}</p>
            <p className="text-xs text-[#6B7A8D]">{p.description}</p>
            {p.recommendedAction && (
              <p className="text-xs text-[#3A4354] mt-1"><strong>Ação sugerida:</strong> {p.recommendedAction}</p>
            )}
            <AlertMeta alert={p} mostrarPrazo className="text-[#6B7A8D] mt-2" />
            {onResolve && (
              <button
                type="button"
                onClick={() => setPedido({ alerta: p, permissao: podeResolverPendencia(p.responsible, equipeUsuario) })}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#1B6CA8] border border-[#1B6CA8]/30 hover:bg-[#E8F4FD] px-3 py-2 rounded-lg transition"
              >
                <CheckCircle size={14} /> Marcar como resolvida
              </button>
            )}
          </div>
        ))}
      </div>

      <AlertDialog open={pedido !== null} onOpenChange={aberto => { if (!aberto) setPedido(null); }}>
        <AlertDialogContent>
          {pedido?.permissao === 'outra-equipe' ? (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Pendência de outra equipe</AlertDialogTitle>
                <AlertDialogDescription>
                  Só a equipe de {equipe} pode resolver esta pendência. Se ela já foi atendida, avise a equipe responsável.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Entendi</AlertDialogCancel>
              </AlertDialogFooter>
            </>
          ) : (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Marcar pendência como resolvida?</AlertDialogTitle>
                <AlertDialogDescription>
                  {pedido?.permissao === 'equipe-desconhecida'
                    ? `Esta pendência é da equipe de ${equipe}. Só membros dessa equipe podem resolvê-la. Você faz parte da equipe de ${equipe}?`
                    : `"${pedido?.alerta.title}" sairá da lista de pendências. O registro de quem resolveu e quando fica guardado.`}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => { if (pedido) onResolve?.(pedido.alerta.id); setPedido(null); }}>
                  {pedido?.permissao === 'equipe-desconhecida' ? `Sou da equipe de ${equipe}, resolver` : 'Marcar como resolvida'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
