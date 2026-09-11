import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { PatientHeader } from "../PatientHeader";
import { ReusedDataAccordion } from "../ReusedDataAccordion";

export interface FisioterapiaFormProps {
  data: Record<string, any>;
  onChange: (key: string, value: any) => void;
  patient: any;
  origins?: Record<string, string>;
  inheritedData?: Record<string, any>;
}

import { InheritableInput, InheritableSelect, InheritableRadioPills } from "./shared/InheritableFormComponents";
import { useClinicalConflicts } from "../../hooks/useClinicalConflicts";

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

// Removed local components, using shared Inheritable components

export function FisioterapiaForm({ data, onChange, patient, inheritedData, origins }: FisioterapiaFormProps) {

  const { getFieldStatus, ignoreConflict } = useClinicalConflicts();

  return (
    <div className="space-y-6">
      <PatientHeader 
        id="CAO-2024-0002"
        name={patient?.name || ""}
        age={patient?.age}
        diagnosis={patient?.diagnosis}
        cid={patient?.cid}
        specialty="Fisioterapia"
        status="Pendente"
        alerts={patient?.alerts}
      />

      <ReusedDataAccordion
        title="I - Dados Pessoais (reaproveitados)"
        fields={[
          { label: "NOME COMPLETO", value: patient?.name, origin: "Cadastro" },
          { label: "DIAGNÓSTICO", value: patient?.diagnosis, origin: "Recepção" },
          { label: "CID", value: patient?.cid, origin: "Recepção" },
          { label: "TELEFONE", value: patient?.phone, origin: "Cadastro" },
          { label: "IDADE", value: `${patient?.age || ''} anos`, origin: "Cadastro" },
        ]}
        data={data}
        onChange={onChange}
      />

      <SectionCard title="Tratamento prévio">
        <InheritableSelect inheritedData={inheritedData} origins={origins} 
          label="Tratamento prévio" 
          name="tratamentoPrevio" 
          options={["Cirurgia", "Quimioterapia", "Radioterapia", "Não"]} 
          hasOther={true}
          data={data} 
          onChange={onChange} 
        />

        {data?.tratamentoPrevio === "Cirurgia" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InheritableInput inheritedData={inheritedData} origins={origins} label="Se houve tratamento cirúrgico, qual a data?" name="dataCirurgia" type="date" data={data} onChange={onChange} />
            <InheritableInput inheritedData={inheritedData} origins={origins} label="Qual cirurgia e onde foi realizado?" name="qualCirurgia" data={data} onChange={onChange} />
          </div>
        )}

        <InheritableRadioPills inheritedData={inheritedData} origins={origins} 
          label="Realiza exercício físico?" 
          name="exercicioFisico" 
          options={["Sim", "Não"]} 
          data={data} 
          onChange={onChange} 
        />
        {data?.exercicioFisico === "Sim" && (
          <InheritableInput inheritedData={inheritedData} origins={origins} label="Quais exercícios?" name="quaisExercicios" data={data} onChange={onChange} />
        )}
      </SectionCard>

      <SectionCard title="Avaliação específica">
        <InheritableRadioPills inheritedData={inheritedData} origins={origins} 
          label="Restrição de amplitude de movimento (ADM)" 
          name="restricaoAdm" 
          options={["Sim", "Não", "Outro"]} 
          data={data} 
          onChange={onChange} 
        />
        {data?.restricaoAdm === "Sim" && (
          <InheritableInput inheritedData={inheritedData} origins={origins} label="Local da restrição" name="localRestricao" data={data} onChange={onChange} />
        )}
        {data?.restricaoAdm === "Outro" && (
          <InheritableInput inheritedData={inheritedData} origins={origins} label="Especifique a restrição" name="especifiqueRestricao" data={data} onChange={onChange} />
        )}

        <InheritableRadioPills inheritedData={inheritedData} origins={origins} 
          label="Linfedema" 
          name="linfedema" 
          options={["Sim", "Não", "Outro"]} 
          data={data} 
          onChange={onChange} 
        />
        {data?.linfedema === "Sim" && (
          <InheritableInput inheritedData={inheritedData} origins={origins} label="Local do linfedema" name="localLinfedema" data={data} onChange={onChange} />
        )}
        {data?.linfedema === "Outro" && (
          <InheritableInput inheritedData={inheritedData} origins={origins} label="Especifique o linfedema" name="especifiqueLinfedema" data={data} onChange={onChange} />
        )}

        <InheritableSelect inheritedData={inheritedData} origins={origins} 
          label="Fadiga" 
          name="fadiga" 
          options={["Sim", "Não"]} 
          hasOther={true}
          data={data} 
          onChange={onChange} 
        />

        {data?.fadiga === "Sim" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
            <InheritableSelect inheritedData={inheritedData} origins={origins} 
              label="Em caso de fadiga" 
              name="emCasoDeFadiga" 
              options={["Aos mínimos esforços", "Aos médios esforços", "Aos grandes esforços", "Não se aplica"]} 
              data={data} 
              onChange={onChange} 
            />
            <InheritableInput inheritedData={inheritedData} origins={origins} 
              label="Graduação da Fadiga (ECN 0-10)" 
              name="graduacaoFadiga" 
              type="number" 
              data={data} 
              onChange={onChange} 
            />
          </div>
        )}

        <InheritableSelect inheritedData={inheritedData} origins={origins} 
          label="Incontinência" 
          name="incontinencia" 
          options={["Urinária", "Fecal", "Não", "Não se aplica"]} 
          data={data} 
          onChange={onChange} 
        />
        {(data?.incontinencia === "Urinária" || data?.incontinencia === "Fecal") && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InheritableInput inheritedData={inheritedData} origins={origins} label="Quando foi o início da incontinência?" name="inicioIncontinencia" data={data} onChange={onChange} />
            <InheritableSelect inheritedData={inheritedData} origins={origins} 
              label="Orientações para Incontinência?" 
              name="orientacoesIncontinencia" 
              options={["Sim", "Não", "Não se aplica"]} 
              hasOther={true}
              data={data} 
              onChange={onChange} 
            />
          </div>
        )}

        <InheritableRadioPills inheritedData={inheritedData} origins={origins} 
          label="Câncer de cabeça e pescoço — dificuldade de abertura da boca?" 
          name="dificuldadeAberturaBoca" 
          options={["Sim", "Não", "Não se aplica"]} 
          data={data} 
          onChange={onChange} 
        />

        <InheritableRadioPills inheritedData={inheritedData} origins={origins} 
          label="Demanda para atendimento ambulatorial?" 
          name="demandaAmbulatorial" 
          options={["Sim", "Não", "Outro"]} 
          data={data} 
          onChange={onChange} 
        />
        {data?.demandaAmbulatorial === "Outro" && (
          <InheritableInput inheritedData={inheritedData} origins={origins} label="Especifique a demanda" name="especifiqueDemanda" data={data} onChange={onChange} />
        )}
      </SectionCard>

      <SectionCard title="Demonstração de Conflito Clínico">
        <InheritableInput 
          inheritedData={inheritedData} 
          origins={origins} 
          label="Escala Verbal de Dor (0-10)" 
          name="escala_verbal_dor" 
          type="number"
          data={data} 
          onChange={onChange}
          conflictStatus={{
            ...getFieldStatus('escala_verbal_dor'),
            onIgnore: () => ignoreConflict('escala_verbal_dor')
          }}
        />

      </SectionCard>
    </div>
  );
}

