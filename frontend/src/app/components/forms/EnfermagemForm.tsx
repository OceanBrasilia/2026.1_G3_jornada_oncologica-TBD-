import { Home, Activity, FileText, Users, HeartPulse } from "lucide-react";
import { PatientHeader } from "../PatientHeader";
import { ReusedDataAccordion } from "../ReusedDataAccordion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

import { InheritableInput, InheritableSelect, InheritableTextarea, InheritableRadioPills, InheritableCheckboxGroup } from "./shared/InheritableFormComponents";
import { ConditionalField } from "./shared/ConditionalField";

export interface EnfermagemFormProps {
  data: Record<string, string>;
  onChange: (key: string, value: string) => void;
  patient: any;
  origins?: Record<string, string>;
  inheritedData?: Record<string, any>;
}

const AccordionCard = ({ title, icon: Icon, value, children }: any) => (
  <div className="bg-white rounded-2xl border border-[rgba(27,108,168,0.1)] shadow-sm mb-5">
    <Accordion type="single" collapsible defaultValue={value}>
      <AccordionItem value={value} className="border-b-0">
        <AccordionTrigger className="px-5 py-4 font-bold text-[#1A2332] text-sm hover:no-underline border-b border-[#F1F5F9]">
          <div className="flex items-center gap-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
            {Icon && <Icon size={16} className="text-[#1B6CA8]" />} {title}
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-5 pt-4 pb-5">
          <div className="flex flex-col gap-4">
            {children}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
);

// Removed local components, using shared Inheritable components

