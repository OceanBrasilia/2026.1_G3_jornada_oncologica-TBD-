import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ArrowDownUp,
  Activity,
  Brain,
  Sparkles,
} from "lucide-react";
import { PatientHeader } from "../PatientHeader";
import { ReusedDataAccordion } from "../ReusedDataAccordion";
import { GlobalCriticalAlert } from "../ui/GlobalCriticalAlert";
import { generatePatientAlerts } from "../../alerts/generatePatientAlerts";
import { AlertLevel, PatientAlert } from "../../types/alerts";
import {
  InheritableInput,
  InheritableSelect,
  InheritableTextarea,
  InheritableRadioPills,
} from "./shared/InheritableFormComponents";
import { ConditionalField } from "./shared/ConditionalField";
import {
  irpoQuestions,
  calculateIrpoTotal,
  classifyIrpoRisk,
  type IrpoQuestion,
} from "../../calculos/irpo";

export interface PsicologiaFormProps {
  data: Record<string, any>;
  onChange: (key: string, value: any) => void;
  patient: any;
  origins?: Record<string, string>;
  inheritedData?: Record<string, any>;
}

export const CONDUTA_ENCAMINHAMENTO_OPCOES = [
  "Ambulatório de Psicologia",
  "Ambulatório de Psiquiatria",
  "Não identificada necessidade de encaminhamento nesse momento, mas o serviço foi disponibilizado para busca por livre demanda",
  "Outro",
];

