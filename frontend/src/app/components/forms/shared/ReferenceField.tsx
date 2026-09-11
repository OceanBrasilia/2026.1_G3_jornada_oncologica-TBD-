import { CornerUpLeft } from "lucide-react";

export interface ReferenceFieldProps {
  label: string;
  value?: string;
  source: string;
  emptyText?: string;
}

/**
 * Mostra, apenas para leitura, um dado já registrado por outra especialidade
 * considerada a fonte de referência daquele assunto (ex.: renda familiar
 * registrada pelo Serviço Social). Não substitui nem se mistura com a
 * pergunta própria da especialidade atual — é só uma consulta ao dado já
 * coletado, para reaproveitar informação sem duplicar a pergunta (RF-006/009).
 */
export function ReferenceField({ label, value, source, emptyText = "Não informado ainda" }: ReferenceFieldProps) {
  return (
    <div className="bg-[#F9FBFE] rounded-xl border border-[#D5E6F3] p-4 flex justify-between items-start gap-3">
      <div>
        <label className="block text-[10px] uppercase font-bold text-[#8A9EB9] tracking-wider mb-1">{label}</label>
        <div className="text-sm font-semibold text-[#1A2332]">{value || emptyText}</div>
      </div>
      <div className="flex items-center gap-1 px-2 py-1 rounded-full border border-[#B3E5D1] text-[#008A5E] bg-[#F2FBF7] text-xs font-medium whitespace-nowrap shrink-0">
        <CornerUpLeft size={12} /> {source}
      </div>
    </div>
  );
}
