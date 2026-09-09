import React from "react";
import { User, Home, Activity, FileText, Users, HeartPulse, FileHeart } from "lucide-react";
import { VitalsField } from "./shared/VitalsField";
import { ComorbiditiesField } from "./shared/ComorbiditiesField";
import { HabitsField } from "./shared/HabitsField";

export interface EnfermagemFormProps {
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

const Card = ({ title, icon: Icon, children }: any) => (
  <div className="bg-white rounded-2xl border border-[rgba(27,108,168,0.1)] shadow-sm p-5 mb-5">
    <h3 className="font-bold text-[#1A2332] mb-4 text-sm flex items-center gap-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <Icon size={16} className="text-[#1B6CA8]" /> {title}
    </h3>
    <div className="grid sm:grid-cols-2 gap-4">
      {children}
    </div>
  </div>
);

const Input = ({ label, name, placeholder = "", type = "text", value, from, data, onChange }: any) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.name, e.target.value);
  };
  return (
    <div>
      <label className="block text-xs font-bold text-[#1A2332] mb-1">{label}</label>
      {from ? (
        <div className="relative">
          <input
            type={type}
            name={name}
            value={value ?? data?.[name] ?? ""}
            onChange={handleChange}
            placeholder={placeholder}
            className="w-full pl-3 pr-24 py-2.5 rounded-xl border border-[#2DB5A3]/50 bg-[#F0FBF9] text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#2DB5A3]/30 transition"
          />
          <span className="absolute right-3 top-3 text-[10px] text-[#2DB5A3] font-semibold bg-[#F0FBF9] pl-2 whitespace-nowrap">↩ {from}</span>
        </div>
      ) : (
        <input
          type={type}
          name={name}
          value={value ?? data?.[name] ?? ""}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition"
        />
      )}
    </div>
  );
};

const Select = ({ label, name, options, data, onChange }: any) => {
  const value = data?.[name] || "";
  const isOther = value && !options.includes(value);
  
  return (
    <div>
      <label className="block text-xs font-bold text-[#1A2332] mb-1">{label}</label>
      <select
        name={name}
        value={isOther ? "Outro" : value}
        onChange={(e) => {
          if (e.target.value !== "Outro") {
            onChange(name, e.target.value);
          } else {
            onChange(name, ""); // Clear for "Outro" input
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
            onChange(`${name}_isOther`, "false");
          }}
          placeholder="Especifique..."
          className="mt-2 w-full px-3 py-2.5 rounded-xl border border-[#D5E6F3] bg-white text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition"
        />
      )}
    </div>
  );
};

