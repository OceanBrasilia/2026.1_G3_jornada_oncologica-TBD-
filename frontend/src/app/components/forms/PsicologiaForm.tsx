import React, { useMemo, useState, useEffect } from "react";
import { User, Activity, AlertTriangle, FileText, CheckCircle } from "lucide-react";

export interface PsicologiaFormProps {
  data: Record<string, string>;
  onChange: (key: string, value: string) => void;
  patient: any;
  origins?: Record<string, string>;
}

const SharedField = ({ label, value, required }: any) => (
  <div>
    <label className="block text-xs font-bold text-[#1A2332] mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="px-3 py-2.5 rounded-xl bg-[#F4F7FB] border border-[#E8F4FD] text-sm text-[#6B7A8D] font-medium">
      {value || "—"}
    </div>
  </div>
);

const Card = ({ title, icon: Icon, children, className = "" }: any) => (
  <div className={`bg-white rounded-2xl border border-[rgba(27,108,168,0.1)] shadow-sm p-5 mb-5 ${className}`}>
    <h3 className="font-bold text-[#1A2332] mb-4 text-sm flex items-center gap-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
      {Icon && <Icon size={16} className="text-[#1B6CA8]" />} {title}
    </h3>
    {children}
  </div>
);

const Input = ({ label, name, placeholder = "", type = "text", value, data, onChange, required }: any) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.name, e.target.value);
  };
  return (
    <div>
      <label className="block text-xs font-bold text-[#1A2332] mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value ?? data?.[name] ?? ""}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition"
      />
    </div>
  );
};

const Select = ({ label, name, options, data, onChange, required }: any) => {
  const value = data?.[name] || "";
  const isOther = value && !options.includes(value);
  
  return (
    <div>
      <label className="block text-xs font-bold text-[#1A2332] mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={isOther ? "Outro" : value}
        required={required}
        onChange={(e) => {
          if (e.target.value !== "Outro") {
            onChange(name, e.target.value);
            onChange(`${name}_isOther`, "false");
          } else {
            onChange(name, ""); 
            onChange(`${name}_isOther`, "true");
          }
        }}
        className="w-full px-3 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition"
      >
        <option value="">Selecione...</option>
        {options.map((o: string) => (
          <option key={o} value={o}>{o}</option>
        ))}
        <option value="Outro">Outro</option>
      </select>
      
      {(isOther || data?.[`${name}_isOther`] === "true") && (
        <input
          type="text"
          value={isOther ? value : ""}
          onChange={(e) => {
            onChange(name, e.target.value);
          }}
          placeholder="Especifique..."
          required={required}
          className="mt-2 w-full px-3 py-2.5 rounded-xl border border-[#D5E6F3] bg-white text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition"
        />
      )}
    </div>
  );
};

