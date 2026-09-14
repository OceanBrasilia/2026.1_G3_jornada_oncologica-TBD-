import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';

export interface ReusedField {
  label: string;
  value: string;
  origin?: string;
}

export interface ReusedDataAccordionProps {
  title?: string;
  fields: ReusedField[];
  children?: React.ReactNode;
  data?: Record<string, any>;
  onChange?: (key: string, value: any) => void;
}

export function ReusedDataAccordion({
  title = 'Identificação (reaproveitada)',
  fields,
  children,
  data,
  onChange
}: ReusedDataAccordionProps) {
  return (
    <div className="bg-white rounded-2xl border border-[rgba(27,108,168,0.1)] shadow-sm mb-5">
      <Accordion type="single" collapsible defaultValue="reused-data">
        <AccordionItem value="reused-data" className="border-b-0">
          <AccordionTrigger className="px-5 py-4 font-bold text-[#1A2332] text-sm hover:no-underline border-b border-[#F1F5F9]">
            {title}
          </AccordionTrigger>
          <AccordionContent className="px-5 pt-4 pb-5">
            <div className="flex flex-col gap-4">
              {fields.map((field, idx) => (
                <div key={idx} className="flex flex-col gap-1 border-b border-[#F1F5F9] pb-4 last:border-0 last:pb-0">
                  <span className="text-[10px] font-bold text-[#6B7A8D] uppercase tracking-wider">
                    {field.label}
                  </span>
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-semibold text-[#1A2332]">{field.value || '—'}</span>
                    {field.origin && (
                      <span className="text-[11px] text-[#2DB5A3] font-bold bg-[#F0FBF9] px-2 py-0.5 rounded-full border border-[#2DB5A3]/20 flex items-center gap-1">
                        <span className="text-xs">↩</span> {field.origin}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Globally Added Fields to all Card I */}
            {data && onChange && (
              <div className="mt-4 pt-4 border-t border-[#F1F5F9]">
                <div className="mb-4">
                  <label className="block text-xs font-bold text-[#1A2332] mb-1">Religião/Crença</label>
                  <select
                    className="w-full px-3 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition"
                    value={data["Religião/Crença"] || data["Religião"] || data["religiao"] || ""}
                    onChange={(e) => onChange("Religião/Crença", e.target.value)}
                  >
                    <option value="">Selecione</option>
                    <option value="Católica">Católica</option>
                    <option value="Evangélica">Evangélica</option>
                    <option value="Espírita">Espírita</option>
                    <option value="Religião de Matriz Africana">Religião de Matriz Africana</option>
                    <option value="Nenhuma">Nenhuma</option>
                    <option value="Outra">Outra</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-bold text-[#1A2332] mb-1">Ocupação/Trabalho</label>
                  <select
                    className="w-full px-3 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition"
                    value={data["Ocupação/Trabalho"] || data["Ocupação"] || data["profissao"] || data["Situação de trabalho"] || ""}
                    onChange={(e) => onChange("Ocupação/Trabalho", e.target.value)}
                  >
                    <option value="">Selecione</option>
                    <option value="Trabalhando">Trabalhando</option>
                    <option value="Aposentado(a)">Aposentado(a)</option>
                    <option value="Desempregado(a)">Desempregado(a)</option>
                    <option value="Afastado(a)">Afastado(a)</option>
                    <option value="Do lar">Do lar</option>
                    <option value="Estudante">Estudante</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div className="mb-4 pl-4 border-l-2 border-[#1B6CA8]/20">
                  <label className="block text-xs font-bold text-[#1A2332] mb-1">Qual trabalho exerce/exercia?</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition"
                    value={data["Trabalho exercido"] || ""}
                    onChange={(e) => onChange("Trabalho exercido", e.target.value)}
                    placeholder="Ex: Professor, Pedreiro..."
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-bold text-[#1A2332] mb-1">Procedência</label>
                  <select
                    className="w-full px-3 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition"
                    value={data["Procedência"] || ""}
                    onChange={(e) => {
                      onChange("Procedência", e.target.value);
                      if (e.target.value !== "Distrito Federal") onChange("Procedência RA", "");
                      if (e.target.value !== "Outro") onChange("Procedência Cidade/Estado", "");
                    }}
                  >
                    <option value="">Selecione</option>
                    <option value="Distrito Federal">Distrito Federal</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                {data["Procedência"] === "Distrito Federal" && (
                  <div className="mb-4 pl-4 border-l-2 border-[#1B6CA8]/20">
                    <label className="block text-xs font-bold text-[#1A2332] mb-1">RA (Região Administrativa)</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition"
                      value={data["Procedência RA"] || ""}
                      onChange={(e) => onChange("Procedência RA", e.target.value)}
                      placeholder="Informe a RA"
                    />
                  </div>
                )}

                {data["Procedência"] === "Outro" && (
                  <div className="mb-4 pl-4 border-l-2 border-[#1B6CA8]/20 flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-[#1A2332] mb-1">Estado (UF)</label>
                      <select
                        className="w-full px-3 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition"
                        value={data["Procedência Estado"] || ""}
                        onChange={(e) => onChange("Procedência Estado", e.target.value)}
                      >
                        <option value="">Selecione</option>
                        <option value="AC">AC</option>
                        <option value="AL">AL</option>
                        <option value="AM">AM</option>
                        <option value="AP">AP</option>
                        <option value="BA">BA</option>
                        <option value="CE">CE</option>
                        <option value="ES">ES</option>
                        <option value="GO">GO</option>
                        <option value="MA">MA</option>
                        <option value="MG">MG</option>
                        <option value="MS">MS</option>
                        <option value="MT">MT</option>
                        <option value="PA">PA</option>
                        <option value="PB">PB</option>
                        <option value="PE">PE</option>
                        <option value="PI">PI</option>
                        <option value="PR">PR</option>
                        <option value="RJ">RJ</option>
                        <option value="RN">RN</option>
                        <option value="RO">RO</option>
                        <option value="RR">RR</option>
                        <option value="RS">RS</option>
                        <option value="SC">SC</option>
                        <option value="SE">SE</option>
                        <option value="SP">SP</option>
                        <option value="TO">TO</option>
                      </select>
                    </div>
                    <div className="flex-[2]">
                      <label className="block text-xs font-bold text-[#1A2332] mb-1">Cidade</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition"
                        value={data["Procedência Cidade"] || ""}
                        onChange={(e) => onChange("Procedência Cidade", e.target.value)}
                        placeholder="Informe a cidade"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Form specific fields rendered inside the accordion content */}
            {children && (
              <div className="mt-6 pt-6 border-t border-[#F1F5F9]">
                {children}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
