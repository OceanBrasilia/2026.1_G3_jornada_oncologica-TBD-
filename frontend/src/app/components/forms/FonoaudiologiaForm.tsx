import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { PatientHeader } from "../PatientHeader";
import { ReusedDataAccordion } from "../ReusedDataAccordion";

export interface FonoaudiologiaFormProps {
  data: Record<string, any>;
  onChange: (key: string, value: any) => void;
  patient: any;
  origins?: Record<string, string>;
  inheritedData?: Record<string, any>;
}

import { InheritableInput, InheritableSelect, InheritableTextarea, InheritableRadioPills, InheritableCheckboxGroup } from "./shared/InheritableFormComponents";
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

// Removed local components, using shared Inheritable components



const OriginField = ({ label, value, origin }: { label: string, value: string, origin: string }) => {
  return (
    <div className="bg-white rounded-xl border border-[#D5E6F3] p-4 flex justify-between items-start">
      <div>
        <label className="block text-[10px] uppercase font-bold text-[#8A9EB9] tracking-wider mb-1">
          {label}
        </label>
        <div className="text-sm text-[#1A2332] font-semibold">
          {value || "Não informado"}
        </div>
      </div>
      <div className="bg-[#E8F3FA] text-[#1B6CA8] text-xs px-2 py-1 rounded-md flex items-center gap-1 font-medium whitespace-nowrap">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
        {origin}
      </div>
    </div>
  );
};

