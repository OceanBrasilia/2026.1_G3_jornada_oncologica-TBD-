import { ChevronDown, ChevronUp, Plus, Trash2, Phone, Users } from "lucide-react";
import { useState } from "react";
import { PatientHeader } from "../PatientHeader";
import { ReusedDataAccordion } from "../ReusedDataAccordion";
import {
  InheritableInput,
  InheritableSelect,
  InheritableTextarea,
  InheritableRadioPills,
  InheritableCheckboxGroup,
} from "./shared/InheritableFormComponents";

export interface ServicoSocialFormProps {
  data: Record<string, any>;
  onChange: (key: string, value: any) => void;
  patient: any;
  origins?: Record<string, string>;
  inheritedData?: Record<string, any>;
}

const SectionCard = ({ title, children, defaultOpen = true, className = "" }: any) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className={`bg-white rounded-2xl border border-[#D5E6F3] shadow-sm ${className}`}>
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

export interface CuidadorItem {
  id: string;
  nome: string;
  parentesco: string;
  parentescoOutro?: string;
  telefone: string;
}

export const PARENTESCO_OPCOES = [
  "Cônjuge ou companheiro(a)",
  "Filho(a)",
  "Irmão(ã)",
  "Pai/Mãe",
  "Neto(a)",
  "Outro parente",
  "Amigo(a)",
  "Cuidador profissional",
  "Outro",
];

export const ESCOLARIDADE_OPCOES = [
  "Analfabeto",
  "Analfabeto, mas assina o próprio nome",
  "Sem escolaridade",
  "Sem instrução",
  "Ensino Fundamental incompleto",
  "Ensino Fundamental",
  "Ensino Fundamental I",
  "Ensino Fundamental II",
  "Ensino Médio incompleto",
  "Ensino Médio",
  "Ensino Superior incompleto",
  "Ensino Superior",
  "Pós-graduação",
  "Outro",
];

export const LOCAL_DIAGNOSTICO_OPCOES = [
  "SES-DF",
  "HUB",
  "Outro Hospital Público",
  "Hospital Particular",
  "Clínica Privada",
  "Outro",
];

export const ACOMPANHAMENTO_OPCOES = [
  "Acompanhado(a)",
  "Desacompanhado(a)",
  "Acompanhado(a) esporadicamente",
  "Outro",
];

export const NIVEL_SUPORTE_OPCOES = [
  "Excelente — vários cuidadores",
  "Satisfatório — 2 cuidadores",
  "Restrito — apenas 1 cuidador",
  "Precário — sem cuidador direto, mas há um pequeno suporte",
  "Não possui — sem cuidadores e sem suporte",
  "Outro",
];

export const COMO_VEM_HUB_OPCOES = [
  "Transporte Público",
  "Transporte Particular",
  "Uber",
  "TFD",
  "Outro",
];

export const RENDA_OPCOES = [
  "Sem renda",
  "Até 1 Salário Mínimo",
  "1,2 a 3 Salários Mínimos",
  "Acima de 3 Salários Mínimos",
  "Não quis responder",
  "Outro",
];

export const PROGRAMAS_BENEFICIOS_OPCOES = [
  "Não",
  "PTNED",
  "TFD",
  "Farmácia Especializada",
  "Passe Livre DF (Pessoa com Deficiência)",
  "Passe Livre Interestadual",
  "Programa Bolsa Família (PBF)",
  "Benefício de Prestação Continuada (BPC)",
  "Outro",
];

export const ORIENTACOES_OPCOES = [
  "Passe Livre DF",
  "Passe Livre Interestadual (PLI)",
  "TFD",
  "Auxílio-Doença (Benefício por incapacidade temporária)",
  "Benefício de Prestação Continuada (BPC)",
  "Isenção de Impostos",
  "Saque de FGTS/ PIS / PASEP",
  "PTNED",
  "Fluxo de Relatórios Médicos",
  "Programa Melhor em Casa",
  "Farmácia Especializada",
  "Associações e grupos de apoio oncológico",
  "Encaminhamento para a Defensoria Pública da União, do DF ou do Estado de origem",
  "Orientações sobre judicialização na Saúde",
  "Orientações sobre recuperação da qualidade de segurado(a)",
  "Programa Bolsa Família (PBF)",
  "Outro",
];