const RadioGroup = ({ label, name, options, data, onChange, required }: any) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-bold text-[#1A2332] mb-2 leading-tight">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex flex-col sm:flex-row sm:gap-6 gap-2">
        {options.map((opt: string) => (
          <label key={opt} className="flex items-center gap-2 text-sm font-normal text-[#3A4354] cursor-pointer hover:text-[#1B6CA8] transition-colors">
            <input
              type="radio"
              name={name}
              value={opt}
              checked={data?.[name] === opt}
              onChange={(e) => onChange(name, e.target.value)}
              className="accent-[#1B6CA8] w-4 h-4"
              required={required}
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
};

const irpoQuestions = [
  { id: 1, text: "Tenho me sentido muito ansioso(a) por causa do meu tratamento.", padrao: 'A' },
  { id: 2, text: "Tenho medo do que pode acontecer comigo.", padrao: 'A' },
  { id: 3, text: "Sinto dificuldade de controlar minha preocupação com a doença.", padrao: 'A' },
  { id: 4, text: "Tenho sentido tristeza ou desânimo com frequência.", padrao: 'A' },
  { id: 5, text: "Tenho vontade de chorar sem saber o motivo.", padrao: 'A' },
  { id: 6, text: "Tenho tido pensamentos negativos sobre o futuro.", padrao: 'A' },
  { id: 7, text: "Sinto que posso contar com alguém quando estou triste.", padrao: 'B' },
  { id: 8, text: "Tenho recebido apoio emocional da minha família.", padrao: 'B' },
  { id: 9, text: "Tenho amigos ou pessoas próximas que me escutam quando preciso.", padrao: 'B' },
  { id: 10, text: "Sinto que as pessoas ao meu redor entendem o que estou passando.", padrao: 'B' },
  { id: 11, text: "Tenho me sentido acolhido(a) pela equipe de saúde.", padrao: 'B' },
  { id: 12, text: "Tenho buscado informações sobre o meu tratamento.", padrao: 'B' },
  { id: 13, text: "Tento manter uma atitude positiva frente à doença.", padrao: 'B' },
  { id: 14, text: "Procuro fazer atividades que me ajudam a relaxar ou distrair.", padrao: 'B' },
  { id: 15, text: "Tento manter minha rotina o máximo possível.", padrao: 'B' },
  { id: 16, text: "Busco conversar abertamente sobre meus sentimentos.", padrao: 'B' },
  { id: 17, text: "Tenho alguém que me acompanha às consultas e exames.", padrao: 'B' },
  { id: 18, text: "Recebo ajuda prática (financeira, transporte, alimentação, etc.) quando preciso.", padrao: 'B' },
  { id: 19, text: "Sinto que minha família está organizada para me ajudar.", padrao: 'B' },
  { id: 20, text: "Tenho recebido os cuidados de que preciso desde a descoberta do diagnóstico atual (médicos, familiares, social/espiritual).", padrao: 'B' },
  { id: 21, text: "Sinto que minha doença mudou completamente quem eu sou.", padrao: 'A' },
  { id: 22, text: "Tenho me sentido um peso para minha família.", padrao: 'A' },
  { id: 23, text: "Acho que minha vida perdeu o sentido por causa da doença.", padrao: 'A' },
  { id: 24, text: "Tenho dificuldade em aceitar meu diagnóstico.", padrao: 'A' },
  { id: 25, text: "Sinto que minha saúde pode melhorar.", padrao: 'B' },
  { id: 26, text: "Evito falar sobre minha doença.", padrao: 'A' },
  { id: 27, text: "Tenho medo constante da morte.", padrao: 'A' },
];

const likertOptions = ["Nunca", "Raramente", "Às vezes", "Frequentemente", "Sempre"];

const calculateScore = (answer: string, padrao: string) => {
  if (!answer) return 0;
  
  const scoreMapA: Record<string, number> = {
    "Nunca": 1,
    "Raramente": 2,
    "Às vezes": 3,
    "Frequentemente": 4,
    "Sempre": 5,
  };
  
  const scoreMapB: Record<string, number> = {
    "Nunca": 5,
    "Raramente": 4,
    "Às vezes": 3,
    "Frequentemente": 2,
    "Sempre": 1,
  };
  
  return padrao === 'A' ? scoreMapA[answer] || 0 : scoreMapB[answer] || 0;
};

export function PsicologiaForm({ data, onChange, patient }: PsicologiaFormProps) {
  
  const irpoTotalScore = useMemo(() => {
    let total = 0;
    irpoQuestions.forEach((q) => {
      const answer = data[`IRPO_${q.id}`];
      total += calculateScore(answer, q.padrao);
    });
    return total;
  }, [data]);

  const irpoRisk = useMemo(() => {
    if (irpoTotalScore === 0) return null; // No score yet
    if (irpoTotalScore < 55) return { level: "Baixo Risco", color: "bg-green-100 text-green-800 border-green-200", indication: "psicoeducação e orientações breves" };
    if (irpoTotalScore <= 69) return { level: "Risco Moderado", color: "bg-yellow-100 text-yellow-800 border-yellow-200", indication: "psicoterapia breve focada em enfrentamento" };
    return { level: "Alto Risco", color: "bg-red-100 text-red-800 border-red-200", indication: "psicoterapia intensiva e avaliação psiquiátrica" };
  }, [irpoTotalScore]);

  const hasSuicidalIdeation = data["IdeacaoSuicida"] === "Sim";
  
  const isCriticalRisk = hasSuicidalIdeation || (irpoTotalScore >= 70);

  const [alertAcknowledged, setAlertAcknowledged] = useState(false);

  useEffect(() => {
    if (isCriticalRisk) {
      setAlertAcknowledged(false);
    }
  }, [isCriticalRisk]);

  return (
    <div className="space-y-6">
      
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
              onClick={() => setAlertAcknowledged(true)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              Ciente, continuar atendimento
            </button>
          </div>
        </div>
      )}

      {/* Card 1: Estrutura de Identificação e Dados Sociodemográficos */}
      <Card title="1. Identificação e Dados Sociodemográficos" icon={User}>
        <div className="grid sm:grid-cols-2 gap-4">
          <SharedField label="Nome Completo" value={patient.name} required />
          <SharedField label="Prontuário" value={patient.id} />
          <SharedField label="CID" value={patient.cid} />
          <SharedField label="Contato telefônico" value={patient.phone} />
          <SharedField label="Idade" value={`${patient.age} anos`} required />
          <Input label="Data" name="Data" type="date" data={data} onChange={onChange} required />
          <Input label="Profissional Responsável" name="Profissional Responsável" data={data} onChange={onChange} />
          <Select label="Fase do Tratamento" name="Fase do Tratamento" options={["Diagnóstico", "Tratamento", "Acompanhamento (Follow-up)", "Cuidados Paliativos"]} data={data} onChange={onChange} />
          <Input label="Profissão" name="Profissão" data={data} onChange={onChange} />
          <Select label="Sexo" name="Sexo" options={["Masculino", "Feminino"]} data={data} onChange={onChange} required />
          <Select label="Estado Civil" name="Estado Civil" options={["Solteiro/a", "Casado/a", "Divorciado/a", "Viúvo/a"]} data={data} onChange={onChange} required />
          <Select label="Escolaridade" name="Escolaridade" options={["Não alfabetizado", "Ensino Fundamental Incompleto", "Ensino Fundamental Completo", "Ensino Médio Incompleto", "Ensino Médio Completo", "Ensino Superior Incompleto", "Ensino Superior Completo"]} data={data} onChange={onChange} required />
          <Input label="Religião / Crença" name="Religião" value={patient.religion} data={data} onChange={onChange} required />
          <Select label="Possui acompanhante hoje?" name="Acompanhante Hoje" options={["Sim", "Não"]} data={data} onChange={onChange} required />
        </div>
      </Card>

      {/* Card 2: Questionário IRPO */}
      <Card title="2. Questionário IRPO" icon={Activity}>
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-6 text-sm text-blue-800">
          <strong>Instrução:</strong> Assinale a frequência com que cada situação ocorreu nas últimas semanas.
        </div>
        
        <div className="space-y-6 divide-y divide-gray-100">
          {irpoQuestions.map((q) => (
            <div key={q.id} className="pt-4 first:pt-0">
              <RadioGroup
                label={`${q.id}. ${q.text}`}
                name={`IRPO_${q.id}`}
                options={likertOptions}
                data={data}
                onChange={onChange}
                required
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Card 3: Perguntas Extras e Conduta */}
      <Card title="3. Perguntas Extras e Conduta" icon={FileText}>
        <div className="space-y-6">
          <RadioGroup
            label="28. Recentemente tenho pensado em acabar com a minha própria vida"
            name="IdeacaoSuicida"
            options={["Sim", "Não"]}
            data={data}
            onChange={onChange}
          />

          {hasSuicidalIdeation && (
            <RadioGroup
              label="29. Se sim, apresenta planejamento?"
              name="PlanejamentoSuicida"
              options={["Sim", "Não", "Outro"]}
              data={data}
              onChange={onChange}
            />
          )}

          <div className="pt-4 border-t border-gray-100">
            <Select 
              label="Conduta: Encaminhado para" 
              name="CondutaEncaminhamento" 
              options={["Ambulatório de Psicologia", "Ambulatório de Psiquiatria", "Não identificada necessidade de encaminhamento no momento"]} 
              data={data} 
              onChange={onChange} 
            />
          </div>
        </div>
      </Card>

      {/* Resultados do IGR */}
      {irpoRisk && (
        <Card title="4. Estratificação de Risco (Índice Global de Risco - IGR)" icon={CheckCircle} className="bg-gray-50 border-gray-200">
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
