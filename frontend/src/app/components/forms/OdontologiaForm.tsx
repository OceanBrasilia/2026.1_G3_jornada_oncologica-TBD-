import React, { useState } from "react";
import { User, Activity, FileText, HeartPulse, Plus, Trash2 } from "lucide-react";
import { ComorbiditiesField } from "./shared/ComorbiditiesField";
import { HabitsField } from "./shared/HabitsField";

export interface OdontologiaFormProps {
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
      <div className="flex gap-4">
        {options.map((opt: any) => (
          <label key={opt.value} className="flex items-center gap-2 text-sm text-[#1A2332] cursor-pointer">
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={(data?.[name] || "") === opt.value}
              onChange={handleChange}
              className="accent-[#1B6CA8] w-4 h-4"
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  );
};

const Select = ({ label, name, options, data, onChange }: any) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.name, e.target.value);
  };
  return (
    <div>
      <label className="block text-xs font-bold text-[#1A2332] mb-1">{label}</label>
      <select
        name={name}
        value={data?.[name] ?? ""}
        onChange={handleChange}
        className="w-full px-3 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition"
      >
        <option value="">Selecione...</option>
        {options.map((opt: any) => (
          <option key={opt.value || opt} value={opt.value || opt}>
            {opt.label || opt}
          </option>
        ))}
      </select>
    </div>
  );
};

const YesNoQuestion = ({ label, name, data, onChange, children }: any) => {
  return (
    <div className="flex flex-col gap-2 py-2 border-b border-[#E8F4FD] last:border-0 sm:col-span-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-[#1A2332] flex-1 pr-4">{label}</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-1.5 text-sm cursor-pointer">
            <input
              type="radio"
              name={name}
              value="Sim"
              checked={(data?.[name]) === "Sim"}
              onChange={(e) => onChange(name, e.target.value)}
              className="accent-[#1B6CA8] w-4 h-4"
            /> Sim
          </label>
          <label className="flex items-center gap-1.5 text-sm cursor-pointer">
            <input
              type="radio"
              name={name}
              value="Não"
              checked={(data?.[name] || "Não") === "Não"}
              onChange={(e) => onChange(name, e.target.value)}
              className="accent-[#1B6CA8] w-4 h-4"
            /> Não
          </label>
        </div>
      </div>
      {(data?.[name]) === "Sim" && children && (
        <div className="mt-2 pl-4 border-l-2 border-[#1B6CA8]/20">
          {children}
        </div>
      )}
    </div>
  );
};