export const PROFISSIONAIS_OPCOES = [
  "Liana",
  "Rafaela",
  "Anna",
  "Luana",
  "Est. Douglas",
  "Giorgia",
  "Outro",
];

export function formatarCuidadores(cuidadores: CuidadorItem[]): string {
  const preenchidos = cuidadores.filter(
    (c) => (c.nome && c.nome.trim()) || (c.parentesco && c.parentesco.trim()) || (c.telefone && c.telefone.trim())
  );

  return preenchidos
    .map((c) => {
      const parentescoFinal =
        c.parentesco === "Outro" && c.parentescoOutro ? `Outro (${c.parentescoOutro})` : c.parentesco || "Parentesco não informado";
      return `${c.nome?.trim() || "Nome não informado"} — ${parentescoFinal} — ${c.telefone?.trim() || "Telefone não informado"}`;
    })
    .join("\n");
}

export function normalizarRespostasServicoSocial(data: Record<string, any>): Record<string, any> {
  const formValues = { ...data };

  if (Array.isArray(formValues.orientacoesEncaminhamentos)) {
    formValues.orientacoesEncaminhamentos = formValues.orientacoesEncaminhamentos.map((item: string) => {
      if (item === "Farmácia de Alto Custo") return "Farmácia Especializada";
      if (item === "Programa de Transporte a Pessoas com Necessidades Especiais do DF - PTNED") return "PTNED";
      if (item === "Tratamento Fora de Domicílio (TFD)") return "TFD";
      return item;
    });
  }

  if (Array.isArray(formValues.programasBeneficios)) {
    formValues.programasBeneficios = formValues.programasBeneficios.map((item: string) => {
      if (item === "Farmácia de Alto Custo") return "Farmácia Especializada";
      if (item === "Tratamento Fora de Domicílio (TFD)") return "TFD";
      return item;
    });
  }

  if (!formValues.profissionaisAtendimento && formValues.assistenteSocial) {
    const splitted = String(formValues.assistenteSocial)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (splitted.length > 0) {
      formValues.profissionaisAtendimento = splitted;
    }
  }

  return formValues;
}