const Card = ({ title, icon: Icon, children, className = "" }: any) => (
  <div className={`bg-white rounded-2xl border border-[rgba(27,108,168,0.1)] shadow-sm p-5 mb-5 ${className}`}>
    <h3
      className="font-bold text-[#1A2332] mb-4 text-sm flex items-center gap-2"
      style={{ fontFamily: "'Nunito', sans-serif" }}
    >
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

export const IrpoQuestionCard = ({
  q,
  data,
  onChange,
}: {
  q: IrpoQuestion;
  data: Record<string, any>;
  onChange: (key: string, value: any) => void;
}) => {
  const value = data[`IRPO_${q.id}`];
  const isInverted = q.padrao === "B";

  // Ordem lógica estrita de 1 a 5, com valor descritivo e pontos transparentes
  const options = [
    { num: 1, label: "Nunca", pts: isInverted ? 5 : 1 },
    { num: 2, label: "Raramente", pts: isInverted ? 4 : 2 },
    { num: 3, label: "Às vezes", pts: isInverted ? 3 : 3 },
    { num: 4, label: "Frequentemente", pts: isInverted ? 2 : 4 },
    { num: 5, label: "Sempre", pts: isInverted ? 1 : 5 },
  ];

  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 transition-all ${
        isInverted
          ? "bg-[#FFFBEB] border border-[#FDE68A] border-l-4 border-l-[#D97706] shadow-sm"
          : "bg-white border border-[#E2EAF1] shadow-xs"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
        <div className="flex items-start gap-2.5 flex-1">
          <span
            className={`font-bold text-sm px-2 py-0.5 rounded-md ${
              isInverted
                ? "bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D]"
                : "bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]"
            }`}
          >
            {q.id}.
          </span>
          <div>
            <span className="font-semibold text-[#1A2332] text-sm leading-snug">
              {q.text}
            </span>

            {/* Apoio explicativo da regra de cálculo para a questão */}
            {isInverted ? (
              <p className="text-xs text-[#92400E] font-medium mt-1.5 flex items-center gap-1.5">
                <span className="font-bold">Regra:</span>
                <span>Pontuação invertida — 1 (Nunca) = 5 pts até 5 (Sempre) = 1 pt</span>
              </p>
            ) : (
              <p className="text-xs text-[#64748B] mt-1.5">
                <span className="font-semibold">Regra:</span> Escala padrão — 1 (Nunca) = 1 pt até 5 (Sempre) = 5 pts
              </p>
            )}
          </div>
        </div>

        {/* Indicador visual e textual com ícone (não depende apenas de cor — RNF-007) */}
        {isInverted ? (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D] shrink-0 self-start shadow-xs"
            title="Esta questão possui pontuação invertida pelo instrumento"
          >
            <ArrowDownUp size={13} className="text-[#B45309]" />
            Pontuação invertida
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium text-[#64748B] bg-[#F8FAFC] border border-[#E2E8F0] shrink-0 self-start">
            Padrão
          </span>
        )}
      </div>

      {/* Escala em ordem estrita 1..5 com rótulo descritivo e pontos destacados */}
      <div className="mt-4">
        <div className="grid grid-cols-5 gap-1.5 sm:gap-3">
          {options.map((opt) => {
            const isSelected = value === opt.label;
            return (
              <button
                key={opt.num}
                type="button"
                onClick={() => onChange(`IRPO_${q.id}`, opt.label)}
                aria-label={`Questão ${q.id}: ${opt.num} - ${opt.label} (${opt.pts} ponto${opt.pts > 1 ? "s" : ""})`}
                className={`flex flex-col items-center justify-center py-2.5 px-1 sm:px-2 rounded-xl transition-all cursor-pointer select-none ${
                  isSelected
                    ? "bg-[#1B6CA8] text-white border-2 border-[#1B6CA8] shadow-md ring-2 ring-[#1B6CA8]/30 scale-[1.03]"
                    : isInverted
                    ? "bg-white text-[#1A2332] border border-[#FDE68A] hover:border-[#D97706] hover:bg-[#FEF3C7]/40"
                    : "bg-white text-[#1A2332] border border-[#D5E6F3] hover:border-[#1B6CA8] hover:bg-[#F0F6FB]"
                }`}
              >
                <span className="text-base font-extrabold leading-none">{opt.num}</span>
                <span
                  className={`text-[11px] font-semibold leading-tight mt-1 text-center truncate max-w-full ${
                    isSelected ? "text-white" : "text-[#334155]"
                  }`}
                >
                  {opt.label}
                </span>
                <span
                  className={`text-[10px] mt-0.5 font-medium ${
                    isSelected ? "text-blue-100" : "text-[#8A9EB9]"
                  }`}
                >
                  {opt.pts} {opt.pts === 1 ? "pt" : "pts"}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export function PsicologiaForm({
  data,
  onChange,
  patient,
  inheritedData,
  origins,
}: PsicologiaFormProps) {
  const commonProps = { data, onChange, inheritedData, origins };
  const irpoTotalScore = useMemo(() => calculateIrpoTotal(data), [data]);
  const irpoRisk = useMemo(() => classifyIrpoRisk(irpoTotalScore), [irpoTotalScore]);
  const hasSuicidalIdeation = data["IdeacaoSuicida"] === "Sim";

  const liveAlerts: PatientAlert[] = useMemo(() => {
    if (!hasSuicidalIdeation) return [];
    return generatePatientAlerts({ psicologia: { IdeacaoSuicida: "Sim" } }).filter((a) =>
      a.level.includes(AlertLevel.LEVEL_1)
    );
  }, [hasSuicidalIdeation]);

  const answeredQuestionsCount = useMemo(
    () => irpoQuestions.filter((q) => data[`IRPO_${q.id}`]).length,
    [data]
  );

  return (
    <div className="space-y-6">
      <PatientHeader
        id={patient?.id}
        name={patient?.name || ""}
        age={patient?.age}
        diagnosis={patient?.diagnosis}
        cid={patient?.cid}
        specialty="Psicologia"
        status="Pendente"
        alerts={patient?.alerts}
      />

      <GlobalCriticalAlert alerts={liveAlerts} />

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
          <InheritableSelect
            inheritedData={inheritedData}
            origins={origins}
            label="Sexo"
            name="Sexo"
            options={["Masculino", "Feminino", "Outro"]}
            hasOther={true}
            data={data}
            onChange={onChange}
          />
          <InheritableSelect
            inheritedData={inheritedData}
            origins={origins}
            label="Estado civil"
            name="Estado civil"
            options={["Solteiro(a)", "Casado(a)", "União Estável", "Separado(a)", "Divorciado(a)", "Viúvo(a)", "Outro"]}
            hasOther={true}
            data={data}
            onChange={onChange}
          />
          <InheritableSelect
            inheritedData={inheritedData}
            origins={origins}
            label="Escolaridade"
            name="Escolaridade"
            options={["Sem instrução", "Fundamental I e II", "Médio", "Superior", "Pós-graduação", "Outro"]}
            hasOther={true}
            data={data}
            onChange={onChange}
          />

          <InheritableSelect
            inheritedData={inheritedData}
            origins={origins}
            label="Fase do tratamento"
            name="Fase do tratamento"
            options={["Diagnóstico", "Tratamento", "Acompanhamento (Follow-up)", "Cuidados Paliativos"]}
            data={data}
            onChange={onChange}
          />
          <InheritableInput
            inheritedData={inheritedData}
            origins={origins}
            label="Profissional responsável pela aplicação"
            name="Profissional Responsável"
            data={data}
            onChange={onChange}
          />
        </div>
      </ReusedDataAccordion>

      <SectionCard title="IRPO — Instruções e Apoios Visuais" defaultOpen={true}>
        <div className="bg-[#F2FAF9] border border-[#D3EFEA] rounded-xl p-5 text-sm text-[#1A2332]">
          <p className="mb-3">
            Este questionário identifica indicadores de sofrimento emocional e necessidades de apoio psicológico durante o tratamento oncológico.
          </p>
          <p className="font-bold text-[#0F4C5C]">
            Oriente o(a) paciente a responder considerando a ÚLTIMA SEMANA.
          </p>
        </div>

        {/* Cartão de legenda da escala */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 mt-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain size={16} className="text-[#1B6CA8]" />
            <span className="text-xs font-bold text-[#1A2332] uppercase tracking-wider">
              Apoio de referência da escala Likert (1 a 5)
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-white border border-[#D5E6F3] text-center">
              <span className="font-bold text-[#1B6CA8] block text-sm">1</span>
              <span className="text-[#475569]">Nunca</span>
            </div>
            <div className="p-2 rounded-lg bg-white border border-[#D5E6F3] text-center">
              <span className="font-bold text-[#1B6CA8] block text-sm">2</span>
              <span className="text-[#475569]">Raramente</span>
            </div>
            <div className="p-2 rounded-lg bg-white border border-[#D5E6F3] text-center">
              <span className="font-bold text-[#1B6CA8] block text-sm">3</span>
              <span className="text-[#475569]">Às vezes</span>
            </div>
            <div className="p-2 rounded-lg bg-white border border-[#D5E6F3] text-center">
              <span className="font-bold text-[#1B6CA8] block text-sm">4</span>
              <span className="text-[#475569]">Frequentemente</span>
            </div>
            <div className="p-2 rounded-lg bg-white border border-[#D5E6F3] text-center">
              <span className="font-bold text-[#1B6CA8] block text-sm">5</span>
              <span className="text-[#475569]">Sempre</span>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="IRPO — Questões 1 a 27" defaultOpen={true}>
        {/* Item 3: Placar persistente / sticky da pontuação durante todo o preenchimento */}
        <div className="sticky top-2 z-20 bg-white/95 backdrop-blur-sm border border-[#B8D5ED] shadow-md rounded-2xl p-4 mb-6 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center h-12 w-12 rounded-xl bg-[#EBF4FA] border border-[#B8D5ED] text-[#1B6CA8] font-black text-xl shadow-inner shrink-0"
                aria-live="polite"
              >
                {irpoTotalScore}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs uppercase font-bold tracking-wider text-[#64748B]">
                    Pontuação IRPO em tempo real
                  </span>
                  <span className="text-xs bg-[#E2E8F0] text-[#334155] font-semibold px-2 py-0.5 rounded-full">
                    {answeredQuestionsCount} / 27 respondidas
                  </span>
                </div>
                <p className="text-sm font-bold text-[#1A2332]">
                  {irpoTotalScore} {irpoTotalScore === 1 ? "ponto" : "pontos"} acumulados
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {irpoRisk ? (
                <span
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border shadow-xs ${irpoRisk.color}`}
                >
                  {irpoRisk.level}
                </span>
              ) : (
                <span className="text-xs text-[#8A9EB9] italic">
                  Responda às questões para atualizar o escore
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Lista das 27 questões do IRPO */}
        <div className="space-y-4">
          {irpoQuestions.map((q) => (
            <IrpoQuestionCard key={q.id} q={q} data={data} onChange={onChange} />
          ))}
        </div>

        <div className="pt-4 text-xs text-[#64748B] font-medium flex items-center justify-between">
          <span>Total de questões respondidas: {answeredQuestionsCount} de 27</span>
          <span className="text-[#1B6CA8] font-bold">Total atual: {irpoTotalScore} pontos</span>
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
                <span className="text-[#B91C1C] font-bold text-sm">
                  Alerta clínico ativo — registrar conduta imediatamente.
                </span>
              </div>
            )}
          </div>

          <ConditionalField
            data={data}
            onChange={onChange}
            showIf={{ campo: "IdeacaoSuicida", igual: "Sim" }}
            campos={["PlanejamentoSuicida"]}
          >
            <div>
              <InheritableRadioPills
                label="29. Apresenta planejamento?"
                name="PlanejamentoSuicida"
                options={["Sim", "Não", "Outro"]}
                hasOther={true}
                data={data}
                onChange={onChange}
              />
              {data["PlanejamentoSuicida"] === "Sim" && (
                <div className="mt-4 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl p-4 flex items-center gap-3">
                  <AlertTriangle className="text-[#DC2626] h-5 w-5 shrink-0" />
                  <span className="text-[#B91C1C] font-bold text-sm">
                    Risco aumentado com planejamento confirmado — acionar protocolo institucional.
                  </span>
                </div>
              )}
            </div>
          </ConditionalField>

          <ConditionalField
            data={data}
            onChange={onChange}
            showIf={{ campo: "IdeacaoSuicida", igual: "Sim" }}
            campos={["CondutaAdotadaAlerta"]}
            className="pt-2 border-t border-gray-100"
          >
            <InheritableTextarea
              inheritedData={inheritedData}
              origins={origins}
              label="Conduta adotada frente ao alerta"
              name="CondutaAdotadaAlerta"
              data={data}
              onChange={onChange}
            />
          </ConditionalField>
        </div>
      </SectionCard>

      {/* Itens 5, 6 e 7: Conduta e encaminhamento clínico com separação estrita de score e decisão */}
      <SectionCard title="Conduta e encaminhamento clínico">
        <div className="space-y-6">
          {/* Caixa de separação do score teórico versus decisão do profissional */}
          {irpoRisk && (
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                  Referência Teórica do Instrumento (IRPO / IGR)
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${irpoRisk.color}`}>
                  {irpoRisk.level} ({irpoTotalScore} pontos)
                </span>
              </div>
              <p className="text-xs text-[#475569]">
                <strong className="text-[#1A2332]">Diretriz de apoio do instrumento:</strong> {irpoRisk.indication}
              </p>
              <p className="text-[11px] text-[#64748B] italic">
                A indicação acima é informativa (RF-020). A conduta e o encaminhamento clínico definitivo são de decisão exclusiva do profissional na Questão 44 abaixo.
              </p>
            </div>
          )}

          {/* Questão 44 — Dropdown próprio de seleção única com suporte nativo a Outro */}
          <InheritableSelect
            inheritedData={inheritedData}
            origins={origins}
            label="44. Indicação / Encaminhamento"
            subLabel="Marcar apenas uma opção."
            name="CondutaEncaminhamento"
            options={CONDUTA_ENCAMINHAMENTO_OPCOES}
            hasOther={true}
            data={data}
            onChange={(key, val) => {
              onChange(key, val);
              if (key === "CondutaEncaminhamento") {
                onChange("indicacaoEncaminhamento", val);
                onChange("Encaminhado (a) para", val);
              }
            }}
          />
        </div>
      </SectionCard>

      {/* Resultados do IGR consolidado */}
      {irpoRisk && (
        <Card
          title="Estratificação de Risco (Índice Global de Risco - IGR)"
          icon={CheckCircle}
          className="bg-gray-50 border-gray-200"
        >
          <div className="flex flex-col md:flex-row items-center gap-6 p-2">
            <div className="flex flex-col items-center justify-center p-6 bg-white rounded-full h-32 w-32 border-4 shadow-sm border-blue-100 shrink-0">
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
                <h5 className="text-sm font-bold text-gray-700">Diretriz teórica de apoio:</h5>
                <p className="text-sm text-gray-600 mt-1">{irpoRisk.indication}</p>
                <p className="text-xs text-gray-400 mt-1 italic">
                  A indicação e conduta definitivas são selecionadas pelo profissional na Questão 44.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
