import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Activity, FileText, HeartPulse, Search, ClipboardList } from "lucide-react";
import { PatientHeader } from "../PatientHeader";
import { ReusedDataAccordion } from "../ReusedDataAccordion";
import {
  InheritableInput,
  InheritableSelect,
  InheritableTextarea,
  InheritableRadioPills,
  InheritableCheckboxGroup,
} from "./shared/InheritableFormComponents";
import { ConditionalField } from "./shared/ConditionalField";

export interface MedicinaFormProps {
  data: Record<string, string>;
  onChange: (key: string, value: string) => void;
  patient: any;
  origins?: Record<string, string>;
  inheritedData?: Record<string, any>;
}

export const MEDICINA_ECOG_OPCOES = ["0", "1", "2", "3", "4"];
export const MEDICINA_ESTADIAMENTO_OPCOES = ["I", "II", "III", "IV", "Não se aplica"];
export const MEDICINA_INVESTIMENTO_OPCOES = ["Pleno", "Proporcional", "Medidas de conforto"];
export const MEDICINA_MENOPAUSA_OPCOES = ["Não", "Sim"];
export const MEDICINA_ATIVIDADE_FISICA_OPCOES = ["Não", "Sim"];

const SectionAccordion = ({ title, icon: Icon, children, defaultOpen = true }: any) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-[rgba(27,108,168,0.1)] shadow-sm mb-4">
      <div 
        className="p-5 flex justify-between items-center cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        <h3 className="font-bold text-[#1A2332] text-sm flex items-center gap-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
          {Icon && <Icon size={16} className="text-[#1B6CA8]" />} {title}
        </h3>
        {isOpen ? <ChevronUp size={20} className="text-[#8A9EB9]" /> : <ChevronDown size={20} className="text-[#8A9EB9]" />}
      </div>
      {isOpen && (
        <div className="px-5 pb-5 pt-0 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
};

export function MedicinaForm({ data, onChange, patient, inheritedData, origins }: MedicinaFormProps) {
  return (
    <div>
      <PatientHeader 
        id={patient?.id}
        name={patient?.name || ""}
        age={patient?.age}
        diagnosis={patient?.diagnosis}
        cid={patient?.cid}
        specialty="Medicina"
        status="Pendente"
        alerts={patient?.alerts}
      />

      <ReusedDataAccordion
        title="ID — Dados da jornada (reaproveitados)"
        fields={[
          { label: "NOME COMPLETO", value: patient?.name, origin: "Cadastro" },
          { label: "DIAGNÓSTICO ONCOLÓGICO", value: patient?.diagnosis, origin: "Recepção" },
          { label: "CID", value: patient?.cid, origin: "Recepção" },
          { label: "ALERGIAS", value: data?.Alergia === "Sim" ? `Sim - ${data?.['Reação alergica'] || ''}` : data?.Alergia || "", origin: "Enfermagem" },
          { label: "MEDICAMENTOS EM USO", value: data?.medicacoes || "", origin: "Enfermagem" },
        ]}
        data={data}
        onChange={onChange}
      />

      {/* Diagnóstico oncológico */}
      <SectionAccordion title="Diagnóstico oncológico" icon={Activity}>
        <InheritableTextarea inheritedData={inheritedData} origins={origins} label="Diagnóstico:" name="Diagnóstico" rows={2} data={data} onChange={onChange} />
        <InheritableSelect inheritedData={inheritedData} origins={origins} label="Estadiamento:" name="Estadiamento" options={MEDICINA_ESTADIAMENTO_OPCOES} data={data} onChange={onChange} />
        <InheritableTextarea inheritedData={inheritedData} origins={origins} label="Tipo histológico:" name="Tipo histológico" rows={2} data={data} onChange={onChange} />
      </SectionAccordion>

      {/* 1. Antecedentes (incluindo Histórico Gestacional) */}
      <SectionAccordion title="Antecedentes" icon={FileText}>
        <InheritableCheckboxGroup inheritedData={inheritedData} origins={origins} label="Comorbidades (Doenças prévias):" name="Comorbidades" options={["Diabetes Mellitus (DM)", "Hipertensão Arterial Sistêmica (HAS)", "Cardiopatia", "DPOC", "Outras"]} data={data} onChange={onChange} />

        <ConditionalField data={data} onChange={onChange} showIf={{ campo: "Comorbidades", "contém": "Outras" }} campos={["Outras doenças"]} className="pl-4 border-l-2 border-[#D5E6F3] ml-2 mt-2">
          <InheritableTextarea inheritedData={inheritedData} origins={origins} label="Outras doenças / comorbidades" name="Outras doenças" rows={2} data={data} onChange={onChange} />
        </ConditionalField>

        <InheritableTextarea inheritedData={inheritedData} origins={origins} label="MUC:" name="MUC" data={data} onChange={onChange} />

        <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Alergias:" name="Alergia" options={["Nega", "Sim"]} data={data} onChange={onChange} />

        <ConditionalField
          data={{ ...data, "Alergia": data?.["Alergia"] ?? inheritedData?.["Alergia"] }}
          onChange={onChange}
          showIf={{ campo: "Alergia", igual: "Sim" }}
          campos={["Reação alergica"]}
          className="pl-4 border-l-2 border-[#D5E6F3] ml-2 mt-4"
        >
          <InheritableInput inheritedData={inheritedData} origins={origins} label="A que e qual a reação?" name="Reação alergica" data={data} onChange={onChange} />
        </ConditionalField>

        <InheritableTextarea inheritedData={inheritedData} origins={origins} label="História familiar:" name="História familiar oncológica" rows={2} data={data} onChange={onChange} />

        {/* Histórico Gestacional dentro de Antecedentes */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-4 mt-4">
          <h4 className="font-bold text-xs uppercase tracking-wider text-[#1A2332]">
            Histórico Gestacional
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InheritableInput
              inheritedData={inheritedData}
              origins={origins}
              label="Gestação (G)"
              name="Gestação"
              placeholder="Nº de gestações"
              data={data}
              onChange={onChange}
            />
            <InheritableInput
              inheritedData={inheritedData}
              origins={origins}
              label="Parto (P)"
              name="Parto"
              placeholder="Nº de partos"
              data={data}
              onChange={onChange}
            />
            <InheritableInput
              inheritedData={inheritedData}
              origins={origins}
              label="Aborto (A)"
              name="Aborto"
              placeholder="Nº de abortos"
              data={data}
              onChange={onChange}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InheritableInput
              inheritedData={inheritedData}
              origins={origins}
              type="date"
              label="DUM (Data da Última Menstruação)"
              name="DUM"
              data={data}
              onChange={onChange}
            />
            <InheritableRadioPills
              inheritedData={inheritedData}
              origins={origins}
              label="Menopausa"
              name="Menopausa"
              options={MEDICINA_MENOPAUSA_OPCOES}
              data={data}
              onChange={onChange}
            />
          </div>
        </div>
      </SectionAccordion>

      {/* 2. Hábitos (incluindo Atividade Física) */}
      <SectionAccordion title="Hábitos" icon={Activity}>
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

        <div className="mb-2">
          <InheritableRadioPills
            inheritedData={inheritedData}
            origins={origins}
            label="Atividade física"
            name="Atividade física"
            options={MEDICINA_ATIVIDADE_FISICA_OPCOES}
            data={data}
            onChange={onChange}
          />
        </div>
      </SectionAccordion>

      {/* 3. História oncológica (antes de Tratamento atual) */}
      <SectionAccordion title="História oncológica" icon={Activity}>
        <InheritableTextarea inheritedData={inheritedData} origins={origins} label="História oncológica:" name="História oncológica" placeholder="Descreva a evolução da doença..." data={data} onChange={onChange} />
      </SectionAccordion>

      {/* 4. Tratamento atual */}
      <SectionAccordion title="Tratamento atual" icon={Activity}>
        <InheritableTextarea inheritedData={inheritedData} origins={origins} label="Tratamento atual:" name="Tratamento em curso" placeholder="Descreva o tratamento atual..." data={data} onChange={onChange} />
      </SectionAccordion>

      {/* Situação clínica atual */}
      <SectionAccordion title="Atual" icon={HeartPulse}>
        <InheritableTextarea inheritedData={inheritedData} origins={origins} label="Atual:" name="Situação atual" placeholder="Quadro clínico atual..." data={data} onChange={onChange} />
      </SectionAccordion>

      {/* 5. Exame físico (ECOG, Peso, Altura, ACV, AR, ABD, MMII) */}
      <SectionAccordion title="Exame físico" icon={HeartPulse}>
        <div className="space-y-4">
          <InheritableRadioPills
            inheritedData={inheritedData}
            origins={origins}
            label="ECOG / Performance"
            name="ECOG / Performance"
            options={MEDICINA_ECOG_OPCOES}
            subLabel="0: Totalmente ativo | 1: Sintomático/deambula | 2: No leito <50% | 3: No leito >50% | 4: Totalmente dependente"
            data={data}
            onChange={onChange}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InheritableInput
              inheritedData={inheritedData}
              origins={origins}
              label="Peso (kg)"
              name="peso"
              placeholder="Ex.: 68"
              data={data}
              onChange={onChange}
            />
            <InheritableInput
              inheritedData={inheritedData}
              origins={origins}
              label="Altura (m)"
              name="altura"
              placeholder="Ex.: 1,63"
              data={data}
              onChange={onChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InheritableInput inheritedData={inheritedData} origins={origins} label="ACV" name="ACV" data={data} onChange={onChange} />
            <InheritableInput inheritedData={inheritedData} origins={origins} label="AR" name="AR" data={data} onChange={onChange} />
            <InheritableInput inheritedData={inheritedData} origins={origins} label="ABD" name="ABD" data={data} onChange={onChange} />
            <InheritableInput inheritedData={inheritedData} origins={origins} label="MMII" name="MMII" data={data} onChange={onChange} />
          </div>
        </div>
      </SectionAccordion>

      {/* Anatomopatológico */}
      <SectionAccordion title="Anatomopatológico" icon={Search}>
        <InheritableTextarea inheritedData={inheritedData} origins={origins} label="Anatomopatológico:" name="Resultado anatomopatológico" data={data} onChange={onChange} />
      </SectionAccordion>

      {/* Exames complementares */}
      <SectionAccordion title="Exames complementares" icon={Search}>
        <InheritableTextarea inheritedData={inheritedData} origins={origins} label="Exames complementares:" name="Exames complementares" data={data} onChange={onChange} />
      </SectionAccordion>

      {/* Impressão e conduta */}
      <SectionAccordion title="Impressão e conduta" icon={ClipboardList}>
        <InheritableTextarea inheritedData={inheritedData} origins={origins} label="Impressão:" name="Impressão diagnóstica" data={data} onChange={onChange} />
        <InheritableTextarea inheritedData={inheritedData} origins={origins} label="Conduta:" name="Conduta" data={data} onChange={onChange} />
        <InheritableSelect inheritedData={inheritedData} origins={origins} label="Investimento:" name="Investimento" options={MEDICINA_INVESTIMENTO_OPCOES} data={data} onChange={onChange} />
      </SectionAccordion>
    </div>
  );
}