export function FonoaudiologiaForm({ data, onChange, patient, inheritedData, origins }: FonoaudiologiaFormProps) {

  return (
    <div className="space-y-6">
      <PatientHeader 
        id="CAO-2024-0005"
        name={patient?.name || ""}
        age={patient?.age}
        diagnosis={patient?.diagnosis}
        cid={patient?.cid}
        specialty="Fonoaudiologia"
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

      <SectionCard title="Avaliação fonoaudiológica">
        <InheritableTextarea inheritedData={inheritedData} origins={origins} 
          label="Queixa principal" 
          name="queixaPrincipal" 
          data={data} 
          onChange={onChange} 
        />
        <InheritableInput inheritedData={inheritedData} origins={origins} 
          label="Topografia e CID (ajustar se necessário)" 
          name="topografiaCid" 
          data={data} 
          onChange={onChange} 
          placeholder="Ex: C16.9 — Câncer Gástrico"
        />
        <InheritableInput inheritedData={inheritedData} origins={origins} 
          label="Peso ponderal (kg)" 
          name="pesoPonderal" 
          type="number" 
          data={data} 
          onChange={onChange} 
        />
        <InheritableTextarea inheritedData={inheritedData} origins={origins} 
          label="Tratamentos em curso" 
          name="tratamentosEmCurso" 
          data={data} 
          onChange={onChange} 
        />
        <InheritableSelect inheritedData={inheritedData} origins={origins} 
          label="Via alimentar" 
          name="viaAlimentar" 
          options={["Oral", "GTT", "SNE", "NPT"]} 
          hasOther={true}
          data={data} 
          onChange={onChange} 
        />
        <InheritableRadioPills inheritedData={inheritedData} origins={origins} 
          label="Suplementação" 
          name="suplementacao" 
          options={["Sim", "Não"]} 
          data={data} 
          onChange={onChange} 
        />
        <InheritableSelect inheritedData={inheritedData} origins={origins} 
          label="Alteração de apetite?" 
          name="alteracaoApetite" 
          options={["Sim", "Não"]} 
          data={data} 
          onChange={onChange} 
        />
        <InheritableTextarea inheritedData={inheritedData} origins={origins} 
          label="Pneumonia (conforme ficha atual)" 
          name="pneumonia" 
          data={data} 
          onChange={onChange} 
          rows={2}
        />
      </SectionCard>

      <SectionCard title="Sintomas e hábitos">
        <InheritableSelect inheritedData={inheritedData} origins={origins} 
          label="Apresenta azia?" 
          name="apresentaAzia" 
          options={["Sim", "Não"]} 
          data={data} 
          onChange={onChange} 
        />
        <InheritableSelect inheritedData={inheritedData} origins={origins} 
          label="Apresenta refluxo?" 
          name="apresentaRefluxo" 
          options={["Sim", "Não"]} 
          data={data} 
          onChange={onChange} 
        />
        
        <OriginField 
          label="MEDICAMENTOS EM USO" 
          value={data?.medicamentosEmUso || patient?.medicamentosEmUso || "Losartana 50 mg"} 
          origin="Enfermagem" 
        />

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
        <div className="mb-4">
          <InheritableCheckboxGroup inheritedData={inheritedData} origins={origins} label="Comorbidades (Doenças prévias)" name="Comorbidades" options={["Diabetes Mellitus (DM)", "Hipertensão Arterial Sistêmica (HAS)", "Cardiopatia", "DPOC", "Outras"]} data={data} onChange={onChange} />

          <ConditionalField
            data={data}
            onChange={onChange}
            showIf={{ campo: "Comorbidades", "contém": "Outras" }}
            campos={["Outras doenças"]}
            className="pl-4 border-l-2 border-[#D5E6F3] ml-2 mt-3"
          >
            <InheritableTextarea inheritedData={inheritedData} origins={origins} label="Outras doenças / comorbidades" name="Outras doenças" data={data} onChange={onChange} />
          </ConditionalField>
        </div>
        <InheritableTextarea inheritedData={inheritedData} origins={origins} 
          label="Estado Geral de Saúde" 
          name="comorbidadesEstadoGeral" 
          data={data} 
          onChange={onChange} 
        />
      </SectionCard>

      <SectionCard title="Cirurgia e sintomas">
        <InheritableRadioPills inheritedData={inheritedData} origins={origins} 
          label="Fez alguma cirurgia?" 
          name="fezCirurgia" 
          options={["Sim", "Não", "Outro"]} 
          data={data} 
          onChange={onChange} 
        />
        <ConditionalField data={data} onChange={onChange} showIf={{ campo: "fezCirurgia", igual: "Sim" }} campos={["qualCirurgia"]}>
          <InheritableInput inheritedData={inheritedData} origins={origins}
            label="Qual cirurgia e onde foi realizado?"
            name="qualCirurgia"
            data={data}
            onChange={onChange}
          />
        </ConditionalField>
        <ConditionalField data={data} onChange={onChange} showIf={{ campo: "fezCirurgia", igual: "Outro" }} campos={["especifiqueCirurgia"]}>
          <InheritableInput inheritedData={inheritedData} origins={origins}
            label="Especifique"
            name="especifiqueCirurgia"
            data={data}
            onChange={onChange}
          />
        </ConditionalField>

        <InheritableCheckboxGroup inheritedData={inheritedData} origins={origins} 
          label="Apresenta algum desses sintomas? (múltipla seleção)"
          name="sintomasApresentados"
          options={[
            "Náusea",
            "Vômitos",
            "Regurgitação",
            "Vômito de sangue fresco",
            "Vômito de sangue velho",
            "Dor ao engolir",
            "Dor no peito",
            "Outro"
          ]}
          data={data}
          onChange={onChange}
        />
        <ConditionalField data={data} onChange={onChange} showIf={{ campo: "sintomasApresentados", "contém": "Outro" }} campos={["sintomaOutro"]} className="mt-3">
          <InheritableInput inheritedData={inheritedData} origins={origins}
            label="Especifique o sintoma"
            name="sintomaOutro"
            data={data}
            onChange={onChange}
          />
        </ConditionalField>
      </SectionCard>

      <SectionCard title="Encaminhamentos e conduta">
        <InheritableTextarea inheritedData={inheritedData} origins={origins} 
          label="Demanda identificada" 
          name="demandaIdentificada" 
          data={data} 
          onChange={onChange} 
        />
        <InheritableSelect inheritedData={inheritedData} origins={origins} 
          label="Risco de aspiração/penetração" 
          name="riscoAspiracao" 
          options={["Alto", "Médio", "Baixo", "Nenhum"]} 
          hasOther={true}
          data={data} 
          onChange={onChange} 
        />
        <InheritableSelect inheritedData={inheritedData} origins={origins} 
          label="Risco de disfagia" 
          name="riscoDisfagia" 
          options={["Leve", "Moderada", "Grave", "Ausente"]} 
          hasOther={true}
          data={data} 
          onChange={onChange} 
        />
        <InheritableSelect inheritedData={inheritedData} origins={origins} 
          label="Alteração da qualidade vocal" 
          name="alteracaoVocal" 
          options={["Sim", "Não"]} 
          hasOther={true}
          data={data} 
          onChange={onChange} 
        />
        <InheritableSelect inheritedData={inheritedData} origins={origins} 
          label="Encaminhamento" 
          name="encaminhamento" 
          options={["Médico", "Nutrição", "Psicologia", "Fisioterapia", "Serviço Social", "Nenhum"]} 
          hasOther={true}
          data={data} 
          onChange={onChange} 
        />
        <InheritableTextarea inheritedData={inheritedData} origins={origins} 
          label="Observações" 
          name="observacoesFinais" 
          data={data} 
          onChange={onChange} 
        />
      </SectionCard>
    </div>
  );
}

