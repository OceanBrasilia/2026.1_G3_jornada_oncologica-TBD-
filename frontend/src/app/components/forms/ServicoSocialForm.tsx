import React from "react";
import { User, Home, DollarSign, ClipboardList } from "lucide-react";

export interface ServicoSocialFormProps {
  data: Record<string, any>;
  onChange: (key: string, value: any) => void;
  patient: any;
  origins?: Record<string, string>;
}

const Card = ({ title, icon: Icon, children, className = "" }: any) => (
  <div className={`bg-white rounded-2xl border border-[rgba(27,108,168,0.1)] shadow-sm p-5 mb-5 ${className}`}>
    <h3 className="font-bold text-[#1A2332] mb-4 text-sm flex items-center gap-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
      {Icon && <Icon size={16} className="text-[#1B6CA8]" />} {title}
    </h3>
    <div className="grid sm:grid-cols-2 gap-4">
      {children}
    </div>
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

const TextArea = ({ label, name, placeholder = "", rows = 4, value, data, onChange, required }: any) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.name, e.target.value);
  };
  return (
    <div className="sm:col-span-2">
      <label className="block text-xs font-bold text-[#1A2332] mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        name={name}
        value={value ?? data?.[name] ?? ""}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className="w-full px-3 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition resize-none"
      />
    </div>
  );
};

const Select = ({ label, name, options, data, onChange, required }: any) => {
  const value = data?.[name] || "";
  
  return (
    <div>
      <label className="block text-xs font-bold text-[#1A2332] mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={value}
        required={required}
        onChange={(e) => {
          onChange(name, e.target.value);
        }}
        className="w-full px-3 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition"
      >
        <option value="">Selecione...</option>
        {options.map((o: string) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
};

const RadioGroup = ({ label, name, options, data, onChange, required }: any) => {
  const value = data?.[name] || "";
  const isOther = value && !options.includes(value) && value !== "";
  
  return (
    <div className="mb-4 sm:col-span-2">
      <label className="block text-sm font-bold text-[#1A2332] mb-2 leading-tight">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:gap-6 gap-2">
        {options.map((opt: string) => {
          if (opt === "Outro") {
            return (
              <div key={opt} className="flex flex-col gap-2 w-full sm:w-auto">
                <label className="flex items-center gap-2 text-sm font-normal text-[#3A4354] cursor-pointer hover:text-[#1B6CA8] transition-colors">
                  <input
                    type="radio"
                    name={name}
                    value={opt}
                    checked={isOther || data?.[`${name}_isOther`] === "true"}
                    onChange={(e) => {
                      onChange(`${name}_isOther`, "true");
                      onChange(name, "");
                    }}
                    className="accent-[#1B6CA8] w-4 h-4"
                    required={required && !value && data?.[`${name}_isOther`] !== "true"}
                  />
                  {opt}
                </label>
                {(isOther || data?.[`${name}_isOther`] === "true") && (
                  <input
                    type="text"
                    value={isOther ? value : ""}
                    onChange={(e) => onChange(name, e.target.value)}
                    placeholder="Especifique..."
                    className="px-3 py-1.5 rounded-xl border border-[#D5E6F3] bg-white text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition"
                    required={required}
                  />
                )}
              </div>
            );
          }
          return (
            <label key={opt} className="flex items-center gap-2 text-sm font-normal text-[#3A4354] cursor-pointer hover:text-[#1B6CA8] transition-colors">
              <input
                type="radio"
                name={name}
                value={opt}
                checked={data?.[name] === opt}
                onChange={(e) => {
                  onChange(`${name}_isOther`, "false");
                  onChange(name, e.target.value);
                }}
                className="accent-[#1B6CA8] w-4 h-4"
                required={required && !value && data?.[`${name}_isOther`] !== "true"}
              />
              {opt}
            </label>
          );
        })}
      </div>
    </div>
  );
};

const CheckboxGroup = ({ label, name, options, data, onChange, required }: any) => {
  const selected = Array.isArray(data?.[name]) ? data[name] : [];
  
  return (
    <div className="mb-4 sm:col-span-2">
      <label className="block text-sm font-bold text-[#1A2332] mb-2 leading-tight">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:gap-6 gap-2">
        {options.map((opt: string) => {
          if (opt === "Outro") {
            const isOther = selected.some((s: string) => !options.includes(s) && s !== "Outro");
            const otherValue = selected.find((s: string) => !options.includes(s) && s !== "Outro") || "";
            return (
              <div key={opt} className="flex flex-col gap-2 w-full sm:w-auto">
                <label className="flex items-center gap-2 text-sm font-normal text-[#3A4354] cursor-pointer hover:text-[#1B6CA8] transition-colors">
                  <input
                    type="checkbox"
                    checked={isOther || data?.[`${name}_isOther`] === "true"}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onChange(`${name}_isOther`, "true");
                      } else {
                        onChange(`${name}_isOther`, "false");
                        const newSelected = selected.filter((item: string) => options.includes(item));
                        onChange(name, newSelected);
                      }
                    }}
                    className="accent-[#1B6CA8] w-4 h-4 rounded"
                  />
                  {opt}
                </label>
                {(isOther || data?.[`${name}_isOther`] === "true") && (
                  <input
                    type="text"
                    value={otherValue}
                    onChange={(e) => {
                      const baseSelected = selected.filter((item: string) => options.includes(item));
                      if (e.target.value) {
                        onChange(name, [...baseSelected, e.target.value]);
                      } else {
                        onChange(name, baseSelected);
                      }
                    }}
                    placeholder="Especifique..."
                    className="px-3 py-1.5 rounded-xl border border-[#D5E6F3] bg-white text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition"
                  />
                )}
              </div>
            );
          }
          return (
            <label key={opt} className="flex items-center gap-2 text-sm font-normal text-[#3A4354] cursor-pointer hover:text-[#1B6CA8] transition-colors">
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
                className="accent-[#1B6CA8] w-4 h-4 rounded"
              />
              {opt}
            </label>
          );
        })}
      </div>
    </div>
  );
};

