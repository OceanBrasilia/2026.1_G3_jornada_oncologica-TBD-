import React from "react";

export interface SharedPatientCardProps {
  patient: any;
  data: Record<string, string>; // Inherited data (the earliest collected values)
  origins?: Record<string, string>; // Where each inherited data came from
}

export function SharedPatientCard({ patient, data, origins }: SharedPatientCardProps) {
  const SharedField = ({ label, value, origin }: { label: string; value?: string; origin?: string }) => (
    <div>
      <label className="block text-xs font-bold text-[#1A2332] mb-1">{label}</label>
      <div className="px-3 py-2.5 rounded-xl bg-[#F4F7FB] border border-[#E8F4FD] text-sm text-[#6B7A8D] font-medium min-h-[42px] flex items-center justify-between group">
        <span>{value || "—"}</span>
        {origin && (
          <span className="text-[10px] text-[#2DB5A3] font-semibold bg-[#F0FBF9] pl-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            ↩ {origin}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-[rgba(27,108,168,0.1)] shadow-sm p-5 mb-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-[#2DB5A3]" />
        <h3 className="font-bold text-[#1A2332] text-sm" style={{ fontFamily: "'Nunito', sans-serif" }}>Dados Compartilhados do Paciente</h3>
        <span className="text-[10px] text-[#2DB5A3] font-bold bg-[#F0FBF9] px-2 py-0.5 rounded-full border border-[#2DB5A3]/20">
          Reaproveitados
        </span>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <SharedField label="Nome completo" value={patient.name} />
        <SharedField label="Idade / Sexo" value={`${patient.age} anos`} />
        
        <SharedField label="Diagnóstico Clínico / Oncológico" value={patient.diagnosis} />
        <SharedField label="CID" value={patient.cid} />
        
        <SharedField label="Peso" value={data["Peso"]} origin={origins?.["Peso"]} />
        <SharedField label="Altura" value={data["Altura"]} origin={origins?.["Altura"]} />
        
        <div className="sm:col-span-2">
          <SharedField label="Alergias" value={data["Alergias"]} origin={origins?.["Alergias"]} />
        </div>
        
        <div className="sm:col-span-2">
          <SharedField label="Comorbidades" value={data["Comorbidades"]} origin={origins?.["Comorbidades"]} />
        </div>
      </div>
    </div>
  );
}