export function EnfermagemForm({ data, origins, onChange, patient }: EnfermagemFormProps) {
  return (
    <div>
      {/* Card 1: Dados Pessoais e Compartilhados */}
      <Card title="Dados Pessoais e Compartilhados" icon={User}>
        <SharedField label="Nome Completo" value={patient.name} />
        <SharedField label="Telefone" value={patient.phone} />
        <SharedField label="Prontuário" value={patient.id} />
        <SharedField label="Idade" value={`${patient.age} anos`} />
        <Input label="Data de Nascimento" name="Data de Nascimento" placeholder="DD/MM/AAAA" data={data} onChange={onChange} />
        <Select label="Sexo" name="Sexo" options={["Masculino", "Feminino"]} data={data} onChange={onChange} />
        <Input label="Procedência (Cidade)" name="Procedência" data={data} onChange={onChange} />
        <Select label="Escolaridade" name="Escolaridade" options={["Analfabeto", "Ensino Fundamental Incompleto", "Ensino Fundamental Completo", "Ensino Médio Incompleto", "Ensino Médio Completo", "Ensino Superior Incompleto", "Ensino Superior Completo"]} data={data} onChange={onChange} />
        <Input label="Ocupação / Profissão" name="Ocupação" data={data} onChange={onChange} />
        <Input label="Religião" name="Religião" value={patient.religion} data={data} onChange={onChange} />
        <Input label="Acompanhante" name="Acompanhante" value={patient.companion} data={data} onChange={onChange} />
      </Card>

      {/* Card 2: Condição Social e Familiar */}
      <Card title="Condição Social e Familiar" icon={Home}>
        <Input label="Mora com quem" name="Mora com quem" data={data} onChange={onChange} />
        <Input label="Forma de deslocamento até o hospital" name="Deslocamento" data={data} onChange={onChange} />
        <Select label="Apoio familiar" name="Apoio familiar" options={["Adequado", "Parcial", "Inexistente"]} data={data} onChange={onChange} />
        <Select label="Limitação de atividade laboral" name="Limitação laboral" options={["Nenhuma", "Parcial", "Total"]} data={data} onChange={onChange} />
        <Select label="Situação de trabalho atual" name="Situação de trabalho" options={["Trabalhando atualmente", "Afastado pelo INSS", "Desempregado"]} data={data} onChange={onChange} />
      </Card>

      {/* Card 3: Histórico da Doença Atual (HDA) */}
      <Card title="Histórico da Doença Atual (HDA)" icon={Activity}>
        <SharedField label="Diagnóstico" value={patient.diagnosis} />
        <SharedField label="CID" value={patient.cid} />
        <Input label="Queixas Principais" name="Queixas principais" data={data} onChange={onChange} />
        <Select label="Paciente tem conhecimento sobre diagnóstico?" name="Conhecimento do diagnóstico" options={["Sim", "Não", "Parcialmente"]} data={data} onChange={onChange} />
        <Input label="Sinais e sintomas" name="Sinais e sintomas" data={data} onChange={onChange} />
        <Input label="Exames" name="Exames" data={data} onChange={onChange} />
        <Select label="Afeto e humor" name="Afeto e humor" options={["Calmo", "Agitado", "Estressado", "Apatia"]} data={data} onChange={onChange} />
        <Input label="Tratamento prévio" name="Tratamento prévio" data={data} onChange={onChange} />
      </Card>

      {/* Card 4: Histórico de Doença Pregressa (HDP) */}
      <Card title="Histórico de Doença Pregressa (HDP)" icon={FileText}>
        <div className="sm:col-span-2">
          <ComorbiditiesField data={data} origins={origins} onChange={onChange} />
        </div>
        <Input label="Outras doenças" name="Outras doenças" data={data} onChange={onChange} />
        <Input label="Alergias" name="alergias" from={origins?.["alergias"]} data={data} onChange={onChange} />
        <Input label="Medicações de uso contínuo" name="medicacoes" from={origins?.["medicacoes"]} data={data} onChange={onChange} />
        <Input label="Cirurgia Prévia" name="Cirurgias prévias" data={data} onChange={onChange} />
        <div className="sm:col-span-2">
          <HabitsField data={data} origins={origins} onChange={onChange} />
        </div>
      </Card>

      {/* Card 5: Histórico Familiar */}
      <Card title="Histórico Familiar" icon={Users}>
        <div className="sm:col-span-2">
          <Input label="Casos de câncer na família (parentesco e tipo)" name="Histórico CA na família" data={data} onChange={onChange} />
        </div>
      </Card>

      {/* Card 6: Exame Físico e Avaliação de Enfermagem */}
      <Card title="Exame Físico e Avaliação de Enfermagem" icon={HeartPulse}>
        <div className="sm:col-span-2">
          <VitalsField data={data} patient={patient} origins={origins} onChange={onChange} />
        </div>
        <Select label="Orientação" name="Orientação" options={["Lúcido e orientado", "Desorientado", "Torporoso"]} data={data} onChange={onChange} />
        <Select label="Sono" name="Sono" options={["Regular", "Insônia", "Hipersonia", "Irregular"]} data={data} onChange={onChange} />
        <Select label="Alimentação" name="Alimentação" options={["Via Oral", "SNE (Sonda Nasoentérica)", "GTT (Gastrostomia)", "Parenteral"]} data={data} onChange={onChange} />
        <Select label="Disfagia" name="Disfagia" options={["Não", "Sim"]} data={data} onChange={onChange} />
        <Select label="Locomoção" name="Locomoção" options={["Sem auxílio", "Com auxílio", "Cadeira de rodas", "Acamado"]} data={data} onChange={onChange} />
        <Select label="Episódios de queda (últimos 3 meses)" name="Quedas" options={["Nenhum", "1 a 2 vezes", "Mais de 2 vezes"]} data={data} onChange={onChange} />
        <Select label="Membros Inferiores (MMII)" name="MMII" options={["Sem queixas", "Edema", "Parestesia"]} data={data} onChange={onChange} />
        <Select label="Eliminações urinárias" name="Eliminações urinárias" options={["Espontânea", "Poliúria", "Disúria", "Incontinência", "Sonda vesical"]} data={data} onChange={onChange} />
        <Select label="Eliminações intestinais" name="Eliminações intestinais" options={["Regular", "Diarreia", "Constipação", "Ostomia"]} data={data} onChange={onChange} />
        <Select label="Avaliação da dor (0 a 10)" name="Avaliação da dor" options={["0 - Sem dor", "1 a 3 - Leve", "4 a 6 - Moderada", "7 a 10 - Intensa"]} data={data} onChange={onChange} />
        <Input label="Lesão tumoral exposta (local, secreção, dor)" name="Lesão tumoral" data={data} onChange={onChange} />
        <Select label="Dispositivos" name="Dispositivos" options={["Nenhum", "SNE", "SVD", "GTT", "Porth-a-cath", "Cateter venoso central"]} data={data} onChange={onChange} />
      </Card>
    </div>
  );
}