export function ServicoSocialForm({ data, onChange, patient }: ServicoSocialFormProps) {
  return (
    <div>
      <Card title="Identificação" icon={User}>
        <Input label="Nome" name="Nome" data={data} onChange={onChange} required />
        <Input label="Registro HUB" name="Registro HUB" data={data} onChange={onChange} required />
        <Input label="Idade" name="Idade" type="number" data={data} onChange={onChange} />
        <RadioGroup label="Sexo" name="Sexo" options={["Masculino", "Feminino", "Outro"]} data={data} onChange={onChange} required />
        <RadioGroup label="Cor" name="Cor" options={["Indígena", "Sem declaração", "Amarelo", "Negra", "Parda", "Branca", "Outro"]} data={data} onChange={onChange} required />
        <RadioGroup label="Grau de Escolaridade" name="Grau de Escolaridade" options={["Nenhum", "Alfabetizado", "Ensino Fund. Completo", "Ensino Fund. Incompleto", "Ensino Médio Completo", "Ensino Médio Incompleto", "Superior Completo", "Superior Incompleto", "Pós Graduação", "Outro"]} data={data} onChange={onChange} required />
        <RadioGroup label="Estado Civil" name="Estado Civil" options={["Casado(a)", "Solteiro(a)", "União Estável", "Divorciado(a) legalmente", "Separação apenas de corpos", "Viúvo(a)", "Outro"]} data={data} onChange={onChange} required />
        
        <Input label="Acompanhante/Cuidador" name="Acompanhante/Cuidador" data={data} onChange={onChange} required />
        <CheckboxGroup label="Grau de Parentesco" name="Grau de Parentesco" options={["Filho(a)", "Neto(a)", "Esposo(a)/Companheiro(a)", "Namorado(a)", "Amigo(a)", "Pai/Mãe", "Sobrinho(a)", "Cunhado(a)", "Irmão(ã)", "Primo(a)", "Outro"]} data={data} onChange={onChange} />
        
        <div className="sm:col-span-2">
          <Input label="Telefone de contato (Nome - Grau de parentesco + Tel)" name="Telefone de contato" data={data} onChange={onChange} required />
        </div>

        <RadioGroup label="Paciente fez diagnóstico onde?" name="Paciente fez diagnóstico onde?" options={["SES-DF", "HUB", "Outro"]} data={data} onChange={onChange} />
        
        <div className="sm:col-span-2">
          <Select 
            label="Diagnóstico" 
            name="Diagnóstico" 
            options={["Mama", "Próstata", "Colo Uterino", "Ovário", "Endométrio", "Bexiga", "Pulmão", "Estômago", "Cólon", "Reto", "Canal Anal", "Vesícula Biliar", "Pâncreas", "Sarcoma de Kaposi", "Sarcomas", "Testículos", "Base de Língua", "Assoalho da Boca", "Palato", "Orofaringe", "Nasofaringe", "Laringe", "Esôfago", "Pele", "Fígado/Vias Biliares", "Outro"]} 
            data={data} 
            onChange={onChange} 
            required 
          />
        </div>
        
        <RadioGroup label="Religião" name="Religião" options={["Católico", "Evangélico", "Espírita", "Cristão", "Ateu", "Religiões Afro", "Protestante", "Indígena", "Testemunha de Jeová", "Outro"]} data={data} onChange={onChange} />
        <Input label="Profissão" name="Profissão" data={data} onChange={onChange} />
      </Card>

      <Card title="Situação Habitacional/Familiar" icon={Home}>
        <Select label="Reside no Distrito Federal?" name="Reside no Distrito Federal?" options={["Sim", "Não"]} data={data} onChange={onChange} required />
        <Input label="Procedência?" name="Procedência?" data={data} onChange={onChange} required />
        
        <Select label="Se não, tem algum amigo ou familiar para ficar hospedado durante o tratamento?" name="Hospedagem amigo ou familiar" options={["Não", "Sim", "Não se aplica"]} data={data} onChange={onChange} />
        <Input label="Se sim, Onde?" name="Onde ficará hospedado" data={data} onChange={onChange} />
        
        <Select label="Necessita de hospedagem em abrigo durante o tratamento?" name="Necessita abrigo" options={["Sim", "Não", "Não se aplica"]} data={data} onChange={onChange} />
        <RadioGroup label="Possui dependentes (previdência)?" name="Possui dependentes" options={["Sim", "Não", "Outro"]} data={data} onChange={onChange} />
        
        <Input label="Se sim, qual a Idade dos dependentes?" name="Idade dependentes" data={data} onChange={onChange} />
        <RadioGroup label="Possui suporte familiar?" name="Possui suporte familiar" options={["Excelente", "Satisfatório", "Restrito", "Precário", "Não possui", "Outro"]} data={data} onChange={onChange} required />
        
        <TextArea label="Observação de situação familiar" name="Observação de situação familiar" data={data} onChange={onChange} />
        
        <CheckboxGroup label="Como vem para o HUB realizar o tratamento?" name="Como vem para o HUB" options={["Transporte Público", "Transporte Particular", "TFD", "Outro"]} data={data} onChange={onChange} required />
        <RadioGroup label="Você possui acesso e facilidade com Telefone com rede de internet?" name="Acesso internet" options={["Sim", "Não"]} data={data} onChange={onChange} required />
        
        <TextArea label="Você tem parentes ou amigos que te auxiliam quando você precisa resolver algo no celular/computador? (Nomes e parentesco)" name="Auxílio tecnologia" data={data} onChange={onChange} required />
        <RadioGroup label="Você possui computador em casa? E internet?" name="Computador e internet" options={["Apenas computador", "Possuo internet", "Computador e internet", "Nenhum", "Outro"]} data={data} onChange={onChange} required />
      </Card>

      <Card title="Situação Econômica" icon={DollarSign}>
        <CheckboxGroup label="Como se apresenta a situação previdenciária do paciente?" name="Situação previdenciária" options={["Aposentado por idade/tempo", "Aposentado por Invalidez", "Pensionista", "Trabalhando", "Auxílio Doença", "Segurado", "Não segurado", "BPC Deficiente", "BPC Idoso", "Outro"]} data={data} onChange={onChange} required />
        <RadioGroup label="Renda do Paciente" name="Renda do Paciente" options={["Sem renda", "1 Salário Mínimo", "1,2 a 3 Salários Mínimos", "Acima de 3 Salários Mínimos", "Não quis responder"]} data={data} onChange={onChange} required />
        <RadioGroup label="Renda Familiar" name="Renda Familiar" options={["Sem renda", "1 Salário Mínimo", "1,2 a 3 Salários Mínimos", "Acima de 3 Salários Mínimos", "Não quis responder"]} data={data} onChange={onChange} required />
        <TextArea label="Observações de situação econômica" name="Observações de situação econômica" data={data} onChange={onChange} />
        <CheckboxGroup label="Incluído em algum programa/benefício?" name="Benefício programa" options={["Não", "Sim", "Passe Livre do DF", "Passe Livre Interestadual", "TFD", "PBF", "BPC", "Outro"]} data={data} onChange={onChange} />
      </Card>

      <Card title="Plano de Trabalho" icon={ClipboardList}>
        <CheckboxGroup label="Orientações e Encaminhamentos" name="Orientações e Encaminhamentos" options={["PL-df", "PLI", "TFD", "Auxílio Doença", "BPC", "Isenção de impostos", "Saque de FGTS", "Programa PTNED", "Fluxo de relatórios", "Agendamento prévio", "Programa Melhor em Casa", "Farmácia de Alto Custo", "Associações de apoio", "DPU", "Judicialização na saúde", "Recuperação de qualidade de segurado", "PBF", "Outro"]} data={data} onChange={onChange} required />
        <CheckboxGroup label="Assistente Social entrevistador(a)" name="Assistente Social entrevistador(a)" options={["Liana", "Rafaela", "Anna", "Luana", "Est. Douglas", "Giorgia", "Outro"]} data={data} onChange={onChange} required />
      </Card>
    </div>
  );
}
