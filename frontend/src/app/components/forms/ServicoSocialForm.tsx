import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { PatientHeader } from "../PatientHeader";
import { ReusedDataAccordion } from "../ReusedDataAccordion";

export interface ServicoSocialFormProps {
  data: Record<string, any>;
  onChange: (key: string, value: any) => void;
  patient: any;
  origins?: Record<string, string>;
  inheritedData?: Record<string, any>;
}

import { InheritableInput, InheritableSelect, InheritableTextarea, InheritableRadioPills, InheritableCheckboxGroup, InheritableRadioGroup } from "./shared/InheritableFormComponents";

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

// Removed local components, using shared Inheritable components

const CheckboxGroup = ({ label, name, options, data, onChange, direction = "row" }: any) => {
  const selected = data?.[name] || [];
  return (
    <div>
      <label className="block text-xs font-bold text-[#1A2332] mb-3">{label}</label>
      <div className={`grid ${direction === "col" ? "grid-cols-1 gap-y-3" : "grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4"}`}>
        {options.map((opt: string) => (
          <label key={opt} className="flex items-center space-x-3 text-sm font-normal text-[#1A2332] cursor-pointer">
            <input 
              type="checkbox" 
              checked={selected.includes(opt)} 
              onChange={(e) => {
                if (e.target.checked) {
                  onChange(name, [...selected, opt]);
                } else {
                  onChange(name, selected.filter((item: string) => item !== opt));
                }
              }}
              className="w-4 h-4 rounded border-[#D5E6F3] text-[#1B6CA8] focus:ring-[#1B6CA8] accent-[#1B6CA8]"
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export function ServicoSocialForm({ data, onChange, patient, inheritedData, origins }: ServicoSocialFormProps) {
  const commonProps = { data, onChange, inheritedData, origins };
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
        data={data}
        onChange={onChange}
      >
        <div className="space-y-5">
          <InheritableSelect inheritedData={inheritedData} origins={origins}
            label="Sexo"
            name="Sexo"
            options={["Feminino", "Masculino", "Outro"]}
            data={data}
            onChange={onChange}
          />
          <InheritableSelect inheritedData={inheritedData} origins={origins}
            label="Cor/Raça (autodeclarada)"
            name="corRaca"
            options={["Branca", "Preta", "Parda", "Amarela", "Indígena", "Não informada"]}
            data={data}
            onChange={onChange}
          />
          <InheritableSelect inheritedData={inheritedData} origins={origins}
            label="Grau de escolaridade"
            name="Escolaridade"
            options={["Sem instrução", "Ensino Fundamental I", "Ensino Fundamental II", "Ensino Médio", "Ensino Superior", "Pós-graduação"]}
            data={data}
            onChange={onChange}
          />
          <InheritableSelect inheritedData={inheritedData} origins={origins}
            label="Estado civil"
            name="Estado civil"
            options={["Solteiro(a)", "Casado(a)", "Viúvo(a)", "Divorciado(a)", "União Estável"]}
            data={data}
            onChange={onChange}
          />

          <InheritableInput inheritedData={inheritedData} origins={origins}
            label="Profissão / Ocupação"
            name="Profissão"
            data={data}
            onChange={onChange}
          />

          <InheritableSelect inheritedData={inheritedData} origins={origins} 
            label="Diagnóstico oncológico (confirmar)" 
            name="diagnosticoConfirmar" 
            options={["Confirmado", "Em investigação"]} 
            data={data} 
            onChange={onChange} 
          />
          <InheritableSelect inheritedData={inheritedData} origins={origins} 
            label="Onde foi feito o diagnóstico?" 
            name="localDiagnostico" 
            options={["HUB", "Outro Hospital Público", "Hospital Particular", "Clínica Privada"]} 
            data={data} 
            onChange={onChange} 
          />
          
          <div className="pt-2">
            <h4 className="font-bold text-[#1A2332] text-sm mb-4">Acompanhante/Cuidador:</h4>
            <div className="space-y-5">
              <InheritableInput inheritedData={inheritedData} origins={origins} 
                label="Nome" 
                name="acompanhanteNome" 
                data={data} 
                onChange={onChange} 
              />
              <InheritableSelect inheritedData={inheritedData} origins={origins} 
                label="Grau de parentesco" 
                name="acompanhanteParentesco" 
                options={["Cônjuge", "Filho(a)", "Irmão(ã)", "Pai/Mãe", "Outro parente", "Amigo(a)", "Cuidador profissional"]} 
                data={data} 
                onChange={onChange} 
              />
              <InheritableInput inheritedData={inheritedData} origins={origins} 
                label="Telefone de contato" 
                name="acompanhanteTelefone" 
                data={data} 
                onChange={onChange} 
              />
            </div>
          </div>
        </div>
      </ReusedDataAccordion>

      <SectionCard title="II – Situação habitacional e familiar">
        <InheritableRadioPills inheritedData={inheritedData} origins={origins} 
          label="Necessita de hospedagem em abrigo?" 
          name="necessitaAbrigo" 
          options={["Sim", "Não", "Não se aplica"]} 
          data={data} 
          onChange={onChange} 
        />
        
        <InheritableRadioPills inheritedData={inheritedData} origins={origins} 
          label="Possui dependentes previdenciários?" 
          name="dependentesPrevidenciarios" 
          options={["Sim", "Não", "Outro"]} 
          data={data} 
          onChange={onChange} 
        />
        
        <InheritableSelect inheritedData={inheritedData} origins={origins} 
          label="Suporte familiar" 
          name="suporteFamiliar" 
          options={["Adequado", "Parcial", "Frágil", "Inexistente"]} 
          data={data} 
          onChange={onChange} 
        />
        
        <InheritableTextarea inheritedData={inheritedData} origins={origins} 
          label="Observação da situação familiar" 
          name="observacaoFamiliar" 
          data={data} 
          onChange={onChange} 
        />
        
        <InheritableCheckboxGroup inheritedData={inheritedData} origins={origins} 
          label="Como vem ao HUB? (múltipla seleção)" 
          name="comoVemHub" 
          direction="col"
          options={["Transporte Público", "Transporte Particular", "TFD", "Outro"]} 
          data={data} 
          onChange={onChange} 
        />
      </SectionCard>

      <SectionCard title="III – Acesso digital">
        <InheritableSelect inheritedData={inheritedData} origins={origins} 
          label="Possui acesso e facilidade com celular e internet?" 
          name="acessoInternet" 
          options={["Sim", "Apenas acesso, sem facilidade", "Não possui acesso"]} 
          data={data} 
          onChange={onChange} 
        />
        
        <InheritableInput inheritedData={inheritedData} origins={origins} 
          label="Parente/amigo que auxilia com tecnologia (nome e parentesco)" 
          name="auxilioTecnologia" 
          data={data} 
          onChange={onChange} 
        />
        
        <InheritableSelect inheritedData={inheritedData} origins={origins} 
          label="Na sua casa existe computador e acesso à internet?" 
          subLabel="Considerar o acesso à internet domiciliar/rede wifi, os pacotes de dados pré-pagos de celular não são considerados."
          name="computadorEmCasa" 
          options={["Sim, temos computador e internet.", "Somente computador.", "Somente internet.", "Não temos computador nem internet."]} 
          data={data} 
          onChange={onChange} 
        />
      </SectionCard>

      <SectionCard title="IV – Situação econômica">
        <InheritableCheckboxGroup inheritedData={inheritedData} origins={origins} 
          label="Qual a situação previdenciária/ocupacional atual do(a) paciente?" 
          name="situacaoPrevidenciaria" 
          direction="col"
          options={["Aposentado(a) por idade e/ou tempo de contribuição", "Aposentado(a) por invalidez", "Pensionista", "Trabalhando com vínculo formal", "Trabalhando como autônomo (trabalho informal/bico)", "Em gozo de Auxílio-Doença (benefício por incapacidade temporária)", "Desempregado(a) (Neste caso, especificar se o paciente é segurado, isto é, quando foi sua última contribuição/último emprego com carteira assinada)", "Não segurado(a) - Nunca contribuiu para o INSS", "BPC da pessoa com deficiência", "BPC da pessoa idosa (a partir de 65 anos)", "Segurado(a) (autônomo, facultativo)", "Outro"]} 
          data={data} 
          onChange={onChange} 
        />
        
        <InheritableSelect inheritedData={inheritedData} origins={origins} 
          label="Renda do paciente" 
          name="rendaPaciente" 
          options={["Sem renda", "Menos de 1 salário mínimo", "1 a 2 salários mínimos", "3 a 5 salários mínimos", "Mais de 5 salários mínimos"]} 
          data={data} 
          onChange={onChange} 
        />
        
        <InheritableSelect inheritedData={inheritedData} origins={origins} 
          label="Renda familiar" 
          name="rendaFamiliar" 
          options={["Sem renda", "Menos de 1 salário mínimo", "1 a 2 salários mínimos", "3 a 5 salários mínimos", "Mais de 5 salários mínimos"]} 
          data={data} 
          onChange={onChange} 
        />
        
        <InheritableTextarea inheritedData={inheritedData} origins={origins} 
          label="Tem alguma observação relevante sobre a situação econômica/previdenciária do(a) paciente? Qual?" 
          name="observacoesEconomicas" 
          data={data} 
          onChange={onChange} 
        />
        
        <InheritableCheckboxGroup inheritedData={inheritedData} origins={origins} 
          label="O(a) paciente/família está incluído em algum programa ou benefício social municipal, estadual ou federal?" 
          name="programasBeneficios" 
          direction="col"
          options={["Não", "Passe Livre DF (Pessoa com Deficiência)", "Passe Livre Interestadual", "Tratamento Fora de Domicílio (TFD)", "Programa Bolsa Família (PBF)", "Benefício de Prestação Continuada (BPC)", "Outro"]} 
          data={data} 
          onChange={onChange} 
        />
      </SectionCard>

      <SectionCard title="V – Plano de trabalho" className="!mt-3">
        <InheritableCheckboxGroup inheritedData={inheritedData} origins={origins} 
          label="Assinale as orientações e/ou encaminhamentos realizados pelo Serviço Social, no momento do acolhimento:" 
          name="orientacoesEncaminhamentos" 
          direction="col"
          options={["Passe Livre DF", "Passe Livre Interestadual (PLI)", "Tratamento Fora de Domicílio (TFD)", "Auxílio-Doença (Benefício por incapacidade temporária)", "Benefício de Prestação Continuada (BPC)", "Isenção de Impostos", "Saque de FGTS/ PIS / PASEP", "Programa de Transporte a Pessoas com Necessidades Especiais do DF - PTNED", "Fluxo de Relatórios Médicos", "Programa Melhor em Casa", "Farmácia de Alto Custo", "Associações e grupos de apoio oncológico", "Encaminhamento para a Defensoria Pública da União, do DF ou do Estado de origem", "Orientações sobre judicialização na Saúde", "Orientações sobre recuperação da qualidade de segurado(a)", "Programa Bolsa Família (PBF)", "Outro"]} 
          data={data} 
          onChange={onChange} 
        />
        
        <InheritableInput inheritedData={inheritedData} origins={origins}
          label="Assistente Social entrevistador(a)"
          name="assistenteSocial"
          data={data}
          onChange={onChange}
        />
      </SectionCard>

      <SectionCard title="VI – Sinalização para a equipe" className="!mt-3">
        <InheritableRadioPills inheritedData={inheritedData} origins={origins}
          label="Sinalizar vulnerabilidade social para acompanhamento da equipe multiprofissional?"
          subLabel="Gera um alerta confidencial (visível só para a equipe), registrado como sinalização do Serviço Social."
          name="vulnerabilidadeSocialSinalizada"
          options={["Sim", "Não"]}
          data={data}
          onChange={onChange}
        />
      </SectionCard>
    </div>
  );
}
