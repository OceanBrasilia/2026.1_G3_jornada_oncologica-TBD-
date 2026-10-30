import React from 'react';

interface HabitsFieldProps {
  data: Record<string, any>;
  origins?: Record<string, string>;
  onChange: (key: string, value: any) => void;
}

export function HabitsField({ data, origins, onChange }: HabitsFieldProps) {
  const tabagismo = data.tabagismo || "Não";
  const tabagismo_detalhes = data.tabagismo_detalhes || "";
  const etilismo = data.etilismo || "Não";
  const etilismo_detalhes = data.etilismo_detalhes || "";
  const outros_habitos = data.outros_habitos || "";

  return (
    <div className="mb-4 bg-[#F9FBFE] p-4 rounded-xl border border-[#D5E6F3]">
      <h4 className="font-bold text-[#1B6CA8] text-sm mb-3">Hábitos de Vida</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        {/* Tabagismo */}
        <div>
          <label className="block text-xs font-bold text-[#1A2332] mb-2">Tabagismo</label>
          <div className="flex gap-4 mb-2">
            {["Não", "Sim", "Ex-tabagista"].map(opt => (
              <label key={opt} className="flex items-center space-x-1.5 text-sm cursor-pointer">
                <input 
                  type="radio" 
                  name="tabagismo"
                  checked={tabagismo === opt} 
                  onChange={() => onChange("tabagismo", opt)}
                  className="w-4 h-4 text-[#1B6CA8] focus:ring-[#1B6CA8]"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
          {(tabagismo === "Sim" || tabagismo === "Ex-tabagista") && (
            <input 
              type="text" 
              value={tabagismo_detalhes} 
              onChange={(e) => onChange("tabagismo_detalhes", e.target.value)} 
              placeholder="Detalhes (cigarros/dia, parou há...)" 
              className="w-full px-3 py-2 rounded-xl border border-[#D5E6F3] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 transition" 
            />
          )}
        </div>

        {/* Etilismo */}
        <div>
          <label className="block text-xs font-bold text-[#1A2332] mb-2">Etilismo</label>
          <div className="flex gap-4 mb-2">
            {["Não", "Sim", "Ex-etilista"].map(opt => (
              <label key={opt} className="flex items-center space-x-1.5 text-sm cursor-pointer">
                <input 
                  type="radio" 
                  name="etilismo"
                  checked={etilismo === opt} 
                  onChange={() => onChange("etilismo", opt)}
                  className="w-4 h-4 text-[#1B6CA8] focus:ring-[#1B6CA8]"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
          {(etilismo === "Sim" || etilismo === "Ex-etilista") && (
            <input 
              type="text" 
              value={etilismo_detalhes} 
              onChange={(e) => onChange("etilismo_detalhes", e.target.value)} 
              placeholder="Detalhes (ml/sem, tempo, parou há...)" 
              className="w-full px-3 py-2 rounded-xl border border-[#D5E6F3] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 transition" 
            />
          )}
        </div>
      </div>

      {/* Outros Hábitos */}
      <div>
        <label className="block text-xs font-bold text-[#1A2332] mb-1">Outros Hábitos / Observações</label>
        <input 
          type="text" 
          value={outros_habitos} 
          onChange={(e) => onChange("outros_habitos", e.target.value)} 
          placeholder="Drogas ilícitas, exercícios físicos, etc..." 
          className="w-full px-3 py-2.5 rounded-xl border border-[#D5E6F3] bg-white text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 transition" 
        />
      </div>
      
      {origins?.["habitos"] && (
        <p className="text-[10px] text-[#1B6CA8] font-semibold mt-2">
          Dados importados de: {origins["habitos"]}
        </p>
      )}
    </div>
  );
}
