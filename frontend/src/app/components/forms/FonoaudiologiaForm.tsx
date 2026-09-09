import React from "react";
import { User, Activity, HeartPulse, FileText } from "lucide-react";
import { VitalsField } from "./shared/VitalsField";
import { ComorbiditiesField } from "./shared/ComorbiditiesField";
import { HabitsField } from "./shared/HabitsField";

export interface FonoaudiologiaFormProps {
  data: Record<string, any>;
  onChange: (key: string, value: any) => void;
  patient: any;
  origins?: Record<string, string>;
}

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

const Input = ({ label, name, placeholder = "", type = "text", value, data, onChange }: any) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.name, e.target.value);
  };
  return (
    <div>
      <label className="block text-xs font-bold text-[#1A2332] mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value ?? data?.[name] ?? ""}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition"
      />
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

const RadioGroup = ({ label, name, options, data, onChange }: any) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.name, e.target.value);
  };
  return (
    <div>
      <label className="block text-xs font-bold text-[#1A2332] mb-2">{label}</label>
      <div className="flex flex-wrap gap-4">
        {options.map((opt: any) => (
          <label key={opt.value || opt} className="flex items-center gap-2 text-sm text-[#1A2332] cursor-pointer">
            <input
              type="radio"
              name={name}
              value={opt.value || opt}
              checked={(data?.[name] || "") === (opt.value || opt)}
              onChange={handleChange}
              className="accent-[#1B6CA8] w-4 h-4"
            />
            {opt.label || opt}
          </label>
        ))}
      </div>
    </div>
  );
};

const CheckboxGroup = ({ label, options, selected, onChange }: any) => (
  <div className="sm:col-span-2">
    <label className="block text-xs font-bold text-[#1A2332] mb-2">{label}</label>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {options.map((opt: string) => (
        <label key={opt} className="flex items-center space-x-2 text-sm text-[#1A2332] cursor-pointer">
          <input 
            type="checkbox" 
            checked={(selected || []).includes(opt)} 
            onChange={(e) => {
              const current = selected || [];
              if (e.target.checked) {
                onChange([...current, opt]);
              } else {
                onChange(current.filter((item: string) => item !== opt));
              }
            }}
            className="w-4 h-4 rounded text-[#1B6CA8] focus:ring-[#1B6CA8] accent-[#1B6CA8]"
          />
          <span>{opt}</span>
        </label>
      ))}
    </div>
  </div>
);

