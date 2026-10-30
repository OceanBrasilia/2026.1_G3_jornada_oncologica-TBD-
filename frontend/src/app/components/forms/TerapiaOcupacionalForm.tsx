import { ChevronDown, ChevronUp, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { PatientHeader } from "../PatientHeader";
import { ReusedDataAccordion } from "../ReusedDataAccordion";
import {
  InheritableCheckboxGroup,
  InheritableInput,
  InheritableRadioPills,
  InheritableSelect,
  InheritableTextarea,
} from "./shared/InheritableFormComponents";
import { ConditionalField } from "./shared/ConditionalField";

export interface FormProps {
  data: Record<string, any>;
  onChange: (key: string, value: any) => void;
  patient: any;
  origins?: Record<string, string>;
  inheritedData?: Record<string, any>;
}

export const TO_CODIGOS_PROCEDIMENTOS = [
  "03.01.01.004-8",
  "03.01.04.004-4",
];

export const TO_EVA_OPTIONS = [
  "Sem dor (0)",
  "Dor leve (1-3)",
  "Dor moderada (4-5)",
  "Dor intensa (6-7)",
  "Dor muito intensa (8-9)",
  "Pior dor possível (10)",
];

export const TO_AVD_OPTIONS = [
  "Independente",
  "Auxílio/Supervisão",
  "Dependente",
  "Não se aplica",
];

export const TO_OCUPACOES_OPTIONS = ["Alterado", "Não Alterado"];

export const TO_ESCOLARIDADE_OPTIONS = [
  "Não Alfabetizado",
  "Alfabetizado",
  "Ensino Fundamental Incompleto",
  "Ensino Fundamental Completo",
  "Ensino Médio Incompleto",
  "Ensino Médio Completo",
  "Ensino Superior Incompleto",
  "Ensino Superior Completo",
];

export const TO_RENDA_OPTIONS = [
  "Ativo(a)",
  "Desempregado(a)",
  "Afastado(a), recebendo Auxílio Doença",
  "Afastado(a), sem renda",
  "Benefício de Prestação Continuada (BPC/LOAS)",
  "Auxílio Brasil",
  "Aposentado(a)",
  "Pensionista",
  "Outro",
];

export const TO_ACOMPANHANTE_OPTIONS = [
  "Filho(a)",
  "Mãe ou Pai",
  "Neto(a)",
  "Companheiro(a)",
  "Amigo(a)",
  "Sem acompanhante",
  "Outro",
];

export const TO_RELIGIAO_OPTIONS = [
  "Católico(a)",
  "Evangélico(a)",
  "Testemunha de Jeová",
  "Adventista do Sétimo Dia",
  "Espírita",
  "Não possui",
  "Outro",
];

export const TO_CANCER_CID_OPTIONS = [
  "Não soube informar",
  "Aguardando resultado de exames complementares",
  "CID C15 - Esôfago",
  "CID C16 - Estômago",
  "CID C17 - Intestino",
  "CID C18 - Cólon",
  "CID C20 - Reto",
  "CID C21 - Anal e Canal Anal",
  "CID C22 - Fígado",
  "CID C25 - Pâncreas",
  "CID C34 - Brônquios e Pulmões",
  "CID C44 - Pele",
  "CID C50 - Mama",
  "CID C53 - Colo de Útero",
  "CID C56 - Ovário",
  "CID C60 - Pênis",
  "CID C61 - Próstata",
  "CID C62 - Testículo",
  "CID C64-C68 - Sistema Urinário",
  "CID C69-C72 - Sistema Nervoso Central",
  "Outro",
];

export const TO_TRATAMENTO_OPTIONS = [
  "Virgem de tratamento",
  "Cirurgia Oncológica",
  "Quimioterapia",
  "Radioterapia",
  "Outro",
];

export const TO_DIAGNOSTICO_OPTIONS = [
  "Capacidade funcional preservada e desempenho ocupacional satisfatório",
  "Dependência para realização de AIVDs",
  "Dependência para realização de AVDs",
  "Alterações na mobilidade",
  "Risco de queda",
  "Dor incapacitante",
  "Fadiga",
  "Outro",
];

export const TO_CONDUTA_OPTIONS = [
  "Não elegível. Realizo orientações em saúde e deixo o serviço à disposição por busca espontânea em caso de necessidade.",
  "Elegível. Encaminho para acompanhamento ambulatorial.",
];

export const TO_ENCAMINHAMENTOS_OPTIONS = [
  "Orientações em Saúde",
  "Ambulatório de Terapia Ocupacional",
  "Encaminhamento para outra especialidade",
  "Visita Domiciliar",
  "Prescrição de Tecnologias Assistivas",
  "Outro",
];

export const TO_PROFISSIONAIS_AVALIADORES = [
  "Yara Helena de Carvalho Paiva (Terapeuta Ocupacional Staff)",
  "Nathalia Rayane Nogueira de Santanna (R1 Atenção em Oncologia)",
  "Outro",
];

const SectionCard = ({ title, children, defaultOpen = true, stepNumber }: any) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-[#D5E6F3] shadow-sm mb-4">
      <div
        className="p-5 flex justify-between items-center cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          {stepNumber && (
            <span className="w-6 h-6 rounded-full bg-[#EBF4FA] text-[#1B6CA8] text-xs font-bold flex items-center justify-center">
              {stepNumber}
            </span>
          )}
          <h3 className="font-bold text-[#1A2332] text-sm" style={{ fontFamily: "'Nunito', sans-serif" }}>
            {title}
          </h3>
        </div>
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

