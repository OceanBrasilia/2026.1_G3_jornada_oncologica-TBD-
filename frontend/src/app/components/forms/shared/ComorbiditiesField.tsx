import React from 'react';

interface ComorbiditiesFieldProps {
  data: Record<string, any>;
  origins?: Record<string, string>;
  onChange: (key: string, value: any) => void;
}

const COMORBIDITIES_LIST = [
  "Diabetes Mellitus Tipo 1",
  "Diabetes Mellitus Tipo 2",
  "Hipertensão Arterial",
  "Doença Cardiovascular",
  "Asma / DPOC",
  "Doença Renal Crônica"
];

export function ComorbiditiesField({ data, origins, onChange }: ComorbiditiesFieldProps) {
  const selectedComorbidities = data.comorbidades_lista || [];
  const outras = data.comorbidades_outras || "";

  const toggleComorbidity = (item: string) => {
    let newList = [...selectedComorbidities];
    if (newList.includes(item)) {
      newList = newList.filter(c => c !== item);
    } else {
      newList.push(item);
    }
    onChange("comorbidades_lista", newList);
  };

  return (
    <div className="mb-4 bg-[#F9FBFE] p-4 rounded-xl border border-[#D5E6F3]">
      <h4 className="font-bold text-[#1B6CA8] text-sm mb-3">Comorbidades</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
        {COMORBIDITIES_LIST.map((item) => (
          <label key={item} className="flex items-center space-x-2 text-sm text-[#1A2332] cursor-pointer">
            <input 
              type="checkbox" 
              checked={selectedComorbidities.includes(item)} 
              onChange={() => toggleComorbidity(item)}
              className="w-4 h-4 rounded text-[#1B6CA8] focus:ring-[#1B6CA8]"
            />
            <span>{item}</span>
          </label>
        ))}
      </div>
      <div>
        <label className="block text-xs font-bold text-[#1A2332] mb-1">Outras Comorbidades</label>
        <div className="relative">
          <input 
            type="text" 
            value={outras} 
            onChange={(e) => onChange("comorbidades_outras", e.target.value)} 
            placeholder="Especifique outras doenças..." 
            className="w-full px-3 py-2.5 rounded-xl border border-[#D5E6F3] bg-white text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 transition" 
          />
        </div>
      </div>
      {origins?.["comorbidades"] && (
        <p className="text-[10px] text-[#1B6CA8] font-semibold mt-2">
          Dados importados de: {origins["comorbidades"]}
        </p>
      )}
    </div>
  );
}
