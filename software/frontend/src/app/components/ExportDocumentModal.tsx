import React, { useState, useEffect, useId } from "react";
import { Download, FileText, CheckCircle2, AlertCircle, X, Loader2 } from "lucide-react";
import type { Patient } from "../types/patient";
import {
  gerarNomeArquivoExportacao,
  type FormatoExportacao,
  type TipoConteudoExportacao,
} from "../export/nomeArquivo";

export interface ExportDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  initialTipo?: TipoConteudoExportacao;
  initialSpecId?: string;
  onExport: (opcoes: {
    tipo: TipoConteudoExportacao;
    especialidadeId?: string;
    especialidadeNome?: string;
    formato: FormatoExportacao;
    nomeArquivo: string;
  }) => Promise<void>;
}

export function isEspecialidadePreenchida(
  spec: { id: string; status: string },
  formAnswers?: Record<string, Record<string, any>>
): boolean {
  if (spec.status === "atendido" || spec.status === "em-atendimento") return true;
  const answers = formAnswers?.[spec.id];
  if (!answers) return false;
  return Object.entries(answers).some(
    ([k, v]) => !k.startsWith("_") && v !== undefined && v !== null && String(v).trim() !== ""
  );
}

export const ExportDocumentModal: React.FC<ExportDocumentModalProps> = ({
  isOpen,
  onClose,
  patient,
  initialTipo = "completo",
  initialSpecId,
  onExport,
}) => {
  const [tipo, setTipo] = useState<TipoConteudoExportacao>(initialTipo);
  const [selectedSpecId, setSelectedSpecId] = useState<string>("");
  const [formato, setFormato] = useState<FormatoExportacao>("pdf");
  const [isExporting, setIsExporting] = useState(false);
  const [erro, setErro] = useState("");

  const modalTitleId = useId();

  // Mapeia as especialidades do paciente identificando as que possuem dados
  const especialidadesComStatus = (patient.specialties || []).map(sp => ({
    ...sp,
    preenchida: isEspecialidadePreenchida(sp, patient.formAnswers),
  }));

  const especialidadesDisponiveis = especialidadesComStatus.filter(sp => sp.preenchida);

  useEffect(() => {
    if (isOpen) {
      setErro("");
      setIsExporting(false);
      setTipo(initialTipo);

      // Define a especialidade inicial selecionada
      if (initialSpecId && especialidadesComStatus.some(s => s.id === initialSpecId && s.preenchida)) {
        setSelectedSpecId(initialSpecId);
      } else if (especialidadesDisponiveis.length > 0) {
        setSelectedSpecId(especialidadesDisponiveis[0].id);
      } else {
        setSelectedSpecId("");
      }
    }
  }, [isOpen, initialTipo, initialSpecId, patient.id]);

  // Se trocar para "Por especialidade", garante uma seleção válida
  useEffect(() => {
    if (tipo === "especialidade") {
      const atualValida = especialidadesDisponiveis.some(s => s.id === selectedSpecId);
      if (!atualValida && especialidadesDisponiveis.length > 0) {
        setSelectedSpecId(especialidadesDisponiveis[0].id);
      }
    }
  }, [tipo]);

  // Tecla ESC para fechar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isExporting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isExporting, onClose]);

  if (!isOpen) return null;

  const selectedSpec = especialidadesComStatus.find(s => s.id === selectedSpecId);

  // Nome do arquivo gerado em tempo real
  const nomeArquivoPreview = gerarNomeArquivoExportacao({
    pacienteNome: patient.name,
    prontuario: patient.id,
    tipo,
    especialidadeNome: tipo === "especialidade" ? selectedSpec?.name : undefined,
    formato,
  });

  const podeExportar =
    tipo === "completo"
      ? true
      : Boolean(selectedSpec && selectedSpec.preenchida);

  const handleConfirmar = async () => {
    if (!podeExportar || isExporting) return;
    setErro("");
    setIsExporting(true);

    try {
      await onExport({
        tipo,
        especialidadeId: tipo === "especialidade" ? selectedSpec?.id : undefined,
        especialidadeNome: tipo === "especialidade" ? selectedSpec?.name : undefined,
        formato,
        nomeArquivo: nomeArquivoPreview,
      });
      onClose();
    } catch (err: any) {
      console.error("Erro ao exportar:", err);
      setErro(err?.message || "Ocorreu um erro ao gerar o documento. Tente novamente.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby={modalTitleId}
    >
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-[rgba(27,108,168,0.15)] flex flex-col gap-5">
        {/* Cabeçalho do Modal */}
        <div className="flex items-start justify-between border-b border-[#EEF2F7] pb-3">
          <div className="flex items-center gap-3">
            <div className="bg-[#E8F4FD] p-2.5 rounded-xl text-[#1B6CA8]">
              <Download size={22} />
            </div>
            <div>
              <h3 id={modalTitleId} className="text-lg font-bold text-[#1A2332]">
                Exportar Documento
              </h3>
              <p className="text-xs text-[#6B7A8D]">
                Paciente: <strong className="text-[#1A2332]">{patient.name}</strong> · Prontuário: {patient.id}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="text-[#9AAABB] hover:text-[#1A2332] p-1 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {/* 1. Escolha de Conteúdo */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-[#1A2332] uppercase tracking-wider block">
            1. Conteúdo do documento
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setTipo("completo")}
              className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition cursor-pointer ${
                tipo === "completo"
                  ? "border-[#1B6CA8] bg-[#F2F8FD] ring-2 ring-[#1B6CA8]/30"
                  : "border-[#D5E6F3] bg-white hover:bg-gray-50 text-gray-700"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                <input
                  type="radio"
                  name="tipo-conteudo"
                  checked={tipo === "completo"}
                  onChange={() => setTipo("completo")}
                  className="accent-[#1B6CA8]"
                />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1A2332]">Documento completo</p>
                <p className="text-xs text-[#6B7A8D] mt-0.5">
                  Reúne todas as especialidades e dados do acolhimento.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTipo("especialidade")}
              className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition cursor-pointer ${
                tipo === "especialidade"
                  ? "border-[#1B6CA8] bg-[#F2F8FD] ring-2 ring-[#1B6CA8]/30"
                  : "border-[#D5E6F3] bg-white hover:bg-gray-50 text-gray-700"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                <input
                  type="radio"
                  name="tipo-conteudo"
                  checked={tipo === "especialidade"}
                  onChange={() => setTipo("especialidade")}
                  className="accent-[#1B6CA8]"
                />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1A2332]">Por especialidade</p>
                <p className="text-xs text-[#6B7A8D] mt-0.5">
                  Exporta somente a especialidade selecionada.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* 2. Seleção da Especialidade (se 'Por especialidade') */}
        {tipo === "especialidade" && (
          <div className="space-y-2 bg-[#F9FBFC] p-3.5 rounded-xl border border-[#D5E6F3]">
            <label htmlFor="especialidade-select" className="text-xs font-bold text-[#1A2332] block">
              Selecione a especialidade desejada:
            </label>
            {especialidadesDisponiveis.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-amber-600" />
                <span>Nenhuma especialidade possui dados preenchidos neste atendimento para exportação individual.</span>
              </div>
            ) : (
              <select
                id="especialidade-select"
                value={selectedSpecId}
                onChange={e => setSelectedSpecId(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#D5E6F3] rounded-lg text-sm text-[#1A2332] font-medium focus:ring-2 focus:ring-[#1B6CA8] focus:border-transparent outline-none"
              >
                {especialidadesComStatus.map(sp => (
                  <option
                    key={sp.id}
                    value={sp.id}
                    disabled={!sp.preenchida}
                    className={!sp.preenchida ? "text-gray-400 bg-gray-50 italic" : "text-[#1A2332]"}
                  >
                    {sp.name} {sp.preenchida ? "✓ (Preenchido)" : "— (Pendente / Sem dados)"}
                  </option>
                ))}
              </select>
            )}
            <p className="text-[11px] text-[#6B7A8D] mt-1">
              Especialidades pendentes ou sem dados preenchidos ficam desabilitadas para evitar documentos em branco.
            </p>
          </div>
        )}

        {/* 3. Escolha do Formato */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-[#1A2332] uppercase tracking-wider block">
            2. Formato de exportação
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setFormato("pdf")}
              className={`p-3 rounded-xl border text-left flex items-center gap-3 transition cursor-pointer ${
                formato === "pdf"
                  ? "border-[#1B6CA8] bg-[#F2F8FD] ring-2 ring-[#1B6CA8]/30"
                  : "border-[#D5E6F3] bg-white hover:bg-gray-50 text-gray-700"
              }`}
            >
              <input
                type="radio"
                name="formato-exportacao"
                checked={formato === "pdf"}
                onChange={() => setFormato("pdf")}
                className="accent-[#1B6CA8]"
              />
              <div>
                <span className="text-sm font-bold text-[#1A2332] block">PDF (.pdf)</span>
                <span className="text-[11px] text-[#6B7A8D]">Ideal para impressão e leitura</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFormato("docx")}
              className={`p-3 rounded-xl border text-left flex items-center gap-3 transition cursor-pointer ${
                formato === "docx"
                  ? "border-[#1B6CA8] bg-[#F2F8FD] ring-2 ring-[#1B6CA8]/30"
                  : "border-[#D5E6F3] bg-white hover:bg-gray-50 text-gray-700"
              }`}
            >
              <input
                type="radio"
                name="formato-exportacao"
                checked={formato === "docx"}
                onChange={() => setFormato("docx")}
                className="accent-[#1B6CA8]"
              />
              <div>
                <span className="text-sm font-bold text-[#1A2332] block">Word (.docx)</span>
                <span className="text-[11px] text-[#6B7A8D]">Editável no Word e Docs</span>
              </div>
            </button>
          </div>
        </div>

        {/* 4. Pré-visualização do Nome do Arquivo */}
        <div className="bg-[#F4F7FB] border border-[#D5E6F3] rounded-xl p-3">
          <p className="text-[11px] font-bold text-[#6B7A8D] uppercase tracking-wider mb-1">
            Nome do arquivo gerado
          </p>
          <p className="font-mono text-xs text-[#1B6CA8] font-bold break-all">
            {nomeArquivoPreview}
          </p>
        </div>

        {erro && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#EEF2F7]">
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2.5 rounded-xl border border-[#D5E6F3] text-sm font-semibold text-[#6B7A8D] hover:bg-gray-50 transition disabled:opacity-50 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmar}
            disabled={!podeExportar || isExporting}
            className="px-5 py-2.5 rounded-xl bg-[#1B6CA8] hover:bg-[#155a90] text-white text-sm font-bold shadow-md hover:shadow-lg transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isExporting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Gerando {formato.toUpperCase()}...
              </>
            ) : (
              <>
                <Download size={16} /> Baixar {formato.toUpperCase()}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
