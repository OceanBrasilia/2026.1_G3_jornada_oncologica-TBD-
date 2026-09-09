import React, { useMemo } from "react";
import { 
  calculateIMC, calculateBox1Score, calculateBox2Score, calculateBox3Score, 
  calculateBox4Score, calculateBoxBScore, calculateBoxCScore, calculateBoxDScore,
  getTriageInfo
} from "../../utils/nutritionScoring";
import { HabitsField } from "./shared/HabitsField";

export interface FormProps {
  data: Record<string, any>;
  onChange: (key: string, value: any) => void;
  patient: any;
  origins?: Record<string, string>;
}

const SharedField = ({ label, value, from, onChange, type = "text", placeholder = "", disabled = false }: any) => (
  <div>
    <label className="block text-xs font-bold text-[#1A2332] mb-1">{label}</label>
    {from && !disabled ? (
      <div className="relative">
        <input type={type} value={value ?? ""} onChange={onChange} placeholder={placeholder} disabled={disabled}
          className="w-full pl-3 pr-24 py-2.5 rounded-xl border border-[#2DB5A3]/50 bg-[#F0FBF9] text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#2DB5A3]/30 transition disabled:opacity-60" />
        <span className="absolute right-3 top-3 text-[10px] text-[#2DB5A3] font-semibold bg-[#F0FBF9] pl-2">↩ {from}</span>
      </div>
    ) : (
      <input type={type} value={value ?? ""} onChange={onChange} placeholder={placeholder} disabled={disabled}
        className="w-full px-3 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 transition disabled:opacity-60" />
    )}
  </div>
);

const RadioGroup = ({ label, options, value, onChange }: any) => (
  <div className="mb-3">
    <label className="block text-xs font-bold text-[#1A2332] mb-2">{label}</label>
    <div className="space-y-2">
      {options.map((opt: string) => (
        <label key={opt} className="flex items-center space-x-2 text-sm text-[#1A2332] cursor-pointer">
          <input 
            type="radio" 
            name={label} 
            value={opt} 
            checked={value === opt} 
            onChange={(e) => onChange(e.target.value)}
            className="w-4 h-4 text-[#1B6CA8] focus:ring-[#1B6CA8]"
          />
          <span>{opt}</span>
        </label>
      ))}
    </div>
  </div>
);

const CheckboxGroup = ({ label, options, selected, onChange }: any) => (
  <div className="mb-3">
    <label className="block text-xs font-bold text-[#1A2332] mb-2">{label}</label>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {options.map((opt: string) => (
        <label key={opt} className="flex items-center space-x-2 text-sm text-[#1A2332] cursor-pointer">
          <input 
            type="checkbox" 
            checked={(selected || []).includes(opt)} 
            onChange={(e) => {
              const current = selected || [];
              if (e.target.checked) {
                onChange([...current, opt]);
              } else {
                onChange(current.filter((item: string) => item !== opt));
              }
            }}
            className="w-4 h-4 rounded text-[#1B6CA8] focus:ring-[#1B6CA8]"
          />
          <span>{opt}</span>
        </label>
      ))}
    </div>
  </div>
);

