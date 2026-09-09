import React from "react";
import { User, Activity, ClipboardList, Briefcase, Users, FileText, CheckCircle, Edit3 } from "lucide-react";

export interface FormProps {
  data: Record<string, string>;
  onChange: (key: string, value: string) => void;
  patient: any;
  origins?: Record<string, string>;
}

const SharedField = ({ label, value }: any) => (
  <div>
    <label className="block text-xs font-bold text-[#1A2332] mb-1">{label}</label>
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

const Input = ({ label, name, placeholder = "", type = "text", value, data, onChange }: any) => (
  <div>
    <label className="block text-xs font-bold text-[#1A2332] mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value ?? data?.[name] ?? ""}
      onChange={(e) => onChange(e.target.name, e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition"
    />
  </div>
);

const TextArea = ({ label, name, placeholder = "", data, onChange, rows = 3 }: any) => (
  <div>
    <label className="block text-xs font-bold text-[#1A2332] mb-1">{label}</label>
    <textarea
      name={name}
      value={data?.[name] ?? ""}
      onChange={(e) => onChange(e.target.name, e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition resize-y"
    />
  </div>
);

const Select = ({ label, name, options, data, onChange }: any) => (
  <div>
    <label className="block text-xs font-bold text-[#1A2332] mb-1">{label}</label>
    <select
      name={name}
      value={data?.[name] || ""}
      onChange={(e) => onChange(name, e.target.value)}
      className="w-full px-3 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition"
    >
      <option value="">Selecione...</option>
      {options.map((o: string) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  </div>
);

const RadioGroup = ({ label, name, options, data, onChange }: any) => (
  <div className="mb-4">
    <label className="block text-sm font-bold text-[#1A2332] mb-2 leading-tight">{label}</label>
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
          />
          {opt}
        </label>
      ))}
    </div>
  </div>
);

const RadioGroupVertical = ({ label, name, options, data, onChange }: any) => (
  <div className="mb-4">
    <label className="block text-sm font-bold text-[#1A2332] mb-2 leading-tight">{label}</label>
    <div className="flex flex-col gap-2">
      {options.map((opt: string) => (
        <label key={opt} className="flex items-start gap-2 text-sm font-normal text-[#3A4354] cursor-pointer hover:text-[#1B6CA8] transition-colors">
          <input
            type="radio"
            name={name}
            value={opt}
            checked={data?.[name] === opt}
            onChange={(e) => onChange(name, e.target.value)}
            className="accent-[#1B6CA8] w-4 h-4 mt-0.5"
          />
          <span className="leading-snug">{opt}</span>
        </label>
      ))}
    </div>
  </div>
);

const CheckboxGroup = ({ label, name, options, data, onChange }: any) => {
  const selected = data?.[name] ? data[name].split("|") : [];

  const handleToggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(name, selected.filter((o: string) => o !== opt).join("|"));
    } else {
      onChange(name, [...selected, opt].join("|"));
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-bold text-[#1A2332] mb-2 leading-tight">{label}</label>
      <div className="flex flex-col gap-2">
        {options.map((opt: string) => (
          <label key={opt} className="flex items-start gap-2 text-sm font-normal text-[#3A4354] cursor-pointer hover:text-[#1B6CA8] transition-colors">
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => handleToggle(opt)}
              className="accent-[#1B6CA8] w-4 h-4 mt-0.5 rounded"
            />
            <span className="leading-snug">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export function TerapiaOcupacionalForm({ data, onChange, patient }: FormProps) {
  const avdOptions = ["1 - Independente", "2 - Auxílio/supervisão", "3 - Dependente", "4 - NA"];
  const ocupacaoOptions = ["1 - Alterada", "2 - Não alterada"];

  return (
    <div>
      {/* Campos Compartilhados */}
      <Card title="Campos Compartilhados" icon={User}>
        <div className="grid sm:grid-cols-2 gap-4">
          <SharedField label="Nome" value={patient.name} />
          <SharedField label="Prontuário" value={patient.id} />
          <Input label="Religião" name="Religião" value={patient.religion} data={data} onChange={onChange} />
          <Input label="Renda" name="Renda" data={data} onChange={onChange} />
          <Input label="Local do câncer" name="Local do câncer" value={patient.diagnosis} data={data} onChange={onChange} />
          <Input label="Estado civil" name="Estado civil" value={patient.maritalStatus} data={data} onChange={onChange} />
          <Input label="Escolaridade" name="Escolaridade" data={data} onChange={onChange} />
          <Input label="Naturalidade" name="Naturalidade" data={data} onChange={onChange} />
        </div>
      </Card>

      {/* Grupo 1: Sintomas e Impacto na Rotina */}
      <Card title="Sintomas e Impacto na Rotina" icon={Activity}>
        <div className="space-y-4">
          <RadioGroup label="Sente cansaço?" name="TO_Cansaco" options={["Sim", "Um pouco", "Não"]} data={data} onChange={onChange} />
          {data["TO_Cansaco"] === "Sim" && (
            <div className="ml-6 border-l-2 border-[#1B6CA8]/30 pl-4">
              <Input label="Se sim, te impede no que você quer fazer? (O que?)" name="TO_Cansaco_Impede" data={data} onChange={onChange} />
            </div>
          )}
          
          <RadioGroup label="Queda?" name="TO_Queda" options={["Sim", "Não", "Risco de queda"]} data={data} onChange={onChange} />
          
          <RadioGroup label="Sente dor?" name="TO_Dor" options={["Sim", "Um pouco", "Não"]} data={data} onChange={onChange} />
          
          <RadioGroup label="Escala numérica de dor / EVA (Possui dor mensurável?)" name="TO_Dor_Escala_SN" options={["Sim", "Não"]} data={data} onChange={onChange} />
          {data["TO_Dor_Escala_SN"] === "Sim" && (
            <div className="ml-6 border-l-2 border-[#1B6CA8]/30 pl-4">
              <label className="block text-xs font-bold text-[#1A2332] mb-1">Intensidade (0 a 10)</label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="0" max="10" 
                  value={data["TO_Dor_Intensidade"] || "0"} 
                  onChange={(e) => onChange("TO_Dor_Intensidade", e.target.value)} 
                  className="flex-1 accent-[#1B6CA8]"
                />
                <span className="w-8 text-center font-bold text-[#1B6CA8] bg-[#E8F4FD] rounded-md py-1">{data["TO_Dor_Intensidade"] || "0"}</span>
              </div>
            </div>
          )}

          <RadioGroup label="Teve alteração com a sua rotina?" name="TO_AlteracaoRotina" options={["Sim", "Um pouco", "Não"]} data={data} onChange={onChange} />
        </div>
      </Card>

      {/* Grupo 2: Avaliação das AVDs */}
      <Card title="Avaliação das AVDs" icon={ClipboardList}>
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-6 text-sm text-blue-800">
          <strong>Instrução:</strong> Classifique cada atividade utilizando as opções: 1 (Independente), 2 (Auxílio/supervisão), 3 (Dependente) ou 4 (NA - não se aplica).
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Select label="Alimentação" name="TO_AVD_Alimentacao" options={avdOptions} data={data} onChange={onChange} />
          <Select label="Vestuário" name="TO_AVD_Vestuario" options={avdOptions} data={data} onChange={onChange} />
          <Select label="Banho" name="TO_AVD_Banho" options={avdOptions} data={data} onChange={onChange} />
          <Select label="Higiene pessoal" name="TO_AVD_Higiene" options={avdOptions} data={data} onChange={onChange} />
          <Select label="Vaso sanitário" name="TO_AVD_Vaso" options={avdOptions} data={data} onChange={onChange} />
          <Select label="Controle da urina" name="TO_AVD_Urina" options={avdOptions} data={data} onChange={onChange} />
          <Select label="Controle de fezes" name="TO_AVD_Fezes" options={avdOptions} data={data} onChange={onChange} />
          <Select label="Mobilidade funcional" name="TO_AVD_Mobilidade" options={avdOptions} data={data} onChange={onChange} />
          
          <div className="sm:col-span-2">
            <Input label="Mobilidade funcional - Qual?" name="TO_AVD_Mobilidade_Qual" data={data} onChange={onChange} />
          </div>
          <div className="sm:col-span-2">
            <RadioGroup label="Utiliza algum dispositivo?" name="TO_AVD_Dispositivo" options={["Sim", "Não"]} data={data} onChange={onChange} />
          </div>
        </div>
      </Card>

      {/* Grupo 3: Avaliação das AIVDs */}
      <Card title="Avaliação das AIVDs" icon={ClipboardList}>
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-6 text-sm text-blue-800">
          <strong>Instrução:</strong> Classifique cada atividade utilizando as opções: 1 (Independente), 2 (Auxílio/supervisão), 3 (Dependente) ou 4 (NA - não se aplica).
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Select label="Uso do celular (Comunicação)" name="TO_AIVD_Celular" options={avdOptions} data={data} onChange={onChange} />
          <Select label="Gerenciamento do lar" name="TO_AIVD_Lar" options={avdOptions} data={data} onChange={onChange} />
          <Select label="Tarefas domésticas" name="TO_AIVD_Tarefas" options={avdOptions} data={data} onChange={onChange} />
          <Select label="Manutenção de saúde (Medicamentos)" name="TO_AIVD_Saude" options={avdOptions} data={data} onChange={onChange} />
          <Select label="Gerenciamento financeiro" name="TO_AIVD_Financeiro" options={avdOptions} data={data} onChange={onChange} />
          <Select label="Fazer compras" name="TO_AIVD_Compras" options={avdOptions} data={data} onChange={onChange} />
          <Select label="Descanso e sono" name="TO_AIVD_Sono" options={avdOptions} data={data} onChange={onChange} />
        </div>
      </Card>

      {/* Grupo 4: Ocupações */}
      <Card title="Ocupações" icon={Briefcase}>
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-6 text-sm text-blue-800">
          <strong>Instrução:</strong> Indique se a ocupação está (1) Alterada ou (2) Não alterada.
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Select label="Lazer" name="TO_Ocup_Lazer" options={ocupacaoOptions} data={data} onChange={onChange} />
          <Select label="Memória" name="TO_Ocup_Memoria" options={ocupacaoOptions} data={data} onChange={onChange} />
          <Select label="Trabalho" name="TO_Ocup_Trabalho" options={ocupacaoOptions} data={data} onChange={onChange} />
          <Select label="Participação social" name="TO_Ocup_Social" options={ocupacaoOptions} data={data} onChange={onChange} />
          <Select label="Compreensão" name="TO_Ocup_Compreensao" options={ocupacaoOptions} data={data} onChange={onChange} />
        </div>
      </Card>

      {/* Grupo 5: Aspectos Psicossociais e Suporte */}
      <Card title="Aspectos Psicossociais e Suporte" icon={Users}>
        <div className="space-y-4">
          <TextArea label="O que foi mais difícil no processo de investigação e diagnóstico?" name="TO_Psico_Dificil" data={data} onChange={onChange} />
          
          <CheckboxGroup label="Neste momento, quem mais te ajuda?" name="TO_Psico_Ajuda" options={["Amigos", "Equipe", "Companheiro", "Vizinho", "Familiares", "Outros"]} data={data} onChange={onChange} />
          
          {data["TO_Psico_Ajuda"]?.includes("Outros") && (
            <div className="ml-6 border-l-2 border-[#1B6CA8]/30 pl-4">
              <Input label="Quais? Em que?" name="TO_Psico_Ajuda_Outros" data={data} onChange={onChange} />
            </div>
          )}

          <RadioGroup label="Tem realizado participação em grupos?" name="TO_Psico_Grupos" options={["Sim", "Não"]} data={data} onChange={onChange} />
          
          <TextArea label="Cite atividades significativas ou que considera importantes no seu cotidiano" name="TO_Psico_AtividadesSig" data={data} onChange={onChange} />
        </div>
      </Card>

      {/* Grupo 6: Conclusão Clínica */}
      <Card title="Conclusão Clínica" icon={CheckCircle}>
        <div className="space-y-6">
          <CheckboxGroup 
            label="Diagnóstico Terapêutico Ocupacional" 
            name="TO_Conclusao_Diagnostico" 
            options={[
              "Capacidade funcional preservada e desempenho ocupacional satisfatório",
              "Dependência para realização de AIVD's",
              "Dependências para realização de AVD's",
              "Alterações na mobilidade",
              "Risco de queda",
              "Dor incapacitante",
              "Fadiga",
              "Outro"
            ]} 
            data={data} onChange={onChange} 
          />
          {data["TO_Conclusao_Diagnostico"]?.includes("Outro") && (
            <div className="ml-6 border-l-2 border-[#1B6CA8]/30 pl-4">
              <Input label="Especificar outro diagnóstico:" name="TO_Conclusao_Diagnostico_Outro" data={data} onChange={onChange} />
            </div>
          )}

          <div className="pt-4 border-t border-gray-100">
            <RadioGroupVertical 
              label="Condutas Iniciais" 
              name="TO_Conclusao_Conduta" 
              options={[
                "Não elegível. Realizo orientações em saúde e deixo o serviço a disposição por busca espontânea em caso de necessidade.",
                "Elegível. Encaminho para acompanhamento ambulatorial."
              ]} 
              data={data} onChange={onChange} 
            />
          </div>

          <div className="pt-4 border-t border-gray-100">
            <CheckboxGroup 
              label="Encaminhamentos" 
              name="TO_Conclusao_Encaminhamentos" 
              options={[
                "Orientações em Saúde",
                "Ambulatório de Terapia Ocupacional",
                "Visita Domiciliar",
                "Prescrição de Tecnologias Assistivas",
                "Encaminhamento para outra especialidade"
              ]} 
              data={data} onChange={onChange} 
            />
            {data["TO_Conclusao_Encaminhamentos"]?.includes("Encaminhamento para outra especialidade") && (
              <div className="ml-6 border-l-2 border-[#1B6CA8]/30 pl-4">
                <Input label="Especificar especialidade:" name="TO_Conclusao_Encaminhamentos_Outro" data={data} onChange={onChange} />
              </div>
            )}
          </div>
        </div>
      </Card>

    </div>
  );
}
