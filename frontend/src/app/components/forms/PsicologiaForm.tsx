import React, { useMemo, useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { PatientHeader } from "../PatientHeader";
import { ReusedDataAccordion } from "../ReusedDataAccordion";

export interface PsicologiaFormProps {
  data: Record<string, string>;
  onChange: (key: string, value: string) => void;
  patient: any;
  origins?: Record<string, string>;
  inheritedData?: Record<string, any>;
}

import { InheritableInput, InheritableSelect, InheritableTextarea, InheritableRadioPills, InheritableCheckboxGroup, InheritableRadioGroup } from "./shared/InheritableFormComponents";
import { ConditionalField } from "./shared/ConditionalField";
import { irpoQuestions, calculateIrpoTotal, classifyIrpoRisk, isIrpoCriticalRisk } from "../../calculos/irpo";

const Card = ({ title, icon: Icon, children, className = "" }: any) => (
  <div className={`bg-white rounded-2xl border border-[rgba(27,108,168,0.1)] shadow-sm p-5 mb-5 ${className}`}>
    <h3 className="font-bold text-[#1A2332] mb-4 text-sm flex items-center gap-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
      {Icon && <Icon size={16} className="text-[#1B6CA8]" />} {title}
    </h3>
    {children}
  </div>
);

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

const IrpoQuestionCard = ({ q, data, onChange }: any) => {
  const value = data[`IRPO_${q.id}`];
  
  const options = [
    { label: "1", value: "Nunca" },
    { label: "2", value: "Raramente" },
    { label: "3", value: "Às vezes" },
    { label: "4", value: "Frequentemente" },
    { label: "5", value: "Sempre" }
  ];

  return (
    <div className="pb-8 border-b border-gray-100 last:border-0 last:pb-0">
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-2">
          <span className="font-bold text-[#8A9EB9] text-sm">{q.id}.</span>
          <span className="font-medium text-[#1A2332] text-sm">{q.text}</span>
        </div>
        {q.padrao === 'B' && (
          <span className="bg-[#F1F5F9] text-[#64748B] text-[10px] font-bold px-1.5 py-0.5 rounded border border-[#E2E8F0] ml-2 shrink-0">
            inv.
          </span>
        )}
      </div>

      <div>
        <div className="flex justify-between gap-2 sm:gap-4">
          {options.map((opt) => {
            const isSelected = value === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange(`IRPO_${q.id}`, opt.value)}
                className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${
                  isSelected
                    ? "bg-[#1B6CA8] text-white border-2 border-[#1B6CA8] shadow-sm scale-[1.05]"
                    : "bg-white text-[#3A4354] border border-[#D5E6F3] hover:border-[#1B6CA8] hover:text-[#1B6CA8]"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        <div className="flex justify-between mt-2 px-1 text-[11px] text-[#8A9EB9] font-medium">
          <span>Nunca</span>
          <span>Sempre</span>
        </div>
      </div>
    </div>
  );
};

export function PsicologiaForm({ data, onChange, patient, inheritedData, origins }: PsicologiaFormProps) {
  const commonProps = { data, onChange, inheritedData, origins };
  const irpoTotalScore = useMemo(() => calculateIrpoTotal(data), [data]);

  const irpoRisk = useMemo(() => classifyIrpoRisk(irpoTotalScore), [irpoTotalScore]);

  const hasSuicidalIdeation = data["IdeacaoSuicida"] === "Sim";

  const isCriticalRisk = hasSuicidalIdeation || isIrpoCriticalRisk(irpoTotalScore);

  const [alertAcknowledged, setAlertAcknowledged] = useState(false);

  useEffect(() => {
    if (isCriticalRisk) {
      setAlertAcknowledged(false);
    }
  }, [isCriticalRisk]);

  const answeredQuestionsCount = irpoQuestions.filter(q => data[`IRPO_${q.id}`]).length;

  return (
    <div className="space-y-6">
      
      <PatientHeader 
        id="CAO-2024-0002"
        name={patient?.name || ""}
        age={patient?.age}
        diagnosis={patient?.diagnosis}
        cid={patient?.cid}
        specialty="Psicologia"
        status="Pendente"
        alerts={patient?.alerts}
      />

      {isCriticalRisk && !alertAcknowledged && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200 border-t-8 border-red-600">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-red-100 p-3 rounded-full shrink-0">
                <AlertTriangle className="text-red-600 h-8 w-8" />
              </div>
              <h3 className="text-xl font-black text-red-700 leading-tight">ALERTA CRÍTICO DE RISCO</h3>
            </div>
            <div className="text-gray-700 mb-6 space-y-3">
              {hasSuicidalIdeation && <p>• <strong>Risco identificado:</strong> Ideação suicida ativa relatada.</p>}
              {irpoTotalScore >= 70 && <p>• <strong>Risco identificado:</strong> IGR ≥ 70 (Distress intenso e coping deficitário).</p>}
              
              <div className="mt-4 bg-red-50 p-3 rounded-lg border border-red-200 flex gap-2">
                <AlertTriangle size={20} className="text-red-600 shrink-0" />
                <p className="text-red-800 font-bold text-sm">
                  Ação Necessária: Avaliação prioritária exigida.
                </p>
              </div>
            </div>
            <button 
               type="button"
              onClick={() => setAlertAcknowledged(true)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              Ciente, continuar atendimento
            </button>
          </div>
        </div>
      )}

      <ReusedDataAccordion
        title="Identificação (reaproveitada)"
        fields={[
          { label: "NOME COMPLETO", value: patient?.name || "", origin: "Cadastro" },
          { label: "CID", value: patient?.cid || "", origin: "Recepção" },
          { label: "DIAGNÓSTICO", value: patient?.diagnosis || "", origin: "Recepção" },
          { label: "TELEFONE", value: patient?.phone || "", origin: "Cadastro" },
        ]}
        data={data}
        onChange={onChange}
      >
        <div className="flex flex-col gap-4">
          <InheritableSelect inheritedData={inheritedData} origins={origins} label="Sexo" name="Sexo" options={["Masculino", "Feminino"]} data={data} onChange={onChange} />
          <InheritableSelect inheritedData={inheritedData} origins={origins} label="Estado civil" name="Estado civil" options={["Solteiro/a", "Casado/a", "Divorciado/a", "Viúvo/a"]} data={data} onChange={onChange} />
          <InheritableSelect inheritedData={inheritedData} origins={origins} label="Escolaridade" name="Escolaridade" options={["Não alfabetizado", "Ensino Fundamental Incompleto", "Ensino Fundamental Completo", "Ensino Médio Incompleto", "Ensino Médio Completo", "Ensino Superior Incompleto", "Ensino Superior Completo"]} data={data} onChange={onChange} />

          <InheritableSelect inheritedData={inheritedData} origins={origins} label="Fase do tratamento" name="Fase do tratamento" options={["Diagnóstico", "Tratamento", "Acompanhamento (Follow-up)", "Cuidados Paliativos"]} data={data} onChange={onChange} />
          <InheritableInput inheritedData={inheritedData} origins={origins} label="Profissional responsável pela aplicação" name="Profissional Responsável" data={data} onChange={onChange} />
        </div>
      </ReusedDataAccordion>

      <SectionCard title="IRPO — Instruções" defaultOpen={true}>
        <div className="bg-[#F2FAF9] border border-[#D3EFEA] rounded-xl p-5 text-sm text-[#1A2332]">
          <p className="mb-4">Este questionário identifica indicadores de sofrimento emocional e necessidades de apoio psicológico durante o tratamento oncológico.</p>
          <p className="font-bold">Responda considerando a ÚLTIMA SEMANA.</p>
        </div>
        <div className="flex flex-wrap gap-4 justify-between text-[13px] text-[#8A9EB9] font-medium mt-4 px-2">
          <span>1 – Nunca</span>
          <span>2 – Raramente</span>
          <span>3 – Às vezes</span>
          <span>4 – Frequentemente</span>
          <span>5 – Sempre</span>
        </div>
      </SectionCard>

      <SectionCard title="IRPO — Questões 1 a 27" defaultOpen={true}>
        <div className="space-y-6">
          {irpoQuestions.map((q) => (
            <IrpoQuestionCard key={q.id} q={q} data={data} onChange={onChange} />
          ))}
        </div>
        <div className="pt-5 mt-2 text-sm text-[#3A4354] font-medium">
          Respondidas: {answeredQuestionsCount} / 27
        </div>
      </SectionCard>

      <SectionCard title="Alertas clínicos (questões 28 e 29)">
        <div className="space-y-8">
          <div>
            <InheritableRadioPills
              label="28. Recentemente tenho pensado em acabar com a minha própria vida?"
              name="IdeacaoSuicida"
              options={["Sim", "Não"]}
              data={data}
              onChange={onChange}
            />
            {data["IdeacaoSuicida"] === "Sim" && (
              <div className="mt-4 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl p-4 flex items-center gap-3">
                <AlertTriangle className="text-[#DC2626] h-5 w-5 shrink-0" />
                <span className="text-[#B91C1C] font-bold text-sm">Alerta clínico ativo — registrar conduta imediatamente.</span>
              </div>
            )}
          </div>

          <ConditionalField data={data} onChange={onChange} showIf={{ campo: "IdeacaoSuicida", igual: "Sim" }} campos={["PlanejamentoSuicida"]}>
            <div>
              <InheritableRadioPills
                label="29. Apresenta planejamento?"
                name="PlanejamentoSuicida"
                options={["Sim", "Não", "Outro"]}
                data={data}
                onChange={onChange}
              />
              {data["PlanejamentoSuicida"] === "Sim" && (
                <div className="mt-4 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl p-4 flex items-center gap-3">
                  <AlertTriangle className="text-[#DC2626] h-5 w-5 shrink-0" />
                  <span className="text-[#B91C1C] font-bold text-sm">Risco aumentado com planejamento confirmado — acionar protocolo institucional.</span>
                </div>
              )}
            </div>
          </ConditionalField>

          <ConditionalField data={data} onChange={onChange} showIf={{ campo: "IdeacaoSuicida", igual: "Sim" }} campos={["CondutaAdotadaAlerta"]} className="pt-2 border-t border-gray-100">
            <InheritableTextarea inheritedData={inheritedData} origins={origins}
              label="Conduta adotada frente ao alerta"
              name="CondutaAdotadaAlerta"
              data={data}
              onChange={onChange}
            />
          </ConditionalField>
        </div>
      </SectionCard>

      <SectionCard title="Conduta e encaminhamento">
        <div className="space-y-5">
          <InheritableSelect inheritedData={inheritedData} origins={origins} 
            label="Encaminhado(a) para" 
            name="CondutaEncaminhamento" 
            options={["Ambulatório de Psicologia", "Ambulatório de Psiquiatria", "Não identificada necessidade de encaminhamento nesse momento, mas o serviço foi disponibilizado para busca por livre demanda"]} 
            data={data} 
            onChange={onChange} 
          />
        </div>
      </SectionCard>

      {/* Resultados do IGR */}
      {irpoRisk && (
        <Card title="Estratificação de Risco (Índice Global de Risco - IGR)" icon={CheckCircle} className="bg-gray-50 border-gray-200">
          <div className="flex flex-col md:flex-row items-center gap-6 p-2">
            <div className="flex flex-col items-center justify-center p-6 bg-white rounded-full h-32 w-32 border-4 shadow-sm border-blue-100">
              <span className="text-3xl font-black text-blue-900">{irpoTotalScore}</span>
              <span className="text-xs font-bold text-gray-400">PONTOS</span>
            </div>
            
            <div className="flex-1 space-y-3 w-full text-center md:text-left">
              <div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${irpoRisk.color}`}>
                  {irpoRisk.level}
                </span>
              </div>
              <div>
                <h5 className="text-sm font-bold text-gray-700">Indicação Terapêutica:</h5>
                <p className="text-sm text-gray-600 mt-1">{irpoRisk.indication}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

    </div>
  );
}
