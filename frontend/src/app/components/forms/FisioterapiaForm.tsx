import React from "react";
import { User, Activity, FileText } from "lucide-react";

export interface FisioterapiaFormProps {
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
    {children}
  </div>
);

const Input = ({ label, name, type = "text", value, data, onChange, placeholder = "" }: any) => {
  return (
    <div>
      <label className="block text-xs font-bold text-[#1A2332] mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value ?? data?.[name] ?? ""}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition"
      />
    </div>
  );
};

const Select = ({ label, name, options, data, onChange, hasOther = false }: any) => {
  const value = data?.[name] || "";
  const isOther = value && !options.includes(value);
  return (
    <div>
      <label className="block text-xs font-bold text-[#1A2332] mb-1">{label}</label>
      <select
        name={name}
        value={isOther && hasOther ? "Outro" : value}
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
        {hasOther && <option value="Outro">Outro</option>}
      </select>
      {hasOther && (isOther || data?.[`${name}_isOther`] === "true") && (
        <input
          type="text"
          value={isOther ? value : ""}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder="Especifique..."
          className="mt-2 w-full px-3 py-2.5 rounded-xl border border-[#D5E6F3] bg-white text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition"
        />
      )}
    </div>
  );
};

const RadioGroup = ({ label, name, options, data, onChange }: any) => {
  return (
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
};

const CheckboxGroup = ({ label, name, options, data, onChange }: any) => {
  const selected = Array.isArray(data?.[name]) ? data[name] : [];
  return (
    <div className="mb-4">
      <label className="block text-sm font-bold text-[#1A2332] mb-2 leading-tight">{label}</label>
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
                        const newSelected = selected.filter((item: string) => options.includes(item) || item === "Outro");
                        onChange(name, newSelected);
                      }
                    }}
                    className="accent-[#1B6CA8] w-4 h-4 rounded text-[#1B6CA8] focus:ring-[#1B6CA8]"
                  />
                  {opt}
                </label>
                {(isOther || data?.[`${name}_isOther`] === "true") && (
                  <input
                    type="text"
                    value={otherValue}
                    onChange={(e) => {
                      const newSelected = selected.filter((item: string) => options.includes(item));
                      if (e.target.value) {
                        newSelected.push(e.target.value);
                      }
                      onChange(name, newSelected);
                    }}
                    placeholder="Especifique..."
                    className="w-full px-3 py-2 rounded-xl border border-[#D5E6F3] bg-white text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition"
                  />
                )}
              </div>
            );
          }
          return (
            <label key={opt} className="flex items-center gap-2 text-sm font-normal text-[#3A4354] cursor-pointer hover:text-[#1B6CA8] transition-colors w-full sm:w-auto">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={(e) => {
                  let current = [...selected];
                  if (e.target.checked) {
                    current.push(opt);
                  } else {
                    current = current.filter((item: string) => item !== opt);
                  }
                  onChange(name, current);
                }}
                className="accent-[#1B6CA8] w-4 h-4 rounded text-[#1B6CA8] focus:ring-[#1B6CA8]"
              />
              {opt}
            </label>
          );
        })}
      </div>
    </div>
  );
};

export function FisioterapiaForm({ data, onChange, patient }: FisioterapiaFormProps) {
  return (
    <div className="space-y-6">
      <Card title="Dados Iniciais" icon={User}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input label="Avaliador" name="avaliador" data={data} onChange={onChange} />
          <Input label="Nome Completo" name="nomeCompleto" data={data} onChange={onChange} value={patient?.name} />
          <Input label="Data" name="data" type="date" data={data} onChange={onChange} />
          <Input label="Registro HUB" name="registroHub" data={data} onChange={onChange} />
          <Input label="CID" name="cid" data={data} onChange={onChange} value={patient?.cid} />
          <Input label="Diagnóstico Clínico" name="diagnosticoClinico" data={data} onChange={onChange} value={patient?.diagnosis} />
          <Input label="Idade" name="idade" type="number" data={data} onChange={onChange} value={patient?.age} />
          <Input label="Telefone" name="telefone" type="tel" data={data} onChange={onChange} value={patient?.phone} />
        </div>
      </Card>

      <Card title="Acolhimento - Fisioterapia" icon={Activity}>
        <div className="space-y-6">
          <CheckboxGroup 
            label="Tratamento Prévio" 
            name="tratamentoPrevio" 
            options={["Cirurgia", "Quimioterapia", "Radioterapia", "Não", "Outro"]} 
            data={data} 
            onChange={onChange} 
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Se houve tratamento cirúrgico, qual a data?" name="dataCirurgia" type="date" data={data} onChange={onChange} />
            <Input label="Qual cirurgia e onde foi realizado?" name="qualCirurgia" data={data} onChange={onChange} />
          </div>

          <RadioGroup 
            label="Realiza exercício físico?" 
            name="exercicioFisico" 
            options={["Sim", "Não"]} 
            data={data} 
            onChange={onChange} 
          />
          {data?.exercicioFisico === "Sim" && (
            <Input label="Se sim, quais?" name="quaisExercicios" data={data} onChange={onChange} />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select 
              label="Restrição de ADM" 
              name="restricaoAdm" 
              options={["Sim", "Não"]} 
              hasOther={true}
              data={data} 
              onChange={onChange} 
            />
            {data?.restricaoAdm === "Sim" && (
              <Input label="Local de restrição" name="localRestricao" data={data} onChange={onChange} />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select 
              label="Linfedema" 
              name="linfedema" 
              options={["Sim", "Não"]} 
              hasOther={true}
              data={data} 
              onChange={onChange} 
            />
            {data?.linfedema === "Sim" && (
              <Input label="Local do linfedema" name="localLinfedema" data={data} onChange={onChange} />
            )}
          </div>

          <Select 
            label="Fadiga" 
            name="fadiga" 
            options={["Sim", "Não"]} 
            hasOther={true}
            data={data} 
            onChange={onChange} 
          />

          {data?.fadiga === "Sim" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl mt-4">
              <Select 
                label="Em caso de fadiga" 
                name="emCasoDeFadiga" 
                options={["Aos mínimos esforços", "Aos médios esforços", "Aos grandes esforços", "Não se aplica"]} 
                data={data} 
                onChange={onChange} 
              />
              <Input 
                label="Graduação da Fadiga (ECN 0-10)" 
                name="graduacaoFadiga" 
                type="number" 
                data={data} 
                onChange={onChange} 
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select 
              label="Incontinência" 
              name="incontinencia" 
              options={["Urinária", "Fecal", "Não", "Não se aplica"]} 
              data={data} 
              onChange={onChange} 
            />
            {(data?.incontinencia === "Urinária" || data?.incontinencia === "Fecal") && (
              <Input label="Quando foi o início da incontinência?" name="inicioIncontinencia" data={data} onChange={onChange} />
            )}
          </div>

          <Select 
            label="Orientações para Incontinência?" 
            name="orientacoesIncontinencia" 
            options={["Sim", "Não", "Não se aplica"]} 
            hasOther={true}
            data={data} 
            onChange={onChange} 
          />

          <Select 
            label="No caso de câncer de Cabeça e Pescoço, há dificuldade de abertura de boca?" 
            name="dificuldadeAberturaBoca" 
            options={["Sim", "Não", "Não se aplica"]} 
            data={data} 
            onChange={onChange} 
          />

          <Select 
            label="Demanda para atendimento ambulatorial?" 
            name="demandaAmbulatorial" 
            options={["Sim", "Não"]} 
            hasOther={true}
            data={data} 
            onChange={onChange} 
          />
        </div>
      </Card>


    </div>
  );
}