const PainScale = ({ name, data, onChange }: any) => {
  return (
    <div>
      <label className="block text-xs font-bold text-[#1A2332] mb-2">Escala numérica de dor 0-10</label>
      <div className="flex flex-col gap-1 overflow-x-auto pb-2">
        <div className="flex gap-1 min-w-max">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => {
            const isSelected = data?.[name] === String(val);
            return (
              <button
                key={val}
                type="button"
                onClick={() => onChange(name, String(val))}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  isSelected
                    ? "bg-[#1B6CA8] text-white border border-[#1B6CA8]"
                    : "bg-white text-[#3A4354] border border-[#D5E6F3] hover:border-[#1B6CA8] hover:text-[#1B6CA8]"
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

export function EnfermagemForm({ data, onChange, patient, inheritedData, origins }: EnfermagemFormProps) {

  return (
    <div>
      <PatientHeader 
        id="CAO-2024-0002"
        name={patient?.name || ""}
        age={patient?.age}
        diagnosis={patient?.diagnosis}
        cid={patient?.cid}
        specialty="Enfermagem"
        status="Pendente"
        alerts={patient?.alerts}
      />

      <ReusedDataAccordion
        title="I – Dados pessoais (reaproveitados)"
        fields={[
          { label: "NOME COMPLETO", value: patient?.name, origin: "Cadastro" },
          { label: "DIAGNÓSTICO", value: patient?.diagnosis, origin: "Recepção" },
          { label: "CID", value: patient?.cid, origin: "Recepção" },
          { label: "TELEFONE", value: patient?.phone, origin: "Cadastro" },
        ]}
        data={data}
        onChange={onChange}
      >
        <div className="flex flex-col gap-4">
          <InheritableSelect inheritedData={inheritedData} origins={origins} label="Escolaridade" name="Escolaridade" options={["Analfabeto", "Ensino Fundamental Incompleto", "Ensino Fundamental Completo", "Ensino Médio Incompleto", "Ensino Médio Completo", "Ensino Superior Incompleto", "Ensino Superior Completo"]} data={data} onChange={onChange} />

          <InheritableSelect inheritedData={inheritedData} origins={origins} label="Acompanhante hoje" name="Acompanhante" options={["Desacompanhado", "Cônjuge", "Filho(a)", "Irmão(ã)", "Outro parente", "Amigo(a)"]} data={data} onChange={onChange} />
        </div>
      </ReusedDataAccordion>

      {/* Card 2: Condição Social e Familiar */}
      <AccordionCard title="II – Condição social e familiar" icon={Home} value="condicao-social">
        <InheritableSelect inheritedData={inheritedData} origins={origins} label="Mora com quem?" name="Mora com quem" options={["Sozinho(a)", "Cônjuge", "Filhos(as)", "Outros familiares", "Amigos / Colegas"]} data={data} onChange={onChange} />
        <InheritableSelect inheritedData={inheritedData} origins={origins} label="Forma de deslocamento até a clínica" name="Deslocamento" options={["Carro próprio / Carona", "Transporte por aplicativo / Táxi", "Ônibus / Metrô", "Ambulância / Transporte da Prefeitura", "Outro"]} data={data} onChange={onChange} />
        <InheritableSelect inheritedData={inheritedData} origins={origins} label="Apoio familiar" name="Apoio familiar" options={["Adequado", "Parcial", "Inexistente"]} data={data} onChange={onChange} />
        <InheritableSelect inheritedData={inheritedData} origins={origins} label="Limitação de atividade laboral" name="Limitação laboral" options={["Nenhuma", "Parcial", "Total"]} data={data} onChange={onChange} />
        {/* "Situação profissional atual" e "Qual trabalho exerce/exercia?" já vêm do bloco
            compartilhado no topo do formulário (ReusedDataAccordion) — pergunta duplicada removida. */}
      </AccordionCard>

      {/* Card 3: Histórico de Doença Pregressa (HDP) */}
      <AccordionCard title="III – Histórico de doença pregressa" icon={FileText} value="hdp">
        <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Alergia" name="Alergia" options={["Nega", "Sim"]} data={data} onChange={onChange} />

        <ConditionalField
          data={{ ...data, "Alergia": data?.["Alergia"] ?? inheritedData?.["Alergia"] }}
          onChange={onChange}
          showIf={{ campo: "Alergia", igual: "Sim" }}
          campos={["Reação alergica"]}
          className="pl-4 border-l-2 border-[#D5E6F3] ml-2 mt-4"
        >
          <InheritableInput inheritedData={inheritedData} origins={origins} label="A que e qual a reação?" name="Reação alergica" data={data} onChange={onChange} />
        </ConditionalField>

        <InheritableCheckboxGroup inheritedData={inheritedData} origins={origins} label="Comorbidades (Doenças prévias)" name="Comorbidades" options={["Diabetes Mellitus (DM)", "Hipertensão Arterial Sistêmica (HAS)", "Cardiopatia", "DPOC", "Outras"]} data={data} onChange={onChange} />

        <ConditionalField data={data} onChange={onChange} showIf={{ campo: "Comorbidades", "contém": "Outras" }} campos={["Outras doenças"]} className="pl-4 border-l-2 border-[#D5E6F3] ml-2">
          <InheritableTextarea inheritedData={inheritedData} origins={origins} label="Outras doenças / comorbidades" name="Outras doenças" data={data} onChange={onChange} />
        </ConditionalField>
        <InheritableTextarea inheritedData={inheritedData} origins={origins} label="Medicações de uso contínuo" name="medicacoes" placeholder="Liste os medicamentos e doses..." data={data} onChange={onChange} />

        <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Cirurgias prévias" name="Cirurgias prévias" options={["Nega", "Sim"]} data={data} onChange={onChange} />
        <ConditionalField data={data} onChange={onChange} showIf={{ campo: "Cirurgias prévias", igual: "Sim" }} campos={["Quais cirurgias"]} className="pl-4 border-l-2 border-[#D5E6F3] ml-2">
          <InheritableInput inheritedData={inheritedData} origins={origins} label="Quais?" name="Quais cirurgias" data={data} onChange={onChange} />
        </ConditionalField>

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
      </AccordionCard>

      {/* Card 4: Histórico da Doença Atual (HDA) */}
      <AccordionCard title="IV – Histórico da doença atual" icon={Activity} value="hda">
        <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Paciente tem conhecimento sobre seu diagnóstico?" name="Conhecimento do diagnóstico" options={["Sim", "Não", "Parcialmente"]} data={data} onChange={onChange} />
        <InheritableTextarea inheritedData={inheritedData} origins={origins} label="Sinais e sintomas atuais (relacionados à doença ou tratamento)" name="Sinais e sintomas" data={data} onChange={onChange} />
        <InheritableCheckboxGroup inheritedData={inheritedData} origins={origins} label="Tratamento oncológico prévio" name="Tratamento oncológico prévio" options={["Nenhum (Iniciando tratamento)", "Cirurgia oncológica", "Quimioterapia", "Radioterapia", "Imunoterapia / Hormonioterapia", "Outro"]} data={data} onChange={onChange} />
        <ConditionalField data={data} onChange={onChange} showIf={{ campo: "Tratamento oncológico prévio", "contém": "Outro" }} campos={["Tratamento prévio"]} className="pl-4 border-l-2 border-[#D5E6F3] ml-2">
          <InheritableTextarea inheritedData={inheritedData} origins={origins} label="Qual tratamento prévio?" name="Tratamento prévio" data={data} onChange={onChange} />
        </ConditionalField>
        
        <InheritableTextarea inheritedData={inheritedData} origins={origins} label="Exames realizados" name="Exames" data={data} onChange={onChange} />
        <InheritableTextarea inheritedData={inheritedData} origins={origins} label="Afeto e humor" name="Afeto e humor" placeholder="Ex.: calmo, agitado, estressado, ansioso..." data={data} onChange={onChange} />
      </AccordionCard>

      {/* Card 5: Histórico Familiar */}
      <AccordionCard title="V – Histórico familiar" icon={Users} value="historico-familiar">
        <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Casos de câncer na família?" name="Casos de câncer na família" options={["Sim", "Não", "Não sabe"]} data={data} onChange={onChange} />
        
        <ConditionalField
          data={data}
          onChange={onChange}
          showIf={{ campo: "Casos de câncer na família", igual: "Sim" }}
          campos={["Parentesco CA na família", "Tipo de CA na família"]}
          className="pl-4 border-l-2 border-[#D5E6F3] ml-2 flex gap-4 mt-2"
        >
          <div className="flex-1">
            <InheritableInput inheritedData={inheritedData} origins={origins} label="Parentesco" name="Parentesco CA na família" data={data} onChange={onChange} />
          </div>
          <div className="flex-1">
            <InheritableInput inheritedData={inheritedData} origins={origins} label="Tipo de câncer" name="Tipo de CA na família" data={data} onChange={onChange} />
          </div>
        </ConditionalField>
      </AccordionCard>

      {/* Card 6: Exame Físico / Avaliação Clínica */}
      <AccordionCard title="VI – Exame físico / Avaliação Clínica" icon={HeartPulse} value="exame-fisico">
        <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Nível de consciência" name="Nível de consciência" options={["Lúcido e orientado", "Desorientado / Confuso", "Torporoso", "Outro"]} data={data} onChange={onChange} />
        <ConditionalField data={data} onChange={onChange} showIf={{ campo: "Nível de consciência", igual: "Outro" }} campos={["Nível de consciência (Outro)"]} className="pl-4 border-l-2 border-[#D5E6F3] ml-2">
          <InheritableInput inheritedData={inheritedData} origins={origins} label="Qual?" name="Nível de consciência (Outro)" data={data} onChange={onChange} />
        </ConditionalField>

        <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Padrão de sono" name="Padrão de sono" options={["Preservado", "Alterado (insônia, despertar frequente)", "Outro"]} data={data} onChange={onChange} />
        <ConditionalField data={data} onChange={onChange} showIf={{ campo: "Padrão de sono", igual: "Outro" }} campos={["Padrão de sono (Outro)"]} className="pl-4 border-l-2 border-[#D5E6F3] ml-2">
          <InheritableInput inheritedData={inheritedData} origins={origins} label="Qual?" name="Padrão de sono (Outro)" data={data} onChange={onChange} />
        </ConditionalField>
        <InheritableSelect inheritedData={inheritedData} origins={origins} label="Aceitação da dieta" name="Aceitação da dieta" options={["Boa", "Regular", "Ruim"]} data={data} onChange={onChange} />
        <InheritableSelect inheritedData={inheritedData} origins={origins} label="Disfagia" name="Disfagia" options={["Sim", "Não"]} data={data} onChange={onChange} />
        <InheritableInput inheritedData={inheritedData} origins={origins} label="Locomoção" name="Locomoção" placeholder="Ex.: sem auxílio, com auxílio, cadeira de rodas..." data={data} onChange={onChange} />
        <InheritableSelect inheritedData={inheritedData} origins={origins} label="Quedas nos últimos 3 meses" name="Quedas" options={["Nenhuma", "Sim, 1 vez", "Sim, mais de 1 vez"]} data={data} onChange={onChange} />
        <InheritableInput inheritedData={inheritedData} origins={origins} label="MMII (membros inferiores)" name="MMII" placeholder="Ex.: sem queixas, edema, parestesia..." data={data} onChange={onChange} />
        
        <InheritableSelect inheritedData={inheritedData} origins={origins} label="Eliminações fisiológicas - Diurese (Urina)" name="Diurese" options={["Presente / Sem alterações", "Disúria (dor/ardor)", "Hematúria (sangue)", "Uso de sonda (SVD)"]} data={data} onChange={onChange} />
        <InheritableSelect inheritedData={inheritedData} origins={origins} label="Eliminações fisiológicas - Evacuação (Fezes)" name="Evacuação" options={["Presente / Sem alterações", "Constipação", "Diarreia", "Uso de ostomia"]} data={data} onChange={onChange} />
        
        <PainScale name="Avaliação da dor" data={data} onChange={onChange} />

        
        <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Presença de lesão na pele / ferida tumoral?" name="Lesão tumoral" options={["Nega", "Sim"]} data={data} onChange={onChange} />
        <ConditionalField
          data={data}
          onChange={onChange}
          showIf={{ campo: "Lesão tumoral", igual: "Sim" }}
          campos={["Localização lesão tumoral"]}
          className="pl-4 border-l-2 border-[#D5E6F3] ml-2 flex flex-col gap-4 mt-2"
        >
          <InheritableTextarea inheritedData={inheritedData} origins={origins} label="Descrever (localização, aspecto, curativo atual):" name="Localização lesão tumoral" data={data} onChange={onChange} />
        </ConditionalField>

        <InheritableCheckboxGroup inheritedData={inheritedData} origins={origins} label="Uso de dispositivos invasivos" name="Dispositivos invasivos" options={["Nenhum", "Acesso venoso periférico", "Port-a-cath", "PICC", "Cateter duplo lúmen", "Sonda nasoenteral (SNE)", "Ostomias", "Traqueostomia", "Outro"]} data={data} onChange={onChange} />

        <ConditionalField data={data} onChange={onChange} showIf={{ campo: "Dispositivos invasivos", "contém": "Outro" }} campos={["Dispositivos invasivos (Outro)"]} className="pl-4 border-l-2 border-[#D5E6F3] ml-2 mt-2">
          <InheritableInput inheritedData={inheritedData} origins={origins} label="Qual dispositivo?" name="Dispositivos invasivos (Outro)" data={data} onChange={onChange} />
        </ConditionalField>
      </AccordionCard>
    </div>
  );
}

