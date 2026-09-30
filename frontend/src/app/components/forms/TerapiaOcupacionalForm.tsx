import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { PatientHeader } from "../PatientHeader";
import { ReusedDataAccordion } from "../ReusedDataAccordion";

export interface FormProps {
  data: Record<string, any>;
  onChange: (key: string, value: any) => void;
  patient: any;
  origins?: Record<string, string>;
  inheritedData?: Record<string, any>;
}

import { InheritableInput, InheritableSelect, InheritableTextarea, InheritableRadioPills, InheritableCheckboxGroup } from "./shared/InheritableFormComponents";
import { ConditionalField } from "./shared/ConditionalField";
import { mapRendaServicoSocialParaTerapiaOcupacional } from "./shared/rendaMapping";

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

// Removed local RowPillGroup, using InheritableRadioPills instead

// Removed local CheckboxGroup

const PainScale = ({ name, data, onChange, inheritedData, origins }: any) => {
  const inheritedValue = inheritedData?.[name];
  const isSuppressed = data?.[`${name}_suppressed`] === true;
  const isInheritedActive = inheritedValue !== undefined && inheritedValue !== "" && !isSuppressed;
  const origin = origins?.[name];
  const value = isInheritedActive ? inheritedValue : (data?.[name] || "");

  return (
    <div>
      {isInheritedActive && (
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center text-[10px] text-[#2DB5A3] font-semibold bg-[#F0FBF9] px-2 py-0.5 rounded-full border border-[#2DB5A3]/20 whitespace-nowrap">
            ↩ {origin}
          </span>
          <button
            type="button"
            onClick={() => onChange(`${name}_suppressed`, true)}
            className="flex items-center gap-1 text-[10px] font-bold text-[#D97706] hover:bg-amber-50 px-2 py-1 rounded-full transition-colors border border-transparent hover:border-amber-200"
          >
            ✕ Ignorar
          </button>
        </div>
      )}
      <div className="flex flex-col gap-1 overflow-x-auto pb-2">
        <div className="flex gap-1 min-w-max">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => {
            const isSelected = value === String(val);
            return (
              <button
                key={val}
                type="button"
                onClick={() => {
                  if (!isInheritedActive) onChange(name, String(val));
                }}
                disabled={isInheritedActive}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  isSelected
                    ? (isInheritedActive ? "bg-[#2DB5A3] text-white border-[#2DB5A3] opacity-90 cursor-default" : "bg-[#1B6CA8] text-white border border-[#1B6CA8]")
                    : (isInheritedActive ? "bg-white text-[#9AAABB] border border-[#EEF2F7] cursor-not-allowed opacity-50" : "bg-white text-[#3A4354] border border-[#D5E6F3] hover:border-[#1B6CA8] hover:text-[#1B6CA8]")
                }`}
              >
                {val}
              </button>
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] text-[#8A9EB9] uppercase font-bold min-w-max">
          <span>Sem dor</span>
          <span>Dor máxima</span>
        </div>
      </div>
    </div>
  );
};

export function TerapiaOcupacionalForm({ data, onChange, patient, inheritedData, origins }: FormProps) {
  const avdOptions = ["1 — Independente", "2 — Auxílio/supervisão", "3 — Dependente", "4 — N/A"];
  const ocupacaoOptions = ["Alterada", "Não alterada"];
  
  return (
    <div className="space-y-6">
      <PatientHeader 
        id={patient?.id}
        name={patient?.name || ""}
        age={patient?.age}
        diagnosis={patient?.diagnosis}
        cid={patient?.cid}
        specialty="Terapia Ocupacional"
        status="Pendente"
        alerts={patient?.alerts}
      />

      <ReusedDataAccordion
        title="Identificação (reaproveitada)"
        fields={[
          { label: "NOME", value: patient?.name || "", origin: "Cadastro" },
          { label: "DIAGNÓSTICO", value: patient?.diagnosis || "", origin: "Recepção" },
          { label: "CID", value: patient?.cid || "", origin: "Recepção" },
        ]}
        data={data}
        onChange={onChange}
      >
        <div className="flex flex-col gap-4">
          <InheritableSelect inheritedData={inheritedData} origins={origins} label="Renda atual" name="rendaAtual" sourceName="rendaPaciente" mapValue={mapRendaServicoSocialParaTerapiaOcupacional} options={["Até 1 salário mínimo", "De 1 a 3 salários mínimos", "Mais de 3 salários mínimos", "Sem renda"]} data={data} onChange={onChange} />
          <InheritableInput inheritedData={inheritedData} origins={origins} label="Naturalidade / Reside em" name="naturalidade" data={data} onChange={onChange} />
        </div>
      </ReusedDataAccordion>

      <SectionCard title="Avaliação inicial">
        <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Sente cansaço:" name="TO_Cansaco" options={["Sim", "Um pouco", "Não"]} data={data} onChange={onChange} />
        <ConditionalField
          data={data}
          onChange={onChange}
          showIf={{ OU: [
            { campo: "TO_Cansaco", igual: "Sim" },
            { campo: "TO_Cansaco", igual: "Um pouco" },
          ]}}
          campos={["TO_Cansaco_Impede"]}
        >
          <InheritableTextarea inheritedData={inheritedData} origins={origins} label="Se sim, te impede no que você quer fazer? (O que?)" name="TO_Cansaco_Impede" data={data} onChange={onChange} rows={2} />
        </ConditionalField>

        <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Queda / Risco de queda" name="TO_Queda" options={["Sim - queda", "Risco de queda", "Não"]} data={data} onChange={onChange} />

        <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Dor" name="TO_Dor" options={["Sim", "Não"]} data={data} onChange={onChange} />
        <ConditionalField data={data} onChange={onChange} showIf={{ campo: "TO_Dor", igual: "Sim" }} campos={["TO_Dor_Intensidade"]} className="mt-2">
          <label className="block text-xs font-bold text-[#1A2332] mb-2">Escala numérica de dor:</label>
          <PainScale name="TO_Dor_Intensidade" data={data} onChange={onChange} inheritedData={inheritedData} origins={origins} />
        </ConditionalField>

        <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Alteração da rotina" name="TO_AlteracaoRotina" options={["Sim", "Um pouco", "Não"]} data={data} onChange={onChange} />
        <ConditionalField
          data={data}
          onChange={onChange}
          showIf={{ OU: [
            { campo: "TO_AlteracaoRotina", igual: "Sim" },
            { campo: "TO_AlteracaoRotina", igual: "Um pouco" },
          ]}}
          campos={["TO_AlteracaoRotina_Descricao"]}
        >
          <InheritableTextarea inheritedData={inheritedData} origins={origins} label="Descreva a alteração" name="TO_AlteracaoRotina_Descricao" data={data} onChange={onChange} rows={2} />
        </ConditionalField>
      </SectionCard>

      <SectionCard title="AVDs — Atividades de vida diária">
        <div className="text-xs text-[#8A9EB9] mb-4">
          1 – Independente • 2 – Auxílio/supervisão • 3 – Dependente • 4 – Não se aplica
        </div>
        
        <div className="space-y-6">
          <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Alimentação" name="TO_AVD_Alimentacao" options={avdOptions} data={data} onChange={onChange} />
          <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Vestuário" name="TO_AVD_Vestuario" options={avdOptions} data={data} onChange={onChange} />
          <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Banho" name="TO_AVD_Banho" options={avdOptions} data={data} onChange={onChange} />
          <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Higiene pessoal" name="TO_AVD_Higiene" options={avdOptions} data={data} onChange={onChange} />
          <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Vaso sanitário" name="TO_AVD_Vaso" options={avdOptions} data={data} onChange={onChange} />
          <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Controle da urina" name="TO_AVD_Urina" options={avdOptions} data={data} onChange={onChange} />
          <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Controle de fezes" name="TO_AVD_Fezes" options={avdOptions} data={data} onChange={onChange} />
          <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Mobilidade funcional" name="TO_AVD_Mobilidade" options={avdOptions} data={data} onChange={onChange} />
          
          <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Utiliza algum dispositivo:" name="TO_AVD_Dispositivo" options={["Sim", "Não"]} data={data} onChange={onChange} />
          <ConditionalField data={data} onChange={onChange} showIf={{ campo: "TO_AVD_Dispositivo", igual: "Sim" }} campos={["TO_AVD_Dispositivo_Qual"]}>
            <InheritableTextarea inheritedData={inheritedData} origins={origins} label="Qual?:" name="TO_AVD_Dispositivo_Qual" data={data} onChange={onChange} rows={2} />
          </ConditionalField>
        </div>
      </SectionCard>

      <SectionCard title="AIVDs — Atividades instrumentais">
        <div className="text-xs text-[#8A9EB9] mb-4">
          1 – Independente • 2 – Auxílio/supervisão • 3 – Dependente • 4 – Não se aplica
        </div>
        
        <div className="space-y-6">
          <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Gerenciamento de comunicação/celular" name="TO_AIVD_Celular" options={avdOptions} data={data} onChange={onChange} />
          <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Gerenciamento do lar" name="TO_AIVD_Lar" options={avdOptions} data={data} onChange={onChange} />
          <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Tarefas domésticas" name="TO_AIVD_Tarefas" options={avdOptions} data={data} onChange={onChange} />
          <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Saúde/medicamentos" name="TO_AIVD_Saude" options={avdOptions} data={data} onChange={onChange} />
          <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Gerenciamento financeiro" name="TO_AIVD_Financeiro" options={avdOptions} data={data} onChange={onChange} />
          <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Fazer compras" name="TO_AIVD_Compras" options={avdOptions} data={data} onChange={onChange} />
        </div>
      </SectionCard>

      <SectionCard title="Ocupações e contexto">
        <div className="text-xs text-[#8A9EB9] mb-4">
          1 – Alterada • 2 – Não alterada
        </div>
        
        <div className="mb-6 space-y-4">
          <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Descanso e sono" name="TO_Ocup_Sono" options={ocupacaoOptions} data={data} onChange={onChange} />
          <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Trabalho" name="TO_Ocup_Trabalho" options={ocupacaoOptions} data={data} onChange={onChange} />
          <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Lazer" name="TO_Ocup_Lazer" options={ocupacaoOptions} data={data} onChange={onChange} />
          <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Participação social" name="TO_Ocup_Social" options={ocupacaoOptions} data={data} onChange={onChange} />
          <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Memória" name="TO_Ocup_Memoria" options={ocupacaoOptions} data={data} onChange={onChange} />
          <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Compreensão" name="TO_Ocup_Compreensao" options={ocupacaoOptions} data={data} onChange={onChange} />
        </div>
        
        <div className="space-y-6">
          <InheritableTextarea inheritedData={inheritedData} origins={origins} label="O que foi mais difícil no processo de investigação e diagnóstico?" name="TO_Ocup_Dificil" data={data} onChange={onChange} rows={3} />
          
          <InheritableCheckboxGroup inheritedData={inheritedData} origins={origins} 
            label="Neste momento, quem mais te ajuda?" 
            name="TO_Ocup_Ajuda" 
            options={["Amigos", "Equipe", "Companheiro(a)", "Vizinho", "Familiares", "Outros"]} 
            inline={true}
            data={data} onChange={onChange} 
          />
          <InheritableTextarea inheritedData={inheritedData} origins={origins} label="Em que essa pessoa te ajuda?" name="TO_Ocup_Ajuda_Como" data={data} onChange={onChange} rows={2} />
          
          <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Realiza participação em grupos?" name="TO_Ocup_Grupos" options={["Sim", "Não"]} data={data} onChange={onChange} />
          <InheritableTextarea inheritedData={inheritedData} origins={origins} label="Cite atividades significativas ou que considera importantes no seu cotidiano:" name="TO_Ocup_AtividadesSig" data={data} onChange={onChange} rows={3} />
        </div>
      </SectionCard>

      <SectionCard title="Evolução e diagnóstico terapêutico ocupacional">
        <div className="space-y-6">
          <InheritableTextarea inheritedData={inheritedData} origins={origins} label="Evolução" name="TO_Evolucao" data={data} onChange={onChange} rows={5} />
          
          <InheritableCheckboxGroup inheritedData={inheritedData} origins={origins} 
            label="Diagnóstico Terapêutico Ocupacional (múltipla seleção):" 
            name="TO_Diagnostico" 
            options={[
              "Capacidade funcional preservada e desempenho ocupacional satisfatório",
              "Dependência para realização de AIVDs",
              "Dependência para realização de AVDs",
              "Alterações na mobilidade",
              "Risco de queda",
              "Dor incapacitante",
              "Fadiga",
              "Outro"
            ]} 
            data={data} onChange={onChange} 
          />
          <ConditionalField
            data={data}
            onChange={onChange}
            showIf={{ campo: "TO_Diagnostico", "contém": "Outro" }}
            campos={["TO_Diagnostico_Outro"]}
            className="ml-6 border-l-2 border-[#1B6CA8]/30 pl-4"
          >
            <InheritableInput inheritedData={inheritedData} origins={origins} label="Especifique o outro diagnóstico:" name="TO_Diagnostico_Outro" data={data} onChange={onChange} />
          </ConditionalField>
        </div>
      </SectionCard>

      <SectionCard title="Conduta e encaminhamentos">
        <div className="space-y-6">
          <InheritableRadioPills inheritedData={inheritedData} origins={origins} 
            label="Conduta inicial" 
            name="TO_Conduta" 
            options={[
              "Não elegível – orientações em saúde, serviço à disposição",
              "Elegível – encaminho para acompanhamento ambulatorial"
            ]} 
            stacked={true}
            data={data} onChange={onChange} 
          />
          
          <InheritableCheckboxGroup inheritedData={inheritedData} origins={origins} 
            label="Encaminhamentos (múltipla seleção):" 
            name="TO_Encaminhamentos" 
            options={[
              "Orientações em Saúde",
              "Ambulatório de Terapia Ocupacional",
              "Visita Domiciliar",
              "Prescrição de Tecnologias Assistivas",
              "Encaminhamento para outra especialidade:"
            ]} 
            data={data} onChange={onChange} 
          />
          <ConditionalField
            data={data}
            onChange={onChange}
            showIf={{ campo: "TO_Encaminhamentos", "contém": "Encaminhamento para outra especialidade:" }}
            campos={["TO_Encaminhamentos_Especialidade"]}
            className="ml-6 border-l-2 border-[#1B6CA8]/30 pl-4"
          >
            <InheritableInput inheritedData={inheritedData} origins={origins} label="Especifique a especialidade:" name="TO_Encaminhamentos_Especialidade" data={data} onChange={onChange} />
          </ConditionalField>
        </div>
      </SectionCard>
    </div>
  );
}