export function CuidadoresSection({
  data,
  onChange,
  inheritedData,
}: {
  data: Record<string, any>;
  onChange: (key: string, value: any) => void;
  inheritedData?: Record<string, any>;
}) {
  const [cuidadores, setCuidadores] = useState<CuidadorItem[]>(() => {
    if (data.cuidadoresJSON) {
      try {
        const parsed = JSON.parse(data.cuidadoresJSON);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // ignora erro de parse e cai no fallback
      }
    }
    const initialNome = data.acompanhanteNome || inheritedData?.acompanhanteNome || "";
    let initialParentesco = data.acompanhanteParentesco || inheritedData?.acompanhanteParentesco || "";
    if (initialParentesco === "Cônjuge") initialParentesco = "Cônjuge ou companheiro(a)";
    const initialTelefone = data.acompanhanteTelefone || inheritedData?.acompanhanteTelefone || "";

    return [
      {
        id: "cuidador-1",
        nome: initialNome,
        parentesco: initialParentesco,
        telefone: initialTelefone,
      },
    ];
  });

  const syncCuidadores = (novos: CuidadorItem[]) => {
    setCuidadores(novos);
    onChange("cuidadoresJSON", JSON.stringify(novos));
    const formatado = formatarCuidadores(novos);
    onChange("cuidadoresFormatados", formatado);

    // Sincroniza primeiro cuidador com os campos legados para manter retrocompatibilidade com telas antigas e relatórios
    if (novos[0]) {
      onChange("acompanhanteNome", novos[0].nome || "");
      onChange(
        "acompanhanteParentesco",
        novos[0].parentesco === "Outro" && novos[0].parentescoOutro
          ? `Outro (${novos[0].parentescoOutro})`
          : novos[0].parentesco || ""
      );
      onChange("acompanhanteTelefone", novos[0].telefone || "");
    }
  };

  const handleUpdate = (index: number, field: keyof CuidadorItem, val: string) => {
    const novos = cuidadores.map((item, idx) => {
      if (idx !== index) return item;
      return { ...item, [field]: val };
    });
    syncCuidadores(novos);
  };

  const handleAdd = () => {
    const novo: CuidadorItem = {
      id: `cuidador-${Date.now()}`,
      nome: "",
      parentesco: "",
      telefone: "",
    };
    syncCuidadores([...cuidadores, novo]);
  };

  const handleRemove = (index: number) => {
    if (cuidadores.length <= 1) {
      syncCuidadores([{ id: "cuidador-1", nome: "", parentesco: "", telefone: "" }]);
      return;
    }
    const novos = cuidadores.filter((_, idx) => idx !== index);
    syncCuidadores(novos);
  };

  return (
    <div className="pt-2 space-y-4">
      <div className="flex items-center justify-between border-b border-[#E2EAF1] pb-2">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-[#1B6CA8]" />
          <h4 className="font-bold text-[#1A2332] text-sm">
            Cuidador(es) e contatos do paciente
          </h4>
        </div>
        <span className="text-xs text-[#6B7A8D]">
          Estrutura: Nome — Grau de parentesco — Telefone
        </span>
      </div>

      <div className="space-y-4">
        {cuidadores.map((item, index) => (
          <div
            key={item.id}
            className="p-4 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] space-y-3 relative transition hover:border-[#1B6CA8]/40"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1B6CA8] uppercase tracking-wider">
                Cuidador / Contato {index + 1}
              </span>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                aria-label={`Remover cuidador ${index + 1}`}
                className="text-xs text-[#DC2626] hover:text-[#991B1B] flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 transition"
              >
                <Trash2 size={14} />
                <span>Remover</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label
                  htmlFor={`cuidador-nome-${item.id}`}
                  className="block text-xs font-semibold text-[#3A4B60] mb-1"
                >
                  Nome completo:
                </label>
                <input
                  id={`cuidador-nome-${item.id}`}
                  type="text"
                  value={item.nome || ""}
                  onChange={(e) => handleUpdate(index, "nome", e.target.value)}
                  placeholder="Ex: Maria da Silva"
                  className="w-full px-3 py-2 rounded-lg border border-[#D5E6F3] bg-white text-sm text-[#1A2332] placeholder-[#9AAABB] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition"
                />
              </div>

              <div>
                <label
                  htmlFor={`cuidador-parentesco-${item.id}`}
                  className="block text-xs font-semibold text-[#3A4B60] mb-1"
                >
                  Grau de parentesco:
                </label>
                <select
                  id={`cuidador-parentesco-${item.id}`}
                  value={item.parentesco || ""}
                  onChange={(e) => handleUpdate(index, "parentesco", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#D5E6F3] bg-white text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition"
                >
                  <option value="">Selecione...</option>
                  {PARENTESCO_OPCOES.map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </select>
                {item.parentesco === "Outro" && (
                  <div className="mt-2">
                    <label
                      htmlFor={`cuidador-parentesco-outro-${item.id}`}
                      className="block text-xs text-[#3A4B60] mb-1"
                    >
                      Especificar parentesco:
                    </label>
                    <input
                      id={`cuidador-parentesco-outro-${item.id}`}
                      type="text"
                      value={item.parentescoOutro || ""}
                      onChange={(e) =>
                        handleUpdate(index, "parentescoOutro", e.target.value)
                      }
                      placeholder="Especifique..."
                      className="w-full px-3 py-1.5 rounded-lg border border-[#D5E6F3] bg-white text-xs text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition"
                    />
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor={`cuidador-telefone-${item.id}`}
                  className="block text-xs font-semibold text-[#3A4B60] mb-1"
                >
                  Telefone de contato:
                </label>
                <div className="relative">
                  <input
                    id={`cuidador-telefone-${item.id}`}
                    type="text"
                    value={item.telefone || ""}
                    onChange={(e) => handleUpdate(index, "telefone", e.target.value)}
                    placeholder="Ex: (61) 99999-9999"
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-[#D5E6F3] bg-white text-sm text-[#1A2332] placeholder-[#9AAABB] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition"
                  />
                  <Phone
                    size={14}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8A9EB9] pointer-events-none"
                  />
                </div>
              </div>
            </div>

            {/* Visual preview da linha formatada */}
            {(item.nome || item.parentesco || item.telefone) && (
              <div className="text-xs text-[#4A5D73] bg-[#EEF5FA] px-3 py-1.5 rounded-md flex items-center gap-1.5">
                <span className="font-semibold text-[#1B6CA8]">Registro:</span>
                <span>
                  {item.nome || "Nome não informado"} —{" "}
                  {item.parentesco === "Outro" && item.parentescoOutro
                    ? `Outro (${item.parentescoOutro})`
                    : item.parentesco || "Parentesco não informado"}{" "}
                  — {item.telefone || "Telefone não informado"}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAdd}
        className="w-full py-2.5 px-4 border-2 border-dashed border-[#B8D5ED] hover:border-[#1B6CA8] hover:bg-[#F0F6FB] text-[#1B6CA8] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
      >
        <Plus size={16} />
        <span>Adicionar outro cuidador / contato</span>
      </button>
    </div>
  );
}

export function ServicoSocialForm({
  data,
  onChange,
  patient,
  inheritedData,
  origins,
}: ServicoSocialFormProps) {
  const formValues = normalizarRespostasServicoSocial(data);

  return (
    <div className="space-y-6 pb-20">
      <PatientHeader
        id={patient?.id}
        name={patient?.name || ""}
        age={patient?.age}
        diagnosis={patient?.diagnosis}
        cid={patient?.cid}
        specialty="Serviço Social"
        status="Pendente"
        alerts={patient?.alerts}
      />

      <ReusedDataAccordion
        title="I – Identificação (reaproveitada)"
        fields={[
          { label: "NOME", value: patient?.name || "", origin: "Cadastro" },
          { label: "DIAGNÓSTICO", value: patient?.diagnosis || "", origin: "Recepção" },
          { label: "CID", value: patient?.cid || "", origin: "Recepção" },
        ]}
        data={formValues}
        onChange={onChange}
      >
        <div className="space-y-5">
          <InheritableSelect
            inheritedData={inheritedData}
            origins={origins}
            label="Sexo"
            name="Sexo"
            options={["Feminino", "Masculino", "Outro"]}
            hasOther={true}
            data={formValues}
            onChange={onChange}
          />
          <InheritableSelect
            inheritedData={inheritedData}
            origins={origins}
            label="Cor/Raça (autodeclarada)"
            name="corRaca"
            options={["Branca", "Preta", "Parda", "Amarela", "Indígena", "Não informada"]}
            data={formValues}
            onChange={onChange}
          />

          {/* 1. Escolaridade: organizada em progressão lógica com alfabetização e 'Outro' */}
          <InheritableSelect
            inheritedData={inheritedData}
            origins={origins}
            label="Grau de escolaridade"
            name="Escolaridade"
            options={ESCOLARIDADE_OPCOES}
            hasOther={true}
            data={formValues}
            onChange={onChange}
          />

          <InheritableSelect
            inheritedData={inheritedData}
            origins={origins}
            label="Estado civil"
            name="Estado civil"
            options={["Solteiro(a)", "Casado(a)", "Viúvo(a)", "Divorciado(a)", "União Estável", "Outro"]}
            hasOther={true}
            data={formValues}
            onChange={onChange}
          />

          <InheritableInput
            inheritedData={inheritedData}
            origins={origins}
            label="Profissão / Ocupação"
            name="Profissão"
            data={formValues}
            onChange={onChange}
          />

          <InheritableSelect
            inheritedData={inheritedData}
            origins={origins}
            label="Diagnóstico oncológico (confirmar)"
            name="diagnosticoConfirmar"
            options={["Confirmado", "Em investigação"]}
            data={formValues}
            onChange={onChange}
          />

          {/* 2. Diagnóstico / origem: contempla SES-DF e Outro */}
          <InheritableSelect
            inheritedData={inheritedData}
            origins={origins}
            label="Onde foi feito o diagnóstico?"
            name="localDiagnostico"
            options={LOCAL_DIAGNOSTICO_OPCOES}
            hasOther={true}
            data={formValues}
            onChange={onChange}
          />

          {/* 3. Acompanhamento */}
          <InheritableSelect
            inheritedData={inheritedData}
            origins={origins}
            label="Acompanhamento"
            subLabel="Condição de acompanhamento do paciente no atendimento/tratamento"
            name="acompanhamento"
            options={ACOMPANHAMENTO_OPCOES}
            hasOther={true}
            data={formValues}
            onChange={(k, v) => {
              onChange(k, v);
              if (!formValues["Acompanhante"]) {
                onChange("Acompanhante", v);
              }
            }}
          />

          {/* 4, 6 e 7. Cuidadores e contatos múltiplos com 'Cônjuge ou companheiro(a)' */}
          <CuidadoresSection
            data={formValues}
            onChange={onChange}
            inheritedData={inheritedData}
          />
        </div>
      </ReusedDataAccordion>

      <SectionCard title="II – Situação habitacional e familiar">
        <InheritableRadioPills
          inheritedData={inheritedData}
          origins={origins}
          label="Necessita de hospedagem em abrigo?"
          name="necessitaAbrigo"
          options={["Sim", "Não", "Não se aplica"]}
          data={formValues}
          onChange={onChange}
        />

        <InheritableRadioPills
          inheritedData={inheritedData}
          origins={origins}
          label="Possui dependentes previdenciários?"
          name="dependentesPrevidenciarios"
          options={["Sim", "Não", "Outro"]}
          hasOther={true}
          data={formValues}
          onChange={onChange}
        />

        {/* 5 e 14. Nível de suporte padronizado com as 6 opções e 'Outro' com especificação */}
        <InheritableSelect
          inheritedData={inheritedData}
          origins={origins}
          label="Nível de suporte"
          name="suporteFamiliar"
          options={NIVEL_SUPORTE_OPCOES}
          hasOther={true}
          data={formValues}
          onChange={onChange}
        />

        <InheritableTextarea
          inheritedData={inheritedData}
          origins={origins}
          label="Observação da situação familiar"
          name="observacaoFamiliar"
          data={formValues}
          onChange={onChange}
        />

        {/* 8. Como vem ao HUB com a opção Uber */}
        <InheritableCheckboxGroup
          inheritedData={inheritedData}
          origins={origins}
          label="Como vem para o HUB realizar o tratamento? (múltipla seleção)"
          name="comoVemHub"
          direction="col"
          options={COMO_VEM_HUB_OPCOES}
          hasOther={true}
          data={formValues}
          onChange={onChange}
        />
      </SectionCard>

      <SectionCard title="III – Acesso digital">
        <InheritableSelect
          inheritedData={inheritedData}
          origins={origins}
          label="Possui acesso e facilidade com celular e internet?"
          name="acessoInternet"
          options={["Sim", "Apenas acesso, sem facilidade", "Não possui acesso"]}
          data={formValues}
          onChange={onChange}
        />

        <InheritableInput
          inheritedData={inheritedData}
          origins={origins}
          label="Parente/amigo que auxilia com tecnologia (nome e parentesco)"
          name="auxilioTecnologia"
          data={formValues}
          onChange={onChange}
        />

        <InheritableSelect
          inheritedData={inheritedData}
          origins={origins}
          label="Na sua casa existe computador e acesso à internet?"
          subLabel="Considerar o acesso à internet domiciliar/rede wifi, os pacotes de dados pré-pagos de celular não são considerados."
          name="computadorEmCasa"
          options={[
            "Sim, temos computador e internet.",
            "Somente computador.",
            "Somente internet.",
            "Não temos computador nem internet.",
          ]}
          data={formValues}
          onChange={onChange}
        />
      </SectionCard>

      <SectionCard title="IV – Situação econômica">
        {/* 11. Situação previdenciária mantida integralmente */}
        <InheritableCheckboxGroup
          inheritedData={inheritedData}
          origins={origins}
          label="Como se apresenta a situação previdenciária do paciente?"
          name="situacaoPrevidenciaria"
          direction="col"
          options={[
            "Aposentado(a) por idade e/ou tempo de contribuição",
            "Aposentado(a) por invalidez",
            "Pensionista",
            "Trabalhando com vínculo formal",
            "Trabalhando como autônomo (trabalho informal/bico)",
            "Em gozo de Auxílio-Doença (benefício por incapacidade temporária)",
            "Desempregado(a) (Neste caso, especificar se o paciente é segurado, isto é, quando foi sua última contribuição/último emprego com carteira assinada)",
            "Não segurado(a) - Nunca contribuiu para o INSS",
            "BPC da pessoa com deficiência",
            "BPC da pessoa idosa (a partir de 65 anos)",
            "Segurado(a) (autônomo, facultativo)",
            "Outro",
          ]}
          hasOther={true}
          data={formValues}
          onChange={onChange}
        />

        {/* 9. Renda individual: Até 1 Salário Mínimo */}
        <InheritableSelect
          inheritedData={inheritedData}
          origins={origins}
          label="Renda do paciente"
          name="rendaPaciente"
          options={RENDA_OPCOES}
          hasOther={true}
          data={formValues}
          onChange={onChange}
        />

        {/* 10. Renda familiar: Até 1 Salário Mínimo */}
        <InheritableSelect
          inheritedData={inheritedData}
          origins={origins}
          label="Renda familiar"
          name="rendaFamiliar"
          options={RENDA_OPCOES}
          hasOther={true}
          data={formValues}
          onChange={onChange}
        />

        <InheritableTextarea
          inheritedData={inheritedData}
          origins={origins}
          label="Tem alguma observação relevante sobre a situação econômica/previdenciária do(a) paciente? Qual?"
          name="observacoesEconomicas"
          data={formValues}
          onChange={onChange}
        />

        {/* 12. Programas sociais / benefícios com PTNED e Farmácia Especializada */}
        <InheritableCheckboxGroup
          inheritedData={inheritedData}
          origins={origins}
          label="O(a) paciente/família está incluído em algum programa ou benefício social municipal, estadual ou federal?"
          name="programasBeneficios"
          direction="col"
          options={PROGRAMAS_BENEFICIOS_OPCOES}
          hasOther={true}
          data={formValues}
          onChange={onChange}
        />
      </SectionCard>

      <SectionCard title="V – Plano de trabalho" className="!mt-3">
        {/* 12. PTNED e Farmácia Especializada */}
        <InheritableCheckboxGroup
          inheritedData={inheritedData}
          origins={origins}
          label="Assinale as orientações e/ou encaminhamentos realizados pelo Serviço Social, no momento do acolhimento:"
          name="orientacoesEncaminhamentos"
          direction="col"
          options={ORIENTACOES_OPCOES}
          hasOther={true}
          data={formValues}
          onChange={onChange}
        />

        {/* 13. Profissionais que realizaram o atendimento (seleção múltipla) */}
        <InheritableCheckboxGroup
          inheritedData={inheritedData}
          origins={origins}
          label="Profissionais que realizaram o atendimento"
          subLabel="Marque todas que se aplicam."
          name="profissionaisAtendimento"
          direction="row"
          options={PROFISSIONAIS_OPCOES}
          hasOther={true}
          data={formValues}
          onChange={(k, v) => {
            onChange(k, v);
            const list = Array.isArray(v) ? v : v ? [v] : [];
            onChange("assistenteSocial", list.join(", "));
          }}
        />
      </SectionCard>

      <SectionCard title="VI – Sinalização para a equipe" className="!mt-3">
        <InheritableRadioPills
          inheritedData={inheritedData}
          origins={origins}
          label="Sinalizar vulnerabilidade social para acompanhamento da equipe multiprofissional?"
          subLabel="Gera um alerta confidencial (visível só para a equipe), registrado como sinalização do Serviço Social."
          name="vulnerabilidadeSocialSinalizada"
          options={["Sim", "Não"]}
          data={formValues}
          onChange={onChange}
        />
      </SectionCard>
    </div>
  );
}
