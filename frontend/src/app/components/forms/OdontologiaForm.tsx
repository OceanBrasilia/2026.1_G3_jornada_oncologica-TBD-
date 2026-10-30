import React, { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { PatientHeader } from "../PatientHeader";
import { ReusedDataAccordion } from "../ReusedDataAccordion";
import {
  InheritableInput,
  InheritableTextarea,
  InheritableRadioPills,
} from "./shared/InheritableFormComponents";
import { ConditionalField } from "./shared/ConditionalField";

export interface OdontologiaFormProps {
  data: Record<string, any>;
  onChange: (key: string, value: any) => void;
  patient: any;
  origins?: Record<string, string>;
  inheritedData?: Record<string, any>;
}

export const ODONTO_RISCO_MUCOSITE_OPCOES = [
  "Baixo",
  "Moderado",
  "Alto",
  "Depende do quimioterápico, paciente ainda não sabe o protocolo",
  "Ainda não sabe se vai fazer quimioterapia",
  "Outro",
];

export const ODONTO_DENTES_NATURAIS_OPCOES = ["Sim", "Não"];

export const ODONTO_PROTESE_OPCOES = ["Sim", "Não", "Outro"];

export const ODONTO_DOR_DENTE_OPCOES = ["Sim", "Não", "Outro"];

export const ODONTO_TABAGISTA_OPCOES = [
  "Sim",
  "Não",
  "Ex-tabagista",
  "Outro",
];

export const ODONTO_ETILISTA_OPCOES = [
  "Sim",
  "Não",
  "Ex-etilista",
  "Socialmente",
  "Outro",
];

export const ODONTO_VIA_ALIMENTACAO_OPCOES = [
  "Via oral",
  "Via sonda",
  "Ambos",
];

export const ODONTO_TRAQUEOSTOMIA_OPCOES = ["Sim", "Não"];

export const ODONTO_XEROSTOMIA_OPCOES = ["Sim", "Não"];

export const ODONTO_ANTIRREABSORTIVOS_OPCOES = [
  "Sim",
  "Não",
  "Sem previsão",
  "Outro",
];

export const ODONTO_CARIES_OPCOES = [
  "Sim",
  "Não",
  "Não foi possível avaliar",
  "Outro",
];

export const ODONTO_MOBILIDADE_OPCOES = [
  "Sim",
  "Não",
  "Não foi possível avaliar",
  "Outro",
];

export interface RiscoOdontologicoDef {
  valor: "BAIXO" | "MODERADO" | "ALTO";
  titulo: string;
  descricao: string;
}

export const ODONTO_RISCO_ODONTOLOGICO_OPCOES: RiscoOdontologicoDef[] = [
  {
    valor: "BAIXO",
    titulo: "BAIXO",
    descricao: "Sem focos infecciosos aparentes.",
  },
  {
    valor: "MODERADO",
    titulo: "MODERADO",
    descricao: "Necessita de tratamento odontológico eletivo antes ou durante o tratamento oncológico.",
  },
  {
    valor: "ALTO",
    titulo: "ALTO",
    descricao: "Presença de foco infeccioso, dor, abscesso, raiz residual, lesão suspeita ou necessidade de atendimento prioritário.",
  },
];

export const ODONTO_ENCAMINHAR_2857_OPCOES = ["SIM", "NÃO"];

const SectionCard = ({
  title,
  children,
  defaultOpen = true,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className={`bg-white rounded-2xl border border-[#D5E6F3] shadow-sm ${className}`}>
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className="p-5 flex justify-between items-center cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/30 rounded-2xl"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="font-bold text-[#1A2332] text-sm" style={{ fontFamily: "'Nunito', sans-serif" }}>
          {title}
        </h3>
        {isOpen ? (
          <ChevronUp size={20} className="text-[#8A9EB9]" />
        ) : (
          <ChevronDown size={20} className="text-[#8A9EB9]" />
        )}
      </div>
      {isOpen && <div className="px-5 pb-5 pt-0 space-y-5">{children}</div>}
    </div>
  );
};

export function OdontologiaForm({
  data,
  onChange,
  patient,
  inheritedData,
  origins,
}: OdontologiaFormProps) {
  const dataAtendimento =
    data?.["Data do atendimento"] ||
    patient?.date ||
    new Date().toLocaleDateString("pt-BR");

  const dataNascimento =
    patient?.birth ||
    patient?.birthDate ||
    patient?.data_nascimento ||
    inheritedData?.["Data de Nascimento"] ||
    (patient?.age ? `${patient.age} anos` : "—");

  const commonProps = { data, onChange, inheritedData, origins };

  const riscoSelecionado = data?.["Classificação do Risco Odontológico"];

  return (
    <div className="space-y-6">
      <PatientHeader
        id={patient?.id}
        name={patient?.name || ""}
        age={patient?.age}
        diagnosis={patient?.diagnosis}
        cid={patient?.cid}
        specialty="Odontologia"
        status="Pendente"
        alerts={patient?.alerts}
      />

      {/* 1. Identificação do Paciente (Reaproveitada) */}
      <ReusedDataAccordion
        title="1. Identificação do paciente (dados compartilhados)"
        fields={[
          { label: "DATA DO ATENDIMENTO", value: dataAtendimento, origin: "Acolhimento" },
          { label: "NOME DO PACIENTE", value: patient?.name || "—", origin: "Cadastro" },
          { label: "ID DO PRONTUÁRIO", value: patient?.id || "—", origin: "Cadastro" },
          { label: "DATA DE NASCIMENTO", value: dataNascimento, origin: "Cadastro" },
        ]}
        data={data}
        onChange={onChange}
      >
        <p className="text-xs text-[#6B7A8D] mt-2">
          Unidade de Saúde Bucal / Odontologia Oncológica — HUB / UnB
        </p>
      </ReusedDataAccordion>

      {/* 2. Contexto Oncológico */}
      <SectionCard title="2. Contexto oncológico" defaultOpen={true}>
        <div className="space-y-5">
          <div>
            <InheritableTextarea
              {...commonProps}
              label="Diagnóstico Oncológico e Localização do Tumor (CID)"
              name="Diagnóstico Oncológico e Localização do Tumor (CID)"
              placeholder="Descreva o diagnóstico oncológico e a localização anatômica do tumor..."
              rows={3}
            />
          </div>

          <div>
            <InheritableRadioPills
              {...commonProps}
              label="Risco de Mucosite"
              name="Risco de Mucosite"
              options={ODONTO_RISCO_MUCOSITE_OPCOES}
              stacked={true}
              subLabel="Selecione o nível de risco de mucosite previsto para o tratamento oncológico"
            />
            <ConditionalField
              data={data}
              onChange={onChange}
              showIf={{ campo: "Risco de Mucosite", igual: "Outro" }}
              campos={["Risco de Mucosite (outro)"]}
              className="pl-4 border-l-2 border-[#1B6CA8]/30 mt-3"
            >
              <InheritableInput
                {...commonProps}
                label="Especifique o risco de mucosite"
                name="Risco de Mucosite (outro)"
                placeholder="Descreva a situação do risco de mucosite..."
              />
            </ConditionalField>
          </div>
        </div>
      </SectionCard>

      {/* 3. Condição Odontológica e Fatores Associados */}
      <SectionCard title="3. Condição odontológica e fatores associados" defaultOpen={true}>
        <div className="space-y-5">
          {/* Dentes naturais */}
          <div>
            <InheritableRadioPills
              {...commonProps}
              label="Tem dentes naturais?"
              name="Tem dentes naturais?"
              options={ODONTO_DENTES_NATURAIS_OPCOES}
            />
          </div>

          {/* Próteses */}
          <div>
            <InheritableRadioPills
              {...commonProps}
              label="Usa próteses?"
              name="Usa próteses?"
              options={ODONTO_PROTESE_OPCOES}
            />
            <ConditionalField
              data={data}
              onChange={onChange}
              showIf={{ campo: "Usa próteses?", igual: "Outro" }}
              campos={["Usa próteses? (outro)"]}
              className="pl-4 border-l-2 border-[#1B6CA8]/30 mt-3"
            >
              <InheritableInput
                {...commonProps}
                label="Especifique o uso de prótese"
                name="Usa próteses? (outro)"
                placeholder="Ex.: Prótese parcial removível, prótese total superior..."
              />
            </ConditionalField>
          </div>

          {/* Dor de dente */}
          <div>
            <InheritableRadioPills
              {...commonProps}
              label="Tem dor de dente?"
              name="Tem dor de dente?"
              options={ODONTO_DOR_DENTE_OPCOES}
            />
            <ConditionalField
              data={data}
              onChange={onChange}
              showIf={{ campo: "Tem dor de dente?", igual: "Outro" }}
              campos={["Tem dor de dente? (outro)"]}
              className="pl-4 border-l-2 border-[#1B6CA8]/30 mt-3"
            >
              <InheritableInput
                {...commonProps}
                label="Especifique a dor de dente"
                name="Tem dor de dente? (outro)"
                placeholder="Descreva a intensidade, localização e características da dor..."
              />
            </ConditionalField>
          </div>

          {/* Tabagismo */}
          <div>
            <InheritableRadioPills
              {...commonProps}
              label="Tabagista"
              name="Tabagista"
              options={ODONTO_TABAGISTA_OPCOES}
            />
            <ConditionalField
              data={data}
              onChange={onChange}
              showIf={{ campo: "Tabagista", igual: "Outro" }}
              campos={["Tabagista (outro)"]}
              className="pl-4 border-l-2 border-[#1B6CA8]/30 mt-3"
            >
              <InheritableInput
                {...commonProps}
                label="Especifique o tabagismo"
                name="Tabagista (outro)"
                placeholder="Descreva o histórico ou especificidade do tabagismo..."
              />
            </ConditionalField>
          </div>

          {/* Etilismo */}
          <div>
            <InheritableRadioPills
              {...commonProps}
              label="Etilista"
              name="Etilista"
              options={ODONTO_ETILISTA_OPCOES}
            />
            <ConditionalField
              data={data}
              onChange={onChange}
              showIf={{ campo: "Etilista", igual: "Outro" }}
              campos={["Etilista (outro)"]}
              className="pl-4 border-l-2 border-[#1B6CA8]/30 mt-3"
            >
              <InheritableInput
                {...commonProps}
                label="Especifique o etilismo"
                name="Etilista (outro)"
                placeholder="Descreva o padrão de consumo de bebidas alcoólicas..."
              />
            </ConditionalField>
          </div>

          {/* Via de alimentação */}
          <div>
            <InheritableRadioPills
              {...commonProps}
              label="Qual a via de alimentação?"
              name="Qual a via de alimentação?"
              options={ODONTO_VIA_ALIMENTACAO_OPCOES}
            />
          </div>

          {/* Traqueostomia */}
          <div>
            <InheritableRadioPills
              {...commonProps}
              label="Tem traqueostomia?"
              name="Tem traqueostomia?"
              options={ODONTO_TRAQUEOSTOMIA_OPCOES}
            />
          </div>

          {/* Xerostomia */}
          <div>
            <InheritableRadioPills
              {...commonProps}
              label="Xerostomia"
              name="Xerostomia"
              options={ODONTO_XEROSTOMIA_OPCOES}
            />
          </div>

          {/* Medicamentos antirreabsortivos */}
          <div>
            <InheritableRadioPills
              {...commonProps}
              label="Paciente faz uso ou há previsão de uso de medicamentos antirreabsortivos? Se sim, qual?"
              name="Medicamentos antirreabsortivos"
              options={ODONTO_ANTIRREABSORTIVOS_OPCOES}
            />
            <ConditionalField
              data={data}
              onChange={onChange}
              showIf={{ campo: "Medicamentos antirreabsortivos", igual: "Sim" }}
              campos={["Medicamento antirreabsortivo (qual)"]}
              className="pl-4 border-l-2 border-[#1B6CA8]/30 mt-3"
            >
              <InheritableInput
                {...commonProps}
                label="Qual medicamento antirreabsortivo em uso ou previsto?"
                name="Medicamento antirreabsortivo (qual)"
                placeholder="Ex.: Ácido zoledrônico, Pamidronato, Denosumabe..."
              />
            </ConditionalField>
            <ConditionalField
              data={data}
              onChange={onChange}
              showIf={{ campo: "Medicamentos antirreabsortivos", igual: "Outro" }}
              campos={["Medicamentos antirreabsortivos (outro)"]}
              className="pl-4 border-l-2 border-[#1B6CA8]/30 mt-3"
            >
              <InheritableInput
                {...commonProps}
                label="Especifique o uso ou previsão de antirreabsortivos"
                name="Medicamentos antirreabsortivos (outro)"
                placeholder="Descreva a medicação ou condição informada..."
              />
            </ConditionalField>
          </div>

          {/* Acesso à UBS */}
          <div>
            <InheritableTextarea
              {...commonProps}
              label="Tem acesso facilitado a atendimento odontológico na UBS?"
              name="Acesso odontológico UBS"
              placeholder="Descreva se o paciente possui UBS de referência, facilidade ou barreiras de acesso ao serviço odontológico básico..."
              rows={2}
            />
          </div>

          {/* Cáries cavitadas */}
          <div>
            <InheritableRadioPills
              {...commonProps}
              label="Cáries cavitadas? Em quais dentes?"
              name="Cáries cavitadas"
              options={ODONTO_CARIES_OPCOES}
            />
            <ConditionalField
              data={data}
              onChange={onChange}
              showIf={{ campo: "Cáries cavitadas", igual: "Sim" }}
              campos={["Dentes com cáries cavitadas"]}
              className="pl-4 border-l-2 border-[#1B6CA8]/30 mt-3"
            >
              <InheritableInput
                {...commonProps}
                label="Em quais dentes apresentam cáries cavitadas?"
                name="Dentes com cáries cavitadas"
                placeholder="Ex.: 16, 26, 36, 46..."
              />
            </ConditionalField>
            <ConditionalField
              data={data}
              onChange={onChange}
              showIf={{ campo: "Cáries cavitadas", igual: "Outro" }}
              campos={["Cáries cavitadas (outro)"]}
              className="pl-4 border-l-2 border-[#1B6CA8]/30 mt-3"
            >
              <InheritableInput
                {...commonProps}
                label="Especifique a avaliação de cáries"
                name="Cáries cavitadas (outro)"
                placeholder="Descreva as observações sobre as cáries..."
              />
            </ConditionalField>
          </div>

          {/* Mobilidade dentária */}
          <div>
            <InheritableRadioPills
              {...commonProps}
              label="Mobilidade dentária? Em quais dentes?"
              name="Mobilidade dentária"
              options={ODONTO_MOBILIDADE_OPCOES}
            />
            <ConditionalField
              data={data}
              onChange={onChange}
              showIf={{ campo: "Mobilidade dentária", igual: "Sim" }}
              campos={["Dentes com mobilidade"]}
              className="pl-4 border-l-2 border-[#1B6CA8]/30 mt-3"
            >
              <InheritableInput
                {...commonProps}
                label="Em quais dentes apresentam mobilidade?"
                name="Dentes com mobilidade"
                placeholder="Ex.: 31, 41..."
              />
            </ConditionalField>
            <ConditionalField
              data={data}
              onChange={onChange}
              showIf={{ campo: "Mobilidade dentária", igual: "Outro" }}
              campos={["Mobilidade dentária (outro)"]}
              className="pl-4 border-l-2 border-[#1B6CA8]/30 mt-3"
            >
              <InheritableInput
                {...commonProps}
                label="Especifique a avaliação de mobilidade dentária"
                name="Mobilidade dentária (outro)"
                placeholder="Descreva as observações sobre a mobilidade..."
              />
            </ConditionalField>
          </div>
        </div>
      </SectionCard>

      {/* 4. Avaliação e Encaminhamento */}
      <SectionCard title="4. Avaliação e encaminhamento" defaultOpen={true}>
        <div className="space-y-6">
          {/* Classificação do Risco Odontológico */}
          <div role="radiogroup" aria-labelledby="label-classificacao-risco-odonto">
            <span
              id="label-classificacao-risco-odonto"
              className="block text-xs font-bold text-[#1A2332] mb-1"
            >
              Classificação do Risco Odontológico
            </span>
            <p className="text-xs text-[#6B7A8D] mb-3">
              Selecione o nível de risco odontológico com base na avaliação clínica:
            </p>

            <div className="grid grid-cols-1 gap-3">
              {ODONTO_RISCO_ODONTOLOGICO_OPCOES.map((opt) => {
                const isSelected = riscoSelecionado === opt.valor;
                return (
                  <label
                    key={opt.valor}
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "border-[#1B6CA8] bg-[#F0F7FD] shadow-sm"
                        : "border-[#D5E6F3] bg-white hover:border-[#1B6CA8]/50 hover:bg-[#F9FBFE]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="Classificação do Risco Odontológico"
                      value={opt.valor}
                      checked={isSelected}
                      onChange={() => onChange("Classificação do Risco Odontológico", opt.valor)}
                      className="mt-1 w-4 h-4 accent-[#1B6CA8] focus:ring-[#1B6CA8]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded ${
                            opt.valor === "ALTO"
                              ? "bg-rose-100 text-rose-800"
                              : opt.valor === "MODERADO"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {opt.titulo}
                        </span>
                        {isSelected && (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-[#1B6CA8]">
                            <CheckCircle2 size={14} /> Selecionado
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#3A4354] mt-1.5 leading-relaxed">
                        {opt.descricao}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Encaminhamento para 2857 */}
          <div>
            <InheritableRadioPills
              {...commonProps}
              label="Encaminhar para 2857?"
              name="Encaminhar para 2857?"
              options={ODONTO_ENCAMINHAR_2857_OPCOES}
              subLabel="Código institucional de encaminhamento odontológico HUB"
            />
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
