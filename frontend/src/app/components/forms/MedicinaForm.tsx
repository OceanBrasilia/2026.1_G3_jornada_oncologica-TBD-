import React from "react";
import { User, Activity, FileText, HeartPulse, Search, ClipboardList, Clock } from "lucide-react";
import { VitalsField } from "./shared/VitalsField";
import { ComorbiditiesField } from "./shared/ComorbiditiesField";
import { HabitsField } from "./shared/HabitsField";

export interface MedicinaFormProps {
  data: Record<string, string>;
  onChange: (key: string, value: string) => void;
  patient: any;
  origins?: Record<string, string>;
}

const SharedField = ({ label, value }: any) => (
  <div>
    <label className="block text-xs font-bold text-[#1A2332] mb-1">{label}</label>
    <div className="px-3 py-2.5 rounded-xl bg-[#F4F7FB] border border-[#E8F4FD] text-sm text-[#6B7A8D] font-medium min-h-[42px] flex items-center">
      {value || "—"}
    </div>
  </div>
);

const Card = ({ title, icon: Icon, children }: any) => (
  <div className="bg-white rounded-2xl border border-[rgba(27,108,168,0.1)] shadow-sm p-5 mb-5">
    <h3 className="font-bold text-[#1A2332] mb-4 text-sm flex items-center gap-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <Icon size={16} className="text-[#1B6CA8]" /> {title}
    </h3>
    <div className="grid sm:grid-cols-2 gap-4">
      {children}
    </div>
  </div>
);

const Input = ({ label, name, placeholder = "", type = "text", value, from, data, onChange }: any) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.name, e.target.value);
  };
  return (
    <div>
      <label className="block text-xs font-bold text-[#1A2332] mb-1">{label}</label>
      {from ? (
        <div className="relative">
          <input
            type={type}
            name={name}
            value={value ?? data?.[name] ?? ""}
            onChange={handleChange}
            placeholder={placeholder}
            className="w-full pl-3 pr-24 py-2.5 rounded-xl border border-[#2DB5A3]/50 bg-[#F0FBF9] text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#2DB5A3]/30 transition"
          />
          <span className="absolute right-3 top-3 text-[10px] text-[#2DB5A3] font-semibold bg-[#F0FBF9] pl-2 whitespace-nowrap">↩ {from}</span>
        </div>
      ) : (
        <input
          type={type}
          name={name}
          value={value ?? data?.[name] ?? ""}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition"
        />
      )}
    </div>
  );
};

const TextArea = ({ label, name, placeholder = "", rows = 4, value, data, onChange }: any) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.name, e.target.value);
  };
  return (
    <div className="sm:col-span-2">
      <label className="block text-xs font-bold text-[#1A2332] mb-1">{label}</label>
      <textarea
        name={name}
        value={value ?? data?.[name] ?? ""}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition resize-none"
      />
    </div>
  );
};

export function MedicinaForm({ data, origins, onChange, patient }: MedicinaFormProps) {
  return (
    <div>
      {/* 1. Campos e Dados Compartilhados (Identificação e Biometria) */}
      <Card title="Campos e Dados Compartilhados (Identificação e Biometria)" icon={User}>
        <SharedField label="Nome Completo" value={patient?.name} />
        <SharedField label="Telefone" value={patient?.phone} />
        <SharedField label="Diagnóstico" value={patient?.diagnosis} />
        <SharedField label="CID" value={patient?.cid} />
        <div className="sm:col-span-2">
          <VitalsField data={data} patient={patient} origins={origins} onChange={onChange} />
        </div>
      </Card>

      {/* 2. Avaliação Oncológica */}
      <Card title="Avaliação Oncológica" icon={Activity}>
        <div className="sm:col-span-2">
          <Input label="Diagnóstico oncológico" name="Diagnóstico oncológico" data={data} onChange={onChange} />
        </div>
        <TextArea label="História oncológica" name="História oncológica" data={data} onChange={onChange} />
        <TextArea label="Tratamento atual" name="Tratamento atual" data={data} onChange={onChange} />
      </Card>

      {/* 3. Antecedentes */}
      <Card title="Antecedentes" icon={FileText}>
        <div className="sm:col-span-2">
          <ComorbiditiesField data={data} origins={origins} onChange={onChange} />
        </div>
        <div className="sm:col-span-2">
          <HabitsField data={data} origins={origins} onChange={onChange} />
        </div>
        <Input label="Medicações de Uso Contínuo" name="medicacoes" from={origins?.["medicacoes"]} data={data} onChange={onChange} />
        <Input label="Alergias" name="alergias" from={origins?.["alergias"]} data={data} onChange={onChange} />
        <Input label="História familiar" name="História familiar" data={data} onChange={onChange} />
      </Card>

      {/* 4. Situação Atual e Exame Físico */}
      <Card title="Situação Atual e Exame Físico" icon={HeartPulse}>
        <TextArea label="Atual" name="Atual" data={data} onChange={onChange} />
        <TextArea label="Exame físico" name="Exame físico" data={data} onChange={onChange} />
        <Input label="ACV" name="ACV" data={data} onChange={onChange} />
        <Input label="AR" name="AR" data={data} onChange={onChange} />
        <Input label="ABD" name="ABD" data={data} onChange={onChange} />
        <Input label="MMII" name="MMII" data={data} onChange={onChange} />
      </Card>

      {/* 5. Investigação e Diagnóstico */}
      <Card title="Investigação e Diagnóstico" icon={Search}>
        <TextArea label="Anatomopatológico" name="Anatomopatológico" data={data} onChange={onChange} />
        <TextArea label="Exames complementares" name="Exames complementares" data={data} onChange={onChange} />
        <TextArea label="Impressão" name="Impressão" data={data} onChange={onChange} />
      </Card>

      {/* 6. Planejamento Terapêutico */}
      <Card title="Planejamento Terapêutico" icon={ClipboardList}>
        <TextArea label="Conduta" name="Conduta" value={data["Conduta"] ?? data["Conduta proposta"] ?? ""} data={data} onChange={onChange} />
        <Input label="Investimento" name="Investimento" data={data} onChange={onChange} />
      </Card>

    </div>
  );
}