export function OdontologiaForm({ data, onChange, patient, origins }: OdontologiaFormProps) {
  
  const handleBloodPressureAdd = () => {
    const current = Array.isArray(data["Pressões arteriais"]) ? data["Pressões arteriais"] : [];
    onChange("Pressões arteriais", [...current, ""]);
  };

  const handleBloodPressureChange = (index: number, value: string) => {
    const current = Array.isArray(data["Pressões arteriais"]) ? [...data["Pressões arteriais"]] : [];
    current[index] = value;
    onChange("Pressões arteriais", current);
  };

  const handleBloodPressureRemove = (index: number) => {
    const current = Array.isArray(data["Pressões arteriais"]) ? [...data["Pressões arteriais"]] : [];
    current.splice(index, 1);
    onChange("Pressões arteriais", current);
  };

  const bps = Array.isArray(data["Pressões arteriais"]) ? data["Pressões arteriais"] : (data["Pressões arteriais"] ? [data["Pressões arteriais"]] : []);

  return (
    <div>
      {/* 1. Identificação do Paciente */}
      <Card title="Identificação do Paciente" icon={User}>
        <Input label="Número do Prontuário" name="Número do Prontuário" data={data} onChange={onChange} value={data["Número do Prontuário"] || patient?.id} />
        <Input label="Nome" name="Nome" data={data} onChange={onChange} value={data["Nome"] || patient?.name} />
        <Input label="Data de Nascimento" name="Data de Nascimento" type="date" data={data} onChange={onChange} />
        <RadioGroup label="Gênero" name="Gênero" options={[{ label: "Masculino", value: "M" }, { label: "Feminino", value: "F" }]} data={data} onChange={onChange} />
        <Input label="RG e Expedição" name="RG e Expedição" data={data} onChange={onChange} />
        <Input label="Nacionalidade" name="Nacionalidade" data={data} onChange={onChange} />
        <Input label="Naturalidade" name="Naturalidade" data={data} onChange={onChange} />
        <div className="sm:col-span-2 grid sm:grid-cols-2 gap-4">
          <Input label="Filiação (Pai)" name="Filiação Pai" data={data} onChange={onChange} />
          <Input label="Filiação (Mãe)" name="Filiação Mãe" data={data} onChange={onChange} />
        </div>
        <Input label="Responsável Legal" name="Responsável Legal" data={data} onChange={onChange} />
        <Input label="Telefones de contato" name="Telefones de contato" data={data} onChange={onChange} value={data["Telefones de contato"] || patient?.phone} />
        <div className="sm:col-span-2 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-[#F4F7FB] p-4 rounded-xl border border-[#E8F4FD]">
          <div className="sm:col-span-2">
            <Input label="Endereço (Rua)" name="Endereço Rua" data={data} onChange={onChange} />
          </div>
          <Input label="Bairro" name="Bairro" data={data} onChange={onChange} />
          <Input label="Cidade - UF" name="Cidade - UF" data={data} onChange={onChange} />
          <Input label="CEP" name="CEP" data={data} onChange={onChange} />
        </div>
        <Input label="Ocupação" name="Ocupação" data={data} onChange={onChange} />
      </Card>

      {/* 2. Anamnese e Exame Físico */}
      <Card title="Anamnese e Exame Físico" icon={Activity}>
        <TextArea label="Queixa Principal" name="Queixa Principal" data={data} onChange={onChange} />
        <TextArea label="História da Doença Atual" name="História da Doença Atual" data={data} onChange={onChange} />
        <TextArea label="Antecedentes Familiares" name="Antecedentes Familiares" data={data} onChange={onChange} />
      </Card>

      {/* 3. Questionário de Saúde */}
      <Card title="Questionário de Saúde" icon={FileText}>
        <div className="sm:col-span-2 mb-4">
          <Input label="Datas das Atualizações" name="Datas das Atualizações" placeholder="Ex: 10/10/2023, 15/02/2024" data={data} onChange={onChange} />
        </div>

        <div className="sm:col-span-2 mb-4">
          <ComorbiditiesField data={data} origins={origins} onChange={onChange} />
        </div>
        
        <YesNoQuestion label="Está sob tratamento médico?" name="qs_tratamento_medico" data={data} onChange={onChange} />
        <YesNoQuestion label="Está tomando algum medicamento?" name="qs_tomando_medicamento" data={data} onChange={onChange} />
        <YesNoQuestion label="Já apresentou alguma reação à penicilina?" name="qs_reacao_penicilina" data={data} onChange={onChange} />
        <YesNoQuestion label="Tem história de alergia?" name="qs_alergia" data={data} onChange={onChange} />
        <YesNoQuestion label="Tem ou teve problemas respiratórios?" name="qs_problemas_respiratorios" data={data} onChange={onChange} />
        <YesNoQuestion label="Tem ou teve doença articular? (Artrite, febre reumática)" name="qs_doenca_articular" data={data} onChange={onChange} />
        <YesNoQuestion label="Tem ou teve distúrbio sanguíneo? (Anemia, hemorragia, leucemia)" name="qs_disturbio_sanguineo" data={data} onChange={onChange} />
        <YesNoQuestion label="Tem dores de cabeça frequentemente?" name="qs_dores_cabeca" data={data} onChange={onChange} />
        <YesNoQuestion label="Tem ou teve hepatite A, B ou C?" name="qs_hepatite" data={data} onChange={onChange} />
        <YesNoQuestion label="Tomou vacina contra hepatite B?" name="qs_vacina_hepatite_b" data={data} onChange={onChange} />
        
        <YesNoQuestion label="Está grávida?" name="qs_gravida" data={data} onChange={onChange}>
           <Input label="Em qual período?" name="qs_gravida_periodo" placeholder="Ex: 3º Mês, 12 semanas..." data={data} onChange={onChange} />
        </YesNoQuestion>
        
        <YesNoQuestion label="Algum problema renal (nos rins)?" name="qs_problema_renal" data={data} onChange={onChange} />
        <YesNoQuestion label="Algum problema hepático (no fígado)?" name="qs_problema_hepatico" data={data} onChange={onChange} />
        <YesNoQuestion label="Já recebeu transfusão de sangue?" name="qs_transfusao_sangue" data={data} onChange={onChange} />

      </Card>

      {/* 4. Sinais Vitais e Hábitos */}
      <Card title="Sinais Vitais e Hábitos" icon={HeartPulse}>
        
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-[#1A2332] mb-2">Pressão Arterial</label>
          <div className="space-y-2">
            {bps.map((bp: string, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={bp}
                    onChange={(e) => handleBloodPressureChange(i, e.target.value)}
                    placeholder="Ex: 120/80"
                    className="w-full pl-3 pr-16 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 transition"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-[#9AAABB] font-medium">mmHg</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleBloodPressureRemove(i)}
                  className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleBloodPressureAdd}
              className="flex items-center gap-1.5 text-sm text-[#1B6CA8] font-bold py-1 hover:underline"
            >
              <Plus size={16} /> Adicionar medição
            </button>
          </div>
        </div>
        <div className="sm:col-span-2 mt-4">
          <HabitsField data={data} origins={origins} onChange={onChange} />
        </div>

      </Card>
    </div>
  );
}