export function FonoaudiologiaForm({ data, onChange, patient, origins }: FonoaudiologiaFormProps) {
  const getVal = (key: string, fallbackKey?: string) => {
    if (data[key] !== undefined) return data[key];
    if (fallbackKey && patient[fallbackKey] !== undefined) return patient[fallbackKey];
    return "";
  };

  const handleFieldChange = (key: string, value: any) => {
    onChange(key, value);
  };

  return (
    <div className="space-y-6">
      {/* Bloco 1: Identificação e Dados Básicos */}
      <Card title="Identificação e Dados Básicos" icon={User}>
        <Input label="Data" name="fono_data" type="date" data={data} onChange={handleFieldChange} />
        <Input label="Nome" name="fono_nome" data={data} onChange={handleFieldChange} value={getVal('fono_nome', 'name')} />
        <Input label="Registro" name="fono_registro" data={data} onChange={handleFieldChange} value={getVal('fono_registro', 'id')} />
        <Input label="Data de nascimento" name="fono_data_nascimento" type="date" data={data} onChange={handleFieldChange} />
        <Input label="Idade" name="fono_idade" type="number" data={data} onChange={handleFieldChange} value={getVal('fono_idade', 'age')} />
        <Input label="Profissão" name="fono_profissao" data={data} onChange={handleFieldChange} />
        <Input label="Acompanhante" name="fono_acompanhante" data={data} onChange={handleFieldChange} />
        <Input label="Contato" name="fono_contato" data={data} onChange={handleFieldChange} placeholder="(00) 00000-0000" />
        <div className="sm:col-span-2 mt-4">
          <VitalsField data={data} patient={patient} origins={origins} onChange={onChange} />
        </div>
      </Card>

      {/* Bloco 2: Histórico Clínico e Comorbidades */}
      <Card title="Histórico Clínico e Comorbidades" icon={Activity}>
        <TextArea label="Queixa" name="fono_queixa" data={data} onChange={handleFieldChange} />
        <Input label="Topografia" name="fono_topografia" data={data} onChange={handleFieldChange} />
        <Input label="CID" name="fono_cid" data={data} onChange={handleFieldChange} />
        <div className="sm:col-span-2 my-2">
          <ComorbiditiesField data={data} origins={origins} onChange={onChange} />
        </div>
        <TextArea label="Estado geral de saúde (Observações)" name="fono_estado_geral" data={data} onChange={handleFieldChange} />
        
        <div className="sm:col-span-2">
          <RadioGroup 
            label="Você fez alguma cirurgia?" 
            name="fono_cirurgia" 
            options={["Sim", "Não", "Outro"]} 
            data={data} 
            onChange={handleFieldChange} 
          />
          {data["fono_cirurgia"] === "Outro" && (
            <div className="mt-2 pl-4 border-l-2 border-[#1B6CA8]/20">
              <Input label="Especifique a cirurgia" name="fono_cirurgia_outro" data={data} onChange={handleFieldChange} />
            </div>
          )}
        </div>
        <div className="sm:col-span-2 mt-4">
          <HabitsField data={data} origins={origins} onChange={onChange} />
        </div>
      </Card>

      {/* Bloco 3: Terapêutica e Suporte Nutricional */}
      <Card title="Terapêutica e Suporte Nutricional" icon={HeartPulse}>
        <Input label="Pneumonia?" name="fono_pneumonia" data={data} onChange={handleFieldChange} />
        <Input label="Suplementação" name="fono_suplementacao" data={data} onChange={handleFieldChange} />
        <TextArea label="Tratamentos" name="fono_tratamentos" data={data} onChange={handleFieldChange} />
        <TextArea label="Medicamentos em uso" name="fono_medicamentos" data={data} onChange={handleFieldChange} />
        
        <CheckboxGroup 
          label="Via alimentar"
          options={["Oral", "GTT", "SNE", "NPT"]}
          selected={data["fono_via_alimentar"] || []}
          onChange={(val: any) => handleFieldChange("fono_via_alimentar", val)}
        />
      </Card>

      {/* Bloco 4: Avaliação Fonoaudiológica / Trato Digestivo */}
      <Card title="Avaliação Fonoaudiológica / Trato Digestivo" icon={FileText}>
        <RadioGroup label="Apresenta alteração de apetite?" name="fono_apetite" options={["Sim", "Não"]} data={data} onChange={handleFieldChange} />
        <RadioGroup label="Apresenta azia?" name="fono_azia" options={["Sim", "Não"]} data={data} onChange={handleFieldChange} />
        <RadioGroup label="Apresenta refluxo?" name="fono_refluxo" options={["Sim", "Não"]} data={data} onChange={handleFieldChange} />

        <div className="sm:col-span-2">
          <CheckboxGroup 
            label="Você apresenta algum desses sintomas:"
            options={["Náusea", "Vômitos", "Regurgitação", "Vômito de sangue fresco", "Vômito de sangue velho", "Dor ao engolir", "Dor no peito", "Outro"]}
            selected={data["fono_sintomas"] || []}
            onChange={(val: any) => handleFieldChange("fono_sintomas", val)}
          />
          {(data["fono_sintomas"] || []).includes("Outro") && (
            <div className="mt-2 pl-4 border-l-2 border-[#1B6CA8]/20">
              <Input label="Especifique o sintoma" name="fono_sintomas_outro" data={data} onChange={handleFieldChange} />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