export function TerapiaOcupacionalForm({ data, onChange, patient, inheritedData, origins }: FormProps) {
  // Garantir persistência dos códigos de procedimento oficiais da Terapia Ocupacional
  useEffect(() => {
    const codigosTexto = TO_CODIGOS_PROCEDIMENTOS.join(", ");
    if (data?.codigosProcedimentosTO !== codigosTexto) {
      onChange("codigosProcedimentosTO", codigosTexto);
    }
  }, [data?.codigosProcedimentosTO, onChange]);

  // Sincronizar campo EVA com legado de dor se necessário
  const handleEvaChange = (val: string) => {
    onChange("TO_EVA", val);
    if (!val || val === "Sem dor (0)") {
      onChange("TO_Dor", "Não");
      onChange("TO_Dor_Intensidade", "0");
    } else {
      onChange("TO_Dor", "Sim");
      if (val === "Dor leve (1-3)") onChange("TO_Dor_Intensidade", "2");
      else if (val === "Dor moderada (4-5)") onChange("TO_Dor_Intensidade", "5");
      else if (val === "Dor intensa (6-7)") onChange("TO_Dor_Intensidade", "7");
      else if (val === "Dor muito intensa (8-9)") onChange("TO_Dor_Intensidade", "9");
      else if (val === "Pior dor possível (10)") onChange("TO_Dor_Intensidade", "10");
    }
  };

  // Sincronizar Observação com Evolução legado
  const handleObservacaoChange = (val: string) => {
    onChange("observacaoTO", val);
    onChange("TO_Evolucao", val);
  };

  const valorEva = data?.TO_EVA || (data?.TO_Dor === "Não" ? "Sem dor (0)" : "");

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

      {/* 1. Identificação do paciente e 2. Gênero */}
      <SectionCard title="1. Identificação do paciente e Gênero" defaultOpen={true}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] mb-3 text-xs">
          <div>
            <span className="text-[#64748B] block font-medium">Prontuário:</span>
            <span className="text-[#1E293B] font-bold">{patient?.id || data?.prontuario || "—"}</span>
          </div>
          <div>
            <span className="text-[#64748B] block font-medium">Nome completo:</span>
            <span className="text-[#1E293B] font-bold">{patient?.name || data?.nomePaciente || "—"}</span>
          </div>
          <div>
            <span className="text-[#64748B] block font-medium">Idade:</span>
            <span className="text-[#1E293B] font-bold">{patient?.age !== undefined ? `${patient.age} anos` : "—"}</span>
          </div>
        </div>

        <InheritableRadioPills
          inheritedData={inheritedData}
          origins={origins}
          label="Gênero"
          name="genero"
          sourceName="Sexo"
          options={["Feminino", "Masculino", "Prefiro não dizer", "Outro"]}
          hasOther={true}
          data={data}
          onChange={onChange}
        />
      </SectionCard>

      {/* 2. Estado Civil */}
      <SectionCard title="2. Estado Civil" defaultOpen={true}>
        <InheritableRadioPills
          inheritedData={inheritedData}
          origins={origins}
          label="Estado Civil"
          name="Estado civil"
          options={["Casado(a)", "Divorciado(a)", "Solteiro(a)", "União Estável", "Viúvo(a)", "Outro"]}
          hasOther={true}
          data={data}
          onChange={onChange}
        />
      </SectionCard>

      {/* 3. Histórico familiar */}
      <SectionCard title="3. Histórico familiar" defaultOpen={true}>
        <InheritableTextarea
          inheritedData={inheritedData}
          origins={origins}
          label="Histórico familiar"
          name="historicoFamiliar"
          data={data}
          onChange={onChange}
          placeholder="Permitir texto livre sobre antecedentes e dinâmica familiar relevante"
          rows={3}
        />
      </SectionCard>

      {/* 4. Escolaridade */}
      <SectionCard title="4. Escolaridade" defaultOpen={true}>
        <InheritableSelect
          inheritedData={inheritedData}
          origins={origins}
          label="Escolaridade"
          name="Escolaridade"
          options={TO_ESCOLARIDADE_OPTIONS}
          data={data}
          onChange={onChange}
        />
      </SectionCard>

      {/* 5. Atividade Profissional */}
      <SectionCard title="5. Atividade Profissional" defaultOpen={true}>
        <InheritableInput
          inheritedData={inheritedData}
          origins={origins}
          label="Atividade Profissional"
          name="atividadeProfissional"
          sourceName="Profissão"
          data={data}
          onChange={onChange}
          placeholder="Descreva a atividade profissional / ocupação"
        />
      </SectionCard>

      {/* 6. Renda Atual / Situação ocupacional */}
      <SectionCard title="6. Renda Atual / Situação ocupacional" defaultOpen={true}>
        <InheritableCheckboxGroup
          inheritedData={inheritedData}
          origins={origins}
          label="Renda Atual / Situação ocupacional (múltipla seleção)"
          name="rendaAtual"
          options={TO_RENDA_OPTIONS}
          hasOther={true}
          data={data}
          onChange={onChange}
        />
      </SectionCard>

      {/* 7. Naturalidade e 8. Reside em */}
      <SectionCard title="7 e 8. Naturalidade e Moradia" defaultOpen={true}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InheritableInput
            inheritedData={inheritedData}
            origins={origins}
            label="7. Naturalidade"
            name="naturalidade"
            data={data}
            onChange={onChange}
            placeholder="Cidade - UF de nascimento"
          />
          <InheritableInput
            inheritedData={inheritedData}
            origins={origins}
            label="8. Reside em"
            name="resideEm"
            data={data}
            onChange={onChange}
            placeholder="Cidade - UF onde reside atualmente"
          />
        </div>
      </SectionCard>

      {/* 9. Acompanhado(a) de */}
      <SectionCard title="9. Acompanhado(a) de" defaultOpen={true}>
        <InheritableCheckboxGroup
          inheritedData={inheritedData}
          origins={origins}
          label="Acompanhado(a) de (múltipla seleção)"
          name="acompanhadoDe"
          options={TO_ACOMPANHANTE_OPTIONS}
          hasOther={true}
          data={data}
          onChange={onChange}
        />
      </SectionCard>

      {/* 10. Religião */}
      <SectionCard title="10. Religião" defaultOpen={true}>
        <InheritableRadioPills
          inheritedData={inheritedData}
          origins={origins}
          label="Religião"
          name="religiao"
          options={TO_RELIGIAO_OPTIONS}
          hasOther={true}
          data={data}
          onChange={onChange}
        />
      </SectionCard>

      {/* 11. Localização do Câncer */}
      <SectionCard title="11. Localização do Câncer" defaultOpen={true}>
        <InheritableCheckboxGroup
          inheritedData={inheritedData}
          origins={origins}
          label="Localização do Câncer (múltipla seleção)"
          name="localizacaoCancer"
          options={TO_CANCER_CID_OPTIONS}
          hasOther={true}
          data={data}
          onChange={onChange}
        />
      </SectionCard>

      {/* 12. Tratamento Oncológico */}
      <SectionCard title="12. Tratamento Oncológico" defaultOpen={true}>
        <InheritableCheckboxGroup
          inheritedData={inheritedData}
          origins={origins}
          label="Tratamento Oncológico (múltipla seleção)"
          name="tratamentoOncologico"
          options={TO_TRATAMENTO_OPTIONS}
          hasOther={true}
          data={data}
          onChange={onChange}
        />
      </SectionCard>

      {/* 13. Fadiga */}
      <SectionCard title="13. FADIGA" defaultOpen={true}>
        <InheritableRadioPills
          inheritedData={inheritedData}
          origins={origins}
          label="Sente cansaço?"
          name="TO_Cansaco"
          options={["Sim", "Não", "Um pouco"]}
          data={data}
          onChange={onChange}
        />
        <ConditionalField
          data={data}
          onChange={onChange}
          showIf={{
            OU: [
              { campo: "TO_Cansaco", igual: "Sim" },
              { campo: "TO_Cansaco", igual: "Um pouco" },
            ],
          }}
          campos={["TO_Cansaco_Impede"]}
        >
          <InheritableTextarea
            inheritedData={inheritedData}
            origins={origins}
            label="Se sim, te impede no que você quer fazer? (O que?)"
            name="TO_Cansaco_Impede"
            data={data}
            onChange={onChange}
            rows={2}
          />
        </ConditionalField>
      </SectionCard>

      {/* 14. Dor */}
      <SectionCard title="14. DOR" defaultOpen={true}>
        <div className="space-y-3">
          <label className="block text-xs font-bold text-[#1A2332]">
            ESCALA VISUAL ANALÓGICA - EVA
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {TO_EVA_OPTIONS.map((opt) => {
              const isSelected = valorEva === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleEvaChange(opt)}
                  className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                    isSelected
                      ? "bg-[#1B6CA8] text-white border-[#1B6CA8] shadow-sm"
                      : "bg-white text-[#3A4354] border-[#D5E6F3] hover:border-[#1B6CA8]/50 hover:bg-[#F8FAFC]"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </SectionCard>

      {/* 15. Queda */}
      <SectionCard title="15. QUEDA" defaultOpen={true}>
        <InheritableRadioPills
          inheritedData={inheritedData}
          origins={origins}
          label="Queda"
          name="TO_Queda"
          options={["Sim", "Não", "Risco de queda"]}
          data={data}
          onChange={onChange}
        />
      </SectionCard>

      {/* 16. Avaliação das AVDs */}
      <SectionCard title="16. AVALIAÇÃO DAS AVDs" defaultOpen={true}>
        <div className="text-xs text-[#8A9EB9] mb-4">
          Independente • Auxílio/Supervisão • Dependente • Não se aplica
        </div>
        <div className="space-y-4">
          <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Alimentação" name="TO_AVD_Alimentacao" options={TO_AVD_OPTIONS} data={data} onChange={onChange} />
          <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Higiene Pessoal" name="TO_AVD_Higiene" options={TO_AVD_OPTIONS} data={data} onChange={onChange} />
          <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Banho" name="TO_AVD_Banho" options={TO_AVD_OPTIONS} data={data} onChange={onChange} />
          <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Vestir metade inferior" name="TO_AVD_VestirInferior" options={TO_AVD_OPTIONS} data={data} onChange={onChange} />
          <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Utilização do vaso sanitário" name="TO_AVD_Vaso" options={TO_AVD_OPTIONS} data={data} onChange={onChange} />
          <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Mobilidade Funcional" name="TO_AVD_Mobilidade" options={TO_AVD_OPTIONS} data={data} onChange={onChange} />
          
          {/* Campos preservados do instrumento atual */}
          <div className="pt-2 border-t border-[#EEF2F7]">
            <span className="text-[11px] font-bold text-[#8A9EB9] uppercase tracking-wider block mb-3">AVDs complementares</span>
            <div className="space-y-4">
              <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Vestuário (geral)" name="TO_AVD_Vestuario" options={TO_AVD_OPTIONS} data={data} onChange={onChange} />
              <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Controle da urina" name="TO_AVD_Urina" options={TO_AVD_OPTIONS} data={data} onChange={onChange} />
              <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Controle de fezes" name="TO_AVD_Fezes" options={TO_AVD_OPTIONS} data={data} onChange={onChange} />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* 17. Utiliza algum dispositivo? */}
      <SectionCard title="17. Utiliza algum Dispositivo?" defaultOpen={true}>
        <InheritableRadioPills
          inheritedData={inheritedData}
          origins={origins}
          label="Utiliza algum Dispositivo?"
          name="TO_AVD_Dispositivo"
          options={["Sim", "Não", "Outro"]}
          hasOther={true}
          data={data}
          onChange={onChange}
        />
        <ConditionalField
          data={data}
          onChange={onChange}
          showIf={{
            OU: [
              { campo: "TO_AVD_Dispositivo", igual: "Sim" },
              { campo: "TO_AVD_Dispositivo", igual: "Outro" },
            ],
          }}
          campos={["TO_AVD_Dispositivo_Qual"]}
        >
          <InheritableInput
            inheritedData={inheritedData}
            origins={origins}
            label="Qual dispositivo?:"
            name="TO_AVD_Dispositivo_Qual"
            data={data}
            onChange={onChange}
            placeholder="Ex.: bengala, cadeira de rodas, andador, órtese"
          />
        </ConditionalField>
      </SectionCard>

      {/* 18. Avaliação das AIVDs */}
      <SectionCard title="18. AVALIAÇÃO DAS AIVDs" defaultOpen={true}>
        <div className="text-xs text-[#8A9EB9] mb-4">
          Independente • Auxílio/Supervisão • Dependente • Não se aplica
        </div>
        <div className="space-y-4">
          <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Tarefas Domésticas" name="TO_AIVD_Tarefas" options={TO_AVD_OPTIONS} data={data} onChange={onChange} />
          <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Gerenciamento e manutenção da saúde / medicamentos" name="TO_AIVD_Saude" options={TO_AVD_OPTIONS} data={data} onChange={onChange} />
          <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Gerenciamento Financeiro" name="TO_AIVD_Financeiro" options={TO_AVD_OPTIONS} data={data} onChange={onChange} />
          <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Fazer Compras" name="TO_AIVD_Compras" options={TO_AVD_OPTIONS} data={data} onChange={onChange} />
          
          {/* Campos preservados do instrumento atual */}
          <div className="pt-2 border-t border-[#EEF2F7]">
            <span className="text-[11px] font-bold text-[#8A9EB9] uppercase tracking-wider block mb-3">AIVDs complementares</span>
            <div className="space-y-4">
              <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Gerenciamento de comunicação/celular" name="TO_AIVD_Celular" options={TO_AVD_OPTIONS} data={data} onChange={onChange} />
              <InheritableRadioPills inheritedData={inheritedData} origins={origins} label="Gerenciamento do lar" name="TO_AIVD_Lar" options={TO_AVD_OPTIONS} data={data} onChange={onChange} />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* 19. Outras Ocupações */}
      <SectionCard title="19. OUTRAS OCUPAÇÕES" defaultOpen={true}>
        <div className="space-y-4">
          <InheritableRadioPills
            inheritedData={inheritedData}
            origins={origins}
            label="Descanso e Sono"
            name="TO_Ocup_Sono"
            options={TO_OCUPACOES_OPTIONS}
            data={data}
            onChange={onChange}
          />
          <InheritableRadioPills
            inheritedData={inheritedData}
            origins={origins}
            label="Lazer e participação Social"
            name="TO_Ocup_LazerSocial"
            options={TO_OCUPACOES_OPTIONS}
            data={data}
            onChange={onChange}
          />
          {/* Preservado caso instrumento atual utilize Trabalho */}
          <InheritableRadioPills
            inheritedData={inheritedData}
            origins={origins}
            label="Trabalho"
            name="TO_Ocup_Trabalho"
            options={TO_OCUPACOES_OPTIONS}
            data={data}
            onChange={onChange}
          />
        </div>
      </SectionCard>

      {/* 20. Cognição */}
      <SectionCard title="20. COGNIÇÃO" defaultOpen={true}>
        <div className="space-y-4">
          <InheritableRadioPills
            inheritedData={inheritedData}
            origins={origins}
            label="Memória"
            name="TO_Ocup_Memoria"
            options={TO_OCUPACOES_OPTIONS}
            data={data}
            onChange={onChange}
          />
          <InheritableRadioPills
            inheritedData={inheritedData}
            origins={origins}
            label="Compreensão (preservada do instrumento)"
            name="TO_Ocup_Compreensao"
            options={TO_OCUPACOES_OPTIONS}
            data={data}
            onChange={onChange}
          />
        </div>
      </SectionCard>

      {/* 21. Suporte Social */}
      <SectionCard title="21. SUPORTE SOCIAL - ESCALA DE SATISFAÇÃO COM O SUPORTE SOCIAL ADAPTADA" defaultOpen={true}>
        <div className="space-y-4">
          <InheritableCheckboxGroup
            inheritedData={inheritedData}
            origins={origins}
            label="Neste momento quem mais te ajuda?"
            name="TO_Ocup_Ajuda"
            options={["Amigos", "Equipe", "Companheiro", "Vizinho", "Familiares", "Outro"]}
            hasOther={true}
            data={data}
            onChange={onChange}
          />
          <InheritableTextarea
            inheritedData={inheritedData}
            origins={origins}
            label="Em que essa pessoa te ajuda?"
            name="TO_Ocup_Ajuda_Como"
            data={data}
            onChange={onChange}
            rows={2}
          />
        </div>
      </SectionCard>

      {/* 22. Atividades significativas */}
      <SectionCard title="22. Atividades significativas" defaultOpen={true}>
        <InheritableTextarea
          inheritedData={inheritedData}
          origins={origins}
          label="Cite atividades significativas ou que considera importantes no seu cotidiano."
          name="TO_Ocup_AtividadesSig"
          data={data}
          onChange={onChange}
          rows={3}
          placeholder="Descreva as atividades significativas..."
        />
      </SectionCard>

      {/* 23. Observação */}
      <SectionCard title="23. Observação" defaultOpen={true}>
        <InheritableTextarea
          inheritedData={inheritedData}
          origins={origins}
          label="Observação"
          name="observacaoTO"
          data={data}
          onChange={(_, val) => handleObservacaoChange(val)}
          rows={4}
          placeholder="Observações gerais e anotações clínicas de Terapia Ocupacional"
        />
      </SectionCard>

      {/* 24. Diagnóstico Terapêutico Ocupacional */}
      <SectionCard title="24. Diagnóstico Terapêutico Ocupacional" defaultOpen={true}>
        <InheritableCheckboxGroup
          inheritedData={inheritedData}
          origins={origins}
          label="Diagnóstico Terapêutico Ocupacional (múltipla seleção)"
          name="TO_Diagnostico"
          options={TO_DIAGNOSTICO_OPTIONS}
          hasOther={true}
          data={data}
          onChange={onChange}
        />
      </SectionCard>

      {/* 25. Condutas Iniciais */}
      <SectionCard title="25. Condutas Iniciais" defaultOpen={true}>
        <InheritableRadioPills
          inheritedData={inheritedData}
          origins={origins}
          label="Condutas Iniciais (seleção única)"
          name="TO_Conduta"
          options={TO_CONDUTA_OPTIONS}
          stacked={true}
          data={data}
          onChange={onChange}
        />
      </SectionCard>

      {/* 26. Encaminhamentos */}
      <SectionCard title="26. Encaminhamentos" defaultOpen={true}>
        <InheritableCheckboxGroup
          inheritedData={inheritedData}
          origins={origins}
          label="Encaminhamentos (múltipla seleção)"
          name="TO_Encaminhamentos"
          options={TO_ENCAMINHAMENTOS_OPTIONS}
          hasOther={true}
          data={data}
          onChange={onChange}
        />
        <ConditionalField
          data={data}
          onChange={onChange}
          showIf={{ campo: "TO_Encaminhamentos", contém: "Encaminhamento para outra especialidade" }}
          campos={["TO_Encaminhamentos_Especialidade"]}
          className="ml-4 border-l-2 border-[#1B6CA8]/30 pl-4 mt-2"
        >
          <InheritableInput
            inheritedData={inheritedData}
            origins={origins}
            label="Qual especialidade?:"
            name="TO_Encaminhamentos_Especialidade"
            data={data}
            onChange={onChange}
            placeholder="Ex.: Fisioterapia, Nutrição, Psicologia..."
          />
        </ConditionalField>
      </SectionCard>

      {/* 27. Profissional avaliador */}
      <SectionCard title="27. Profissional avaliador" defaultOpen={true}>
        <InheritableRadioPills
          inheritedData={inheritedData}
          origins={origins}
          label="Profissional avaliador (seleção única)"
          name="profissionalAvaliador"
          options={TO_PROFISSIONAIS_AVALIADORES}
          stacked={true}
          hasOther={true}
          data={data}
          onChange={onChange}
        />
      </SectionCard>

      {/* 28 a 31. Estrutura do documento final & Códigos de Procedimentos */}
      <div className="bg-[#F8FAFC] rounded-2xl border-2 border-[#1B6CA8]/30 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-[#1B6CA8] font-bold text-sm">
          <FileText size={20} />
          <span>28 a 31. Estrutura do Documento Final & Códigos de Procedimentos</span>
        </div>

        <div className="space-y-3 bg-white p-4 rounded-xl border border-[#D5E6F3] text-xs">
          <div>
            <span className="font-bold text-[#1A2332]">Diagnóstico terapêutico ocupacional: </span>
            <span className="text-[#3A4354]">
              {Array.isArray(data?.TO_Diagnostico) && data.TO_Diagnostico.length > 0
                ? data.TO_Diagnostico.join("; ") + (data?.TO_Diagnostico_outro ? ` (${data.TO_Diagnostico_outro})` : "")
                : "Não informado"}
            </span>
          </div>

          <div>
            <span className="font-bold text-[#1A2332]">Condutas iniciais: </span>
            <span className="text-[#3A4354]">{data?.TO_Conduta || "Não informada"}</span>
          </div>

          <div>
            <span className="font-bold text-[#1A2332]">Encaminhamentos: </span>
            <span className="text-[#3A4354]">
              {Array.isArray(data?.TO_Encaminhamentos) && data.TO_Encaminhamentos.length > 0
                ? data.TO_Encaminhamentos.join("; ") +
                  (data?.TO_Encaminhamentos_Especialidade ? ` [Especialidade: ${data.TO_Encaminhamentos_Especialidade}]` : "") +
                  (data?.TO_Encaminhamentos_outro ? ` (${data.TO_Encaminhamentos_outro})` : "")
                : "Nenhum encaminhamento registrado"}
            </span>
          </div>

          <div>
            <span className="font-bold text-[#1A2332]">Profissional avaliador: </span>
            <span className="text-[#3A4354]">
              {data?.profissionalAvaliador === "Outro" && data?.profissionalAvaliador_outro
                ? data.profissionalAvaliador_outro
                : data?.profissionalAvaliador || "Não selecionado"}
            </span>
          </div>

          <div className="pt-2 border-t border-[#EEF2F7]">
            <span className="font-bold text-[#1B6CA8] block mb-1">CÓDIGOS DE PROCEDIMENTOS:</span>
            <div className="flex flex-wrap gap-2">
              {TO_CODIGOS_PROCEDIMENTOS.map((cod) => (
                <span
                  key={cod}
                  className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#EBF4FA] text-[#1B6CA8] font-mono text-xs font-bold border border-[#1B6CA8]/20"
                >
                  {cod}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
