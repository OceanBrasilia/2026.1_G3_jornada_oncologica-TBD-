import { useMemo } from "react";
import { 
  calculateIMC, calculateBox1Score, calculateBox2Score, calculateBox3Score, 
  calculateBox4Score, calculateBoxBScore, calculateBoxCScore, calculateBoxDScore
} from "../../utils/nutritionScoring";
import { PatientHeader } from "../PatientHeader";
import { ReusedDataAccordion } from "../ReusedDataAccordion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

export interface FormProps {
  data: Record<string, any>;
  onChange: (key: string, value: any) => void;
  patient: any;
  origins?: Record<string, string>;
  inheritedData?: Record<string, any>;
}

import { InheritableInput, InheritableSelect, InheritableTextarea, InheritableRadioPills } from "./shared/InheritableFormComponents";



const AccordionCard = ({ title, value, children }: any) => (
  <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm mb-4">
    <Accordion type="single" collapsible defaultValue={value}>
      <AccordionItem value={value} className="border-b-0">
        <AccordionTrigger className="px-5 py-4 font-bold text-[#1A2332] text-sm hover:no-underline border-b border-[#F1F5F9]">
          <div className="flex items-center gap-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
            {title}
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-5 pt-4 pb-5">
          <div className="flex flex-col gap-5">
            {children}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
);

// Removed local components, using shared Inheritable components

const CheckboxGroupList = ({ label, options, selected, onChange }: any) => (
  <div className="mb-3">
    {label && <label className="block text-xs font-bold text-[#1A2332] mb-3">{label}</label>}
    <div className="flex flex-col gap-3">
      {options.map((opt: string) => (
        <label key={opt} className="flex items-center space-x-3 text-sm text-[#1A2332] font-semibold cursor-pointer">
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
            className="w-4 h-4 rounded text-[#1B6CA8] focus:ring-[#1B6CA8] border-gray-300"
          />
          <span>{opt}</span>
        </label>
      ))}
    </div>
  </div>
);

const SectionFooterScore = ({ label, score, total }: { label: string, score: number, total?: number }) => (
  <div className="mt-2 bg-[#F9FBFE] p-4 rounded-xl border border-[#D5E6F3] flex items-center justify-between">
    <span className="text-sm font-bold text-[#6B7A8D]">{label}</span>
    <div className="text-lg font-black text-[#1B6CA8]">
      {score}
      {total !== undefined && <span className="text-sm font-bold text-[#6B7A8D] opacity-70"> / {total}</span>}
    </div>
  </div>
);

