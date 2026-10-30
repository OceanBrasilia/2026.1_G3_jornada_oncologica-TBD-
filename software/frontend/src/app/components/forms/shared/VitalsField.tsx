import React from 'react';

interface VitalsFieldProps {
  data: Record<string, any>;
  patient: any;
  origins?: Record<string, string>;
  onChange: (key: string, value: any) => void;
  disabled?: boolean;
}

export function VitalsField({ data, patient, origins, onChange, disabled = false }: VitalsFieldProps) {
  const getVal = (key: string, fallbackKey?: string) => {
    if (data[key] !== undefined) return data[key];
    if (fallbackKey && patient?.[fallbackKey] !== undefined) return patient[fallbackKey];
    return "";
  };

  const weight = getVal("peso", "weight");
  const height = getVal("altura", "height");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-bold text-[#1A2332] mb-1">Peso (kg)</label>
        <div className="relative">
          <input 
            type="number" 
            step="0.1"
            value={weight} 
            onChange={(e) => onChange("peso", e.target.value)} 
            placeholder="Ex: 70.5" 
            disabled={disabled}
            className="w-full pl-3 pr-24 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 transition disabled:opacity-60" 
          />
          {origins?.["peso"] && !disabled && (
            <span className="absolute right-3 top-3 text-[10px] text-[#1B6CA8] font-semibold bg-[#F9FBFE] pl-2">↩ {origins["peso"]}</span>
          )}
          {!origins?.["peso"] && patient?.weight && !disabled && (
            <span className="absolute right-3 top-3 text-[10px] text-[#1B6CA8] font-semibold bg-[#F9FBFE] pl-2">↩ Cadastro</span>
          )}
        </div>
      </div>
      
      <div>
        <label className="block text-xs font-bold text-[#1A2332] mb-1">Altura (m)</label>
        <div className="relative">
          <input 
            type="number" 
            step="0.01"
            value={height} 
            onChange={(e) => onChange("altura", e.target.value)} 
            placeholder="Ex: 1.75" 
            disabled={disabled}
            className="w-full pl-3 pr-24 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 transition disabled:opacity-60" 
          />
          {origins?.["altura"] && !disabled && (
            <span className="absolute right-3 top-3 text-[10px] text-[#1B6CA8] font-semibold bg-[#F9FBFE] pl-2">↩ {origins["altura"]}</span>
          )}
          {!origins?.["altura"] && patient?.height && !disabled && (
            <span className="absolute right-3 top-3 text-[10px] text-[#1B6CA8] font-semibold bg-[#F9FBFE] pl-2">↩ Cadastro</span>
          )}
        </div>
      </div>
    </div>
  );
}