export function NutricaoForm({ data, origins, onChange, patient }: FormProps) {
  const getVal = (key: string, fallbackKey?: string) => {
    if (data[key] !== undefined) return data[key];
    if (fallbackKey && patient[fallbackKey] !== undefined) return patient[fallbackKey];
    return "";
  };

  const dob = getVal("data_nasc");
  let computedAge = getVal("idade", "age");
  if (!computedAge && dob) {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    computedAge = age.toString();
  }

  const weight = getVal("peso", "weight");
  const height = getVal("altura", "height");
  const imc = useMemo(() => calculateIMC(weight, height) || "—", [weight, height]);

  // Scores
  const box1Score = useMemo(() => calculateBox1Score(weight, data.peso_1m || "", data.peso_6m || "", data.peso_var_2sem || ""), [weight, data.peso_1m, data.peso_6m, data.peso_var_2sem]);
  const box2Score = useMemo(() => calculateBox2Score(data.ingestao_mudanca || "", data.ingestao_atual || ""), [data.ingestao_mudanca, data.ingestao_atual]);
  const box3Score = useMemo(() => calculateBox3Score(data.sintomas || []), [data.sintomas]);
  const box4Score = useMemo(() => calculateBox4Score(data.atividade || ""), [data.atividade]);
  const boxBScore = useMemo(() => calculateBoxBScore(data.doencas || []), [data.doencas]);
  const boxCScore = useMemo(() => calculateBoxCScore(parseInt(data.febre || "0"), parseInt(data.corticoide || "0")), [data.febre, data.corticoide]);
  const boxDScore = useMemo(() => calculateBoxDScore(parseInt(data.exame_fisico || "0")), [data.exame_fisico]);

  const totalScore = box1Score + box2Score + box3Score + box4Score + boxBScore + boxCScore + boxDScore;
  const triage = getTriageInfo(totalScore);

  return (
    <div className="space-y-6">
      {/* Seção 1 */}
      <div className="bg-white rounded-2xl border border-[rgba(27,108,168,0.1)] shadow-sm p-5">
        <h3 className="font-bold text-[#1A2332] mb-4 text-base border-b pb-2">Seção 1: Dados Cadastrais e Clínicos</h3>
        
        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          <SharedField label="Sexo" value={getVal("sexo")} onChange={(e: any) => onChange("sexo", e.target.value)} />
          <SharedField label="Registro" value={getVal("registro")} onChange={(e: any) => onChange("registro", e.target.value)} />
          <SharedField label="Data de nascimento" type="date" value={getVal("data_nasc")} onChange={(e: any) => onChange("data_nasc", e.target.value)} />
          <SharedField label="Idade" type="number" value={computedAge} onChange={(e: any) => onChange("idade", e.target.value)} />
          <SharedField label="CID" value={getVal("cid", "cid")} onChange={(e: any) => onChange("cid", e.target.value)} />
          <SharedField label="Escolaridade" value={getVal("escolaridade")} onChange={(e: any) => onChange("escolaridade", e.target.value)} />
          <SharedField label="Via de alimentação" value={getVal("via_alimentacao")} onChange={(e: any) => onChange("via_alimentacao", e.target.value)} />
          <SharedField label="Renda familiar" placeholder="R$, salários, habitação..." value={getVal("renda")} onChange={(e: any) => onChange("renda", e.target.value)} />
        </div>

        <h4 className="font-bold text-[#1A2332] text-sm mt-6 mb-3">Antropometria</h4>
        <div className="grid sm:grid-cols-3 gap-3 mb-6">
          <SharedField label="Peso (kg)" value={weight} from={origins?.["peso"] ?? (patient?.weight ? "Cadastro" : undefined)} onChange={(e: any) => onChange("peso", e.target.value)} />
          <SharedField label="Altura (m)" value={height} from={origins?.["altura"] ?? (patient?.height ? "Cadastro" : undefined)} onChange={(e: any) => onChange("altura", e.target.value)} />
          <div>
            <label className="block text-xs font-bold text-[#1A2332] mb-1">IMC Atual</label>
            <div className="px-3 py-2.5 rounded-xl bg-[#E8F4FD] border border-[#D5E6F3] text-sm text-[#1B6CA8] font-bold">{imc}</div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mb-4">
          <div>
            <RadioGroup label="Tratamento prévio" options={["Não", "Sim"]} value={data.tratamento_previo} onChange={(v: string) => onChange("tratamento_previo", v)} />
            {data.tratamento_previo === "Sim" && <SharedField label="Qual? (cirurgia, RT, BQT, QT)" value={data.tratamento_qual} onChange={(e: any) => onChange("tratamento_qual", e.target.value)} />}
          </div>
          <div>
            <RadioGroup label="Suplementação" options={["Não", "Sim"]} value={data.suplementacao} onChange={(v: string) => onChange("suplementacao", v)} />
            {data.suplementacao === "Sim" && <SharedField label="Qual?" value={data.suplementacao_qual} onChange={(e: any) => onChange("suplementacao_qual", e.target.value)} />}
          </div>
          <div>
            <RadioGroup label="Atividade física" options={["Não", "Sim (intensidade leve, moderada ou vigorosa)"]} value={data.atividade_fisica} onChange={(v: string) => onChange("atividade_fisica", v)} />
          </div>
        </div>

        <div className="mb-4">
          <HabitsField data={data} origins={origins} onChange={onChange} />
        </div>
        
        <div className="mt-4">
          <label className="block text-xs font-bold text-[#1A2332] mb-1">Conduta</label>
          <textarea 
            value={data.conduta ?? ""} 
            onChange={(e) => onChange("conduta", e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 transition min-h-[80px]"
            placeholder="Descreva a conduta nutricional..."
          />
        </div>
      </div>

      {/* Seção 2 */}
      <div className="bg-white rounded-2xl border border-[rgba(27,108,168,0.1)] shadow-sm p-5">
        <h3 className="font-bold text-[#1A2332] mb-4 text-base border-b pb-2">Seção 2: Preenchimento pelo Paciente</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#F9FBFE] p-4 rounded-xl border border-[#D5E6F3]">
            <h4 className="font-bold text-[#1B6CA8] text-sm mb-3">Caixa 1: História de Peso (Pts: {box1Score})</h4>
            <div className="space-y-3">
              <SharedField label="Eu atualmente peso aproximadamente (kg)" value={weight} disabled={true} onChange={() => {}} />
              <SharedField label="Eu tenho aproximadamente (m)" value={height} disabled={true} onChange={() => {}} />
              <SharedField label="Há um mês atrás eu pesava aproximadamente (kg)" value={data.peso_1m} onChange={(e: any) => onChange("peso_1m", e.target.value)} />
              <SharedField label="Há seis meses atrás eu pesava aproximadamente (kg)" value={data.peso_6m} onChange={(e: any) => onChange("peso_6m", e.target.value)} />
              <RadioGroup 
                label="Durante as 2 últimas semanas meu peso:" 
                options={["diminuiu", "ficou igual", "aumentou"]} 
                value={data.peso_var_2sem} 
                onChange={(v: string) => onChange("peso_var_2sem", v)} 
              />
            </div>
          </div>

          <div className="bg-[#F9FBFE] p-4 rounded-xl border border-[#D5E6F3]">
            <h4 className="font-bold text-[#1B6CA8] text-sm mb-3">Caixa 2: Ingestão Alimentar (Pts: {box2Score})</h4>
            <div className="space-y-4">
              <RadioGroup 
                label="Em comparação à minha alimentação normal, considero minha ingestão no último mês como:" 
                options={["sem mudanças", "mais que o normal", "menos que o normal"]} 
                value={data.ingestao_mudanca} 
                onChange={(v: string) => onChange("ingestao_mudanca", v)} 
              />
              <RadioGroup 
                label="Atualmente, eu estou comendo:" 
                options={[
                  "comida normal em menor quantidade", 
                  "comida normal em pouca quantidade", 
                  "apenas líquidos", 
                  "apenas suplementos nutricionais", 
                  "muito pouco de qualquer comida", 
                  "apenas alimentos pela sonda ou veia"
                ]} 
                value={data.ingestao_atual} 
                onChange={(v: string) => onChange("ingestao_atual", v)} 
              />
            </div>
          </div>

          <div className="bg-[#F9FBFE] p-4 rounded-xl border border-[#D5E6F3]">
            <h4 className="font-bold text-[#1B6CA8] text-sm mb-3">Caixa 3: Sintomas (Pts: {box3Score})</h4>
            <CheckboxGroup 
              label="Durante as últimas 2 semanas eu tenho tido os seguintes problemas:" 
              options={[
                "sem problemas para se alimentar", "sem apetite", "náusea", "vômito", 
                "constipação", "diarreia", "feridas na boca", "boca seca", 
                "problemas para engolir", "alimentos com gosto estranho/sem gosto", 
                "rapidamente me sinto satisfeito", "cheiros me enjoam", "dor", "outros"
              ]} 
              selected={data.sintomas} 
              onChange={(v: string[]) => onChange("sintomas", v)} 
            />
            {data.sintomas?.includes("dor") && <SharedField label="Onde dói?" value={data.dor_onde} onChange={(e: any) => onChange("dor_onde", e.target.value)} />}
            {data.sintomas?.includes("outros") && <SharedField label="Quais outros problemas?" value={data.sintomas_outros} onChange={(e: any) => onChange("sintomas_outros", e.target.value)} />}
          </div>

          <div className="bg-[#F9FBFE] p-4 rounded-xl border border-[#D5E6F3]">
            <h4 className="font-bold text-[#1B6CA8] text-sm mb-3">Caixa 4: Atividades e Função (Pts: {box4Score})</h4>
            <RadioGroup 
              label="No último mês, eu consideraria minha atividade como:" 
              options={[
                "normal, sem limitação",
                "capaz de manter quase todas as atividades normais",
                "ficando na cama/cadeira menos da metade do dia",
                "capaz de fazer pouca atividade, maior parte do tempo na cama/cadeira",
                "acamado, raramente fora da cama"
              ]} 
              value={data.atividade} 
              onChange={(v: string) => onChange("atividade", v)} 
            />
          </div>
        </div>
      </div>

      {/* Seção 3 */}
      <div className="bg-white rounded-2xl border border-[rgba(27,108,168,0.1)] shadow-sm p-5">
        <h3 className="font-bold text-[#1A2332] mb-4 text-base border-b pb-2">Seção 3: Preenchimento Profissional</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#F9FBFE] p-4 rounded-xl border border-[#D5E6F3]">
            <h4 className="font-bold text-[#1B6CA8] text-sm mb-3">Anexo 2 (Caixa B) - Doenças (Pts: {boxBScore})</h4>
            <CheckboxGroup 
              label="Selecione as condições (1 pt cada):" 
              options={[
                "Estadiamento (I, II, III, IV, Outro)", "Câncer", "AIDS", 
                "Caquexia pulmonar/cardíaca", "Úlcera de decúbito/ferida/fístula", 
                "Trauma", "Idade maior que 65 anos"
              ]} 
              selected={data.doencas} 
              onChange={(v: string[]) => onChange("doencas", v)} 
            />
          </div>

          <div className="bg-[#F9FBFE] p-4 rounded-xl border border-[#D5E6F3]">
            <h4 className="font-bold text-[#1B6CA8] text-sm mb-3">Anexo 3 (Caixa C) - Estresse (Pts: {boxCScore})</h4>
            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#1A2332]">Febre</label>
              <select className="w-full px-3 py-2 rounded-xl border border-[#D5E6F3] bg-white text-sm" value={data.febre ?? "0"} onChange={e => onChange("febre", e.target.value)}>
                <option value="0">Nenhum (0) / Sem febre</option>
                <option value="1">Baixo (1) / &lt; 72h</option>
                <option value="2">Moderado (2) / 72h</option>
                <option value="3">Alto (3) / &gt; 72h</option>
              </select>

              <label className="block text-xs font-bold text-[#1A2332] mt-2">Corticosteroides</label>
              <select className="w-full px-3 py-2 rounded-xl border border-[#D5E6F3] bg-white text-sm" value={data.corticoide ?? "0"} onChange={e => onChange("corticoide", e.target.value)}>
                <option value="0">Sem (0)</option>
                <option value="1">Dose baixa (1)</option>
                <option value="2">Dose moderada (2)</option>
                <option value="3">Dose alta (3)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-[#F9FBFE] p-4 rounded-xl border border-[#D5E6F3] mt-6">
          <h4 className="font-bold text-[#1B6CA8] text-sm mb-3">Anexo 4 (Caixa D) - Exame Físico (Pts: {boxDScore})</h4>
          <p className="text-xs text-gray-500 mb-3">Avalie gordura, músculo e hidratação (0 a +3). Insira o escore subjetivo final abaixo.</p>
          <div className="w-64">
            <label className="block text-xs font-bold text-[#1A2332] mb-1">Escore subjetivo final do déficit corporal</label>
            <select className="w-full px-3 py-2 rounded-xl border border-[#D5E6F3] bg-white text-sm font-semibold" value={data.exame_fisico ?? "0"} onChange={e => onChange("exame_fisico", e.target.value)}>
              <option value="0">0 = Sem déficit</option>
              <option value="1">1 = Leve</option>
              <option value="2">2 = Moderado</option>
              <option value="3">3 = Grave</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <RadioGroup 
            label="Avaliação Global ASG-PPP" 
            options={[
              "Bem nutrido (ASG A)", 
              "Desnutrição moderada/suspeita (ASG B)", 
              "Gravemente desnutrido (ASG C)"
            ]} 
            value={data.asg_ppp} 
            onChange={(v: string) => onChange("asg_ppp", v)} 
          />
        </div>
      </div>

      {/* Triagem Final Card */}
      <div className={`rounded-2xl border p-5 shadow-sm transition-colors duration-300 ${triage.color}`}>
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg mb-1">Escore ASG-PPP Total: {totalScore}</h3>
            <p className="text-sm font-medium">{triage.text}</p>
          </div>
          <div className="text-4xl font-black opacity-30">{totalScore}</div>
        </div>
      </div>

    </div>
  );
}