export function NutricaoForm({ data, onChange, patient, inheritedData, origins }: FormProps) {
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
  const boxCScore = useMemo(() => calculateBoxCScore(parseInt(data.febre || "0"), parseInt(data.duracao_febre || "0"), parseInt(data.corticoide || "0")), [data.febre, data.duracao_febre, data.corticoide]);
  const boxDScore = useMemo(() => calculateBoxDScore(parseInt(data.exame_fisico || "0")), [data.exame_fisico]);

  const totalScore = box1Score + box2Score + box3Score + box4Score + boxBScore + boxCScore + boxDScore;
  
  // Custom text colors based on score value if triage info is not enough
  let scoreColorClass = "text-[#1B6CA8]";
  if (totalScore >= 4) {
    scoreColorClass = "text-[#F59E0B]";
  } else if (totalScore >= 1) {
    scoreColorClass = "text-[#2DB5A3]"; 
  } else {
    scoreColorClass = "text-[#1B6CA8]";
  }

  return (
    <div className="space-y-6">
      <PatientHeader 
        id="CAO-2024-0002"
        name={patient?.name || ""}
        age={patient?.age}
        diagnosis={patient?.diagnosis}
        cid={patient?.cid}
        specialty="Nutrição"
        status="Pendente"
        alerts={patient?.alerts}
      />

      <ReusedDataAccordion
        title="Identificação (reaproveitada)"
        fields={[
          { label: "NOME", value: patient?.name, origin: "Cadastro" },
          { label: "DIAGNÓSTICO", value: patient?.diagnosis, origin: "Recepção" },
          { label: "CID", value: patient?.cid, origin: "Recepção" },
        ]}
        data={data}
        onChange={onChange}
      >
        <div className="flex flex-col gap-5 mt-2">
          <InheritableSelect inheritedData={inheritedData} origins={origins} label="Via de alimentação" name="via_alimentacao" options={["Oral", "Sonda", "Ostomia", "Parenteral"]} data={data} onChange={onChange} />
          
          <div>
            <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Suplementação" name="suplementacao" options={["Não", "Sim"]} data={data} onChange={onChange} />
            {data.suplementacao === "Sim" && (
              <div className="pl-4 border-l-2 border-[#FCD34D] mt-3">
                <InheritableInput inheritedData={inheritedData} origins={origins} label="Qual?" name="suplementacao_qual" data={data} onChange={onChange} />
              </div>
            )}
          </div>
          
          <div>
            <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Tratamento prévio" name="tratamento_previo" options={["Não", "Sim"]} data={data} onChange={onChange} />
            {data.tratamento_previo === "Sim" && (
              <div className="pl-4 border-l-2 border-[#FCD34D] mt-3">
                <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Qual?" name="tratamento_previo_qual" options={["Cirurgia", "RT", "RQT", "QT"]} data={data} onChange={onChange} />
              </div>
            )}
          </div>
          
          <InheritableSelect inheritedData={inheritedData} origins={origins} label="Escolaridade" name="escolaridade" options={["Ensino Médio", "Ensino Superior"]} data={data} onChange={onChange} />
          
          <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Atividade física" name="atividade_fisica" stacked={true} options={["Sim: intensidade leve, moderada - min 30min, 5x/semana ou intensidade vigorosa, min 20min, 3x/semana", "Não"]} data={data} onChange={onChange} />
          
          <InheritableSelect inheritedData={inheritedData} origins={origins} label="Renda familiar" name="renda_familiar" options={["1 a 2 salários", "3 a 4 salários", "Mais de 4 salários"]} data={data} onChange={onChange} />
          
          <InheritableInput inheritedData={inheritedData} origins={origins} label="Pessoas na habitação" name="pessoas_habitacao" placeholder="Ex.: 4" data={data} onChange={onChange} />
          
          <div>
            <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Tabagismo" name="tabagismo" options={["Não", "Sim", "Ex-tabagista"]} data={data} onChange={onChange} />
            {(data.tabagismo === "Sim" || data.tabagismo === "Ex-tabagista") && (
              <div className="pl-4 border-l-2 border-[#FCD34D] mt-3 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <InheritableInput inheritedData={inheritedData} origins={origins} label="Cigarros/dia" name="tabagismo_cigarros" data={data} onChange={onChange} />
                </div>
                <div className="flex-1">
                  <InheritableInput inheritedData={inheritedData} origins={origins} label="Duração" name="tabagismo_duracao" data={data} onChange={onChange} />
                </div>
                {data.tabagismo === "Ex-tabagista" && (
                  <div className="flex-1">
                    <InheritableInput inheritedData={inheritedData} origins={origins} label="Parou há" name="tabagismo_parou" data={data} onChange={onChange} />
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Etilismo" name="etilismo" options={["Não", "Sim", "Ex-etilista"]} data={data} onChange={onChange} />
            {(data.etilismo === "Sim" || data.etilismo === "Ex-etilista") && (
              <div className="pl-4 border-l-2 border-[#FCD34D] mt-3 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <InheritableInput inheritedData={inheritedData} origins={origins} label="Fermentados ml/sem" name="etilismo_fermentados" data={data} onChange={onChange} />
                </div>
                <div className="flex-1">
                  <InheritableInput inheritedData={inheritedData} origins={origins} label="Destilados ml/sem" name="etilismo_destilados" data={data} onChange={onChange} />
                </div>
                <div className="flex-1">
                  <InheritableInput inheritedData={inheritedData} origins={origins} label="Duração" name="etilismo_duracao" data={data} onChange={onChange} />
                </div>
                {data.etilismo === "Ex-etilista" && (
                  <div className="flex-1">
                    <InheritableInput inheritedData={inheritedData} origins={origins} label="Parou há" name="etilismo_parou" data={data} onChange={onChange} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </ReusedDataAccordion>

      <AccordionCard title="IMC (calculado automaticamente)" value="imc">
        <div className="grid md:grid-cols-3 gap-4">
          <InheritableInput inheritedData={inheritedData} origins={origins} label="Peso aferido (kg)" name="peso" placeholder="Ex.: 68" data={data} onChange={onChange} />
          <InheritableInput inheritedData={inheritedData} origins={origins} label="Altura (m)" name="altura" placeholder="Ex.: 1,63" data={data} onChange={onChange} />
          <div>
            <label className="block text-xs font-bold text-[#1A2332] mb-1">IMC calculado</label>
            <div className="w-full px-3 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#E8F4FD] text-sm text-[#1B6CA8] font-bold flex items-center justify-between">
              <span>—</span>
              <span>{imc} {imc !== "—" && "kg/m²"}</span>
            </div>
          </div>
        </div>
      </AccordionCard>

      <AccordionCard title="ASG-PPP — Caixa 1: Peso" value="caixa1">
        <div className="grid md:grid-cols-2 gap-4">
          <InheritableInput inheritedData={inheritedData} origins={origins} label="Há um mês atrás eu pesava aproximadamente (kg)" name="peso_1m" placeholder="Ex.: 70" data={data} onChange={onChange} />
          <InheritableInput inheritedData={inheritedData} origins={origins} label="Há seis meses atrás eu pesava aproximadamente (kg)" name="peso_6m" placeholder="Ex.: 72" data={data} onChange={onChange} />
        </div>
        <InheritableRadioPills inheritedData={inheritedData} origins={origins} 
          label="Durante as 2 últimas semanas o meu peso:" 
          name="peso_var_2sem" 
          options={["Diminuiu (1)", "Ficou igual (0)", "Aumentou (0)"]} 
          data={data} 
          onChange={onChange} 
        />
        <SectionFooterScore label="Escore Caixa 1" score={box1Score} total={5} />
      </AccordionCard>

      <AccordionCard title="ASG-PPP — Caixa 2: Ingestão alimentar" value="caixa2">
        <InheritableRadioPills inheritedData={inheritedData} origins={origins} 
          label="Em comparação à minha alimentação normal, eu poderia considerar minha ingestão alimentar durante o último mês como:" 
          name="ingestao_mudanca" 
          stacked={true} block={true}
          options={["Sem mudanças (0)", "Mais que o normal (0)", "Menos que o normal (1)"]} 
          data={data} 
          onChange={onChange} 
        />
        <div className="mt-2"></div>
        <InheritableRadioPills inheritedData={inheritedData} origins={origins} 
          label="Atualmente, eu estou comendo:" 
          name="ingestao_atual" 
          stacked={true} block={true}
          options={[
            "Comida normal (alimentos sólidos) em menor quantidade (1)", 
            "Comida normal (alimentos sólidos) em pouca quantidade (2)", 
            "Apenas líquidos (3)", 
            "Apenas suplementos nutricionais (3)", 
            "Muito pouco de qualquer comida (4)", 
            "Apenas alimentos pela sonda ou pela veia (0)"
          ]} 
          data={data} 
          onChange={onChange} 
        />
        <SectionFooterScore label="Escore Caixa 2" score={box2Score} total={4} />
      </AccordionCard>

      <AccordionCard title="ASG-PPP — Caixa 3: Sintomas (últimas 2 semanas)" value="caixa3">
        <CheckboxGroupList 
          label="Durante as últimas 2 semanas eu tenho tido os seguintes problemas que me impedem de comer o suficiente (marque todos os que estiver sentindo):" 
          options={[
            "Sem problemas para se alimentar (0)",
            "Sem apetite, apenas sem vontade de comer (3)", 
            "Náusea (1)", "Vômito (3)", "Constipação (1)", "Diarreia (3)", 
            "Feridas na boca (2)", "Boca seca (1)", "Os alimentos têm gosto estranho ou não têm gosto (1)", 
            "Os cheiros me enjoam (1)", "Problemas para engolir (2)", 
            "Rapidamente me sinto satisfeito (1)", "Dor; onde? (3)", "Outros** (1)"
          ]} 
          selected={data.sintomas} 
          onChange={(v: string[]) => onChange("sintomas", v)} 
        />
        {(data.sintomas || []).includes("Dor; onde? (3)") && (
          <div className="pl-4 border-l-2 border-[#FCD34D] mb-4">
            <InheritableInput inheritedData={inheritedData} origins={origins} label="Onde?" name="dor_onde" data={data} onChange={onChange} />
          </div>
        )}
        {(data.sintomas || []).includes("Outros** (1)") && (
          <div className="pl-4 border-l-2 border-[#FCD34D] mb-4">
            <InheritableInput inheritedData={inheritedData} origins={origins} label="Quais outros problemas?" name="outros_sintomas" placeholder="Ex: depressão, problemas dentários ou financeiros" data={data} onChange={onChange} />
          </div>
        )}
        <SectionFooterScore label="Escore Caixa 3" score={box3Score} />
      </AccordionCard>

      <AccordionCard title="ASG-PPP — Caixa 4: Atividade e função (último mês)" value="caixa4">
        <InheritableRadioPills inheritedData={inheritedData} origins={origins} 
          label="No último mês, eu consideraria minha atividade como:" 
          name="atividade" 
          stacked={true}
          block={true}
          options={[
            "Normal, sem nenhuma limitação (0)",
            "Não totalmente normal, mas capaz de manter quase todas as atividades normais (1)",
            "Não me sentindo bem para a maioria das coisas, mas ficando na cama ou na cadeira menos da metade do dia (2)",
            "Capaz de fazer pouca atividade, e passando a maior parte do tempo na cadeira ou na cama (3)",
            "Bastante tempo acamado, raramente fora da cama (3)"
          ]} 
          data={data} 
          onChange={onChange} 
        />
        <SectionFooterScore label="Escore Caixa 4" score={box4Score} total={3} />
        <SectionFooterScore label="A = Caixas 1+2+3+4" score={box1Score + box2Score + box3Score + box4Score} />
      </AccordionCard>

      <AccordionCard title="Doenças e requerimentos nutricionais" value="doencas">
        <InheritableTextarea inheritedData={inheritedData} origins={origins} label="Todos diagnósticos relevantes (especifique)" name="diagnosticos_relevantes" data={data} onChange={onChange} />
        <InheritableSelect inheritedData={inheritedData} origins={origins} 
          label="Estadiamento da doença primária" 
          name="estadiamento_doenca" 
          options={["I", "II", "III", "IV", "Outro", "Não aplicável"]} 
          data={data} 
          onChange={onChange} 
        />
        {data.estadiamento_doenca === "Outro" && (
          <div className="pl-4 border-l-2 border-[#FCD34D] mb-4">
            <InheritableInput inheritedData={inheritedData} origins={origins} label="Especifique o outro estadiamento" name="estadiamento_outro" data={data} onChange={onChange} />
          </div>
        )}
        <CheckboxGroupList 
          label="Condições que pontuam (marque as aplicáveis):" 
          options={[
            "Câncer (1)", "AIDS (1)", "Caquexia pulmonar ou cardíaca (1)", 
            "Úlcera de decúbito, ferida aberta ou fístula (1)", "Presença de trauma (1)", "Idade maior que 65 anos (1)"
          ]} 
          selected={data.doencas} 
          onChange={(v: string[]) => onChange("doencas", v)} 
        />
        <SectionFooterScore label="B = Condições clínicas" score={boxBScore} total={6} />
      </AccordionCard>

      <AccordionCard title="Demanda metabólica" value="demanda">
        <InheritableSelect inheritedData={inheritedData} origins={origins} 
          label="Febre" 
          name="febre" 
          options={["0 = Nenhum / Sem febre", "1 = Baixo / > 37,2º e < 38,3º", "2 = Moderado / ≥ 38,3º e < 38,9º", "3 = Alto / ≥ 38,9º"]} 
          data={data} 
          onChange={onChange} 
        />
        <InheritableSelect inheritedData={inheritedData} origins={origins} 
          label="Duração da febre" 
          name="duracao_febre" 
          options={["0 = Nenhum / Sem febre", "1 = Baixo / < 72 horas", "2 = Moderado / 72 horas", "3 = Alto / > 72 horas"]} 
          data={data} 
          onChange={onChange} 
        />
        <InheritableSelect inheritedData={inheritedData} origins={origins} 
          label="Corticosteroides" 
          name="corticoide" 
          options={["0 = Nenhum / Sem corticosteroides", "1 = Baixo / Dose baixa (< 10 mg prednisona/dia)", "2 = Moderado / Dose moderada (≥ 10 e < 30 mg prednisona/dia)", "3 = Alto / Dose alta (≥ 30 mg prednisona/dia)"]} 
          data={data} 
          onChange={onChange} 
        />
        <SectionFooterScore label="C = Demanda metabólica" score={boxCScore} total={9} />
      </AccordionCard>

      <AccordionCard title="Exame físico" value="exame">
        <p className="text-sm text-[#6B7A8D] mb-4 font-semibold">0 = sem déficit · +1 = leve · +2 = moderado · +3 = grave</p>
        <div className="flex flex-col gap-4 mb-4">
          <InheritableSelect inheritedData={inheritedData} origins={origins} 
            label="Reservas de gordura (peri-orbital, tríceps, últimas costelas)" 
            name="reserva_gordura" 
            options={["0 - Sem déficit", "+1 - Déficit leve", "+2 - Déficit moderado", "+3 - Déficit grave"]} 
            data={data} 
            onChange={onChange} 
          />
          <InheritableSelect inheritedData={inheritedData} origins={origins} 
            label="Estado muscular (temporal, clavícula, ombros, interósseo, escápula, coxa, panturrilha)" 
            name="estado_muscular" 
            options={["0 - Sem déficit", "+1 - Déficit leve", "+2 - Déficit moderado", "+3 - Déficit grave"]} 
            data={data} 
            onChange={onChange} 
          />
          <InheritableSelect inheritedData={inheritedData} origins={origins} 
            label="Estado de hidratação (tornozelo, sacral, ascite)" 
            name="estado_hidratacao" 
            options={["0 - Sem déficit", "+1 - Déficit leve", "+2 - Déficit moderado", "+3 - Déficit grave"]} 
            data={data} 
            onChange={onChange} 
          />
        </div>
        
        <InheritableRadioPills inheritedData={inheritedData} origins={origins} 
          label="Avaliação global do déficit corporal:" 
          name="exame_fisico" 
          stacked={true}
          block={true}
          options={[
            "0 – Sem déficit",
            "+1 – Déficit leve",
            "+2 – Déficit moderado",
            "+3 – Déficit grave"
          ]} 
          data={data} 
          onChange={onChange} 
        />
        <SectionFooterScore label="D = Exame físico" score={boxDScore} total={3} />
      </AccordionCard>

      <AccordionCard title="Resultado ASG-PPP" value="resultado">
        <div className="bg-[#F9FBFE] p-4 rounded-xl border border-[#D5E6F3] flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-[#6B7A8D]">Escore total (A+B+C+D)</span>
          <div className={`text-2xl font-black ${scoreColorClass}`}>
            {totalScore}
          </div>
        </div>
        
        <InheritableRadioPills inheritedData={inheritedData} origins={origins} 
          label="Avaliação global ASG-PPP — classificação pelo profissional:" 
          name="asg_ppp" 
          stacked={true}
          block={true}
          options={[
            "Bem nutrido ou anabólico (ASG A)",
            "Desnutrição moderada ou suspeita (ASG B)",
            "Gravemente desnutrido (ASG C)"
          ]} 
          data={data} 
          onChange={onChange} 
        />
        
        <div className="mt-4">
          <InheritableTextarea inheritedData={inheritedData} origins={origins} label="Conduta nutricional" name="conduta_nutricional" data={data} onChange={onChange} />
        </div>
      </AccordionCard>

    </div>
  );
}
