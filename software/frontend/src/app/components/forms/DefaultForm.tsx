import React from "react";
import { FormProps } from "./NutricaoForm";

export function DefaultForm({ data, onChange, patient }: FormProps & { specName?: string }) {
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.name, e.target.value);
  };

  return (
    <div className="bg-white rounded-2xl border border-[rgba(27,108,168,0.1)] shadow-sm p-5">
      <h3 className="font-bold text-[#1A2332] mb-4 text-sm" style={{ fontFamily: "'Nunito', sans-serif" }}>Campos específicos – {patient.specName || ""}</h3>
      <div className="space-y-3">
        {["Avaliação geral","Queixas principais","Conduta","Encaminhamentos"].map(f => (
          <div key={f}>
            <label className="block text-xs font-bold text-[#1A2332] mb-1">{f}</label>
            <select 
              name={f}
              value={data[f] ?? ""}
              onChange={handleSelectChange}
              className="w-full px-3 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20"
            >
              <option value="">Selecione...</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
