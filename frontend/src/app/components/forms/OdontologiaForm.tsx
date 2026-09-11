import React, { useState } from "react";
import { ChevronDown, ChevronUp, CornerUpLeft } from "lucide-react";
import { PatientHeader } from "../PatientHeader";
import { ReusedDataAccordion } from "../ReusedDataAccordion";

export interface OdontologiaFormProps {
  data: Record<string, any>;
  onChange: (key: string, value: any) => void;
  patient: any;
  origins?: Record<string, string>;
  inheritedData?: Record<string, any>;
}

import { InheritableInput, InheritableSelect, InheritableTextarea, InheritableRadioPills, InheritableCheckboxGroup, InheritableRadioGroup } from "./shared/InheritableFormComponents";
import { ConditionalField } from "./shared/ConditionalField";

const SectionCard = ({ title, children, defaultOpen = true }: any) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-[#D5E6F3] shadow-sm mb-4">
      <div 
        className="p-5 flex justify-between items-center cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="font-bold text-[#1A2332] text-sm" style={{ fontFamily: "'Nunito', sans-serif" }}>
          {title}
        </h3>
        {isOpen ? <ChevronUp size={20} className="text-[#8A9EB9]" /> : <ChevronDown size={20} className="text-[#8A9EB9]" />}
      </div>
      {isOpen && (
        <div className="px-5 pb-5 pt-0 space-y-5">
          {children}
        </div>
      )}
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

// Removed local Input, TextArea, RadioPills. Leaving RadioGroup local


const YesNoPillGroup = ({ label, name, data, onChange, children, campos = [] }: any) => {
  const options = ["Sim", "Não"];
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
      <label className="text-sm text-[#1A2332] flex-1">{label}</label>
      <div className="flex gap-2 shrink-0">
        {options.map((opt: string) => {
          const isSelected = data?.[name] === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(name, opt)}
              className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
                isSelected
                  ? "bg-[#1B6CA8] text-white border border-[#1B6CA8]"
                  : "bg-white text-[#3A4354] border border-[#D5E6F3] hover:border-[#1B6CA8] hover:text-[#1B6CA8]"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {children && (
        <ConditionalField
          data={data}
          onChange={onChange}
          showIf={{ campo: name, igual: "Sim" }}
          campos={campos}
          className="w-full sm:w-auto mt-2 sm:mt-0 pl-4 border-l-2 border-[#1B6CA8]/20"
        >
          {children}
        </ConditionalField>
      )}
    </div>
  );
};

const ReadOnlyField = ({ label, value, source }: any) => (
  <div className="flex justify-between items-start mb-4 border-b border-[#E8F4FD] pb-4">
    <div>
      <label className="block text-xs font-bold text-[#8A9EB9] uppercase mb-1">{label}</label>
      <div className="text-sm font-bold text-[#1A2332]">{value || "-"}</div>
    </div>
    {source && (
      <div className="flex items-center gap-1 px-2 py-1 rounded-full border border-[#B3E5D1] text-[#008A5E] bg-[#F2FBF7] text-xs font-medium">
        <CornerUpLeft size={14} /> {source}
      </div>
    )}
  </div>
);

export function OdontologiaForm({ data, onChange, patient, inheritedData, origins }: OdontologiaFormProps) {
  const commonProps = { data, onChange, inheritedData, origins };
  return (
    <div className="space-y-6">
      <PatientHeader 
        id="CAO-2024-0002"
        name={patient?.name || ""}
        age={patient?.age}
        diagnosis={patient?.diagnosis}
        cid={patient?.cid}
        specialty="Odontologia"
        status="Pendente"
        alerts={patient?.alerts}
      />

      <ReusedDataAccordion
        title="Identificação (reaproveitada)"
        fields={[
          { label: "NOME", value: patient?.name || "", origin: "Cadastro" },
          { label: "DIAGNÓSTICO", value: patient?.diagnosis || "", origin: "Recepção" },
          { label: "CID", value: patient?.cid || "", origin: "Recepção" },
          { label: "TELEFONE", value: patient?.phone || "", origin: "Cadastro" },
        ]}
        data={data}
        onChange={onChange}
      >
        <p className="text-xs text-[#6B7A8D] mt-2">
          Departamento de Odontologia / Unidade de Saúde Bucal — Ficha Clínica
        </p>
      </ReusedDataAccordion>

      {/* 1. Identificação do Paciente */}
      <SectionCard title="Dados Cadastrais Complementares" defaultOpen={false}>
        <InheritableInput inheritedData={inheritedData} origins={origins} label="Data de Nascimento" name="Data de Nascimento" type="date" data={data} onChange={onChange} />
        <RadioGroup label="Gênero" name="Gênero" options={[{ label: "Masculino", value: "M" }, { label: "Feminino", value: "F" }]} data={data} onChange={onChange} />
        <InheritableInput inheritedData={inheritedData} origins={origins} label="RG e Expedição" name="RG e Expedição" data={data} onChange={onChange} />
        <InheritableInput inheritedData={inheritedData} origins={origins} label="Nacionalidade" name="Nacionalidade" data={data} onChange={onChange} />
        <InheritableInput inheritedData={inheritedData} origins={origins} label="Naturalidade" name="Naturalidade" data={data} onChange={onChange} />
        <div className="sm:col-span-2 grid sm:grid-cols-2 gap-4">
          <InheritableInput inheritedData={inheritedData} origins={origins} label="Filiação (Pai)" name="Filiação Pai" data={data} onChange={onChange} />
          <InheritableInput inheritedData={inheritedData} origins={origins} label="Filiação (Mãe)" name="Filiação Mãe" data={data} onChange={onChange} />
        </div>
        <InheritableInput inheritedData={inheritedData} origins={origins} label="Responsável Legal" name="Responsável Legal" data={data} onChange={onChange} />
        <InheritableInput inheritedData={inheritedData} origins={origins} label="Telefones de contato" name="Telefones de contato" data={data} onChange={onChange} />
        <div className="sm:col-span-2 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-[#F4F7FB] p-4 rounded-xl border border-[#E8F4FD]">
          <div className="sm:col-span-2">
            <InheritableInput inheritedData={inheritedData} origins={origins} label="Endereço (Rua)" name="Endereço Rua" data={data} onChange={onChange} />
          </div>
          <InheritableInput inheritedData={inheritedData} origins={origins} label="Bairro" name="Bairro" data={data} onChange={onChange} />
          <InheritableInput inheritedData={inheritedData} origins={origins} label="Cidade - UF" name="Cidade - UF" data={data} onChange={onChange} />
          <InheritableInput inheritedData={inheritedData} origins={origins} label="CEP" name="CEP" data={data} onChange={onChange} />
        </div>
        <InheritableInput inheritedData={inheritedData} origins={origins} label="Ocupação" name="Profissão" data={data} onChange={onChange} />
      </SectionCard>

      {/* 2. Anamnese */}
      <SectionCard title="Anamnese">
        <div className="space-y-4">
          <InheritableTextarea inheritedData={inheritedData} origins={origins} label="1. Queixa principal" name="Queixa Principal" data={data} onChange={onChange} />
          <InheritableTextarea inheritedData={inheritedData} origins={origins} label="2. História da doença atual" name="História da Doença Atual" data={data} onChange={onChange} />
          <InheritableTextarea inheritedData={inheritedData} origins={origins} label="3. Antecedentes familiares" name="Antecedentes Familiares" data={data} onChange={onChange} />
        </div>
      </SectionCard>

      {/* 3. Questionário de Saúde */}
      <SectionCard title="Questionário de saúde" defaultOpen={false}>
        <div className="text-sm text-[#8A9EB9] mb-4">Responda Sim ou Não para cada item:</div>
        
        <div className="space-y-1">
          <YesNoPillGroup label="Está sob tratamento médico?" name="qs_tratamento_medico" data={data} onChange={onChange} />
          <YesNoPillGroup label="Está tomando algum medicamento?" name="qs_tomando_medicamento" data={data} onChange={onChange} />
          <YesNoPillGroup label="Já apresentou alguma reação à penicilina?" name="qs_reacao_penicilina" data={data} onChange={onChange} />
          <YesNoPillGroup label="Tem história de alergia?" name="qs_alergia" data={data} onChange={onChange} />
          <YesNoPillGroup label="Tem ou teve problemas respiratórios?" name="qs_problemas_respiratorios" data={data} onChange={onChange} />
          <YesNoPillGroup label="Tem ou teve doença articular / artrite / febre reumática?" name="qs_doenca_articular" data={data} onChange={onChange} />
          <YesNoPillGroup label="Tem ou teve distúrbio sanguíneo / anemia / hemorragia / leucemia?" name="qs_disturbio_sanguineo" data={data} onChange={onChange} />
          <YesNoPillGroup label="Tem diabetes?" name="qs_diabetes" data={data} onChange={onChange} />
          <YesNoPillGroup label="Tem dores de cabeça frequentemente?" name="qs_dores_cabeca" data={data} onChange={onChange} />
          <YesNoPillGroup label="Tem ou teve doença cardiovascular / hipertensão / infarto?" name="qs_doenca_cardiovascular" data={data} onChange={onChange} />
          <YesNoPillGroup label="Tem ou teve hepatite A, B ou C?" name="qs_hepatite" data={data} onChange={onChange} />
          <YesNoPillGroup label="Tomou vacina contra hepatite B?" name="qs_vacina_hepatite_b" data={data} onChange={onChange} />
          <YesNoPillGroup label="Algum problema renal?" name="qs_problema_renal" data={data} onChange={onChange} />
          <YesNoPillGroup label="Algum problema hepático?" name="qs_problema_hepatico" data={data} onChange={onChange} />
          <YesNoPillGroup label="Já recebeu transfusão de sangue?" name="qs_transfusao_sangue" data={data} onChange={onChange} />
          <YesNoPillGroup label="Está grávida?" name="qs_gravida" data={data} onChange={onChange} campos={["qs_gravida_periodo"]}>
             <InheritableInput inheritedData={inheritedData} origins={origins} label="Em qual período?" name="qs_gravida_periodo" placeholder="Ex: 3º Mês, 12 semanas..." data={data} onChange={onChange} />
          </YesNoPillGroup>
        </div>
      </SectionCard>

      {/* 4. Pressão arterial, hábitos e observações */}
      <SectionCard title="Pressão arterial, hábitos e observações" defaultOpen={false}>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <InheritableInput inheritedData={inheritedData} origins={origins} label="PA sistólica (mmHg)" name="pa_sistolica" placeholder="Ex.: 120" data={data} onChange={onChange} />
          <InheritableInput inheritedData={inheritedData} origins={origins} label="PA diastólica (mmHg)" name="pa_diastolica" placeholder="Ex.: 80" data={data} onChange={onChange} />
        </div>

        <ReadOnlyField 
          label="ALERGIAS (REGISTRADAS POR ENFERMAGEM)" 
          value={data?.Alergia === "Sim" ? `Sim - ${data?.['Reação alergica'] || ''}` : data?.Alergia || "—"}
          source="Enfermagem" 
        />
        
        <ReadOnlyField
          label="MEDICAMENTOS"
          value={data?.medicacoes}
          source="Enfermagem"
        />

        <div className="space-y-4 mt-6">
          <div className="mb-4">
            <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Tabagismo" name="tabagismo" options={["Não", "Sim", "Ex-tabagista"]} data={data} onChange={onChange} />
            <ConditionalField
              data={data}
              onChange={onChange}
              showIf={{ OU: [
                { campo: "tabagismo", igual: "Sim" },
                { campo: "tabagismo", igual: "Ex-tabagista" },
              ]}}
              campos={["tabagismo_cigarros", "tabagismo_duracao", "tabagismo_parou"]}
              className="pl-4 border-l-2 border-[#FCD34D] mt-3 flex flex-col md:flex-row gap-4"
            >
              <div className="flex-1">
                <InheritableInput inheritedData={inheritedData} origins={origins} label="Cigarros/dia" name="tabagismo_cigarros" data={data} onChange={onChange} />
              </div>
              <div className="flex-1">
                <InheritableInput inheritedData={inheritedData} origins={origins} label="Duração" name="tabagismo_duracao" data={data} onChange={onChange} />
              </div>
              <ConditionalField data={data} onChange={onChange} showIf={{ campo: "tabagismo", igual: "Ex-tabagista" }} campos={["tabagismo_parou"]} className="flex-1">
                <InheritableInput inheritedData={inheritedData} origins={origins} label="Parou há" name="tabagismo_parou" data={data} onChange={onChange} />
              </ConditionalField>
            </ConditionalField>
          </div>

          <div className="mb-4">
            <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Etilismo" name="etilismo" options={["Não", "Sim", "Ex-etilista"]} data={data} onChange={onChange} />
            <ConditionalField
              data={data}
              onChange={onChange}
              showIf={{ OU: [
                { campo: "etilismo", igual: "Sim" },
                { campo: "etilismo", igual: "Ex-etilista" },
              ]}}
              campos={["etilismo_quantidade", "etilismo_frequencia", "etilismo_duracao", "etilismo_parou"]}
              className="pl-4 border-l-2 border-[#FCD34D] mt-3 flex flex-col md:flex-row gap-4"
            >
              <div className="flex-1">
                <InheritableInput inheritedData={inheritedData} origins={origins} label="Quantidade" name="etilismo_quantidade" data={data} onChange={onChange} />
              </div>
              <div className="flex-1">
                <InheritableInput inheritedData={inheritedData} origins={origins} label="Frequência" name="etilismo_frequencia" data={data} onChange={onChange} />
              </div>
              <div className="flex-1">
                <InheritableInput inheritedData={inheritedData} origins={origins} label="Duração" name="etilismo_duracao" data={data} onChange={onChange} />
              </div>
              <ConditionalField data={data} onChange={onChange} showIf={{ campo: "etilismo", igual: "Ex-etilista" }} campos={["etilismo_parou"]} className="flex-1">
                <InheritableInput inheritedData={inheritedData} origins={origins} label="Parou há" name="etilismo_parou" data={data} onChange={onChange} />
              </ConditionalField>
            </ConditionalField>
          </div>

          <InheritableInput inheritedData={inheritedData} origins={origins} label="Outros hábitos" name="habitos_outros" data={data} onChange={onChange} />
        </div>
      </SectionCard>
    </div>
  );
}
