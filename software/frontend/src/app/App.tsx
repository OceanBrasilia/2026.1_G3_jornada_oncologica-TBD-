import React, { useState, useEffect } from "react";
import { api, type DashboardJornadaItem, type DashboardCoordenacaoResponse } from "./services/api";
import {
  Activity, AlertCircle, ArrowLeft, BarChart3, Bell, Check,
  CheckCircle, ClipboardList, Clock, Download, Eye, FileText,
  Filter, Heart, Home, LogOut, Menu, Plus, Save,
  Search, Stethoscope, Upload, User, Users, X,
  MapPin, Paperclip, Layers,
  AlertTriangle, Clipboard, UserPlus, Shield, Pencil, Trash2,
  SlidersHorizontal, RotateCcw
} from "lucide-react";
import { EnfermagemForm } from "./components/forms/EnfermagemForm";
import { NutricaoForm } from "./components/forms/NutricaoForm";
import { FisioterapiaForm } from "./components/forms/FisioterapiaForm";
import { TerapiaOcupacionalForm } from "./components/forms/TerapiaOcupacionalForm";
import { MedicinaForm } from "./components/forms/MedicinaForm";
import { PsicologiaForm } from "./components/forms/PsicologiaForm";
import { ServicoSocialForm } from "./components/forms/ServicoSocialForm";
import { DefaultForm } from "./components/forms/DefaultForm";
import { OdontologiaForm } from "./components/forms/OdontologiaForm";
import { FonoaudiologiaForm } from "./components/forms/FonoaudiologiaForm";
import { GlobalCriticalAlert } from "./components/ui/GlobalCriticalAlert";
import { Level3Chips } from "./components/ui/Level3Chips";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "./components/ui/alert-dialog";
import { Level2Banner } from "./components/ui/Level2Banner";
import { PendencyList } from "./components/ui/PendencyList";
import { mockPatientAlerts } from "./mocks/patientAlertsMock";
import { PatientAlert, AlertCategory } from "./types/alerts";
import { generatePatientAlerts } from "./alerts/generatePatientAlerts";
import { filterAlertsForRole, podeVerConfidencial } from "./alerts/visibleAlerts";
import {
  buildDadosGerais, buildDetalhesEspecialidade, buildInformacoesCompartilhadas, buildResumoNutricao, buildResumoPsicologia, statusLabel,
} from "./consolidado/buildConsolidatedView";
import { buildEspecialidadesPdf } from "./pdf/buildEspecialidadesPdf";
import { ExportDocumentModal } from "./components/ExportDocumentModal";
import { nomeExibicaoPorPerfil } from "./utils/roleDisplayName";
import { calcularIdade } from "./utils/idade";
import { statusGeralDoPaciente } from "./utils/statusPaciente";
import {
  loadStoredPatients,
  saveStoredPatients,
  saveFormDraft,
  loadFormDraft,
  clearFormDraft,
  resetStoredPatients,
  loadFormDraftWithMeta,
} from "./services/patientStorage";

// ─── Types ───────────────────────────────────────────────────────────────────

type Screen =
  | "login"
  | "public-journey"
  | "reception-dashboard"
  | "patient-registration"
  | "professional-dashboard"
  | "patient-record"
  | "specialty-form"
  | "consolidated-record"
  | "coordination-dashboard"
  | "professionals-management"
  | "time-targets"
  | "forms-list";

type Role = "recepcao" | "profissional" | "coordenacao" | "administrador";
type SpecStatus = "atendido" | "pendente" | "em-atendimento" | "nao-se-aplica";
type PatStatus = "aguardando" | "em-atendimento" | "pendente" | "finalizado";

interface PatientDocument {
  id: string;
  patientId: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
}

interface Specialty {
  id: string;
  name: string;
  status: SpecStatus;
  professional?: string;
  completedTime?: string;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  cpf: string;
  cns?: string;
  phone: string;
  address?: string;
  addressRua?: string;
  addressBairro?: string;
  addressCidadeUF?: string;
  addressCEP?: string;
  sexoNascimento?: string;
  identidadeGenero?: string;
  emergencyContact: string;
  companion?: string;
  diagnosis: string;
  cid: string;
  origin: string;
  status: PatStatus;
  arrivalTime: string;
  date: string;
  specialties: Specialty[];
  weight?: string;
  height?: string;
  maritalStatus?: string;
  religion?: string;
  raceColor?: string;
  formAnswers?: Record<string, Record<string, string>>;
  alerts?: PatientAlert[];
  /** Exportações em PDF da ficha consolidada (RF-018): a próxima recebe a versão seguinte. */
  pdfExports?: PdfExportRecord[];
  /** Chegada/saída registradas pela Recepção. A saída só é dada na Recepção. */
  checkin?: CheckinRecord;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const SPEC_NAMES = ["Recepção", "Enfermagem", "Medicina", "Nutrição", "Fisioterapia", "Serviço Social", "Psicologia", "Odontologia", "Fonoaudiologia", "Terapia Ocupacional"];
const SPEC_IDS = ["recepcao", "enfermagem", "medicina", "nutricao", "fisioterapia", "servico-social", "psicologia", "odontologia", "fonoaudiologia", "terapia-ocupacional"];
const SPEC_PROFS = ["Carla Santos", "Enfª. Patrícia Lima", "Dr. Rafael Costa", "Nutr. Fernanda Alves", "Fisio. Pedro Nunes", "AS Lívia Souza", "Psic. Marcos Vidal", "CD João Melo", "Fga. Sônia Reis", "TO Amanda Borges"];
const SPEC_TIMES = ["08:20", "09:05", "09:55", "11:00", "11:45", "12:30", "13:20", "14:10", "15:00", "15:45"];

function mkSpecs(statuses: SpecStatus[]): Specialty[] {
  return SPEC_NAMES.map((name, i) => ({
    id: SPEC_IDS[i],
    name,
    status: statuses[i],
    professional: (statuses[i] === "atendido" || statuses[i] === "em-atendimento") ? SPEC_PROFS[i] : undefined,
    completedTime: statuses[i] === "atendido" ? SPEC_TIMES[i] : undefined,
  }));
}

const MOCK_FORM_ANSWERS: Record<string, Record<string, string>> = {
  recepcao: {
    "Documentos verificados": "Sim",
    "Tipo de documento": "RG + CPF",
    "Cobertura": "SUS",
    "Observações": "Paciente orientada sobre o fluxo de acolhimento.",
  },
  enfermagem: {
    "Pressão arterial": "130/85 mmHg",
    "Temperatura": "36,8°C",
    "Saturação O₂": "97%",
    "Frequência cardíaca": "78 bpm",
    "peso": "68",
    "altura": "1.63",
    "Alergia": "Sim",
    "Reação alergica": "Dipirona",
    "comorbidades_lista": "Hipertensão Arterial",
    "tabagismo": "Ex-tabagista",
    "tabagismo_detalhes": "parou há 5 anos",
    "etilismo": "Sim",
    "etilismo_detalhes": "social",
    "Queixas principais": "Dor moderada no local da cirurgia. Relata cansaço frequente.",
  },
  medicina: {
    "Diagnóstico oncológico": "Câncer de Mama",
    "Estadiamento": "IIA",
    "Tipo histológico": "Carcinoma ductal invasivo",
    "História oncológica": "Nódulo mamário palpável diagnosticado há 4 meses. Biópsia confirmou CDI.",
    "Tratamento em curso": "Planejada quimioterapia neoadjuvante",
    "Situação atual": "Paciente em bom estado geral, lúcida e orientada.",
    "ECOG / Performance": "1",
    "peso": "68",
    "altura": "1.63",
    "Gestação": "2",
    "Parto": "2",
    "Aborto": "0",
    "DUM": "2020-05-10",
    "Menopausa": "Sim",
    "Atividade física": "Não",
    "ACV": "RCR em 2T, bulhas normofonéticas sem sopros",
    "AR": "MV presente bilateralmente sem ruídos adventícios",
    "ABD": "Plano, flácido, indolor à palpação, sem visceromegalias",
    "MMII": "Sem edema, pulsos periféricos presentes",
    "Resultado anatomopatológico": "CDI grau II, RE+, RP+, HER2-",
    "Exames complementares": "Mamografia e ultrassom de mamas anexados",
    "Impressão diagnóstica": "Carcinoma de mama estágio clínico IIA",
    "Conduta": "Encaminhada para planejamento de QT neoadjuvante",
    "Investimento": "Pleno",
    "Observações": "Paciente orientada sobre plano terapêutico.",
  },
  nutricao: {
    "peso": "68",
    "altura": "1.63",
    "IMC": "25,6",
    "Risco nutricional": "Moderado",
    "Uso de sonda/gastrostomia": "Não",
    "Apetite": "Preservado",
    "Observações": "Alimentação oral adequada. Sem perda de peso significativa nos últimos 3 meses.",
  },
  fisioterapia: {
    "Nível de dor": "4–6 – Moderada",
    "Mobilidade": "Limitada",
    "Limitação funcional": "Moderada",
    "Necessidade de reabilitação": "Sim – ambulatorial",
    "Observações": "Limitação de amplitude de movimento no membro superior esquerdo.",
  },
  "servico-social": {
    "Situação de moradia": "Casa própria",
    "Composição familiar": "Cônjuge ou companheiro(a) e 2 filhos",
    "Renda familiar": "2 a 4 salários mínimos",
    "Benefício social": "Não",
    "Necessidade de transporte": "Sim",
    "Observações": "Família presente e participativa. Esposo acompanha em todos os atendimentos.",
  },
  psicologia: {
    "Estado emocional": "Ansioso/Preocupado",
    "Suporte familiar": "Adequado",
    "Histórico de transtorno mental": "Não",
    "Avaliação de risco": "Sem risco",
    "Observações": "Paciente ansiosa em relação ao diagnóstico. Receptiva à intervenção psicológica.",
  },
  odontologia: {
    "Diagnóstico Oncológico e Localização do Tumor (CID)": "Câncer de Mama (C50.9)",
    "Risco de Mucosite": "Baixo",
    "Tem dentes naturais?": "Sim",
    "Usa próteses?": "Não",
    "Tem dor de dente?": "Não",
    "Tabagista": "Não",
    "Etilista": "Não",
    "Qual a via de alimentação?": "Via oral",
    "Tem traqueostomia?": "Não",
    "Xerostomia": "Não",
    "Medicamentos antirreabsortivos": "Não",
    "Acesso odontológico UBS": "Sim, UBS de referência próxima à residência",
    "Cáries cavitadas": "Não",
    "Mobilidade dentária": "Não",
    "Classificação do Risco Odontológico": "BAIXO",
    "Encaminhar para 2857?": "NÃO",
    "Observações": "Sem alterações bucais de urgência no momento. Paciente orientada sobre higiene oral.",
  },
  fonoaudiologia: {
    "Deglutição": "Preservada",
    "Comunicação": "Adequada",
    "Observações": "Sem alterações fonoaudiológicas identificadas.",
  },
  "terapia-ocupacional": {
    "Independência nas AVDs": "Parcialmente dependente",
    "Uso de órtese/prótese": "Não",
    "Capacidade de autocuidado": "Preservada com auxílio",
    "Atividades de lazer/trabalho": "Reduzidas devido ao tratamento",
    "Adaptações no domicílio": "Não necessárias no momento",
    "Observações": "Paciente com limitação funcional leve no membro superior. Orientações sobre conservação de energia.",
  },
};

const PATIENTS: Patient[] = [
  {
    id: "CAO-2024-0001",
    name: "Maria das Graças Oliveira",
    age: 62,
    cpf: "123.456.789-00",
    cns: "700 0012 3456 7890",
    phone: "(31) 98765-4321",
    address: "Rua das Flores, 123 – Belo Horizonte/MG",
    emergencyContact: "Ana Oliveira – (31) 99999-0000",
    companion: "José Oliveira (esposo)",
    diagnosis: "Câncer de Mama",
    cid: "C50.9",
    origin: "UBS Central",
    status: "em-atendimento",
    arrivalTime: "08:15",
    date: "03/07/2024",
    weight: "68 kg",
    height: "1,63 m",
    maritalStatus: "Casada",
    religion: "Católica",
    raceColor: "Parda",
    formAnswers: {
      recepcao: MOCK_FORM_ANSWERS.recepcao,
      enfermagem: MOCK_FORM_ANSWERS.enfermagem,
    },
    alerts: mockPatientAlerts,
    specialties: mkSpecs(["atendido", "atendido", "em-atendimento", "pendente", "pendente", "pendente", "pendente", "nao-se-aplica", "nao-se-aplica", "pendente"]),
  },
  {
    id: "CAO-2024-0002",
    name: "Roberto Ferreira Silva",
    age: 68,
    cpf: "987.654.321-00",
    phone: "(31) 97654-3210",
    address: "Av. Afonso Pena, 500 – Belo Horizonte/MG",
    emergencyContact: "Laura Silva – (31) 98888-1111",
    diagnosis: "Câncer de Próstata",
    cid: "C61",
    origin: "Hospital das Clínicas",
    status: "aguardando",
    arrivalTime: "09:00",
    date: "03/07/2024",
    specialties: mkSpecs(["atendido", "pendente", "pendente", "pendente", "pendente", "pendente", "pendente", "pendente", "nao-se-aplica", "pendente"]),
  },
  {
    id: "CAO-2024-0003",
    name: "Ana Beatriz Martins",
    age: 45,
    cpf: "456.789.123-00",
    phone: "(31) 96543-2109",
    address: "Rua São Paulo, 78 – Contagem/MG",
    emergencyContact: "Paulo Martins – (31) 97777-2222",
    diagnosis: "Linfoma de Hodgkin",
    cid: "C81.9",
    origin: "Clínica Oncovida",
    status: "finalizado",
    arrivalTime: "07:30",
    date: "03/07/2024",
    formAnswers: {
      recepcao: MOCK_FORM_ANSWERS.recepcao,
      enfermagem: MOCK_FORM_ANSWERS.enfermagem,
      medicina: MOCK_FORM_ANSWERS.medicina,
      nutricao: MOCK_FORM_ANSWERS.nutricao,
      fisioterapia: MOCK_FORM_ANSWERS.fisioterapia,
      "servico-social": MOCK_FORM_ANSWERS["servico-social"],
      psicologia: MOCK_FORM_ANSWERS.psicologia,
      "terapia-ocupacional": MOCK_FORM_ANSWERS["terapia-ocupacional"],
    },
    specialties: mkSpecs(["atendido", "atendido", "atendido", "atendido", "atendido", "atendido", "atendido", "nao-se-aplica", "nao-se-aplica", "atendido"]),
  },
  {
    id: "CAO-2024-0004",
    name: "Carlos Eduardo Pinto",
    age: 54,
    cpf: "321.654.987-00",
    phone: "(31) 95432-1098",
    address: "Rua Caetés, 200 – Betim/MG",
    emergencyContact: "Renata Pinto – (31) 96666-3333",
    diagnosis: "Câncer de Pulmão",
    cid: "C34.9",
    origin: "Pronto-Socorro Central",
    status: "pendente",
    arrivalTime: "10:20",
    date: "03/07/2024",
    specialties: mkSpecs(["atendido", "atendido", "pendente", "pendente", "pendente", "pendente", "pendente", "nao-se-aplica", "nao-se-aplica", "pendente"]),
  },
  {
    id: "CAO-2024-0005",
    name: "Francisca Gomes Tavares",
    age: 78,
    cpf: "654.321.098-00",
    phone: "(31) 94321-0987",
    address: "Rua Goiás, 45 – Santa Luzia/MG",
    emergencyContact: "Marcos Tavares – (31) 95555-4444",
    companion: "Eliane Tavares (filha)",
    diagnosis: "Câncer Gástrico",
    cid: "C16.9",
    origin: "UPA Leste",
    status: "em-atendimento",
    arrivalTime: "08:45",
    date: "03/07/2024",
    weight: "55 kg",
    height: "1,58 m",
    maritalStatus: "Viúva",
    religion: "Evangélica",
    raceColor: "Branca",
    formAnswers: {
      recepcao: MOCK_FORM_ANSWERS.recepcao,
      enfermagem: MOCK_FORM_ANSWERS.enfermagem,
      medicina: MOCK_FORM_ANSWERS.medicina,
    },
    specialties: mkSpecs(["atendido", "atendido", "atendido", "em-atendimento", "pendente", "pendente", "pendente", "nao-se-aplica", "pendente", "pendente"]),
  },
];

// ─── Shared Components ────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: SpecStatus | PatStatus }) {
  const cfg: Record<string, { label: string; cls: string }> = {
    atendido: { label: "Atendido", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    pendente: { label: "Pendente", cls: "bg-amber-50 text-amber-700 border-amber-200" },
    "em-atendimento": { label: "Em atendimento", cls: "bg-blue-50 text-blue-700 border-blue-200" },
    "nao-se-aplica": { label: "Não se aplica", cls: "bg-gray-50 text-gray-400 border-gray-200" },
    aguardando: { label: "Aguardando", cls: "bg-sky-50 text-sky-700 border-sky-200" },
    finalizado: { label: "Finalizado", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  };
  const c = cfg[status] ?? { label: status, cls: "bg-gray-100 text-gray-500 border-gray-200" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${c.cls}`}>
      {c.label}
    </span>
  );
}

const MOCK_NOW = "11:24";

function calcElapsed(arrival: string, patient: Patient): { label: string; color: string } {
  const lastDone = [...patient.specialties]
    .reverse()
    .find(s => s.status === "atendido" && s.completedTime);
  const endTime = patient.status === "finalizado" && lastDone?.completedTime
    ? lastDone.completedTime
    : MOCK_NOW;

  const [ah, am] = arrival.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const mins = (eh * 60 + em) - (ah * 60 + am);
  if (mins <= 0) return { label: "—", color: "text-[#9AAABB]" };

  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const label = h > 0 ? `${h}h ${m < 10 ? "0" : ""}${m}min` : `${m}min`;
  const color = mins > 180 ? "text-red-600" : mins > 120 ? "text-amber-600" : "text-emerald-600";
  return { label, color };
}

function SpecIcon({ status }: { status: SpecStatus }) {
  if (status === "atendido")
    return <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0"><Check size={14} className="text-emerald-600" /></div>;
  if (status === "em-atendimento")
    return <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 animate-pulse"><Activity size={14} className="text-blue-600" /></div>;
  if (status === "nao-se-aplica")
    return <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0"><X size={14} className="text-gray-400" /></div>;
  return <div className="w-8 h-8 rounded-full bg-amber-50 border-2 border-amber-200 border-dashed flex items-center justify-center shrink-0"><Clock size={13} className="text-amber-500" /></div>;
}

function StatCard({ label, value, sub, color }: { label: string; value: number | string; sub?: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-[rgba(27,108,168,0.1)] p-5 shadow-sm">
      <p className="text-sm text-[#6B7A8D] font-medium mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-[#9AAABB] mt-1">{sub}</p>}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

interface SidebarProps {
  role: Role;
  screen: Screen;
  onNavigate: (s: Screen) => void;
  onLogout: () => void;
  open: boolean;
  onClose: () => void;
  userName?: string;
}

function Sidebar({ role, screen, onNavigate, onLogout, open, onClose, userName }: SidebarProps) {
  const navItems: { icon: React.ReactNode; label: string; screen: Screen }[] = role === "recepcao"
    ? [
      { icon: <Home size={18} />, label: "Dashboard", screen: "reception-dashboard" },
      { icon: <Plus size={18} />, label: "Novo Paciente", screen: "patient-registration" },
    ]
    : role === "profissional"
      ? [
        { icon: <Users size={18} />, label: "Pacientes", screen: "professional-dashboard" },
        { icon: <ClipboardList size={18} />, label: "Formulários", screen: "forms-list" },
      ]
      : role === "coordenacao"
        ? [
          { icon: <BarChart3 size={18} />, label: "Painel Geral", screen: "coordination-dashboard" },
          { icon: <Users size={18} />, label: "Pacientes", screen: "professional-dashboard" },
          { icon: <SlidersHorizontal size={18} />, label: "Metas de tempo", screen: "time-targets" },
        ]
        : [
          { icon: <UserPlus size={18} />, label: "Gestão de Profissionais", screen: "professionals-management" },
          { icon: <BarChart3 size={18} />, label: "Painel Geral", screen: "coordination-dashboard" },
          { icon: <Users size={18} />, label: "Pacientes", screen: "professional-dashboard" },
          { icon: <SlidersHorizontal size={18} />, label: "Metas de tempo", screen: "time-targets" },
          { icon: <ClipboardList size={18} />, label: "Formulários", screen: "forms-list" },
        ];

  const roleLabel = role === "recepcao" ? "Recepção" : role === "profissional" ? "Profissional" : role === "coordenacao" ? "Coordenação" : "Administração";
  const displayName = userName || nomeExibicaoPorPerfil(role);

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/30 z-20 lg:hidden print:hidden" onClick={onClose} />}
      <aside className={`print:hidden fixed top-0 left-0 h-full w-60 bg-white border-r border-[rgba(27,108,168,0.12)] z-30 flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        style={{ fontFamily: "'Nunito', sans-serif" }}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-[rgba(27,108,168,0.1)] flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1B6CA8] flex items-center justify-center shrink-0">
            <Heart size={18} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#1B6CA8] uppercase tracking-wider leading-none">Central</p>
            <p className="text-[10px] text-[#6B7A8D] leading-none mt-0.5">Acolhimento Oncológico</p>
          </div>
          <button className="ml-auto lg:hidden" onClick={onClose} aria-label="Fechar menu"><X size={18} className="text-[#6B7A8D]" /></button>
        </div>

        {/* Role badge */}
        <div className="px-4 pt-4 pb-2">
          <span className="text-[10px] font-bold text-[#1B6CA8] uppercase tracking-widest bg-[#E8F4FD] px-2.5 py-1 rounded-full">{roleLabel}</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5">
          {navItems.map(item => (
            <button
              key={item.label}
              onClick={() => { onNavigate(item.screen); onClose(); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${screen === item.screen
                  ? "bg-[#1B6CA8] text-white shadow-md"
                  : "text-[#6B7A8D] hover:bg-[#F4F7FB] hover:text-[#1A2332]"
                }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-[rgba(27,108,168,0.1)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#E8F4FD] flex items-center justify-center">
              <User size={14} className="text-[#1B6CA8]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#1A2332] truncate">{displayName}</p>
              <p className="text-[10px] text-[#9AAABB]">{roleLabel}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[#6B7A8D] hover:bg-red-50 hover:text-red-600 transition-colors font-medium"
          >
            <LogOut size={15} />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}

// ─── Notifications ────────────────────────────────────────────────────────────

interface AppNotification {
  id: string;
  type: "new-patient" | "awaiting-next";
  patientId: string;
  patientName: string;
  message: string;
  time: string;
  read: boolean;
}

function buildNotifications(patients: Patient[]): AppNotification[] {
  const notes: AppNotification[] = [];
  patients.forEach(p => {
    const anyDone = p.specialties.some(s => s.status === "atendido");
    const anyPending = p.specialties.some(s => s.status === "pendente");

    if (!anyDone && p.status !== "finalizado") {
      notes.push({
        id: `new-${p.id}`,
        type: "new-patient",
        patientId: p.id,
        patientName: p.name,
        message: "Novo paciente aguardando primeiro atendimento",
        time: p.arrivalTime,
        read: false,
      });
    } else if (anyDone && anyPending) {
      const lastDone = [...p.specialties].reverse().find(s => s.status === "atendido");
      notes.push({
        id: `next-${p.id}`,
        type: "awaiting-next",
        patientId: p.id,
        patientName: p.name,
        message: `Concluiu ${lastDone?.name ?? "especialidade"} · aguardando próximo atendimento`,
        time: lastDone?.completedTime ?? p.arrivalTime,
        read: false,
      });
    }
  });
  return notes.sort((a, b) => b.time.localeCompare(a.time));
}

// ─── Authenticated Layout ─────────────────────────────────────────────────────

function AppLayout({ children, role, screen, onNavigate, onLogout, title, onBack, notifications, onMarkAllRead, userName }: {
  children: React.ReactNode;
  role: Role;
  screen: Screen;
  onNavigate: (s: Screen) => void;
  onLogout: () => void;
  title: string;
  onBack?: () => void;
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  userName?: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex print:bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Sidebar role={role} screen={screen} onNavigate={onNavigate} onLogout={onLogout} open={sidebarOpen} onClose={() => setSidebarOpen(false)} userName={userName} />
      <div className="flex-1 min-w-0 lg:ml-60 flex flex-col min-h-screen print:ml-0 print:block">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-white border-b border-[rgba(27,108,168,0.1)] px-4 md:px-6 py-3.5 flex items-center gap-3 print:hidden">
          <button className="lg:hidden p-2 rounded-xl hover:bg-[#F4F7FB] transition" onClick={() => setSidebarOpen(true)} aria-label="Abrir menu">
            <Menu size={20} className="text-[#6B7A8D]" />
          </button>
          {onBack && (
            <button onClick={onBack} className="p-2 rounded-xl hover:bg-[#F4F7FB] transition" aria-label="Voltar">
              <ArrowLeft size={20} className="text-[#6B7A8D]" />
            </button>
          )}
          <h1 className="text-base font-bold text-[#1A2332] flex-1" style={{ fontFamily: "'Nunito', sans-serif" }}>{title}</h1>
          <div className="flex items-center gap-2 relative">
            <button
              onClick={() => { setBellOpen(o => !o); if (!bellOpen) onMarkAllRead(); }}
              className="p-2 rounded-xl hover:bg-[#F4F7FB] transition relative"
              aria-label={unread > 0 ? `Notificações: ${unread} não lidas` : "Notificações"}
              aria-expanded={bellOpen}
            >
              <Bell size={18} className={unread > 0 ? "text-[#1B6CA8]" : "text-[#9AAABB]"} />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                  {unread}
                </span>
              )}
            </button>

            {/* Notification dropdown */}
            {bellOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setBellOpen(false)} />
                <div className="absolute top-10 right-0 z-30 w-80 bg-white rounded-2xl shadow-2xl border border-[rgba(27,108,168,0.1)] overflow-hidden">
                  <div className="px-4 py-3.5 border-b border-[#EEF2F7] flex items-center justify-between">
                    <h3 className="font-bold text-sm text-[#1A2332]" style={{ fontFamily: "'Nunito', sans-serif" }}>
                      Notificações
                    </h3>
                    <span className="text-xs text-[#9AAABB]">{notifications.length} alertas</span>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-[#F4F7FB]">
                    {notifications.length === 0 ? (
                      <div className="py-8 flex flex-col items-center gap-2 text-center">
                        <Bell size={20} className="text-[#D5E6F3]" />
                        <p className="text-xs text-[#9AAABB]">Nenhuma notificação</p>
                      </div>
                    ) : notifications.map(n => (
                      <div key={n.id} className={`px-4 py-3 hover:bg-[#F9FBFE] transition-colors ${n.read ? "opacity-60" : ""}`}>
                        <div className="flex gap-3 items-start">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${n.type === "new-patient" ? "bg-[#E8F4FD]" : "bg-emerald-50"
                            }`}>
                            {n.type === "new-patient"
                              ? <User size={14} className="text-[#1B6CA8]" />
                              : <CheckCircle size={14} className="text-emerald-600" />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-[#1A2332] truncate">{n.patientName}</p>
                            <p className="text-xs text-[#6B7A8D] leading-snug mt-0.5">{n.message}</p>
                            <p className="text-[10px] text-[#9AAABB] mt-1 flex items-center gap-1">
                              <Clock size={9} /> {n.time}
                            </p>
                          </div>
                          {!n.read && <span className="w-2 h-2 bg-[#1B6CA8] rounded-full shrink-0 mt-1.5" />}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="px-4 py-3 border-t border-[#EEF2F7] bg-[#F9FBFE]">
                    <p className="text-[10px] text-[#9AAABB] text-center">As notificações são geradas automaticamente pelo sistema</p>
                  </div>
                </div>
              </>
            )}

            <span className="hidden sm:block text-xs text-[#9AAABB]">03/07/2024 · 11:24</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 md:px-6 py-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────

function LoginScreen({ onLogin, onPublicJourney, professionals = [] }: {
  onLogin: (r: Role, email?: string) => void;
  onPublicJourney: () => void;
  professionals?: Professional[];
}) {
  const [role, setRole] = useState<Role>("profissional");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const roles: { id: Role; label: string; defaultEmail: string }[] = [
    { id: "recepcao", label: "Recepção", defaultEmail: "recepcao@hospital.com.br" },
    { id: "profissional", label: "Profissional", defaultEmail: "felipe@hospital.com.br" },
    { id: "coordenacao", label: "Coordenação", defaultEmail: "coordenacao@hospital.com.br" },
    { id: "administrador", label: "Administração", defaultEmail: "admin@hospital.com.br" },
  ];

  const currentRoleConfig = roles.find(r => r.id === role) || roles[1];

  async function handleLoginSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setErrorMsg(null);
    
    if (!email.trim() || !pwd.trim()) {
      setErrorMsg("Por favor, preencha o e-mail e a senha.");
      return;
    }
    
    setLoading(true);

    try {
      // Integração com endpoint POST /login
      await api.login(email.trim(), pwd);
      onLogin(role, email.trim());
    } catch (err: any) {
      const emailNorm = email.trim().toLowerCase();
      const localPro = professionals.find(p => p.email.toLowerCase() === emailNorm && p.status === "ativo");
      const roleMatches = localPro && (
        (role === "recepcao" && localPro.role === "Recepção") ||
        (role === "profissional" && localPro.role === "Profissional") ||
        (role === "coordenacao" && localPro.role === "Coordenação") ||
        (role === "administrador" && localPro.role === "Administração")
      );

      if (localPro && roleMatches) {
        onLogin(role, email.trim());
      } else if (err instanceof Error && err.message.includes("Failed to fetch")) {
        console.warn("Backend offline. Utilizando login de contingência.");
        onLogin(role, email.trim());
      } else {
        setErrorMsg("E-mail ou senha incorretos.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F4FD] via-[#F4F7FB] to-[#E8F5F0] flex items-center justify-center p-4" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1B6CA8] mb-4 shadow-lg shadow-[#1B6CA8]/30">
            <Heart size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#1A2332]" style={{ fontFamily: "'Nunito', sans-serif" }}>Central de Acolhimento</h1>
          <p className="text-[#6B7A8D] mt-1">Oncológico · Hospital Regional</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-[rgba(27,108,168,0.12)] p-8">
          <div className="flex rounded-xl bg-[#F4F7FB] p-1 mb-6">
            {roles.map(r => (
              <button key={r.id} onClick={() => { setRole(r.id); setErrorMsg(null); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${role === r.id ? "bg-white text-[#1B6CA8] shadow-sm" : "text-[#6B7A8D] hover:text-[#1A2332]"}`}>
                {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}
            <div>
              <label htmlFor="login-email" className="block text-sm font-semibold text-[#1A2332] mb-1.5">E-mail ou usuário</label>
              <input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder={currentRoleConfig.defaultEmail}
                className="w-full px-4 py-3 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-[#1A2332] placeholder-[#9AAABB] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/25 focus:border-[#1B6CA8] transition text-sm" />
            </div>
            <div>
              <label htmlFor="login-senha" className="block text-sm font-semibold text-[#1A2332] mb-1.5">Senha</label>
              <input id="login-senha" type="password" value={pwd} onChange={e => setPwd(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-[#1A2332] placeholder-[#9AAABB] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/25 focus:border-[#1B6CA8] transition text-sm" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-[#1B6CA8] text-white rounded-xl font-bold hover:bg-[#155a90] active:scale-[.98] transition-all shadow-lg shadow-[#1B6CA8]/25 mt-1 flex items-center justify-center gap-2 disabled:opacity-75 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1B6CA8]/40 focus-visible:ring-offset-2">
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#EEF2F7] text-center">
            <button onClick={onPublicJourney}
              className="text-sm text-[#1B6CA8] hover:text-[#155a90] font-semibold hover:underline transition">
              Consultar jornada do paciente →
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-[#9AAABB] mt-5">
          Sistema de Acolhimento Oncológico · v1.0.0
        </p>
      </div>
    </div>
  );
}

// ─── Public Journey Screen ────────────────────────────────────────────────────

function PublicJourneyScreen({ onBack }: { onBack: () => void }) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Patient | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSearch() {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setNotFound(false);

    try {
      // 1. Tenta buscar via API backend no endpoint /pacientes/{id_ou_nome}/jornada
      const data = await api.getPublicJourney(q);
      if (data && data.paciente) {
        // Mapeia etapas retornadas pelo backend
        const mappedSpecs: Specialty[] = data.jornada?.etapas?.length
          ? data.jornada.etapas.map(et => {
            let st: SpecStatus = "pendente";
            if (et.status === "ATENDIDO") st = "atendido";
            else if (et.status === "EM_ATENDIMENTO") st = "em-atendimento";
            else if (et.status === "NAO_SE_APLICA") st = "nao-se-aplica";

            const compTime = et.finalizada_em
              ? new Date(et.finalizada_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
              : undefined;

            return {
              id: et.area_id || et.id,
              name: et.nome,
              status: st,
              completedTime: compTime,
            };
          })
          : [];

        const publicPatient: Patient = {
          id: data.paciente.codigo_publico || data.paciente.id,
          name: data.paciente.nome_completo,
          age: 0,
          cpf: "***.***.***-**",
          phone: "",
          address: "",
          emergencyContact: "",
          diagnosis: "Acompanhamento Oncológico",
          cid: "",
          origin: "Recepção Central",
          status: (!data.jornada ? "aguardando" : data.jornada.status === "FINALIZADO" ? "finalizado" : "em-atendimento") as PatStatus,
          arrivalTime: data.jornada?.data_acolhimento || "Não registrada",
          date: new Date().toLocaleDateString("pt-BR"),
          specialties: mappedSpecs,
        };

        setResult(publicPatient);
        setNotFound(false);
        setLoading(false);
        return;
      }
    } catch {
      // Se não encontrou na API ou backend offline, busca na base local em memória
    }

    const qLower = q.toLowerCase();
    const found = PATIENTS.find(p =>
      p.name.toLowerCase().includes(qLower) ||
      p.id.toLowerCase().includes(qLower) ||
      p.cpf.includes(q)
    );

    if (found) {
      // Clona paciente omitindo dados sensíveis
      const sanitizedPatient: Patient = {
        ...found,
        address: "Protegido por sigilo",
        emergencyContact: "Protegido por sigilo",
        phone: "Protegido por sigilo",
      };
      setResult(sanitizedPatient);
      setNotFound(false);
    } else {
      setResult(null);
      setNotFound(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F4FD] to-[#E8F5F0]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <header className="bg-white border-b border-[rgba(27,108,168,0.1)] px-4 py-4 flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-[#F4F7FB] transition" aria-label="Voltar">
          <ArrowLeft size={20} className="text-[#6B7A8D]" />
        </button>
        <div className="flex items-center gap-2">
          <Heart size={20} className="text-[#1B6CA8]" />
          <span className="font-bold text-[#1A2332]" style={{ fontFamily: "'Nunito', sans-serif" }}>Jornada do Paciente</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#1A2332] mb-2" style={{ fontFamily: "'Nunito', sans-serif" }}>Acompanhe seu acolhimento</h2>
          <p className="text-[#6B7A8D]">Veja abaixo quais etapas do seu acolhimento já foram concluídas.</p>
        </div>

        <div className="flex gap-2 mb-8">
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder="Digite o nome, CPF ou ID do paciente..."
            className="flex-1 px-4 py-3.5 rounded-xl border border-[#D5E6F3] bg-white text-[#1A2332] placeholder-[#9AAABB] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/25 focus:border-[#1B6CA8] transition shadow-sm" />
          <button onClick={handleSearch} disabled={loading}
            className="px-5 py-3.5 bg-[#1B6CA8] text-white rounded-xl font-bold hover:bg-[#155a90] transition shadow-md flex items-center gap-2 disabled:opacity-75">
            <Search size={18} />
            <span className="hidden sm:inline">{loading ? "Buscando..." : "Buscar"}</span>
          </button>
        </div>

        {notFound && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
            <AlertCircle size={32} className="text-amber-500 mx-auto mb-2" />
            <p className="font-semibold text-[#1A2332]">Paciente não encontrado</p>
            <p className="text-sm text-[#6B7A8D] mt-1">Verifique o nome, CPF ou ID informado e tente novamente.</p>
          </div>
        )}

        {!result && !notFound && (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-[#6B7A8D]">Pesquise pelo nome completo, CPF ou ID do paciente.</p>
            <p className="text-sm text-[#9AAABB] mt-1">Exemplo: <span className="font-mono font-medium">CAO-2024-0001</span> ou <span className="font-medium">Maria</span></p>
          </div>
        )}

        {result && (
          <div className="bg-white rounded-2xl shadow-lg border border-[rgba(27,108,168,0.12)] overflow-hidden">
            <div className="bg-gradient-to-r from-[#1B6CA8] to-[#2DB5A3] px-6 py-5">
              <p className="text-blue-100 text-xs font-semibold uppercase tracking-wider mb-0.5">Paciente</p>
              <h3 className="text-white text-xl font-bold" style={{ fontFamily: "'Nunito', sans-serif" }}>{result.name}</h3>
              <p className="text-blue-100 text-sm mt-1">ID: {result.id} · Data: {result.date} · Chegada: {result.arrivalTime}</p>
              <div className="mt-3"><StatusBadge status={result.status} /></div>
            </div>

            <div className="px-6 py-6">
              <p className="text-xs font-bold text-[#6B7A8D] uppercase tracking-widest mb-5">Etapas do acolhimento</p>
              {result.specialties.length === 0 && (
                <p className="text-sm text-[#6B7A8D]">Ainda não há etapas registradas para este acolhimento.</p>
              )}
              <div className="space-y-1">
                {result.specialties.map((sp, i) => (
                  <div key={sp.id} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <SpecIcon status={sp.status} />
                      {i < result.specialties.length - 1 && (
                        <div className={`w-px flex-1 min-h-[12px] mt-1 mb-1 ${sp.status === "atendido" ? "bg-emerald-200" : "bg-gray-100"}`} />
                      )}
                    </div>
                    <div className="flex-1 flex items-center justify-between pt-1 pb-3">
                      <div>
                        <p className={`text-sm font-semibold ${sp.status === "nao-se-aplica" ? "text-gray-400" : "text-[#1A2332]"}`}>{sp.name}</p>
                        {sp.completedTime && <p className="text-xs text-[#6B7A8D]">Concluído às {sp.completedTime}</p>}
                        {sp.status === "em-atendimento" && <p className="text-xs text-blue-600 font-medium">Em andamento agora</p>}
                      </div>
                      <StatusBadge status={sp.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 pb-5 text-center bg-gray-50 border-t border-gray-100 pt-3">
              <p className="text-xs text-[#6B7A8D]">
                <Shield size={12} className="inline mr-1 text-emerald-600" />
                As informações clínicas detalhadas são de uso estritamente restrito à equipe de saúde.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


// ─── Reception Dashboard ──────────────────────────────────────────────────────

type CheckinRecord = { arrived: boolean; arrivedAt?: string; departed: boolean; departedAt?: string };

function ReceptionDashboard({ onNavigate, onOpenPatient, onAddDoc, patients = PATIENTS, onCheckinChange }: {
  onNavigate: (s: Screen) => void;
  onOpenPatient: (p: Patient) => void;
  onAddDoc: (doc: PatientDocument) => void;
  patients?: Patient[];
  onCheckinChange?: (patientId: string, registro: CheckinRecord) => void;
}) {
  const [search, setSearch] = useState("");

  // Usa o registro de chegada/saída salvo no paciente; sem registro, deriva a
  // chegada do status. A saída nunca é deduzida: mesmo com a jornada
  // finalizada, o paciente só sai quando a Recepção registra a saída.
  function deriveCheckin(p: Patient): CheckinRecord {
    if (p.checkin) return p.checkin;
    return p.status !== "aguardando"
      ? { arrived: true, arrivedAt: p.arrivalTime, departed: false }
      : { arrived: false, departed: false };
  }

  const initCheckins = () => {
    const r: Record<string, CheckinRecord> = {};
    patients.forEach(p => { r[p.id] = deriveCheckin(p); });
    return r;
  };

  const [checkins, setCheckins] = useState<Record<string, CheckinRecord>>(initCheckins);

  // A cada atualização de `patients` (polling da API a cada 30s), sincroniza a fila:
  // adiciona pacientes novos e marca a chegada de quem já entrou em atendimento,
  // sem nunca reverter uma marcação manual (chegada/saída) da recepção.
  useEffect(() => {
    setCheckins(prev => {
      let changed = false;
      const next = { ...prev };
      patients.forEach(p => {
        const derived = deriveCheckin(p);
        const atual = next[p.id];
        if (!atual) {
          next[p.id] = derived;
          changed = true;
        } else if (derived.departed && !atual.departed) {
          next[p.id] = derived;
          changed = true;
        } else if (derived.arrived && !atual.arrived) {
          next[p.id] = derived;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [patients]);
  const [showModal, setShowModal] = useState(false);
  const [modalSearch, setModalSearch] = useState("");

  // Upload modal state
  type UploadStep = "upload" | "confirm";
  const [showUpload, setShowUpload] = useState(false);
  const [uploadStep, setUploadStep] = useState<UploadStep>("upload");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPatientId, setUploadPatientId] = useState<string>("");
  const [uploadDragging, setUploadDragging] = useState(false);

  function handleUploadFile(file: File) {
    setUploadFile(file);
  }

  function openUploadModal() {
    setUploadFile(null);
    setUploadPatientId("");
    setUploadStep("upload");
    setShowUpload(true);
  }

  function closeUploadModal() {
    setShowUpload(false);
    setUploadDragging(false);
  }

  function proceedToConfirm() {
    if (!uploadFile || !uploadPatientId) return;
    setUploadStep("confirm");
  }

  function confirmUpload() {
    if (!uploadFile || !uploadPatientId) return;
    onAddDoc({
      id: `doc-${Date.now()}`,
      patientId: uploadPatientId,
      fileName: uploadFile.name,
      fileSize: uploadFile.size,
      uploadedAt: MOCK_NOW,
      uploadedBy: "Recepção",
    });
    setShowUpload(false);
  }

  const uploadSelectedPatient = patients.find(p => p.id === uploadPatientId);

  const horaAtual = () => new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  function registrarCheckin(id: string, registro: CheckinRecord) {
    setCheckins(c => ({ ...c, [id]: registro }));
    onCheckinChange?.(id, registro);
  }

  function confirmArrival(id: string) {
    registrarCheckin(id, { ...checkins[id], departed: checkins[id]?.departed ?? false, arrived: true, arrivedAt: horaAtual() });
  }

  function confirmDeparture(id: string) {
    registrarCheckin(id, { ...checkins[id], arrived: checkins[id]?.arrived ?? true, departed: true, departedAt: horaAtual() });
  }

  function undoArrival(id: string) {
    registrarCheckin(id, { arrived: false, departed: false });
  }

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.id.includes(search)
  );

  const modalPatients = patients.filter(p =>
    p.name.toLowerCase().includes(modalSearch.toLowerCase()) || p.id.includes(modalSearch)
  ).sort((a, b) => {
    const order = { arrived: 0, aguardando: 1, departed: 2 };
    const statusA = checkins[a.id]?.departed ? "departed" : checkins[a.id]?.arrived ? "arrived" : "aguardando";
    const statusB = checkins[b.id]?.departed ? "departed" : checkins[b.id]?.arrived ? "arrived" : "aguardando";
    return (order[statusA as keyof typeof order] ?? 1) - (order[statusB as keyof typeof order] ?? 1);
  });

  const presentCount = Object.values(checkins).filter(c => c.arrived && !c.departed).length;
  const departedCount = Object.values(checkins).filter(c => c.departed).length;
  const pendingCount = Object.values(checkins).filter(c => !c.arrived).length;

  const counts = {
    aguardando: patients.filter(p => p.status === "aguardando").length,
    em: patients.filter(p => p.status === "em-atendimento").length,
    pendente: patients.filter(p => p.status === "pendente").length,
    finalizado: patients.filter(p => p.status === "finalizado").length,
  };


  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-[#1A2332]" style={{ fontFamily: "'Nunito', sans-serif" }}>Pacientes do dia</h2>
          <p className="text-sm text-[#6B7A8D]">03 de julho de 2024 · {PATIENTS.length} acolhimentos</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onNavigate("patient-registration")}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1B6CA8] text-white rounded-xl text-sm font-bold hover:bg-[#155a90] transition shadow-md shadow-[#1B6CA8]/20">
            <Plus size={16} /> Novo Paciente
          </button>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#2DB5A3] text-white rounded-xl text-sm font-bold hover:bg-[#28a090] transition shadow-md shadow-[#2DB5A3]/20 relative">
            <CheckCircle size={16} /> Chegada / Saída
            {pendingCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-400 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Aguardando" value={counts.aguardando} sub="na fila" color="text-sky-600" />
        <StatCard label="Em atendimento" value={counts.em} sub="com profissional" color="text-[#1B6CA8]" />
        <StatCard label="Pendentes" value={counts.pendente} sub="especialidades" color="text-amber-600" />
        <StatCard label="Finalizados" value={counts.finalizado} sub="hoje" color="text-emerald-600" />
      </div>

      {/* Search + upload */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9AAABB]" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome, ID ou data..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D5E6F3] bg-white text-sm text-[#1A2332] placeholder-[#9AAABB] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition" />
        </div>
        <button onClick={openUploadModal}
          className="flex items-center gap-2 px-4 py-2.5 border border-[#D5E6F3] bg-white rounded-xl text-sm text-[#6B7A8D] hover:bg-[#F4F7FB] transition font-medium">
          <Upload size={15} /> Anexar documentos
        </button>
      </div>

      {/* Patient list */}
      <div className="bg-white rounded-2xl border border-[rgba(27,108,168,0.1)] shadow-sm overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#EEF2F7]">
                {["Paciente", "ID", "Diagnóstico", "Chegada", "Presença", "Status", "Ações"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#9AAABB] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F7FB]">
              {filtered.map(p => {
                const ck = checkins[p.id] ?? { arrived: false, departed: false };
                return (
                  <tr key={p.id} className="hover:bg-[#F9FBFE] transition-colors">
                    <td className="px-4 py-3.5 cursor-pointer" onClick={() => onOpenPatient(p)}>
                      <div className="font-semibold text-[#1B6CA8] hover:underline text-sm">{p.name}</div>
                      <div className="text-xs text-[#9AAABB]">{p.age} anos · {p.companion ?? "Sem acompanhante"}</div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-[#1B6CA8] font-semibold">{p.id}</td>
                    <td className="px-4 py-3.5">
                      <div className="text-sm text-[#1A2332] font-medium">{p.diagnosis}</div>
                      <div className="text-xs text-[#9AAABB]">CID: {p.cid}</div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-[#6B7A8D]">{p.arrivalTime}</td>
                    <td className="px-4 py-3.5">
                      {ck.departed ? (
                        <div>
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
                            <LogOut size={10} /> Saiu {ck.departedAt}
                          </span>
                        </div>
                      ) : ck.arrived ? (
                        <div>
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <Check size={10} /> Presente {ck.arrivedAt}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          <Clock size={10} /> Aguardando
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3.5">
                      <button onClick={() => onOpenPatient(p)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E8F4FD] text-[#1B6CA8] text-xs font-bold hover:bg-[#1B6CA8] hover:text-white transition">
                        <Eye size={13} /> Abrir
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-[#F4F7FB]">
          {filtered.map(p => {
            const ck = checkins[p.id] ?? { arrived: false, departed: false };
            return (
              <div key={p.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-[#1A2332] text-sm">{p.name}</p>
                    <p className="text-xs text-[#9AAABB] font-mono">{p.id}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                <p className="text-sm text-[#6B7A8D] mb-2">{p.diagnosis} · CID {p.cid}</p>
                <div className="flex gap-2 mb-3">
                  {ck.departed
                    ? <span className="text-xs text-gray-500 font-semibold bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full flex items-center gap-1"><LogOut size={10} />Saiu {ck.departedAt}</span>
                    : ck.arrived
                      ? <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1"><Check size={10} />Presente {ck.arrivedAt}</span>
                      : <span className="text-xs text-amber-700 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1"><Clock size={10} />Aguardando</span>}
                </div>
                <button onClick={() => onOpenPatient(p)}
                  className="w-full py-2 bg-[#E8F4FD] text-[#1B6CA8] rounded-xl text-sm font-bold hover:bg-[#1B6CA8] hover:text-white transition flex items-center justify-center gap-2">
                  <Eye size={14} /> Abrir ficha
                </button>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-[#9AAABB]">Nenhum paciente encontrado.</div>
        )}
      </div>

      {/* Check-in / Check-out Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[rgba(27,108,168,0.1)] w-full max-w-lg flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#EEF2F7] flex items-start justify-between shrink-0">
              <div>
                <h3 className="font-bold text-[#1A2332] text-lg" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  Registrar Chegada / Saída
                </h3>
                <div className="flex gap-3 mt-1.5 text-xs">
                  <span className="text-emerald-600 font-semibold">{presentCount} presentes</span>
                  <span className="text-gray-400 font-semibold">{departedCount} saíram</span>
                  <span className="text-amber-600 font-semibold">{pendingCount} aguardando</span>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-[#F4F7FB] transition mt-0.5" aria-label="Fechar">
                <X size={18} className="text-[#6B7A8D]" />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 pt-4 pb-2 shrink-0">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AAABB]" />
                <input type="text" value={modalSearch} onChange={e => setModalSearch(e.target.value)}
                  placeholder="Buscar paciente..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] placeholder-[#9AAABB] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition" />
              </div>
            </div>

            {/* Patient list */}
            <div className="overflow-y-auto flex-1 px-4 pb-4">
              <div className="space-y-2 pt-2">
                {modalPatients.map(p => {
                  const ck = checkins[p.id] ?? { arrived: false, departed: false };
                  return (
                    <div key={p.id} className={`rounded-xl border px-4 py-3.5 transition-colors ${ck.departed ? "bg-gray-50 border-gray-200" :
                        ck.arrived ? "bg-emerald-50 border-emerald-200" :
                          "bg-white border-[#D5E6F3]"
                      }`}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-[#1A2332] truncate">{p.name}</p>
                          <p className="text-xs text-[#9AAABB]">{p.id} · Previsto: {p.arrivalTime}</p>
                        </div>

                        {/* Status indicator */}
                        <div className="shrink-0 text-right">
                          {ck.departed ? (
                            <div>
                              <p className="text-xs font-bold text-gray-500">Saiu</p>
                              <p className="text-[10px] text-[#9AAABB]">{ck.departedAt}</p>
                            </div>
                          ) : ck.arrived ? (
                            <div>
                              <p className="text-xs font-bold text-emerald-600">Presente</p>
                              <p className="text-[10px] text-[#9AAABB]">desde {ck.arrivedAt}</p>
                            </div>
                          ) : (
                            <p className="text-xs font-bold text-amber-600">Não confirmado</p>
                          )}
                        </div>

                        {/* Action button */}
                        <div className="shrink-0 flex gap-1.5">
                          {ck.departed ? (
                            <button onClick={() => undoArrival(p.id)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 text-xs font-semibold hover:bg-gray-50 transition">
                              <RotateCcw size={11} /> Desfazer
                            </button>
                          ) : ck.arrived ? (
                            <button onClick={() => confirmDeparture(p.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold hover:bg-gray-200 transition border border-gray-200">
                              <LogOut size={12} /> Registrar saída
                            </button>
                          ) : (
                            <button onClick={() => confirmArrival(p.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2DB5A3] text-white text-xs font-bold hover:bg-[#28a090] transition shadow-sm">
                              <Check size={12} /> Confirmar chegada
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#EEF2F7] shrink-0">
              <button onClick={() => setShowModal(false)}
                className="w-full py-2.5 bg-[#1B6CA8] text-white rounded-xl text-sm font-bold hover:bg-[#155a90] transition">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[rgba(27,108,168,0.1)] w-full max-w-md flex flex-col">

            {uploadStep === "upload" ? (
              <>
                {/* Header */}
                <div className="px-6 py-5 border-b border-[#EEF2F7] flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-[#1A2332] text-lg" style={{ fontFamily: "'Nunito', sans-serif" }}>
                      Anexar documento
                    </h3>
                    <p className="text-xs text-[#9AAABB] mt-0.5">PDF, JPEG, PNG ou DOCX · máx. 20 MB</p>
                  </div>
                  <button onClick={closeUploadModal} className="p-2 rounded-xl hover:bg-[#F4F7FB] transition" aria-label="Fechar">
                    <X size={18} className="text-[#6B7A8D]" />
                  </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4">
                  {/* Drop zone */}
                  <div
                    onDragOver={e => { e.preventDefault(); setUploadDragging(true); }}
                    onDragLeave={() => setUploadDragging(false)}
                    onDrop={e => {
                      e.preventDefault();
                      setUploadDragging(false);
                      const f = e.dataTransfer.files[0];
                      if (f) handleUploadFile(f);
                    }}
                    className={`rounded-2xl border-2 border-dashed transition-colors flex flex-col items-center justify-center gap-3 py-10 cursor-pointer ${uploadDragging
                        ? "border-[#1B6CA8] bg-[#E8F4FD]"
                        : uploadFile
                          ? "border-emerald-400 bg-emerald-50"
                          : "border-[#D5E6F3] bg-[#F9FBFE] hover:border-[#1B6CA8] hover:bg-[#E8F4FD]"
                      }`}
                    onClick={() => {
                      const inp = document.createElement("input");
                      inp.type = "file";
                      inp.accept = ".pdf,.jpg,.jpeg,.png,.docx";
                      inp.onchange = (e) => {
                        const f = (e.target as HTMLInputElement).files?.[0];
                        if (f) handleUploadFile(f);
                      };
                      inp.click();
                    }}
                  >
                    {uploadFile ? (
                      <>
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                          <FileText size={22} className="text-emerald-600" />
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-sm text-[#1A2332]">{uploadFile.name}</p>
                          <p className="text-xs text-[#9AAABB] mt-0.5">{(uploadFile.size / 1024).toFixed(0)} KB · clique para trocar</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-xl bg-[#E8F4FD] flex items-center justify-center">
                          <Upload size={22} className="text-[#1B6CA8]" />
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-sm text-[#1A2332]">Solte o documento aqui</p>
                          <p className="text-xs text-[#9AAABB] mt-1">ou clique para selecionar arquivo</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Patient selector */}
                  <div>
                    <label className="block text-xs font-bold text-[#6B7A8D] uppercase tracking-wider mb-1.5">
                      Atribuir ao paciente
                    </label>
                    <select
                      value={uploadPatientId}
                      onChange={e => setUploadPatientId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5E6F3] bg-white text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition"
                    >
                      <option value="">Selecione um paciente…</option>
                      {PATIENTS.map(p => (
                        <option key={p.id} value={p.id}>{p.name} — {p.id}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-5 flex gap-2">
                  <button onClick={closeUploadModal}
                    className="flex-1 py-2.5 border border-[#D5E6F3] rounded-xl text-sm text-[#6B7A8D] font-semibold hover:bg-[#F4F7FB] transition">
                    Cancelar
                  </button>
                  <button
                    onClick={proceedToConfirm}
                    disabled={!uploadFile || !uploadPatientId}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition ${uploadFile && uploadPatientId
                        ? "bg-[#1B6CA8] text-white hover:bg-[#155a90] shadow-md shadow-[#1B6CA8]/20"
                        : "bg-[#EEF2F7] text-[#9AAABB] cursor-not-allowed"
                      }`}>
                    Continuar
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Confirm step header */}
                <div className="px-6 py-5 border-b border-[#EEF2F7] flex items-center justify-between">
                  <h3 className="font-bold text-[#1A2332] text-lg" style={{ fontFamily: "'Nunito', sans-serif" }}>
                    Confirmar anexo
                  </h3>
                  <button onClick={closeUploadModal} className="p-2 rounded-xl hover:bg-[#F4F7FB] transition" aria-label="Fechar">
                    <X size={18} className="text-[#6B7A8D]" />
                  </button>
                </div>

                {/* Confirm body */}
                <div className="px-6 py-6 space-y-4">
                  <div className="rounded-2xl bg-[#F4F7FB] border border-[#D5E6F3] px-4 py-4 flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#D5E6F3] flex items-center justify-center shrink-0">
                      <Paperclip size={18} className="text-[#1B6CA8]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#9AAABB] uppercase tracking-wider mb-0.5">Documento</p>
                      <p className="font-bold text-sm text-[#1A2332] truncate">{uploadFile?.name}</p>
                      <p className="text-xs text-[#9AAABB]">{uploadFile ? (uploadFile.size / 1024).toFixed(0) : 0} KB</p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#F4F7FB] border border-[#D5E6F3] px-4 py-4 flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#D5E6F3] flex items-center justify-center shrink-0">
                      <User size={18} className="text-[#2DB5A3]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#9AAABB] uppercase tracking-wider mb-0.5">Paciente</p>
                      <p className="font-bold text-sm text-[#1A2332]">{uploadSelectedPatient?.name}</p>
                      <p className="text-xs text-[#9AAABB] font-mono">{uploadSelectedPatient?.id}</p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-[#E8F4FD] border border-[#D5E6F3] px-4 py-3 flex items-center gap-2.5">
                    <AlertCircle size={15} className="text-[#1B6CA8] shrink-0" />
                    <p className="text-xs text-[#1B6CA8] font-medium">
                      O documento poderá ser removido diretamente na ficha do paciente.
                    </p>
                  </div>
                </div>

                {/* Confirm footer */}
                <div className="px-6 pb-5 flex gap-2">
                  <button onClick={() => setUploadStep("upload")}
                    className="flex-1 py-2.5 border border-[#D5E6F3] rounded-xl text-sm text-[#6B7A8D] font-semibold hover:bg-[#F4F7FB] transition flex items-center justify-center gap-1.5">
                    <ArrowLeft size={14} /> Voltar
                  </button>
                  <button onClick={confirmUpload}
                    className="flex-1 py-2.5 bg-[#2DB5A3] text-white rounded-xl text-sm font-bold hover:bg-[#28a090] transition shadow-md shadow-[#2DB5A3]/20 flex items-center justify-center gap-1.5">
                    <Check size={14} /> Confirmar anexo
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Patient Registration ─────────────────────────────────────────────────────

function PatientRegistrationScreen({ onBack, onSaved }: {
  onBack: () => void;
  onSaved: (p: Patient) => void;
}) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generatedId, setGeneratedId] = useState<string>("CAO-2024-0006");

  const [form, setForm] = useState({
    name: "", birth: "", cpf: "", cns: "", phone: "", 
    addressRua: "", addressBairro: "", addressCidadeUF: "", addressCEP: "",
    emergency: "", companion: "", diagnosis: "", cid: "", origin: "",
    maritalStatus: "", religion: "", raceColor: "",
    identidadeGenero: "", identidadeGeneroOutro: "",
  });

  async function handleSave() {
    if (!form.name.trim() || !form.cpf.trim() || !form.birth.trim()) {
      setErrorMsg("Por favor, preencha os campos obrigatórios (*).");
      return;
    }
    setErrorMsg(null);
    setLoading(true);

    let assignedId = `CAO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      // Integração com endpoint POST /pacientes
      const apiRes = await api.createPatient({
        nome_completo: form.name.trim(),
        data_nascimento: form.birth,
        cpf: form.cpf.trim(),
        name: form.name.trim(),
        diagnosis: form.diagnosis.trim() || undefined,
        treatment_stage: "Acolhimento Inicial",
        phone: form.phone.trim(),
        address: form.address.trim(),
        emergency: form.emergency.trim(),
        companion: form.companion.trim(),
        cid: form.cid.trim(),
        origin: form.origin.trim() || "Recepção Central",
        cns: form.cns.trim(),
      });

      if (apiRes && (apiRes.codigo_publico || apiRes.id)) {
        assignedId = apiRes.codigo_publico || apiRes.id;
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.toLowerCase().includes("cpf") || errMsg.toLowerCase().includes("já existe")) {
        setErrorMsg("Já existe um paciente cadastrado com este CPF.");
        setLoading(false);
        return;
      }
      // Se a API estiver offline, mantém o fluxo cadastrando em memória
    }

    const calculatedAge = calcularIdade(form.birth);

    const arrivalTime = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    const newPatient: Patient = {
      id: assignedId,
      name: form.name.trim() || "Novo Paciente",
      age: calculatedAge,
      cpf: form.cpf.trim(),
      cns: form.cns.trim() || undefined,
      phone: form.phone.trim() || "Não informado",
      addressRua: form.addressRua.trim() || undefined,
      addressBairro: form.addressBairro.trim() || undefined,
      addressCidadeUF: form.addressCidadeUF.trim() || undefined,
      addressCEP: form.addressCEP.trim() || undefined,
      address: form.addressRua.trim() || "Não informado", // Fallback for old code
      identidadeGenero: form.identidadeGenero === "Outro" && form.identidadeGeneroOutro.trim() ? form.identidadeGeneroOutro.trim() : (form.identidadeGenero || undefined),
      emergencyContact: form.emergency.trim() || "Não informado",
      companion: form.companion.trim() || undefined,
      diagnosis: form.diagnosis.trim() || "Não informado",
      cid: form.cid.trim() || "Não informado",
      origin: form.origin.trim() || "Recepção Central",
      status: "aguardando",
      arrivalTime,
      date: new Date().toLocaleDateString("pt-BR"),
      maritalStatus: form.maritalStatus || undefined,
      raceColor: form.raceColor || undefined,
      religion: form.religion || undefined,
      // A Recepção fica atendida no próprio cadastro, com o horário real e o
      // perfil de quem cadastrou (e não o nome/horário fixo dos dados de exemplo).
      specialties: mkSpecs(["atendido", "pendente", "pendente", "pendente", "pendente", "pendente", "pendente", "pendente", "pendente", "pendente"])
        .map(s => s.id === "recepcao" ? { ...s, professional: nomeExibicaoPorPerfil("recepcao"), completedTime: arrivalTime } : s),
    };

    setGeneratedId(assignedId);
    setSaved(true);
    setLoading(false);
    onSaved(newPatient);
  }

  const field = (label: string, key: keyof typeof form, type = "text", placeholder = "") => (
    <div>
      <label htmlFor={`cadastro-${key}`} className="block text-sm font-semibold text-[#1A2332] mb-1.5">{label}</label>
      <input id={`cadastro-${key}`} type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-[#1A2332] placeholder-[#9AAABB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition" />
    </div>
  );

  if (saved) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={40} className="text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-[#1A2332] mb-2" style={{ fontFamily: "'Nunito', sans-serif" }}>Cadastro realizado!</h2>
        <p className="text-[#6B7A8D] mb-4">O paciente foi cadastrado e integrado com sucesso ao sistema.</p>
        <div className="bg-[#E8F4FD] rounded-2xl px-6 py-4 mb-6">
          <p className="text-xs font-bold text-[#1B6CA8] uppercase tracking-wider mb-1">ID / Código de Acesso do Paciente</p>
          <p className="text-3xl font-bold text-[#1A2332] font-mono">{generatedId}</p>
        </div>
        <button onClick={onBack}
          className="w-full py-3.5 bg-[#1B6CA8] text-white rounded-xl font-bold hover:bg-[#155a90] transition shadow-md">
          Iniciar Jornada de Acolhimento
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-3">
          <AlertCircle size={20} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Basic data */}
      <div className="bg-white rounded-2xl border border-[rgba(27,108,168,0.1)] shadow-sm p-6">
        <h3 className="font-bold text-[#1A2332] mb-4 flex items-center gap-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
          <User size={16} className="text-[#1B6CA8]" /> Dados pessoais
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field("Nome completo *", "name", "text", "Nome da paciente")}
          {field("Data de nascimento *", "birth", "date")}
          {field("CPF *", "cpf", "text", "000.000.000-00")}
          {field("CNS", "cns", "text", "000 0000 0000 0000")}
          {field("Telefone *", "phone", "tel", "(31) 9 0000-0000")}
          {field("Acompanhante", "companion", "text", "Nome e grau de parentesco")}

          <div className="sm:col-span-2">
            <label htmlFor="cadastro-identidadeGenero" className="block text-sm font-semibold text-[#1A2332] mb-1.5">Gênero / Sexo</label>
            <select id="cadastro-identidadeGenero" value={form.identidadeGenero} onChange={e => setForm(f => ({ ...f, identidadeGenero: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition mb-3">
              <option value="">Selecione...</option>
              {["Mulher cisgênero", "Homem cisgênero", "Mulher transgênero", "Homem transgênero", "Não-binário", "Outro"].map(o => <option key={o}>{o}</option>)}
            </select>
            {form.identidadeGenero === "Outro" && (
              <input type="text" value={form.identidadeGeneroOutro} onChange={e => setForm(f => ({ ...f, identidadeGeneroOutro: e.target.value }))}
                placeholder="Qual?"
                className="w-full px-4 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-[#1A2332] placeholder-[#9AAABB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition" />
            )}
          </div>

          <div>
            <label htmlFor="cadastro-maritalStatus" className="block text-sm font-semibold text-[#1A2332] mb-1.5">Estado civil</label>
            <select id="cadastro-maritalStatus" value={form.maritalStatus} onChange={e => setForm(f => ({ ...f, maritalStatus: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition">
              <option value="">Selecione...</option>
              {["Solteiro(a)", "Casado(a)", "União Estável", "Separado(a)", "Divorciado(a)", "Viúvo(a)"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="cadastro-raceColor" className="block text-sm font-semibold text-[#1A2332] mb-1.5">Cor/raça (autodeclarada)</label>
            <select id="cadastro-raceColor" value={form.raceColor} onChange={e => setForm(f => ({ ...f, raceColor: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition">
              <option value="">Selecione...</option>
              {["Branca", "Preta", "Parda", "Amarela", "Indígena", "Não declarada"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="cadastro-religion" className="block text-sm font-semibold text-[#1A2332] mb-1.5">Religião / espiritualidade</label>
            <select id="cadastro-religion" value={form.religion} onChange={e => setForm(f => ({ ...f, religion: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition">
              <option value="">Selecione...</option>
              {["Católica", "Evangélica", "Espírita", "Umbanda / Candomblé", "Budista", "Judaica", "Islâmica", "Sem religião", "Outra", "Prefere não informar"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="bg-white rounded-2xl border border-[rgba(27,108,168,0.1)] shadow-sm p-6">
        <h3 className="font-bold text-[#1A2332] mb-4 flex items-center gap-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
          <MapPin size={16} className="text-[#1B6CA8]" /> Endereço e contato de emergência
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field("Endereço completo", "address", "text", "Rua, número, bairro, cidade/UF")}
          {field("Contato de emergência *", "emergency", "text", "Nome – (31) 9 0000-0000")}
        </div>
      </div>

      {/* Clinical */}
      <div className="bg-white rounded-2xl border border-[rgba(27,108,168,0.1)] shadow-sm p-6">
        <h3 className="font-bold text-[#1A2332] mb-4 flex items-center gap-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
          <Stethoscope size={16} className="text-[#1B6CA8]" /> Dados clínicos iniciais
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field("Diagnóstico inicial *", "diagnosis", "text", "Ex.: Câncer de Mama")}
          {field("CID *", "cid", "text", "Ex.: C50.9")}
          {field("Unidade de origem", "origin", "text", "Ex.: UBS Central")}
        </div>
      </div>

      <div className="flex gap-3 flex-col sm:flex-row">
        <button onClick={onBack}
          className="flex-1 py-3 border border-[#D5E6F3] bg-white text-[#6B7A8D] rounded-xl font-semibold hover:bg-[#F4F7FB] transition">
          Cancelar
        </button>
        <button onClick={handleSave} disabled={loading}
          className="flex-1 py-3 bg-[#1B6CA8] text-white rounded-xl font-bold hover:bg-[#155a90] transition shadow-md flex items-center justify-center gap-2 disabled:opacity-75">
          <Save size={16} /> {loading ? "Salvando..." : "Salvar e gerar ID"}
        </button>
      </div>
    </div>
  );
}


// ─── Forms List Screen ────────────────────────────────────────────────────────

function FormsListScreen({ onOpenPatient }: { onOpenPatient: (p: Patient) => void }) {
  const [filterSpec, setFilterSpec] = useState("todas");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [search, setSearch] = useState("");

  const specOptions = ["todas", ...SPEC_NAMES];
  const statusOptions = [
    { id: "todos", label: "Todos" },
    { id: "atendido", label: "Concluído" },
    { id: "em-atendimento", label: "Em andamento" },
    { id: "pendente", label: "Pendente" },
    { id: "nao-se-aplica", label: "Não se aplica" },
  ];

  type FormRow = {
    patient: Patient;
    specialty: { id: string; name: string; status: SpecStatus; professional?: string; completedTime?: string };
  };

  const rows: FormRow[] = PATIENTS.flatMap(p =>
    p.specialties.map(s => ({ patient: p, specialty: s }))
  ).filter(({ patient: p, specialty: s }) => {
    const matchSpec = filterSpec === "todas" || s.name === filterSpec;
    const matchStatus = filterStatus === "todos" || s.status === filterStatus;
    const matchSearch = !search.trim() ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.diagnosis.toLowerCase().includes(search.toLowerCase());
    return matchSpec && matchStatus && matchSearch;
  });

  const counts = {
    atendido: rows.filter(r => r.specialty.status === "atendido").length,
    em: rows.filter(r => r.specialty.status === "em-atendimento").length,
    pendente: rows.filter(r => r.specialty.status === "pendente").length,
  };

  return (
    <div className="max-w-5xl space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[#1A2332]" style={{ fontFamily: "'Nunito', sans-serif" }}>Formulários por especialidade</h2>
        <p className="text-sm text-[#6B7A8D]">Visão consolidada de todos os formulários · 03/07/2024</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Concluídos" value={counts.atendido} color="text-emerald-600" />
        <StatCard label="Em andamento" value={counts.em} color="text-[#1B6CA8]" />
        <StatCard label="Pendentes" value={counts.pendente} color="text-amber-600" />
      </div>

      {/* Filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9AAABB]" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome do paciente, ID ou diagnóstico..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D5E6F3] bg-white text-sm text-[#1A2332] placeholder-[#9AAABB] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition" />
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1 bg-white border border-[#D5E6F3] rounded-xl p-1 overflow-x-auto flex-wrap">
            {specOptions.map(s => (
              <button key={s} onClick={() => setFilterSpec(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${filterSpec === s ? "bg-[#1B6CA8] text-white shadow-sm" : "text-[#6B7A8D] hover:text-[#1A2332]"}`}>
                {s === "todas" ? "Todas especialidades" : s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-1 bg-white border border-[#D5E6F3] rounded-xl p-1 w-fit">
          {statusOptions.map(s => (
            <button key={s.id} onClick={() => setFilterStatus(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${filterStatus === s.id ? "bg-[#2DB5A3] text-white shadow-sm" : "text-[#6B7A8D] hover:text-[#1A2332]"}`}>
              {s.label}
            </button>
          ))}
        </div>

        {(filterSpec !== "todas" || filterStatus !== "todos" || search) && (
          <p className="text-xs text-[#6B7A8D] flex items-center gap-1.5">
            <Filter size={12} />
            {rows.length} formulário{rows.length !== 1 ? "s" : ""} encontrado{rows.length !== 1 ? "s" : ""}
            <button onClick={() => { setFilterSpec("todas"); setFilterStatus("todos"); setSearch(""); }}
              className="text-[#1B6CA8] font-semibold hover:underline ml-1">
              Limpar filtros
            </button>
          </p>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[rgba(27,108,168,0.1)] shadow-sm overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#EEF2F7]">
                {["Paciente", "Diagnóstico / CID", "Especialidade", "Responsável", "Horário", "Status", "Ação"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#9AAABB] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F7FB]">
              {rows.map(({ patient: p, specialty: s }) => (
                <tr key={`${p.id}-${s.id}`} className="hover:bg-[#F9FBFE] transition-colors">
                  <td className="px-4 py-3 cursor-pointer" onClick={() => onOpenPatient(p)}>
                    <p className="text-sm font-semibold text-[#1B6CA8] hover:underline">{p.name}</p>
                    <p className="text-xs text-[#9AAABB] font-mono">{p.id}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-[#1A2332]">{p.diagnosis}</p>
                    <p className="text-xs text-[#9AAABB]">CID: {p.cid}</p>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-[#1A2332]">{s.name}</td>
                  <td className="px-4 py-3 text-sm text-[#6B7A8D]">{s.professional ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-[#6B7A8D]">{s.completedTime ?? "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                  <td className="px-4 py-3">
                    <button onClick={() => onOpenPatient(p)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E8F4FD] text-[#1B6CA8] text-xs font-bold hover:bg-[#1B6CA8] hover:text-white transition">
                      <Eye size={13} /> Ver ficha
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="md:hidden divide-y divide-[#F4F7FB]">
          {rows.map(({ patient: p, specialty: s }) => (
            <div key={`${p.id}-${s.id}`} className="p-4">
              <div className="flex items-start justify-between mb-1">
                <button onClick={() => onOpenPatient(p)} className="text-sm font-bold text-[#1B6CA8] hover:underline text-left">{p.name}</button>
                <StatusBadge status={s.status} />
              </div>
              <p className="text-xs text-[#9AAABB] mb-1">{p.id} · {p.diagnosis}</p>
              <p className="text-sm font-semibold text-[#1A2332] mb-1">{s.name}</p>
              {s.professional && <p className="text-xs text-[#6B7A8D]">{s.professional}{s.completedTime ? ` · ${s.completedTime}` : ""}</p>}
            </div>
          ))}
        </div>

        {rows.length === 0 && (
          <div className="py-12 text-center text-[#9AAABB]">Nenhum formulário encontrado com os filtros aplicados.</div>
        )}
      </div>
    </div>
  );
}

// ─── Professional Dashboard ───────────────────────────────────────────────────

function ProfessionalDashboard({ onOpenPatient, patients: patientsProp }: { onOpenPatient: (p: Patient) => void; patients?: Patient[] }) {
  const patients = patientsProp ?? PATIENTS;
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterSpec, setFilterSpec] = useState("todas");
  const [filterCid, setFilterCid] = useState("");

  const filtered = patients.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.id.includes(search);
    const matchStatus = filterStatus === "todos" || p.status === filterStatus;
    const matchSpec = filterSpec === "todas" || p.specialties.some(s => s.name === filterSpec && (s.status === "pendente" || s.status === "em-atendimento"));
    const matchCid = !filterCid.trim() || p.cid.toLowerCase().includes(filterCid.toLowerCase()) || p.diagnosis.toLowerCase().includes(filterCid.toLowerCase());
    return matchSearch && matchStatus && matchSpec && matchCid;
  });

  const counts = {
    aguardando: patients.filter(p => p.status === "aguardando").length,
    em: patients.filter(p => p.status === "em-atendimento").length,
    pendentes: patients.reduce((acc, p) => acc + p.specialties.filter(s => s.status === "pendente").length, 0),
    finalizado: patients.filter(p => p.status === "finalizado").length,
  };

  const statuses = [
    { id: "todos", label: "Todos" },
    { id: "aguardando", label: "Aguardando" },
    { id: "em-atendimento", label: "Em atendimento" },
    { id: "pendente", label: "Pendente" },
    { id: "finalizado", label: "Finalizado" },
  ];

  return (
    <div className="space-y-5 max-w-6xl">
      <div>
        <h2 className="text-xl font-bold text-[#1A2332]" style={{ fontFamily: "'Nunito', sans-serif" }}>Pacientes em acolhimento</h2>
        <p className="text-sm text-[#6B7A8D]">03 de julho de 2024</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Aguardando" value={counts.aguardando} color="text-sky-600" />
        <StatCard label="Em atendimento" value={counts.em} color="text-[#1B6CA8]" />
        <StatCard label="Especialidades pendentes" value={counts.pendentes} color="text-amber-600" />
        <StatCard label="Finalizados" value={counts.finalizado} color="text-emerald-600" />
      </div>

      {/* Filters */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9AAABB]" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome ou ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D5E6F3] bg-white text-sm text-[#1A2332] placeholder-[#9AAABB] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition" />
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AAABB]" />
            <input type="text" value={filterCid} onChange={e => setFilterCid(e.target.value)}
              placeholder="Filtrar por CID ou diagnóstico..."
              className="w-full sm:w-56 pl-9 pr-4 py-2.5 rounded-xl border border-[#D5E6F3] bg-white text-sm text-[#1A2332] placeholder-[#9AAABB] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1 bg-white border border-[#D5E6F3] rounded-xl p-1 overflow-x-auto">
            {statuses.map(s => (
              <button key={s.id} onClick={() => setFilterStatus(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${filterStatus === s.id ? "bg-[#1B6CA8] text-white shadow-sm" : "text-[#6B7A8D] hover:text-[#1A2332]"}`}>
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1 bg-white border border-[#D5E6F3] rounded-xl p-1 overflow-x-auto">
            {["todas", ...SPEC_NAMES.slice(1)].map(sp => (
              <button key={sp} onClick={() => setFilterSpec(sp)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${filterSpec === sp ? "bg-[#2DB5A3] text-white shadow-sm" : "text-[#6B7A8D] hover:text-[#1A2332]"}`}>
                {sp === "todas" ? "Todas especialidades" : sp}
              </button>
            ))}
          </div>
        </div>
        {(filterCid || filterSpec !== "todas" || filterStatus !== "todos") && (
          <div className="flex items-center gap-2 text-xs text-[#6B7A8D]">
            <Filter size={12} />
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
            <button onClick={() => { setFilterCid(""); setFilterSpec("todas"); setFilterStatus("todos"); }}
              className="text-[#1B6CA8] font-semibold hover:underline ml-1">
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[rgba(27,108,168,0.1)] shadow-sm overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#EEF2F7]">
                {["Paciente", "ID", "Diagnóstico / CID", "Tempo total", "Concluídas", "Pendentes", "Status", "Ação"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#9AAABB] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F7FB]">
              {filtered.map(p => {
                const done = p.specialties.filter(s => s.status === "atendido").length;
                const pend = p.specialties.filter(s => s.status === "pendente").length;
                const elapsed = calcElapsed(p.arrivalTime, p);
                return (
                  <tr key={p.id} className="hover:bg-[#F9FBFE] transition-colors">
                    <td className="px-4 py-3.5 cursor-pointer" onClick={() => onOpenPatient(p)}>
                      <div className="font-semibold text-sm text-[#1B6CA8] hover:underline">{p.name}</div>
                      <div className="text-xs text-[#9AAABB]">{p.age} anos</div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-[#1B6CA8] font-semibold">{p.id}</td>
                    <td className="px-4 py-3.5">
                      <div className="text-sm font-medium text-[#1A2332]">{p.diagnosis}</div>
                      <div className="text-xs text-[#9AAABB]">CID: {p.cid}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className={`text-sm font-bold ${elapsed.color}`}>{elapsed.label}</div>
                      <div className="text-xs text-[#9AAABB]">desde {p.arrivalTime}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-bold text-emerald-600">{done}</span>
                      <span className="text-xs text-[#9AAABB]"> de {p.specialties.length}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      {pend > 0
                        ? <span className="text-sm font-bold text-amber-600">{pend}</span>
                        : <span className="text-sm text-emerald-600 font-bold">–</span>}
                    </td>
                    <td className="px-4 py-3.5"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3.5">
                      <button onClick={() => onOpenPatient(p)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E8F4FD] text-[#1B6CA8] text-xs font-bold hover:bg-[#1B6CA8] hover:text-white transition">
                        <Eye size={13} /> Abrir jornada
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="md:hidden divide-y divide-[#F4F7FB]">
          {filtered.map(p => {
            const done = p.specialties.filter(s => s.status === "atendido").length;
            const pend = p.specialties.filter(s => s.status === "pendente").length;
            const elapsed = calcElapsed(p.arrivalTime, p);
            return (
              <div key={p.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-[#1A2332] text-sm">{p.name}</p>
                    <p className="text-xs text-[#9AAABB] font-mono">{p.id}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                <p className="text-sm text-[#6B7A8D] mb-2">{p.diagnosis} · CID {p.cid}</p>
                <div className="flex gap-3 text-xs mb-3 flex-wrap">
                  <span className={`font-bold ${elapsed.color}`}><Clock size={11} className="inline mr-0.5" />{elapsed.label}</span>
                  <span className="text-emerald-600 font-bold">{done} concluídas</span>
                  {pend > 0 && <span className="text-amber-600 font-bold">{pend} pendentes</span>}
                </div>
                <button onClick={() => onOpenPatient(p)}
                  className="w-full py-2 bg-[#E8F4FD] text-[#1B6CA8] rounded-xl text-sm font-bold hover:bg-[#1B6CA8] hover:text-white transition">
                  Abrir jornada
                </button>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-[#9AAABB]">Nenhum paciente encontrado.</div>
        )}
      </div>
    </div>
  );
}

// ─── Patient Record ───────────────────────────────────────────────────────────

function AnswerCard({ answers, specId, role, professional, completedTime, onEdit, onExport }: {
  answers: Record<string, any>;
  specId: string;
  specName: string;
  role: Role | null;
  professional?: string;
  completedTime?: string;
  onEdit: () => void;
  onExport: () => void;
}) {
  const temAcessoConfidencial = podeVerConfidencial(role);
  const detalhes = buildDetalhesEspecialidade(specId, answers, temAcessoConfidencial);
  const resumoNutricao = specId === "nutricao" ? buildResumoNutricao(answers) : null;
  const resumoPsicologia = specId === "psicologia" && temAcessoConfidencial ? buildResumoPsicologia(answers) : null;
  const horario = answers["_updatedAt"];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm text-emerald-700 font-medium flex-1">
          <CheckCircle size={15} />
          Concluído por <span className="font-bold">{professional}</span>{(horario || completedTime) ? ` às ${horario || completedTime}` : ""}
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#D5E6F3] bg-white text-[#1B6CA8] text-xs font-bold hover:bg-[#E8F4FD] transition">
            <Pencil size={13} /> Editar
          </button>
          <button onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#D5E6F3] bg-white text-[#6B7A8D] text-xs font-bold hover:bg-[#F4F7FB] transition">
            <Download size={13} /> Exportar
          </button>
        </div>
      </div>

      {resumoNutricao && (
        <div className="bg-[#F2FAF9] border border-[#D3EFEA] rounded-xl p-3 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-bold text-[#1A2332]">IMC</span>
            <span className="font-bold text-[#1B6CA8]">{resumoNutricao.imc}{resumoNutricao.imc !== "—" ? " kg/m²" : ""} <span className="text-[10px] font-normal text-[#8A9EB9]">({resumoNutricao.imcFormula})</span></span>
          </div>
          {resumoNutricao.asgPreenchido && resumoNutricao.asgTotal !== null && resumoNutricao.asgTriage ? (
            <>
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-[#1A2332]">ASG-PPP</span>
                <span className="font-bold text-[#1B6CA8]">{resumoNutricao.asgTotal} pontos</span>
              </div>
              <p className="text-xs text-[#3A4354]">{resumoNutricao.asgTriage.text}</p>
            </>
          ) : (
            <div className="flex justify-between items-center text-xs text-[#8A9EB9]">
              <span>ASG-PPP</span>
              <span className="italic">Não preenchido</span>
            </div>
          )}
        </div>
      )}
      {resumoPsicologia && (
        <div className="bg-[#F2FAF9] border border-[#D3EFEA] rounded-xl p-3 space-y-1">
          <div className="flex justify-between items-center text-sm">
            <span className="font-bold text-[#1A2332]">IRPO — Índice Global de Risco</span>
            <span className="font-bold text-[#1B6CA8]">{resumoPsicologia.irpoTotal} pontos ({resumoPsicologia.respondidas}/27 questões)</span>
          </div>
          {resumoPsicologia.irpoRisk && (
            <p className="text-xs text-[#3A4354]">{resumoPsicologia.irpoRisk.level} — {resumoPsicologia.irpoRisk.indication}</p>
          )}
        </div>
      )}

      {detalhes.length === 0 ? (
        <p className="text-sm text-gray-500 italic px-1">Sem registros detalhados.</p>
      ) : (
        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-0 bg-[#F9FBFE] rounded-xl border border-[#EEF2F7] overflow-hidden">
          {detalhes.map((d, i) => (
            <div key={d.campo} className={`px-4 py-3 border-b border-[#EEF2F7] ${i % 2 === 1 ? "sm:border-l" : ""}`}>
              <dt className="text-[10px] font-bold text-[#9AAABB] uppercase tracking-wider mb-0.5">{d.label}</dt>
              <dd className="text-sm font-semibold text-[#1A2332]">{d.valor}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

function PatientRecordScreen({ patient, onOpenSpecialty, onConsolidated, docs, onDeleteDoc, role, onAcknowledgeAlert, onResolvePendency, equipeUsuario, onPdfExported, onSetAplicavel }: {
  patient: Patient;
  onOpenSpecialty: (specId: string, mode: "edit" | "fill") => void;
  onConsolidated: () => void;
  docs: PatientDocument[];
  onDeleteDoc: (id: string) => void;
  role: Role | null;
  onAcknowledgeAlert: (alertId: string) => void;
  onResolvePendency: (alertId: string) => void;
  equipeUsuario: string | null;
  onPdfExported: (registro: PdfExportRecord) => void;
  onSetAplicavel: (specId: string, aplicavel: boolean) => void;
}) {
  const [activeTab, setActiveTab] = useState("resumo");
  const [exportMsg, setExportMsg] = useState("");
  const visibleAlerts = filterAlertsForRole(patient.alerts || [], role);

  // Password-protected delete state
  const [deleteTarget, setDeleteTarget] = useState<PatientDocument | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const DELETE_PIN = "1234";

  function submitDelete() {
    if (deletePassword === DELETE_PIN) {
      onDeleteDoc(deleteTarget!.id);
      setDeleteTarget(null);
      setDeletePassword("");
      setDeleteError("");
    } else {
      setDeleteError("Senha incorreta. Tente novamente.");
    }
  }

  const tabs = [
    { id: "resumo", label: "Resumo" },
    ...patient.specialties.map(s => ({ id: s.id, label: s.name })),
    { id: "documentos", label: `Documentos${docs.length > 0 ? ` (${docs.length})` : ""}` },
  ];
  const activeSpec = patient.specialties.find(s => s.id === activeTab);

  const [exportError, setExportError] = useState("");
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportModalTipo, setExportModalTipo] = useState<"completo" | "especialidade">("completo");
  const [exportModalSpecId, setExportModalSpecId] = useState<string | undefined>(undefined);

  function handleAbrirExportacao(tipo: "completo" | "especialidade" = "completo", specId?: string) {
    setExportModalTipo(tipo);
    setExportModalSpecId(specId);
    setExportModalOpen(true);
  }

  async function handleExecutarExportacao(opcoes: {
    tipo: "completo" | "especialidade";
    especialidadeId?: string;
    especialidadeNome?: string;
    formato: "pdf" | "docx";
    nomeArquivo: string;
  }) {
    setExportError("");
    setExportMsg(`Gerando ${opcoes.formato.toUpperCase()}...`);
    const temAcessoConfidencial = podeVerConfidencial(role);
    const agora = new Date();
    const pad2 = (n: number) => String(n).padStart(2, "0");
    const geradoEm = `${pad2(agora.getDate())}/${pad2(agora.getMonth() + 1)}/${agora.getFullYear()} às ${pad2(agora.getHours())}:${pad2(agora.getMinutes())}`;
    const infosCompartilhadas = buildInformacoesCompartilhadas(patient.formAnswers, patient.specialties);
    const versao = proximaVersaoPdf(patient);
    const exportadoPor = currentUser?.name || nomeExibicaoPorPerfil(role);

    const specsParaExportar =
      opcoes.tipo === "especialidade" && opcoes.especialidadeId
        ? patient.specialties.filter(s => s.id === opcoes.especialidadeId)
        : patient.specialties;

    const especialidadesExportadas = buildEspecialidadesPdf(specsParaExportar, patient.formAnswers, patient.date, temAcessoConfidencial);

    const exportProps = {
      patient: { id: patient.id, name: patient.name, age: patient.age, diagnosis: patient.diagnosis, cid: patient.cid, date: patient.date, arrivalTime: patient.arrivalTime },
      geradoEm,
      versao,
      exportadoPor,
      dadosCompartilhados: infosCompartilhadas.filter(i => !i.divergente),
      divergencias: infosCompartilhadas.filter(i => i.divergente),
      especialidades: especialidadesExportadas,
      tipo: opcoes.tipo,
      especialidadeNome: opcoes.especialidadeNome,
      nomeArquivo: opcoes.nomeArquivo,
    };

    try {
      if (opcoes.formato === "pdf") {
        const { exportarFichaConsolidadaPdf } = await import("./pdf/exportFichaConsolidadaPdf");
        const resultado = await exportarFichaConsolidadaPdf(exportProps);
        if (resultado.ok) {
          onPdfExported({ versao, geradoEm, exportadoPor });
          setExportMsg(`Documento exportado em PDF (${resultado.nomeArquivo || opcoes.nomeArquivo}).`);
        } else {
          setExportMsg("");
          setExportError(resultado.erro);
        }
      } else {
        const { exportarDocumentoDocx } = await import("./export/exportDocumentoDocx");
        const resultado = await exportarDocumentoDocx(exportProps);
        if (resultado.ok) {
          onPdfExported({ versao, geradoEm, exportadoPor });
          setExportMsg(`Documento exportado em Word DOCX (${resultado.nomeArquivo || opcoes.nomeArquivo}).`);
        } else {
          setExportMsg("");
          setExportError(resultado.erro);
        }
      }
    } catch (erro) {
      console.error("Falha ao exportar documento:", erro);
      setExportMsg("");
      setExportError("Não foi possível gerar o documento agora. Tente novamente em instantes.");
    }
    setTimeout(() => { setExportMsg(""); setExportError(""); }, 3500);
  }

  return (
    <div className="max-w-5xl space-y-4">
      {exportMsg && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#1B6CA8] text-white px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2">
          <Download size={15} /> {exportMsg}
        </div>
      )}
      {exportError && (
        <div className="fixed bottom-4 right-4 z-50 bg-red-600 text-white px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 max-w-xs">
          <AlertTriangle size={15} className="shrink-0" /> {exportError}
        </div>
      )}

      {/* Patient header */}
      <div className="bg-gradient-to-r from-[#1B6CA8] to-[#2287c5] rounded-2xl shadow-md p-5 text-white">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">{patient.id}</p>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold" style={{ fontFamily: "'Nunito', sans-serif" }}>{patient.name}</h2>
              <Level3Chips alerts={visibleAlerts} />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-blue-100">
              <span>{patient.age} anos</span>
              <span>{patient.diagnosis}</span>
              <span className="font-mono font-semibold bg-white/10 px-1.5 rounded">CID {patient.cid}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <StatusBadge status={patient.status} />
            <div className="flex gap-2">
              <button onClick={onConsolidated}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/15 text-white rounded-xl text-xs font-bold hover:bg-white/25 transition">
                <FileText size={13} /> Ficha consolidada
              </button>
              <button onClick={() => handleAbrirExportacao("completo")}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/15 text-white rounded-xl text-xs font-bold hover:bg-white/25 transition">
                <Download size={13} /> Exportar
              </button>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div><p className="text-blue-200">Chegada</p><p className="font-semibold">{patient.arrivalTime}</p></div>
          <div><p className="text-blue-200">Data</p><p className="font-semibold">{patient.date}</p></div>
          <div><p className="text-blue-200">Origem</p><p className="font-semibold">{patient.origin}</p></div>
          <div><p className="text-blue-200">Acompanhante</p><p className="font-semibold">{patient.companion ?? "Não"}</p></div>
        </div>
      </div>

      <Level2Banner alerts={visibleAlerts} onAcknowledge={onAcknowledgeAlert} />
      {/* [CONFIRMAR COM A EQUIPE] Só o perfil Profissional vê o botão de resolver pendência. */}
      <PendencyList alerts={visibleAlerts} onResolve={role === "profissional" ? onResolvePendency : undefined} equipeUsuario={equipeUsuario} />

      {/* Timeline */}
      <div className="bg-white rounded-2xl border border-[rgba(27,108,168,0.1)] shadow-sm p-4">
        <p className="text-xs font-bold text-[#9AAABB] uppercase tracking-widest mb-3">Linha do tempo</p>
        <div className="flex gap-0.5 overflow-x-auto pb-1">
          {patient.specialties.map((sp, i) => (
            <div key={sp.id} className="flex items-center gap-0.5">
              <button
                onClick={() => setActiveTab(sp.id)}
                className="flex flex-col items-center gap-1 min-w-[64px] group"
              >
                <SpecIcon status={sp.status} />
                <span className="text-[10px] text-[#6B7A8D] text-center leading-tight font-medium group-hover:text-[#1B6CA8] transition-colors">{sp.name}</span>
                {sp.completedTime && <span className="text-[9px] text-[#9AAABB]">{sp.completedTime}</span>}
              </button>
              {i < patient.specialties.length - 1 && (
                <div className={`w-6 h-px mb-5 ${sp.status === "atendido" ? "bg-emerald-300" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-[rgba(27,108,168,0.1)] shadow-sm overflow-hidden">
        <div className="flex border-b border-[#EEF2F7] overflow-x-auto">
          {tabs.map(t => {
            const sp = patient.specialties.find(s => s.id === t.id);
            const dot = sp ? {
              atendido: "bg-emerald-500",
              "em-atendimento": "bg-blue-500",
              pendente: "bg-amber-400",
              "nao-se-aplica": "bg-gray-300",
            }[sp.status] : "";
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === t.id ? "border-[#1B6CA8] text-[#1B6CA8] bg-[#F9FBFE]" : "border-transparent text-[#6B7A8D] hover:text-[#1A2332]"}`}>
                {dot && <span className={`w-1.5 h-1.5 rounded-full ${dot} shrink-0`} />}
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="p-5">
          {activeTab === "resumo" ? (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold text-[#1A2332] mb-3 text-sm">Dados do paciente</h4>
                  <dl className="space-y-2">
                    {[
                      ["CPF", patient.cpf || "—"],
                      ["CNS", patient.cns ?? "—"],
                      ["Telefone", patient.phone || "—"],
                      ["Estado civil", patient.maritalStatus ?? "—"],
                      ["Cor/raça", patient.raceColor ?? "—"],
                      ["Religião", patient.religion ?? "—"],
                      ["Endereço", patient.address || "—"],
                      ["Emergência", patient.emergencyContact || "—"],
                      ["Origem", patient.origin || "—"],
                      ["Data de acolhimento", patient.date ? `${patient.date}${patient.arrivalTime ? ` às ${patient.arrivalTime}` : ""}` : "—"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex gap-2 text-sm">
                        <dt className="text-[#9AAABB] font-medium min-w-[90px] shrink-0">{k}</dt>
                        <dd className="text-[#1A2332] font-medium">{v || "—"}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <div>
                  <h4 className="font-bold text-[#1A2332] mb-3 text-sm">Status por especialidade</h4>
                  <div className="space-y-1.5">
                    {patient.specialties.map(sp => (
                      <button key={sp.id} onClick={() => setActiveTab(sp.id)}
                        className="w-full flex items-center justify-between py-2 px-3 rounded-xl hover:bg-[#F4F7FB] transition-colors border border-transparent hover:border-[#EEF2F7]">
                        <span className="text-sm font-medium text-[#1A2332]">{sp.name}</span>
                        <StatusBadge status={sp.status} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Informações Compartilhadas */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-[#2DB5A3]" />
                  <h4 className="font-bold text-[#1A2332] text-sm" style={{ fontFamily: "'Nunito', sans-serif" }}>Informações Compartilhadas</h4>
                  <span className="text-[10px] text-[#2DB5A3] font-bold bg-[#F0FBF9] px-2 py-0.5 rounded-full border border-[#2DB5A3]/20">Histórico unificado</span>
                </div>
                {(() => {
                  const infos = buildInformacoesCompartilhadas(patient.formAnswers, patient.specialties);
                  if (infos.length === 0) {
                    return <p className="text-sm text-gray-500">Nenhuma especialidade preencheu dados compartilhados ainda.</p>;
                  }
                  return (
                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
                      {infos.map(info => (
                        <div key={info.campo} className={`border rounded-xl p-3 flex flex-col justify-between h-full ${info.divergente ? "bg-amber-50/50 border-amber-300/50" : "bg-[#F0FBF9] border-[#2DB5A3]/30"}`}>
                          <div>
                            <div className="flex items-start justify-between gap-1 mb-0.5">
                              <p className={`text-xs font-bold ${info.divergente ? "text-amber-700" : "text-[#6B7A8D]"}`}>{info.label}</p>
                              {info.divergente && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded flex items-center gap-0.5 font-bold" title="Dados divergentes registrados por outras especialidades"><AlertCircle size={10} /> divergência</span>}
                            </div>
                            {info.divergente ? (
                              <div className="space-y-1.5 mt-2">
                                <p className="text-xs text-amber-900 leading-tight">
                                  <span className="font-bold">Origem:</span> {info.valor} <span className="opacity-75">({info.origem})</span>
                                </p>
                                {info.outrasRespostas.map((d, idx) => (
                                  <p key={idx} className="text-xs text-amber-900 leading-tight">
                                    <span className="font-bold">Divergência:</span> {d.valor} <span className="opacity-75">({d.especialidades.join(", ")})</span>
                                  </p>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm font-semibold mb-2 mt-1 leading-tight text-[#1A2332]">{info.valor}</p>
                            )}
                          </div>
                          {!info.divergente && <span className="text-[10px] font-semibold mt-auto text-[#2DB5A3]">↩ {info.origem}</span>}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          ) : activeTab === "documentos" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-[#1A2332] text-sm" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  Documentos anexados
                </h4>
                <span className="text-xs text-[#9AAABB]">{docs.length} arquivo{docs.length !== 1 ? "s" : ""}</span>
              </div>

              {docs.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#EEF2F7] flex items-center justify-center">
                    <Paperclip size={20} className="text-[#9AAABB]" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[#6B7A8D]">Nenhum documento anexado</p>
                    <p className="text-xs text-[#9AAABB] mt-0.5">Anexe documentos pela recepção usando o botão "Anexar documentos".</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {docs.map(doc => (
                    <div key={doc.id} className="flex items-center gap-3 px-4 py-3.5 bg-[#F9FBFE] border border-[#D5E6F3] rounded-xl hover:border-[#1B6CA8]/30 transition">
                      <div className="w-9 h-9 rounded-xl bg-[#E8F4FD] flex items-center justify-center shrink-0">
                        <FileText size={16} className="text-[#1B6CA8]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[#1A2332] truncate">{doc.fileName}</p>
                        <p className="text-xs text-[#9AAABB]">
                          {(doc.fileSize / 1024).toFixed(0)} KB · anexado às {doc.uploadedAt} por {doc.uploadedBy}
                        </p>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button className="p-1.5 rounded-lg hover:bg-[#E8F4FD] transition text-[#1B6CA8]" title="Baixar">
                          <Download size={14} />
                        </button>
                        <button
                          onClick={() => { setDeleteTarget(doc); setDeletePassword(""); setDeleteError(""); }}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition text-[#9AAABB] hover:text-red-500"
                          title="Remover">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeSpec ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-bold text-[#1A2332]" style={{ fontFamily: "'Nunito', sans-serif" }}>{activeSpec.name}</h4>
                  {activeSpec.professional && <p className="text-sm text-[#6B7A8D]">{activeSpec.professional}{activeSpec.completedTime ? ` · ${activeSpec.completedTime}` : ""}</p>}
                </div>
                <StatusBadge status={activeSpec.status} />
              </div>

              {activeSpec.status === "atendido" ? (() => {
                const answers = patient.formAnswers?.[activeSpec.id] ?? MOCK_FORM_ANSWERS[activeSpec.id];
                return (
                  <AnswerCard
                    answers={answers ?? {}}
                    specId={activeSpec.id}
                    specName={activeSpec.name}
                    role={role}
                    professional={activeSpec.professional}
                    completedTime={activeSpec.completedTime}
                    onEdit={() => onOpenSpecialty(activeSpec.id, "edit")}
                    onExport={() => handleAbrirExportacao("especialidade", activeSpec.id)}
                  />
                );
              })() : activeSpec.status === "nao-se-aplica" ? (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-500 text-center space-y-3">
                  <p>Esta especialidade foi marcada como não aplicável a este paciente.</p>
                  <BotaoAplicabilidade specName={activeSpec.name} aplicavel onConfirm={() => onSetAplicavel(activeSpec.id, true)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-[#D5E6F3] bg-white rounded-xl text-sm text-[#1B6CA8] hover:bg-[#F4F7FB] transition font-semibold">
                    <RotateCcw size={15} /> Tornar aplicável novamente
                  </BotaoAplicabilidade>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2">
                  <button onClick={() => onOpenSpecialty(activeSpec.id, "fill")}
                    className="flex-1 py-3 bg-[#1B6CA8] text-white rounded-xl font-bold hover:bg-[#155a90] transition shadow-md flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1B6CA8]/40 focus-visible:ring-offset-2">
                    <Clipboard size={16} /> {activeSpec.status === "em-atendimento" ? "Continuar formulário" : "Preencher formulário"}
                  </button>
                  <BotaoAplicabilidade specName={activeSpec.name} aplicavel={false} onConfirm={() => onSetAplicavel(activeSpec.id, false)}
                    className="flex items-center justify-center gap-2 px-4 py-3 border border-[#D5E6F3] rounded-xl text-sm text-[#6B7A8D] hover:bg-[#F4F7FB] transition font-medium">
                    <X size={15} /> Não se aplica
                  </BotaoAplicabilidade>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Delete document password modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[rgba(27,108,168,0.1)] w-full max-w-sm">
            <div className="px-6 py-5 border-b border-[#EEF2F7] flex items-center justify-between">
              <h3 className="font-bold text-[#1A2332]" style={{ fontFamily: "'Nunito', sans-serif" }}>
                Confirmar remoção
              </h3>
              <button onClick={() => setDeleteTarget(null)} className="p-2 rounded-xl hover:bg-[#F4F7FB] transition" aria-label="Fechar">
                <X size={16} className="text-[#6B7A8D]" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="flex gap-3 items-start bg-[#F9FBFE] border border-[#D5E6F3] rounded-xl px-4 py-3">
                <FileText size={15} className="text-[#1B6CA8] mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1A2332] truncate">{deleteTarget.fileName}</p>
                  <p className="text-xs text-[#9AAABB]">Será removido da ficha de {patient.name}</p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6B7A8D] uppercase tracking-wider mb-1.5">
                  Senha de autorização
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={e => { setDeletePassword(e.target.value); setDeleteError(""); }}
                  onKeyDown={e => e.key === "Enter" && submitDelete()}
                  placeholder="Digite a senha"
                  autoFocus
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#1A2332] focus:outline-none focus:ring-2 transition ${deleteError
                      ? "border-red-400 bg-red-50 focus:ring-red-200"
                      : "border-[#D5E6F3] bg-white focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8]"
                    }`}
                />
                {deleteError && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle size={12} /> {deleteError}
                  </p>
                )}
              </div>
            </div>
            <div className="px-6 pb-5 flex gap-2">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 border border-[#D5E6F3] rounded-xl text-sm text-[#6B7A8D] font-semibold hover:bg-[#F4F7FB] transition">
                Cancelar
              </button>
              <button onClick={submitDelete}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition shadow-md shadow-red-500/20 flex items-center justify-center gap-1.5">
                <Trash2 size={13} /> Remover
              </button>
            </div>
          </div>
        </div>
      )}

      <ExportDocumentModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        patient={patient}
        initialTipo={exportModalTipo}
        initialSpecId={exportModalSpecId}
        onExport={handleExecutarExportacao}
      />
    </div>
  );
}

type PdfExportRecord = { versao: number; geradoEm: string; exportadoPor: string };

/** Botão "Não se aplica" / "Tornar aplicável novamente" da ficha, sempre com confirmação. */
function BotaoAplicabilidade({ specName, aplicavel, onConfirm, className, children }: {
  specName: string;
  /** true = vai tornar aplicável de novo; false = vai marcar como não se aplica. */
  aplicavel: boolean;
  onConfirm: () => void;
  className: string;
  children: React.ReactNode;
}) {
  const [aberto, setAberto] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setAberto(true)} className={className}>{children}</button>
      <AlertDialog open={aberto} onOpenChange={setAberto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{aplicavel ? `Tornar ${specName} aplicável novamente?` : `Marcar ${specName} como "não se aplica"?`}</AlertDialogTitle>
            <AlertDialogDescription>
              {aplicavel
                ? `${specName} volta a ficar pendente para este paciente. As respostas já registradas continuam guardadas.`
                : `${specName} deixa de contar para a finalização da jornada. Para desfazer, clique em "Tornar aplicável novamente".`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm}>{aplicavel ? "Tornar aplicável" : "Marcar como não se aplica"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/** Número da próxima exportação em PDF deste paciente (1 na primeira). */
function proximaVersaoPdf(patient: Patient): number {
  return (patient.pdfExports?.length ?? 0) + 1;
}

// ─── Specialty Form ───────────────────────────────────────────────────────────

function SpecialtyFormScreen({ patient, specId, mode, onBack, onSave }: {
  patient: Patient;
  specId: string;
  mode: "fill" | "edit";
  onBack: () => void;
  onSave: (specId: string, answers: Record<string, string>, status: SpecStatus) => void;
}) {
  const spec = patient.specialties.find(s => s.id === specId);
  const storedDraftMeta = loadFormDraftWithMeta(patient.id, specId);
  const [draftBannerVisible, setDraftBannerVisible] = useState(Boolean(storedDraftMeta));
  const [obs, setObs] = useState(storedDraftMeta?.answers?.["Observações"] ?? patient.formAnswers?.[specId]?.["Observações"] ?? "");
  const inheritedData: Record<string, string> = {};
  const origins: Record<string, string> = {};

  // Origin tracking with timestamps to ensure newest wins
  const inheritanceTimestamps: Record<string, string> = {};
  
  function applyInheritance(key: string, value: any, origin: string, timestampStr: string) {
    if (value === null || value === undefined) return;
    const strVal = typeof value === "string" 
      ? value 
      : Array.isArray(value) 
        ? value.join(", ") 
        : String(value);

    if (strVal && strVal.trim() !== "" && strVal !== "—") {
      if (!inheritanceTimestamps[key] || timestampStr >= inheritanceTimestamps[key]) {
        inheritedData[key] = strVal;
        origins[key] = origin;
        inheritanceTimestamps[key] = timestampStr;
      }
    }
  }

  // 1. Dados cadastrais
  const baseTime = "0000-00-00T00:00:00.000Z"; 
  if (patient.phone) {
    applyInheritance("Telefone", patient.phone, "Cadastro", baseTime);
    applyInheritance("Telefones de contato", patient.phone, "Cadastro", baseTime);
  }
  if (patient.addressRua) {
    applyInheritance("Endereço Rua", patient.addressRua, "Cadastro", baseTime);
    applyInheritance("Endereço", patient.addressRua, "Cadastro", baseTime); // fallback
  } else if (patient.address) {
    applyInheritance("Endereço Rua", patient.address, "Cadastro", baseTime);
    applyInheritance("Endereço", patient.address, "Cadastro", baseTime);
  }
  if (patient.addressBairro) applyInheritance("Bairro", patient.addressBairro, "Cadastro", baseTime);
  if (patient.addressCidadeUF) applyInheritance("Cidade - UF", patient.addressCidadeUF, "Cadastro", baseTime);
  if (patient.addressCEP) applyInheritance("CEP", patient.addressCEP, "Cadastro", baseTime);
  
  if (patient.maritalStatus) applyInheritance("Estado civil", patient.maritalStatus, "Cadastro", baseTime);
  if (patient.raceColor) {
    applyInheritance("corRaca", patient.raceColor, "Cadastro", baseTime);
    applyInheritance("Cor/raça (autodeclarada)", patient.raceColor, "Cadastro", baseTime);
  }
  if (patient.religion) applyInheritance("Religião", patient.religion, "Cadastro", baseTime);
  if (patient.companion) {
    applyInheritance("Acompanhante", patient.companion, "Cadastro", baseTime);
    applyInheritance("acompanhanteNome", patient.companion, "Cadastro", baseTime);
  }
  if (patient.identidadeGenero) {
    applyInheritance("Gênero", patient.identidadeGenero, "Cadastro", baseTime);
    applyInheritance("Sexo", patient.identidadeGenero, "Cadastro", baseTime);
  }
  if (patient.birth) applyInheritance("Data de Nascimento", patient.birth, "Cadastro", baseTime);
  if (patient.diagnosis && patient.cid) applyInheritance("topografiaCid", `${patient.diagnosis} - CID ${patient.cid}`, "Cadastro", baseTime);
  if (patient.diagnosis) {
    const diagStr = patient.cid ? `${patient.diagnosis} (CID: ${patient.cid})` : patient.diagnosis;
    applyInheritance("Diagnóstico Oncológico e Localização do Tumor (CID)", diagStr, "Cadastro", baseTime);
  }

  if (patient.weight) {
    const pLimpo = String(patient.weight).replace(" kg", "").trim();
    applyInheritance("peso", pLimpo, "Triagem inicial", "0000-00-00T00:00:01.000Z");
    applyInheritance("pesoPonderal", pLimpo, "Triagem inicial", "0000-00-00T00:00:01.000Z");
  }
  if (patient.height) {
    const aLimpo = String(patient.height).replace(" m", "").trim();
    applyInheritance("altura", aLimpo, "Triagem inicial", "0000-00-00T00:00:01.000Z");
  }

  // 2. Respostas já preenchidas por outras especialidades
  if (patient.formAnswers) {
    for (let i = 0; i < patient.specialties.length; i++) {
      const s = patient.specialties[i];
      if (s.id === specId) continue;
      const answers = patient.formAnswers[s.id];
      if (answers) {
        const originDesc = s.professional
          ? `${s.name} (${s.professional}${s.completedTime ? ` · ${s.completedTime}` : ""})`
          : s.name;
        
        // Uso de _updatedAt ou um fallback sequencial usando i (para o mock funcionar)
        const ts = answers["_updatedAt"] || `0000-00-00T00:01:${String(i).padStart(2, '0')}.000Z`;
        
        for (const [key, rawVal] of Object.entries(answers)) {
          if (key === "Observações" || key === "_updatedAt" || key.endsWith("_suppressed") || key.endsWith("_isOther") || key.endsWith("_append")) continue;
          if (rawVal === null || rawVal === undefined) continue;

          const val = typeof rawVal === "string" 
            ? rawVal 
            : Array.isArray(rawVal) 
              ? rawVal.join(", ") 
              : String(rawVal);
          
          // Tratamento de conexões e traduções (4.1 e 4.2)
          if (key === "medicacoes") applyInheritance("MUC", val, originDesc, ts);
          if (key === "MUC") applyInheritance("medicacoes", val, originDesc, ts);
          
          if (key === "Estadiamento") {
            let mapped = val;
            if (val === "Não se aplica") mapped = "Não aplicável";
            applyInheritance("estadiamento_doenca", mapped, originDesc, ts);
          }
          if (key === "estadiamento_doenca") {
            let mapped = val;
            if (val === "Não aplicável") mapped = "Não se aplica";
            applyInheritance("Estadiamento", mapped, originDesc, ts);
          }
          
          if (key === "Cirurgias prévias") {
            if (val === "Nega") applyInheritance("fezCirurgia", "Não", originDesc, ts);
            if (val === "Sim") applyInheritance("fezCirurgia", "Sim", originDesc, ts);
          }
          
          if (key === "Alergia") {
            if (val === "Nega") applyInheritance("qs_alergia", "Não", originDesc, ts);
            if (val === "Sim") applyInheritance("qs_alergia", "Sim", originDesc, ts);
          }
          
          if (key === "Apoio familiar") applyInheritance("suporteFamiliar", val, originDesc, ts);
          
          if (key === "Tratamento em curso") applyInheritance("tratamentosEmCurso", val, originDesc, ts);
          if (key === "tratamentosEmCurso") applyInheritance("Tratamento em curso", val, originDesc, ts);
          
          if (key === "viaAlimentar") {
            let mapped = val;
            if (val === "SNE") mapped = "Sonda";
            if (val === "GTT") mapped = "Ostomia";
            if (val === "NPT") mapped = "Parenteral";
            applyInheritance("via_alimentacao", mapped, originDesc, ts);
          }
          if (key === "via_alimentacao") {
            let mapped = val;
            if (val === "Sonda") mapped = "SNE";
            if (val === "Ostomia") mapped = "GTT";
            if (val === "Parenteral") mapped = "NPT";
            applyInheritance("viaAlimentar", mapped, originDesc, ts);
          }
          
          if (key === "Comorbidades e outras doenças" || key === "Comorbidades") {
            if (val.includes("Diabetes")) applyInheritance("qs_diabetes", "Sim", originDesc, ts);
            if (val.includes("Hipertensão") || val.includes("Cardiopatia")) applyInheritance("qs_doenca_cardiovascular", "Sim", originDesc, ts);
          }
          
          if ((key === "medicacoes" || key === "MUC") && val.trim() !== "") {
             applyInheritance("qs_tomando_medicamento", "Sim", originDesc, ts);
          }
          
          if (key === "ecog" || key === "ECOG / Performance") {
            applyInheritance("ECOG / Performance", val, originDesc, ts);
          }

          // Bloqueados de herança (conceitos semelhantes mas avaliações diferentes)
          const blocked = ["Dor", "Disfagia", "Atividade física", "Cansaço", "Quedas"];
          if (blocked.includes(key)) continue;

          applyInheritance(key, val, originDesc, ts);
        }
      }
    }
  }

  const [dynamicAnswers, setDynamicAnswers] = useState<Record<string, string>>({
    ...(patient.formAnswers?.[specId] || {}),
    ...(storedDraftMeta?.answers || {})
  });

  const handleDiscardDraft = () => {
    clearFormDraft(patient.id, specId);
    setDynamicAnswers(patient.formAnswers?.[specId] || {});
    setObs(patient.formAnswers?.[specId]?.["Observações"] || "");
    setDraftBannerVisible(false);
  };

  const handleDynamicAnswer = (key: string, value: string) => {
    setDynamicAnswers(prev => {
      const next = { ...prev, [key]: value };
      saveFormDraft(patient.id, specId, { ...next, "Observações": obs });
      return next;
    });
  };

  const handleObsChange = (value: string) => {
    setObs(value);
    saveFormDraft(patient.id, specId, { ...dynamicAnswers, "Observações": value });
  };

  const getAnswers = () => ({
    ...dynamicAnswers,
    "Observações": obs
  });

  const mergedData = { ...inheritedData, ...dynamicAnswers };

  return (
    <div className="max-w-2xl space-y-5">
      {/* Aviso de rascunho recuperado */}
      {draftBannerVisible && storedDraftMeta && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 shadow-sm animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold">Rascunho não salvo restaurado</p>
              <p className="text-amber-800">
                Restaurado de {storedDraftMeta.savedAt ? new Date(storedDraftMeta.savedAt).toLocaleString("pt-BR") : "sessão anterior"}.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setDraftBannerVisible(false)}
              className="px-3 py-1.5 bg-[#1B6CA8] hover:bg-[#155a90] text-white rounded-lg text-xs font-semibold transition"
            >
              Continuar
            </button>
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold transition"
            >
              Descartar
            </button>
          </div>
        </div>
      )}
      {/* Specialty-specific */}
      {specId === "nutricao" && <NutricaoForm data={mergedData} inheritedData={inheritedData} origins={origins} onChange={handleDynamicAnswer} patient={patient} />}
      {specId === "fisioterapia" && <FisioterapiaForm data={mergedData} inheritedData={inheritedData} origins={origins} onChange={handleDynamicAnswer} patient={patient} />}
      {specId === "terapia-ocupacional" && <TerapiaOcupacionalForm data={mergedData} inheritedData={inheritedData} origins={origins} onChange={handleDynamicAnswer} patient={patient} />}
      {specId === "enfermagem" && <EnfermagemForm data={mergedData} inheritedData={inheritedData} origins={origins} onChange={handleDynamicAnswer} patient={patient} />}
      {specId === "medicina" && <MedicinaForm data={mergedData} inheritedData={inheritedData} origins={origins} onChange={handleDynamicAnswer} patient={patient} />}
      {specId === "psicologia" && <PsicologiaForm data={mergedData} inheritedData={inheritedData} origins={origins} onChange={handleDynamicAnswer} patient={patient} />}
      {specId === "servico-social" && <ServicoSocialForm data={mergedData} inheritedData={inheritedData} origins={origins} onChange={handleDynamicAnswer} patient={patient} />}
      {specId === "odontologia" && <OdontologiaForm data={mergedData} inheritedData={inheritedData} origins={origins} onChange={handleDynamicAnswer} patient={patient} />}
      {specId === "fonoaudiologia" && <FonoaudiologiaForm data={mergedData} inheritedData={inheritedData} origins={origins} onChange={handleDynamicAnswer} patient={patient} />}
      {(specId !== "nutricao" && specId !== "fisioterapia" && specId !== "terapia-ocupacional" && specId !== "enfermagem" && specId !== "medicina" && specId !== "psicologia" && specId !== "servico-social" && specId !== "odontologia" && specId !== "fonoaudiologia") && (
        <DefaultForm data={mergedData} inheritedData={inheritedData} origins={origins} onChange={handleDynamicAnswer} patient={{ ...patient, specName: spec?.name }} />
      )}
      {/* Observations */}
      <div className="bg-white rounded-2xl border border-[rgba(27,108,168,0.1)] shadow-sm p-5">
        <h3 id="observacoes-titulo" className="font-bold text-[#1A2332] mb-3 text-sm" style={{ fontFamily: "'Nunito', sans-serif" }}>Observações e evolução</h3>
        <textarea aria-labelledby="observacoes-titulo" value={obs} onChange={e => handleObsChange(e.target.value)}
          rows={4} placeholder="Registre observações, condutas ou evolução da especialidade..."
          className="w-full px-4 py-3 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] placeholder-[#9AAABB] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition resize-none" />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={onBack}
          className="flex items-center justify-center gap-2 px-6 py-3 border border-[#D5E6F3] bg-white text-[#6B7A8D] rounded-full text-sm font-bold hover:bg-[#F4F7FB] transition">
          <ArrowLeft size={15} /> Voltar
        </button>
        <button onClick={() => onSave(specId, getAnswers(), "em-atendimento")}
          className="flex-1 flex items-center justify-center gap-2 py-3 border border-[#D5E6F3] bg-white text-[#6B7A8D] rounded-full text-sm font-bold hover:bg-[#F4F7FB] transition">
          <Save size={15} /> Salvar rascunho
        </button>
        <button onClick={() => onSave(specId, getAnswers(), "nao-se-aplica")}
          className="flex-1 flex items-center justify-center gap-2 py-3 border border-[#FCD34D] bg-white text-[#D97706] rounded-full text-sm font-bold hover:bg-[#FFFBEB] transition">
          <X size={15} /> Não se aplica
        </button>
        <button onClick={() => onSave(specId, getAnswers(), "atendido")}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#0F9E62] text-white rounded-full text-sm font-bold hover:bg-[#0B7A4B] transition shadow-sm">
          <CheckCircle size={15} /> Finalizar avaliação
        </button>
      </div>
    </div>
  );
}

// ─── Consolidated Record ──────────────────────────────────────────────────────

function ConsolidatedRecordScreen({ patient, onBack, role, onPdfExported, currentUser }: { patient: Patient; onBack: () => void; role: Role | null; onPdfExported: (registro: PdfExportRecord) => void; currentUser?: { name: string } | null }) {
  const agora = new Date();
  const pad2 = (n: number) => String(n).padStart(2, "0");
  const now = `${pad2(agora.getDate())}/${pad2(agora.getMonth() + 1)}/${agora.getFullYear()} às ${pad2(agora.getHours())}:${pad2(agora.getMinutes())}`;
  const visibleAlerts = filterAlertsForRole(patient.alerts || [], role);
  const temAcessoConfidencial = podeVerConfidencial(role);
  const infosCompartilhadas = buildInformacoesCompartilhadas(patient.formAnswers, patient.specialties);
  const dadosCompartilhados = infosCompartilhadas.filter(i => !i.divergente);
  const divergencies = infosCompartilhadas.filter(i => i.divergente);
  const blocks = [
    {
      title: "Dados gerais",
      icon: <User size={14} />,
      rows: [
        ["Nome completo", patient.name],
        ["Idade", `${patient.age} anos`],
        ["CPF", patient.cpf],
        ["CNS", patient.cns ?? "—"],
        ["Telefone", patient.phone],
        ["Estado civil", patient.maritalStatus ?? "—"],
        ["Cor/raça (autodeclarada)", patient.raceColor ?? "—"],
        ["Religião / espiritualidade", patient.religion ?? "—"],
        ["Endereço", patient.address],
        ["Contato de emergência", patient.emergencyContact],
        ["Acompanhante", patient.companion ?? "Não"],
      ],
    },
    {
      title: "Dados clínicos iniciais",
      icon: <Stethoscope size={14} />,
      rows: [
        ["Diagnóstico", patient.diagnosis],
        ["CID", patient.cid],
        ["Unidade de origem", patient.origin],
        ["Data de acolhimento", patient.date],
        ["Hora de chegada", patient.arrivalTime],
        ...(patient.weight ? [["Peso", patient.weight], ["Altura", patient.height ?? "—"]] : []),
      ],
    },
  ];

  const especialidadesParaPdf = buildEspecialidadesPdf(patient.specialties, patient.formAnswers, patient.date, temAcessoConfidencial);

  const [exportando, setExportando] = useState(false);
  const [erroExportacao, setErroExportacao] = useState("");
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const handleExecutarExportacao = async (opcoes: {
    tipo: "completo" | "especialidade";
    especialidadeId?: string;
    especialidadeNome?: string;
    formato: "pdf" | "docx";
    nomeArquivo: string;
  }) => {
    setErroExportacao("");
    setExportando(true);
    const exportadoPor = currentUser?.name || nomeExibicaoPorPerfil(role);
    const versao = proximaVersaoPdf(patient);
    const exportDate = new Date();
    const pad2 = (n: number) => String(n).padStart(2, "0");
    const geradoEmAgora = `${pad2(exportDate.getDate())}/${pad2(exportDate.getMonth() + 1)}/${exportDate.getFullYear()} às ${pad2(exportDate.getHours())}:${pad2(exportDate.getMinutes())}`;

    const specsParaExportar =
      opcoes.tipo === "especialidade" && opcoes.especialidadeId
        ? patient.specialties.filter(s => s.id === opcoes.especialidadeId)
        : patient.specialties;

    const especialidadesExportadas = buildEspecialidadesPdf(specsParaExportar, patient.formAnswers, patient.date, temAcessoConfidencial);

    const exportProps = {
      patient: { id: patient.id, name: patient.name, age: patient.age, diagnosis: patient.diagnosis, cid: patient.cid, date: patient.date, arrivalTime: patient.arrivalTime },
      geradoEm: geradoEmAgora,
      exportDate,
      versao,
      exportadoPor,
      dadosCompartilhados,
      divergencias: divergencies,
      especialidades: especialidadesExportadas,
      tipo: opcoes.tipo,
      especialidadeNome: opcoes.especialidadeNome,
      nomeArquivo: opcoes.nomeArquivo,
    };

    try {
      if (opcoes.formato === "pdf") {
        const { exportarFichaConsolidadaPdf } = await import("./pdf/exportFichaConsolidadaPdf");
        const resultado = await exportarFichaConsolidadaPdf(exportProps);
        if (resultado.ok) onPdfExported({ versao, geradoEm: geradoEmAgora, exportadoPor });
        else setErroExportacao(resultado.erro);
      } else {
        const { exportarDocumentoDocx } = await import("./export/exportDocumentoDocx");
        const resultado = await exportarDocumentoDocx(exportProps);
        if (resultado.ok) onPdfExported({ versao, geradoEm: geradoEmAgora, exportadoPor });
        else setErroExportacao(resultado.erro);
      }
    } catch (erro) {
      console.error("Falha ao exportar documento:", erro);
      setErroExportacao("Não foi possível gerar o documento agora. Tente novamente em instantes.");
    }
    setExportando(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 print:space-y-4 print:max-w-none print:m-0 print:p-0">
      <div className="bg-white rounded-2xl border border-[rgba(27,108,168,0.1)] shadow-sm px-6 py-4 flex items-center justify-between print:border-none print:shadow-none print:px-0 print:py-2 print:border-b-2 print:border-gray-800 print:rounded-none">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-[#1A2332] text-xl print:text-2xl" style={{ fontFamily: "'Nunito', sans-serif" }}>Ficha Consolidada Multidisciplinar</h2>
            <Level3Chips alerts={visibleAlerts} className="print:hidden" />
          </div>
          <p className="text-sm text-[#9AAABB] print:text-gray-600">Ficha gerada em {now}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#6B7A8D] print:text-gray-700 mt-1">
            <span><strong className="text-[#1A2332] print:text-black">{patient.name}</strong> ({patient.id})</span>
            <span>{patient.age} anos</span>
            <span>{patient.diagnosis} · CID {patient.cid}</span>
            <span>Chegada: {patient.date} às {patient.arrivalTime}</span>
          </div>
        </div>
        <button onClick={() => setExportModalOpen(true)} disabled={exportando} className="print:hidden flex items-center gap-2 px-4 py-2.5 bg-[#1B6CA8] text-white rounded-xl text-sm font-bold hover:bg-[#155a90] transition shadow-md disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer">
          <Download size={15} /> {exportando ? "Gerando..." : "Exportar documento"}
        </button>
      </div>

      {erroExportacao && (
        <div className="print:hidden bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-2 text-sm text-red-700">
          <AlertTriangle size={16} className="shrink-0" /> {erroExportacao}
        </div>
      )}

      {blocks.map(b => (
        <div key={b.title} className="bg-white rounded-2xl border border-[rgba(27,108,168,0.1)] shadow-sm p-5 print:border-none print:shadow-none print:p-0 print:mb-6">
          <h3 className="font-bold text-[#1A2332] mb-4 flex items-center gap-2 text-base print:text-lg print:mb-2 print:border-b print:pb-1" style={{ fontFamily: "'Nunito', sans-serif" }}>
            <span className="text-[#1B6CA8] print:hidden">{b.icon}</span> {b.title}
          </h3>
          <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5 print:grid-cols-2 print:gap-y-1">
            {b.rows.map(([k, v]) => (
              <div key={k} className="flex gap-2 text-sm border-b border-[#F4F7FB] pb-2.5 last:border-0 print:border-b-0 print:pb-1">
                <dt className="text-[#9AAABB] font-medium min-w-[150px] shrink-0 print:text-gray-700">{k}</dt>
                <dd className="text-[#1A2332] font-semibold print:text-black">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}

      {/* Dados compartilhados entre especialidades — cada campo aparece uma única vez, com quem preencheu (RF-006/RF-009) */}
      {dadosCompartilhados.length > 0 && (
        <div className="bg-white rounded-2xl border border-[rgba(27,108,168,0.1)] shadow-sm p-5 print:border-none print:shadow-none print:p-0 print:mb-6">
          <h3 className="font-bold text-[#1A2332] mb-4 flex items-center gap-2 text-base print:text-lg print:mb-2 print:border-b print:pb-1" style={{ fontFamily: "'Nunito', sans-serif" }}>
            <span className="text-[#1B6CA8] print:hidden"><Layers size={14} /></span> Dados compartilhados entre especialidades
          </h3>
          <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5 print:grid-cols-2 print:gap-y-1">
            {dadosCompartilhados.map(d => (
              <div key={d.campo} className="flex gap-2 text-sm border-b border-[#F4F7FB] pb-2.5 last:border-0 print:border-b-0 print:pb-1">
                <dt className="text-[#9AAABB] font-medium min-w-[150px] shrink-0 print:text-gray-700">{d.label}</dt>
                <dd className="text-[#1A2332] font-semibold print:text-black">{d.valor} <span className="text-[10px] text-[#8A9EB9] font-normal">({d.origem})</span></dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* Divergencies Block */}
      {divergencies.length > 0 && (
        <div className="bg-amber-50 rounded-2xl border border-amber-200 shadow-sm p-5 print:border-none print:shadow-none print:p-0 print:mb-6">
          <h3 className="font-bold text-amber-800 mb-4 flex items-center gap-2 text-base print:text-lg print:mb-2 print:border-b print:pb-1" style={{ fontFamily: "'Nunito', sans-serif" }}>
            <span className="text-amber-600 print:hidden"><AlertTriangle size={16} /></span> Alertas de Divergência
          </h3>
          <div className="space-y-4">
            {divergencies.map(d => (
              <div key={d.campo} className="bg-white rounded-xl border border-amber-200/50 p-4 shadow-sm">
                <h4 className="text-sm font-bold text-amber-900 mb-3">Divergência detectada em: <span className="font-extrabold">{d.label}</span></h4>
                <ul className="space-y-2">
                  <li className="text-sm flex gap-3 items-start">
                    <span className="text-amber-700 font-semibold min-w-[140px] mt-0.5">{d.origem}:</span>
                    <span className="text-amber-900 bg-amber-100/50 px-2 py-0.5 rounded-md flex-1 leading-snug">{d.valor}</span>
                  </li>
                  {d.outrasRespostas.map((a, i) => (
                    <li key={i} className="text-sm flex gap-3 items-start">
                      <span className="text-amber-700 font-semibold min-w-[140px] mt-0.5">{a.especialidades.join(", ")}:</span>
                      <span className="text-amber-900 bg-amber-100/50 px-2 py-0.5 rounded-md flex-1 leading-snug">{a.valor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Specialty Summaries — uma seção por especialidade, com status (Preenchido/Pendente/Não aplicável) */}
      <div className="space-y-4 print:space-y-6">
        <h3 className="font-bold text-[#1A2332] flex items-center gap-2 text-base print:text-lg print:border-b print:pb-1" style={{ fontFamily: "'Nunito', sans-serif" }}>
          <span className="text-[#1B6CA8] print:hidden"><Layers size={16} /></span> Evolução e Conduta por Especialidade
        </h3>

        {patient.specialties.map(sp => {
          const preenchido = sp.status === "atendido" || sp.status === "em-atendimento";

          if (!preenchido) {
            const isPendente = sp.status === "pendente";
            return (
              <div key={sp.id} className={`rounded-2xl border p-4 flex items-center justify-between print:break-inside-avoid ${isPendente ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-200"}`}>
                <span className={`font-bold text-sm ${isPendente ? "text-amber-900" : "text-gray-600"}`}>{sp.name}</span>
                <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${isPendente ? "bg-amber-100 text-amber-700" : "bg-gray-200 text-gray-600"}`}>
                  {isPendente && <Clock size={12} />} {statusLabel(sp.status)}
                </span>
              </div>
            );
          }

          const answers = patient.formAnswers?.[sp.id];
          const detalhes = buildDetalhesEspecialidade(sp.id, answers, temAcessoConfidencial);
          const resumoNutricao = sp.id === "nutricao" ? buildResumoNutricao(answers) : null;
          const resumoPsicologia = sp.id === "psicologia" && temAcessoConfidencial ? buildResumoPsicologia(answers) : null;

          return (
            <div key={sp.id} className="bg-white rounded-2xl border border-[rgba(27,108,168,0.1)] shadow-sm overflow-hidden print:border-none print:shadow-none print:rounded-none print:break-inside-avoid">
              <div className="p-4 bg-gray-50 border-b border-[rgba(27,108,168,0.1)] flex justify-between items-center print:bg-transparent print:p-0 print:border-b print:border-gray-300 print:mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-[#1A2332] text-sm print:text-base">{sp.name}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{statusLabel(sp.status)}</span>
                </div>
                <div className="text-xs text-[#6B7A8D] print:text-gray-600">
                  {sp.professional && <span>{sp.professional}</span>}
                  {sp.completedTime && <span> · {patient.date} às {sp.completedTime}</span>}
                </div>
              </div>
              <div className="p-4 print:p-0 print:pt-2 space-y-4">
                {resumoNutricao && (
                  <div className="bg-[#F2FAF9] border border-[#D3EFEA] rounded-xl p-3 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-[#1A2332]">IMC</span>
                      <span className="font-bold text-[#1B6CA8]">{resumoNutricao.imc}{resumoNutricao.imc !== "—" ? " kg/m²" : ""} <span className="text-[10px] font-normal text-[#8A9EB9]">({resumoNutricao.imcFormula})</span></span>
                    </div>
                    {resumoNutricao.asgPreenchido && resumoNutricao.asgTotal !== null && resumoNutricao.asgTriage ? (
                      <>
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-bold text-[#1A2332]">ASG-PPP</span>
                          <span className="font-bold text-[#1B6CA8]">{resumoNutricao.asgTotal} pontos</span>
                        </div>
                        <p className="text-xs text-[#3A4354]">{resumoNutricao.asgTriage.text}</p>
                      </>
                    ) : (
                      <div className="flex justify-between items-center text-xs text-[#8A9EB9]">
                        <span>ASG-PPP</span>
                        <span className="italic">Não preenchido</span>
                      </div>
                    )}
                  </div>
                )}
                {resumoPsicologia && (
                  <div className="bg-[#F2FAF9] border border-[#D3EFEA] rounded-xl p-3 space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-[#1A2332]">IRPO — Índice Global de Risco</span>
                      <span className="font-bold text-[#1B6CA8]">{resumoPsicologia.irpoTotal} pontos ({resumoPsicologia.respondidas}/27 questões)</span>
                    </div>
                    {resumoPsicologia.irpoRisk && (
                      <p className="text-xs text-[#3A4354]">{resumoPsicologia.irpoRisk.level} — {resumoPsicologia.irpoRisk.indication}</p>
                    )}
                  </div>
                )}
                {detalhes.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">Sem registros detalhados.</p>
                ) : (
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 print:grid-cols-1 print:gap-y-1">
                    {detalhes.map(d => (
                      <div key={d.campo} className="text-sm">
                        <dt className="text-[#6B7A8D] font-medium print:text-gray-700 print:font-bold">{d.label}</dt>
                        <dd className="text-[#1A2332] mt-0.5 print:mt-0">{d.valor}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <PendencyList alerts={visibleAlerts} />

      <button onClick={onBack}
        className="print:hidden flex items-center gap-2 text-sm text-[#6B7A8D] hover:text-[#1A2332] transition font-medium mt-6">
        <ArrowLeft size={15} /> Voltar à ficha do paciente
      </button>

      <ExportDocumentModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        patient={patient}
        initialTipo="completo"
        onExport={handleExecutarExportacao}
      />
    </div>
  );
}

// ─── Professionals Management ─────────────────────────────────────────────────

interface Professional {
  id: string;
  name: string;
  role: string;
  specialty: string;
  email: string;
  status: "ativo" | "inativo";
}

const INITIAL_PROFESSIONALS: Professional[] = [
  { id: "PRO-001", name: "Carla Santos", role: "Recepção", specialty: "—", email: "carla@hospital.com.br", status: "ativo" },
  { id: "PRO-002", name: "Marco Antônio", role: "Recepção", specialty: "—", email: "marco@hospital.com.br", status: "ativo" },
  { id: "PRO-003", name: "Enfª. Patrícia Lima", role: "Profissional", specialty: "Enfermagem", email: "patricia@hospital.com.br", status: "ativo" },
  { id: "PRO-004", name: "Enfº. Bruno Lima", role: "Profissional", specialty: "Enfermagem", email: "bruno@hospital.com.br", status: "ativo" },
  { id: "PRO-005", name: "Dr. Rafael Costa", role: "Profissional", specialty: "Medicina", email: "rafael@hospital.com.br", status: "ativo" },
  { id: "PRO-006", name: "Dra. Camila Rocha", role: "Profissional", specialty: "Medicina", email: "camila@hospital.com.br", status: "ativo" },
  { id: "PRO-007", name: "Nutr. Fernanda Alves", role: "Profissional", specialty: "Nutrição", email: "fernanda@hospital.com.br", status: "ativo" },
  { id: "PRO-008", name: "Fisio. Pedro Nunes", role: "Profissional", specialty: "Fisioterapia", email: "pedro@hospital.com.br", status: "ativo" },
  { id: "PRO-009", name: "AS Lívia Souza", role: "Profissional", specialty: "Serviço Social", email: "livia@hospital.com.br", status: "ativo" },
  { id: "PRO-010", name: "Psic. Marcos Vidal", role: "Profissional", specialty: "Psicologia", email: "marcos@hospital.com.br", status: "ativo" },
  { id: "PRO-011", name: "CD João Melo", role: "Profissional", specialty: "Odontologia", email: "joao@hospital.com.br", status: "ativo" },
  { id: "PRO-012", name: "Fga. Sônia Reis", role: "Profissional", specialty: "Fonoaudiologia", email: "sonia@hospital.com.br", status: "ativo" },
  { id: "PRO-014", name: "TO Amanda Borges", role: "Profissional", specialty: "Terapia Ocupacional", email: "amanda@hospital.com.br", status: "ativo" },
  { id: "PRO-013", name: "Ana Lima", role: "Coordenação", specialty: "—", email: "ana@hospital.com.br", status: "ativo" },
];

const SPECIALTIES_LIST = ["—", "Enfermagem", "Medicina", "Nutrição", "Fisioterapia", "Serviço Social", "Psicologia", "Odontologia", "Fonoaudiologia", "Terapia Ocupacional"];
const ROLES_LIST = ["Recepção", "Profissional", "Coordenação"];

const ROLE_COLORS: Record<string, string> = {
  "Recepção": "bg-sky-50 text-sky-700 border-sky-200",
  "Profissional": "bg-[#E8F4FD] text-[#1B6CA8] border-[#D5E6F3]",
  "Coordenação": "bg-purple-50 text-purple-700 border-purple-200",
};

const PROFESSIONALS_STORAGE_KEY = "jornada_oncologica_professionals";

function loadStoredProfessionals(defaults: Professional[]): Professional[] {
  try {
    const raw = localStorage.getItem(PROFESSIONALS_STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaults;
  } catch {
    return defaults;
  }
}

function saveStoredProfessionals(pros: Professional[]): void {
  try {
    localStorage.setItem(PROFESSIONALS_STORAGE_KEY, JSON.stringify(pros));
  } catch {
    // localStorage indisponível
  }
}

interface ProfessionalsManagementProps {
  professionals: Professional[];
  onSaveProfessional: (pro: Omit<Professional, "id">, editId?: string) => { success: boolean; error?: string };
  onToggleStatus: (id: string) => void;
}

function ProfessionalsManagement({ professionals, onSaveProfessional, onToggleStatus }: ProfessionalsManagementProps) {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("todos");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Professional | null>(null);
  const [formError, setFormError] = useState("");
  const [targetToInactivate, setTargetToInactivate] = useState<Professional | null>(null);

  const emptyForm = { name: "", role: "Profissional", specialty: "Enfermagem", email: "", status: "ativo" as "ativo" | "inativo" };
  const [form, setForm] = useState(emptyForm);

  const filtered = professionals.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.specialty.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "todos" || p.role === filterRole;
    return matchSearch && matchRole;
  });

  function openNew() {
    setEditTarget(null);
    setForm(emptyForm);
    setFormError("");
    setShowForm(true);
  }

  function openEdit(pro: Professional) {
    setEditTarget(pro);
    setForm({ name: pro.name, role: pro.role, specialty: pro.specialty, email: pro.email, status: pro.status });
    setFormError("");
    setShowForm(true);
  }

  function handleSave() {
    setFormError("");
    if (!form.name.trim() || !form.email.trim()) {
      setFormError("Preencha todos os campos obrigatórios (nome e e-mail).");
      return;
    }
    const result = onSaveProfessional(form, editTarget?.id);
    if (!result.success) {
      setFormError(result.error || "Erro ao salvar profissional.");
      return;
    }
    setShowForm(false);
  }

  function handleRequestToggleStatus(pro: Professional) {
    if (pro.status === "ativo") {
      setTargetToInactivate(pro);
    } else {
      onToggleStatus(pro.id);
    }
  }

  function confirmInactivate() {
    if (targetToInactivate) {
      onToggleStatus(targetToInactivate.id);
      setTargetToInactivate(null);
    }
  }

  const counts = {
    total: professionals.length,
    recepcao: professionals.filter(p => p.role === "Recepção").length,
    profissional: professionals.filter(p => p.role === "Profissional").length,
    coordenacao: professionals.filter(p => p.role === "Coordenação").length,
    inativos: professionals.filter(p => p.status === "inativo").length,
  };

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-[#1A2332]" style={{ fontFamily: "'Nunito', sans-serif" }}>Gestão de Profissionais</h2>
          <p className="text-sm text-[#6B7A8D]">{counts.total} usuários cadastrados</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1B6CA8] text-white rounded-xl text-sm font-bold hover:bg-[#155a90] transition shadow-md shadow-[#1B6CA8]/20">
          <UserPlus size={16} /> Novo profissional
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Recepção" value={counts.recepcao} color="text-sky-600" />
        <StatCard label="Profissionais" value={counts.profissional} color="text-[#1B6CA8]" />
        <StatCard label="Coordenação" value={counts.coordenacao} color="text-purple-600" />
        <StatCard label="Inativos" value={counts.inativos} color="text-gray-400" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9AAABB]" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome, e-mail ou especialidade..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D5E6F3] bg-white text-sm text-[#1A2332] placeholder-[#9AAABB] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition" />
        </div>
        <div className="flex gap-1 bg-white border border-[#D5E6F3] rounded-xl p-1">
          {["todos", "Recepção", "Profissional", "Coordenação"].map(r => (
            <button key={r} onClick={() => setFilterRole(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${filterRole === r ? "bg-[#1B6CA8] text-white shadow-sm" : "text-[#6B7A8D] hover:text-[#1A2332]"}`}>
              {r === "todos" ? "Todos" : r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[rgba(27,108,168,0.1)] shadow-sm overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#EEF2F7]">
                {["Profissional", "Perfil", "Especialidade", "E-mail", "Status", "Ações"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#9AAABB] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F7FB]">
              {filtered.map(pro => (
                <tr key={pro.id} className={`hover:bg-[#F9FBFE] transition-colors ${pro.status === "inativo" ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#E8F4FD] flex items-center justify-center shrink-0">
                        <User size={14} className="text-[#1B6CA8]" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[#1A2332]">{pro.name}</p>
                        <p className="text-xs text-[#9AAABB] font-mono">{pro.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${ROLE_COLORS[pro.role] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
                      {pro.role}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-[#6B7A8D]">{pro.specialty}</td>
                  <td className="px-4 py-3.5 text-sm text-[#6B7A8D]">{pro.email}</td>
                  <td className="px-4 py-3.5">
                    <button onClick={() => handleRequestToggleStatus(pro)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors ${pro.status === "ativo" ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"}`}>
                      {pro.status === "ativo" ? <><Check size={11} /> Ativo</> : <><X size={11} /> Inativo</>}
                    </button>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(pro)}
                        className="p-1.5 rounded-lg hover:bg-[#E8F4FD] text-[#1B6CA8] transition" title="Editar">
                        <Pencil size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="md:hidden divide-y divide-[#F4F7FB]">
          {filtered.map(pro => (
            <div key={pro.id} className={`p-4 ${pro.status === "inativo" ? "opacity-50" : ""}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-[#E8F4FD] flex items-center justify-center shrink-0">
                  <User size={15} className="text-[#1B6CA8]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-[#1A2332] truncate">{pro.name}</p>
                  <p className="text-xs text-[#9AAABB]">{pro.email}</p>
                </div>
                <button onClick={() => openEdit(pro)} className="p-2 rounded-xl hover:bg-[#E8F4FD] text-[#1B6CA8] transition">
                  <Pencil size={14} />
                </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${ROLE_COLORS[pro.role] ?? ""}`}>{pro.role}</span>
                {pro.specialty !== "—" && <span className="text-xs text-[#6B7A8D] bg-[#F4F7FB] px-2.5 py-0.5 rounded-full">{pro.specialty}</span>}
                <button onClick={() => handleRequestToggleStatus(pro)}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${pro.status === "ativo" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-400 border-gray-200"}`}>
                  {pro.status === "ativo" ? <><Check size={10} /> Ativo</> : <><X size={10} /> Inativo</>}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-[#9AAABB]">Nenhum profissional encontrado.</div>
        )}
      </div>

      {/* Modal / Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[rgba(27,108,168,0.1)] w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[#1A2332] text-lg" style={{ fontFamily: "'Nunito', sans-serif" }}>
                {editTarget ? "Editar profissional" : "Novo profissional"}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-[#F4F7FB] transition" aria-label="Fechar">
                <X size={18} className="text-[#6B7A8D]" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2">
                <AlertCircle size={15} className="text-red-500 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#1A2332] mb-1.5">Nome completo *</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ex.: Dr. João Silva"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] placeholder-[#9AAABB] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1A2332] mb-1.5">E-mail *</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="profissional@hospital.com.br"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] placeholder-[#9AAABB] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-[#1A2332] mb-1.5">Perfil *</label>
                  <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value, specialty: e.target.value !== "Profissional" ? "—" : f.specialty }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition">
                    {ROLES_LIST.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1A2332] mb-1.5">Especialidade</label>
                  <select value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))}
                    disabled={form.role !== "Profissional"}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition disabled:opacity-40">
                    {SPECIALTIES_LIST.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1A2332] mb-1.5">Status</label>
                <div className="flex gap-2">
                  {(["ativo", "inativo"] as const).map(s => (
                    <button key={s} onClick={() => setForm(f => ({ ...f, status: s }))}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${form.status === s ? (s === "ativo" ? "bg-emerald-600 text-white border-emerald-600" : "bg-gray-400 text-white border-gray-400") : "bg-white text-[#6B7A8D] border-[#D5E6F3] hover:bg-[#F4F7FB]"}`}>
                      {s === "ativo" ? "Ativo" : "Inativo"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-3 border border-[#D5E6F3] bg-white text-[#6B7A8D] rounded-xl font-semibold text-sm hover:bg-[#F4F7FB] transition">
                Cancelar
              </button>
              <button onClick={handleSave}
                className="flex-1 py-3 bg-[#1B6CA8] text-white rounded-xl font-bold text-sm hover:bg-[#155a90] transition shadow-md flex items-center justify-center gap-2">
                <Save size={15} /> {editTarget ? "Salvar alterações" : "Cadastrar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal to Inactivate Professional (Obs 15) */}
      {targetToInactivate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[rgba(27,108,168,0.1)] w-full max-w-md p-6">
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                <AlertCircle size={20} />
              </div>
              <div>
                <h3 className="font-bold text-[#1A2332] text-base" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  Confirmar inativação
                </h3>
                <p className="text-xs text-[#6B7A8D]">Ação de segurança cadastral</p>
              </div>
            </div>

            <p className="text-sm text-[#4A5568] mb-6">
              Deseja realmente inativar o profissional <strong className="text-[#1A2332]">{targetToInactivate.name}</strong>? Ele perderá o acesso ao sistema.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setTargetToInactivate(null)}
                className="flex-1 py-2.5 border border-[#D5E6F3] bg-white text-[#6B7A8D] rounded-xl font-semibold text-sm hover:bg-[#F4F7FB] transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmInactivate}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition shadow-sm"
              >
                Confirmar inativação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Avg times ────────────────────────────────────────────────────────────────

interface SpecTarget {
  name: string;
  minutes: number;
  target: number;
}

const DEFAULT_TARGETS: SpecTarget[] = [
  { name: "Recepção", minutes: 12, target: 15 },
  { name: "Enfermagem", minutes: 28, target: 30 },
  { name: "Medicina", minutes: 47, target: 40 },
  { name: "Nutrição", minutes: 35, target: 35 },
  { name: "Fisioterapia", minutes: 22, target: 25 },
  { name: "Serviço Social", minutes: 41, target: 30 },
  { name: "Psicologia", minutes: 38, target: 40 },
  { name: "Odontologia", minutes: 18, target: 20 },
  { name: "Fonoaudiologia", minutes: 26, target: 25 },
  { name: "Terapia Ocupacional", minutes: 32, target: 35 },
];

// ─── Time Targets Screen ──────────────────────────────────────────────────────

function TimeTargetsScreen({ targets, onChange }: {
  targets: SpecTarget[];
  onChange: (updated: SpecTarget[]) => void;
}) {
  const [draft, setDraft] = useState<SpecTarget[]>(targets.map(t => ({ ...t })));
  const [saved, setSaved] = useState(false);

  function update(i: number, value: number) {
    const v = Math.max(5, Math.min(120, value));
    setDraft(d => d.map((t, idx) => idx === i ? { ...t, target: v } : t));
    setSaved(false);
  }

  function handleSave() {
    onChange(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleReset() {
    const reset = DEFAULT_TARGETS.map(t => ({ ...t }));
    setDraft(reset);
    onChange(reset);
    setSaved(false);
  }

  const hasChanges = draft.some((d, i) => d.target !== targets[i].target);

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-[#1A2332]" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Metas de tempo por especialidade
          </h2>
          <p className="text-sm text-[#6B7A8D] mt-0.5">
            Defina o tempo ideal de atendimento (em minutos) para cada especialidade.
            O painel de coordenação usa esses valores para sinalizar gargalos.
          </p>
        </div>
        <button onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-2 border border-[#D5E6F3] bg-white text-[#6B7A8D] rounded-xl text-xs font-semibold hover:bg-[#F4F7FB] transition shrink-0">
          <RotateCcw size={13} /> Restaurar padrões
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[rgba(27,108,168,0.1)] shadow-sm divide-y divide-[#F4F7FB]">
        {draft.map((item, i) => {
          const over = item.minutes > item.target;
          const pct = Math.min(Math.round((item.minutes / item.target) * 100), 100);
          return (
            <div key={item.name} className="px-5 py-4">
              <div className="flex items-center gap-4">
                {/* Specialty name */}
                <div className="w-32 shrink-0">
                  <p className="text-sm font-semibold text-[#1A2332]">{item.name}</p>
                  <p className="text-xs text-[#9AAABB]">Atual: {item.minutes} min</p>
                </div>

                {/* Slider */}
                <div className="flex-1">
                  <input
                    type="range"
                    min={5} max={120} step={5}
                    value={item.target}
                    onChange={e => update(i, Number(e.target.value))}
                    className="w-full accent-[#1B6CA8] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#9AAABB] mt-0.5">
                    <span>5 min</span>
                    <span>120 min</span>
                  </div>
                </div>

                {/* Number input */}
                <div className="shrink-0 flex items-center gap-1.5">
                  <input
                    type="number"
                    min={5} max={120} step={5}
                    value={item.target}
                    onChange={e => update(i, Number(e.target.value))}
                    className="w-16 px-2 py-1.5 rounded-lg border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-center font-bold text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition"
                  />
                  <span className="text-xs text-[#9AAABB]">min</span>
                </div>

                {/* Status badge */}
                <div className="shrink-0 w-20 text-right">
                  {over
                    ? <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      <AlertTriangle size={10} /> acima
                    </span>
                    : <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <Check size={10} /> ok
                    </span>}
                </div>
              </div>

              {/* Mini progress bar comparing actual vs target */}
              <div className="mt-2.5 ml-36 mr-24">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-[#F4F7FB] rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${over ? "bg-amber-400" : "bg-[#2DB5A3]"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-bold shrink-0 ${over ? "text-amber-600" : "text-[#9AAABB]"}`}>
                    {pct}% da meta
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-[#9AAABB]">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#2DB5A3] inline-block" /> Dentro da meta</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Acima da meta</span>
        <span>· Tempo atual = média do dia de hoje</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className="flex items-center gap-2 px-6 py-3 bg-[#1B6CA8] text-white rounded-xl font-bold text-sm hover:bg-[#155a90] transition shadow-md disabled:opacity-40 disabled:cursor-not-allowed">
          <Save size={15} /> Salvar metas
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-semibold">
            <CheckCircle size={15} /> Metas salvas com sucesso!
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Coordination Dashboard ───────────────────────────────────────────────────

function CoordinationDashboard({ onOpenPatient, targets, patients: patientsProp }: { onOpenPatient: (p: Patient) => void; targets: SpecTarget[]; patients?: Patient[] }) {
  const patients = patientsProp ?? PATIENTS;
  const counts = {
    total: patients.length,
    em: patients.filter(p => p.status === "em-atendimento").length,
    aguardando: patients.filter(p => p.status === "aguardando").length,
    finalizado: patients.filter(p => p.status === "finalizado").length,
    pendente: patients.filter(p => p.status === "pendente").length,
  };
  // "Pacientes Ativos" = jornadas do dia que ainda não terminaram (nem finalizadas, nem canceladas).
  const pacientesAtivos = counts.total - counts.finalizado;

  const specBottlenecks = SPEC_NAMES.slice(1).map((name, i) => ({
    name,
    pending: patients.filter(p => p.specialties[i + 1]?.status === "pendente").length,
    active: patients.filter(p => p.specialties[i + 1]?.status === "em-atendimento").length,
  })).sort((a, b) => b.pending - a.pending);

  // Indicadores agregados vindos do backend (GET /dashboard/coordenacao), que já
  // calcula o tempo médio de espera do dia — métrica que não dá pra derivar
  // corretamente só com o que a lista de pacientes expõe no front.
  const [coordStats, setCoordStats] = useState<DashboardCoordenacaoResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchCoordStats() {
      try {
        const data = await api.getDashboardCoordenacao();
        if (!cancelled) setCoordStats(data);
      } catch {
        // Silenciosamente ignora erro de rede — mantém o último valor conhecido
      }
    }
    fetchCoordStats();
    const interval = setInterval(fetchCoordStats, 30_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  const tempoMedioEsperaLabel = coordStats?.tempo_medio_espera_minutos != null
    ? `${Math.round(coordStats.tempo_medio_espera_minutos)} min`
    : "—";

  return (
    <div className="max-w-6xl space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[#1A2332]" style={{ fontFamily: "'Nunito', sans-serif" }}>Painel de Coordenação</h2>
        <p className="text-sm text-[#6B7A8D]">Visão geral do acolhimento · 03/07/2024</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <StatCard label="Pacientes ativos" value={pacientesAtivos} color="text-[#1B6CA8]" />
        <StatCard label="Tempo de espera médio" value={tempoMedioEsperaLabel} color="text-[#2DB5A3]" />
        <StatCard label="Total do dia" value={counts.total} color="text-[#1A2332]" />
        <StatCard label="Aguardando" value={counts.aguardando} color="text-sky-600" />
        <StatCard label="Em atendimento" value={counts.em} color="text-[#1B6CA8]" />
        <StatCard label="Finalizados" value={counts.finalizado} color="text-emerald-600" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Bottlenecks */}
        <div className="bg-white rounded-2xl border border-[rgba(27,108,168,0.1)] shadow-sm p-5">
          <h3 className="font-bold text-[#1A2332] mb-4 flex items-center gap-2 text-sm" style={{ fontFamily: "'Nunito', sans-serif" }}>
            <AlertTriangle size={14} className="text-amber-500" /> Gargalos por especialidade
          </h3>
          <div className="space-y-3">
            {specBottlenecks.map(s => (
              <div key={s.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-[#1A2332]">{s.name}</span>
                  <div className="flex gap-2">
                    {s.active > 0 && <span className="text-xs text-blue-600 font-semibold">{s.active} em atend.</span>}
                    <span className={`text-xs font-bold ${s.pending > 2 ? "text-amber-600" : "text-[#6B7A8D]"}`}>{s.pending} pend.</span>
                  </div>
                </div>
                <div className="w-full bg-[#F4F7FB] rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${s.pending > 2 ? "bg-amber-400" : "bg-[#1B6CA8]"}`}
                    style={{ width: `${patients.length > 0 ? (s.pending / patients.length) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Avg time per specialty */}
        <div className="bg-white rounded-2xl border border-[rgba(27,108,168,0.1)] shadow-sm p-5">
          <h3 className="font-bold text-[#1A2332] mb-4 flex items-center gap-2 text-sm" style={{ fontFamily: "'Nunito', sans-serif" }}>
            <Clock size={14} className="text-[#2DB5A3]" /> Tempo médio por especialidade
          </h3>
          <div className="space-y-2.5">
            {targets.map(({ name, minutes, target }) => {
              const pct = Math.min(Math.round((minutes / target) * 100), 100);
              const over = minutes > target;
              return (
                <div key={name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-[#1A2332] truncate max-w-[110px]">{name}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-xs font-bold ${over ? "text-amber-600" : "text-emerald-600"}`}>
                        {minutes} min
                      </span>
                      {over
                        ? <span className="text-[9px] font-bold text-amber-500 bg-amber-50 border border-amber-200 px-1 rounded-full">↑ acima</span>
                        : <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1 rounded-full">ok</span>}
                    </div>
                  </div>
                  <div className="w-full bg-[#F4F7FB] rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full transition-all ${over ? "bg-amber-400" : "bg-[#2DB5A3]"}`}
                      style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[9px] text-[#9AAABB] mt-0.5">Meta: {target} min</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status overview */}
        <div className="bg-white rounded-2xl border border-[rgba(27,108,168,0.1)] shadow-sm p-5">
          <h3 className="font-bold text-[#1A2332] mb-4 flex items-center gap-2 text-sm" style={{ fontFamily: "'Nunito', sans-serif" }}>
            <Activity size={14} className="text-[#1B6CA8]" /> Andamento geral
          </h3>
          <div className="space-y-3">
            {patients.map(p => {
              const done = p.specialties.filter(s => s.status === "atendido").length;
              const total = p.specialties.filter(s => s.status !== "nao-se-aplica").length;
              const pct = Math.round((done / total) * 100);
              return (
                <div key={p.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-[#1A2332] truncate max-w-[160px]">{p.name}</span>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={p.status} />
                      <span className="text-xs text-[#9AAABB] font-medium">{pct}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-[#F4F7FB] rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full transition-all ${p.status === "finalizado" ? "bg-emerald-500" : "bg-[#1B6CA8]"}`}
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Patient list */}
      <div className="bg-white rounded-2xl border border-[rgba(27,108,168,0.1)] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#EEF2F7] flex items-center justify-between">
          <h3 className="font-bold text-[#1A2332] text-sm" style={{ fontFamily: "'Nunito', sans-serif" }}>Todos os pacientes</h3>
          <span className="text-xs text-[#9AAABB]">Atualizado às 11:24</span>
        </div>
        <div className="divide-y divide-[#F4F7FB]">
          {PATIENTS.map(p => {
            const pend = p.specialties.filter(s => s.status === "pendente").length;
            const elapsed = calcElapsed(p.arrivalTime, p);
            return (
              <div key={p.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-[#F9FBFE] transition-colors">
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onOpenPatient(p)}>
                  <p className="font-semibold text-sm text-[#1B6CA8] hover:underline truncate">{p.name}</p>
                  <p className="text-xs text-[#9AAABB]">{p.id} · {p.diagnosis}</p>
                </div>
                <div className="hidden sm:flex items-center gap-3">
                  <div className="text-right">
                    <p className={`text-sm font-bold ${elapsed.color}`}>{elapsed.label}</p>
                    <p className="text-[10px] text-[#9AAABB]">desde {p.arrivalTime}</p>
                  </div>
                  {pend > 0 && <span className="text-xs text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">{pend} pend.</span>}
                  <StatusBadge status={p.status} />
                </div>
                <button onClick={() => onOpenPatient(p)}
                  className="p-2 rounded-xl hover:bg-[#E8F4FD] transition text-[#1B6CA8]">
                  <Eye size={16} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard API helpers (Issue 5) ─────────────────────────────────────────

function mapEtapaStatus(s: string): SpecStatus {
  switch (s) {
    case "EM_ATENDIMENTO": return "em-atendimento";
    case "ATENDIDO": return "atendido";
    case "NAO_SE_APLICA": return "nao-se-aplica";
    default: return "pendente";
  }
}

function mapJornadaStatus(s: string): Patient["status"] {
  switch (s) {
    case "EM_ATENDIMENTO": return "em-atendimento";
    case "FINALIZADA":     return "finalizado";
    case "CANCELADA":      return "finalizado";
    default:               return "aguardando";
  }
}

function apiItemToPaciente(item: DashboardJornadaItem): Patient {
  const etapas = [...item.etapas].sort((a, b) => a.ordem - b.ordem);
  const specialties: Specialty[] = etapas.map(e => ({
    id:            e.area_id,
    name:          e.nome_area,
    status:        mapEtapaStatus(e.status),
    professional:  e.profissional_nome ?? undefined,
    startTime:     e.iniciada_em ? new Date(e.iniciada_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : undefined,
    completedTime: e.finalizada_em ? new Date(e.finalizada_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : undefined,
  }));

  const chegadaStr = item.chegada_em
    ? new Date(item.chegada_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const dataStr = item.chegada_em
    ? new Date(item.chegada_em).toLocaleDateString("pt-BR")
    : new Date().toLocaleDateString("pt-BR");

  return {
    id:               item.jornada_id,
    name:             item.paciente_nome,
    age:              calcularIdade(item.paciente_data_nascimento),
    cpf:              item.paciente_cpf,
    cid:              "",
    diagnosis:        item.diagnostico ?? "",
    status:           mapJornadaStatus(item.jornada_status),
    arrivalTime:      chegadaStr,
    date:             dataStr,
    origin:           "Recepção Central",
    emergencyContact: "Não informado",
    specialties,
    weight:           "",
    height:           "",
    // legado
    email:            "",
    phone:            "",
    address:          "",
  } as Patient;
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [patientsList, setPatientsList] = useState<Patient[]>(() => loadStoredPatients(PATIENTS));
  const [screen, setScreen] = useState<Screen>("login");
  const [role, setRole] = useState<Role | null>(null);
  const [originScreen, setOriginScreen] = useState<Screen | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient>(() => loadStoredPatients(PATIENTS)[0] || PATIENTS[0]);
  const [selectedSpec, setSelectedSpec] = useState<string>("nutricao");
  const [targets, setTargets] = useState<SpecTarget[]>(DEFAULT_TARGETS.map(t => ({ ...t })));
  const [patientDocs, setPatientDocs] = useState<PatientDocument[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>(() => loadStoredProfessionals(INITIAL_PROFESSIONALS));
  const [currentUser, setCurrentUser] = useState<{ name: string; role: Role; email: string; specialty?: string } | null>(null);

  // ─── Polling em tempo real: busca jornadas do dia a cada 30s ──────────────
  useEffect(() => {
    let cancelled = false;

    async function fetchDashboard() {
      try {
        const items = await api.getDashboardJornadas();
        if (!cancelled && items.length > 0) {
          setPatientsList(items.map(apiItemToPaciente));
        }
      } catch {
        // Silenciosamente ignora erros de rede — mantém dados locais
      }
    }

    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  const [readNotifIds, setReadNotifIds] = useState<Set<string>>(new Set());
  const baseNotifications = buildNotifications(patientsList);
  const notifications: AppNotification[] = baseNotifications.map(n => ({ ...n, read: readNotifIds.has(n.id) }));
  function markAllRead() { setReadNotifIds(new Set(baseNotifications.map(n => n.id))); }

  function handleLogin(r: Role, email?: string) {
    setRole(r);
    const emailNorm = email?.trim().toLowerCase();
    let matchedPro = emailNorm ? professionals.find(p => p.email.toLowerCase() === emailNorm) : undefined;
    if (!matchedPro) {
      const roleMap: Record<Role, string> = {
        recepcao: "Recepção",
        profissional: "Profissional",
        coordenacao: "Coordenação",
        administrador: "Coordenação",
      };
      matchedPro = professionals.find(p => p.role === roleMap[r]);
    }
    const defaultNames: Record<Role, string> = {
      recepcao: "Carla Santos",
      profissional: "Enfª. Patrícia Lima",
      coordenacao: "Ana Lima",
      administrador: "Administrador HUB",
    };
    setCurrentUser({
      name: matchedPro?.name || defaultNames[r],
      role: r,
      email: matchedPro?.email || (email || `${r}@hospital.com.br`),
      specialty: matchedPro?.specialty !== "—" ? matchedPro?.specialty : undefined,
    });
    setOriginScreen(null);
    setScreen(
      r === "recepcao"
        ? "reception-dashboard"
        : r === "administrador"
          ? "professionals-management"
          : r === "coordenacao"
            ? "coordination-dashboard"
            : "professional-dashboard"
    );
  }

  function handleLogout() {
    setRole(null);
    setCurrentUser(null);
    setOriginScreen(null);
    setScreen("login");
  }

  function openPatient(p: Patient) {
    setOriginScreen(screen);
    setSelectedPatient(p);
    setScreen("patient-record");
  }

  const [specMode, setSpecMode] = useState<"fill" | "edit">("fill");

  function openSpecialty(specId: string, mode: "fill" | "edit" = "fill") {
    setSelectedSpec(specId);
    setSpecMode(mode);
    setScreen("specialty-form");
  }

  function handleSaveProfessional(data: Omit<Professional, "id">, editId?: string): { success: boolean; error?: string } {
    const emailNorm = data.email.trim().toLowerCase();
    const duplicate = professionals.find(p => p.email.toLowerCase() === emailNorm && p.id !== editId);
    if (duplicate) {
      return { success: false, error: "Já existe um profissional cadastrado com este e-mail." };
    }
    if (editId) {
      const updated = professionals.map(p => p.id === editId ? { ...p, ...data } : p);
      setProfessionals(updated);
      saveStoredProfessionals(updated);
    } else {
      const newId = `PRO-${String(professionals.length + 1).padStart(3, "0")}`;
      const updated = [...professionals, { id: newId, ...data }];
      setProfessionals(updated);
      saveStoredProfessionals(updated);
    }
    return { success: true };
  }

  function handleToggleProfessionalStatus(id: string) {
    const updated = professionals.map(p => p.id === id ? { ...p, status: (p.status === "ativo" ? "inativo" : "ativo") as "ativo" | "inativo" } : p);
    setProfessionals(updated);
    saveStoredProfessionals(updated);
  }

  function handleSaveForm(specId: string, answers: Record<string, string>, status: SpecStatus) {
    const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const userName = currentUser?.name || nomeExibicaoPorPerfil(role);

    setPatientsList(prev => {
      const pIndex = prev.findIndex(p => p.id === selectedPatient.id);
      if (pIndex === -1) return prev;

      const p = prev[pIndex];
      const newSpecialties = p.specialties.map(s => {
        if (s.id !== specId) return s;
        return {
          ...s,
          status,
          completedTime: status === "atendido" ? time : s.completedTime,
          professional: status === "atendido" || status === "em-atendimento" ? userName : s.professional
        };
      });

      const newFormAnswers = {
        ...(p.formAnswers || {}),
        [specId]: {
          ...(p.formAnswers?.[specId] || {}),
          ...answers,
          _updatedAt: time
        }
      };

      // Recalcula a lista inteira de alertas a partir das respostas de todas
      // as especialidades (fonte única — ver frontend/src/app/alerts).
      // Preserva o status ("ciente"/"resolvido") que o profissional já tiver
      // registrado para um alerta que continua valendo.
      const previousAlerts = p.alerts || [];
      const freshAlerts = generatePatientAlerts(newFormAnswers, () => new Date().toLocaleString('pt-BR'));
      const newAlerts = freshAlerts.map(fresh => {
        const prevAlert = previousAlerts.find(a => a.id === fresh.id);
        if (prevAlert?.status && prevAlert.status !== 'aberto') {
          return { ...fresh, status: prevAlert.status, createdAt: prevAlert.createdAt ?? fresh.createdAt, resolvedBy: prevAlert.resolvedBy, resolvedAt: prevAlert.resolvedAt };
        }
        return fresh;
      });

      const updatedPatient = { ...p, status: statusGeralDoPaciente(newSpecialties), specialties: newSpecialties, formAnswers: newFormAnswers, alerts: newAlerts };
      if (answers.Peso) updatedPatient.weight = answers.Peso;
      if (answers.Altura) updatedPatient.height = answers.Altura;

      setSelectedPatient(updatedPatient);
      // mutate global PATIENTS as well so other components reading it pick it up if they aren't fully migrated
      PATIENTS[PATIENTS.findIndex(px => px.id === p.id)] = updatedPatient;

      const newList = [...prev];
      newList[pIndex] = updatedPatient;
      saveStoredPatients(newList);
      clearFormDraft(p.id, specId);
      return newList;
    });
    setScreen("patient-record");
  }

  function handleAcknowledgeAlert(alertId: string) {
    setPatientsList(prev => {
      const pIndex = prev.findIndex(p => p.id === selectedPatient?.id);
      if (pIndex === -1) return prev;

      const p = prev[pIndex];
      const newAlerts = (p.alerts || []).map(a => a.id === alertId ? { ...a, status: 'ciente' as const } : a);
      const updatedPatient = { ...p, alerts: newAlerts };

      setSelectedPatient(updatedPatient);
      PATIENTS[PATIENTS.findIndex(px => px.id === p.id)] = updatedPatient;

      const newList = [...prev];
      newList[pIndex] = updatedPatient;
      saveStoredPatients(newList);
      return newList;
    });
  }

  // Equipe do usuário logado (ex.: "Nutrição"). O login ainda não informa;
  // enquanto for null, resolver pendência pede confirmação de equipe.
  const equipeUsuario: string | null = null;

  function handleSetAplicavel(specId: string, aplicavel: boolean) {
    setPatientsList(prev => {
      const pIndex = prev.findIndex(p => p.id === selectedPatient?.id);
      if (pIndex === -1) return prev;

      const p = prev[pIndex];
      const newSpecialties = p.specialties.map(s => s.id !== specId ? s : {
        ...s,
        status: (aplicavel ? "pendente" : "nao-se-aplica") as SpecStatus,
        completedTime: undefined,
      });
      const updatedPatient = { ...p, specialties: newSpecialties, status: statusGeralDoPaciente(newSpecialties) };

      setSelectedPatient(updatedPatient);
      PATIENTS[PATIENTS.findIndex(px => px.id === p.id)] = updatedPatient;

      const newList = [...prev];
      newList[pIndex] = updatedPatient;
      saveStoredPatients(newList);
      return newList;
    });
  }

  function handleCheckinChange(patientId: string, registro: CheckinRecord) {
    setPatientsList(prev => {
      const pIndex = prev.findIndex(p => p.id === patientId);
      if (pIndex === -1) return prev;
      const updatedPatient = { ...prev[pIndex], checkin: registro };
      PATIENTS[PATIENTS.findIndex(px => px.id === patientId)] = updatedPatient;
      const newList = [...prev];
      newList[pIndex] = updatedPatient;
      saveStoredPatients(newList);
      return newList;
    });
  }

  function handlePdfExported(registro: PdfExportRecord) {
    setPatientsList(prev => {
      const pIndex = prev.findIndex(p => p.id === selectedPatient?.id);
      if (pIndex === -1) return prev;

      const p = prev[pIndex];
      const updatedPatient = { ...p, pdfExports: [...(p.pdfExports || []), registro] };

      setSelectedPatient(updatedPatient);
      PATIENTS[PATIENTS.findIndex(px => px.id === p.id)] = updatedPatient;

      const newList = [...prev];
      newList[pIndex] = updatedPatient;
      saveStoredPatients(newList);
      return newList;
    });
  }

  function handleResolvePendency(alertId: string) {
    setPatientsList(prev => {
      const pIndex = prev.findIndex(p => p.id === selectedPatient?.id);
      if (pIndex === -1) return prev;

      const p = prev[pIndex];
      const resolvedAt = new Date().toLocaleString('pt-BR');
      const resolvedBy = currentUser?.name || nomeExibicaoPorPerfil(role);
      const newAlerts = (p.alerts || []).map(a => a.id === alertId ? { ...a, status: 'resolvido' as const, resolvedBy, resolvedAt } : a);
      const updatedPatient = { ...p, alerts: newAlerts };

      setSelectedPatient(updatedPatient);
      PATIENTS[PATIENTS.findIndex(px => px.id === p.id)] = updatedPatient;

      const newList = [...prev];
      newList[pIndex] = updatedPatient;
      saveStoredPatients(newList);
      return newList;
    });
  }

  const getScreenTitle = () => {
    const titles: Partial<Record<Screen, string>> = {
      "reception-dashboard": "Painel da Recepção",
      "patient-registration": "Cadastro de Paciente",
      "professional-dashboard": "Pacientes em Acolhimento",
      "patient-record": selectedPatient?.name ?? "Ficha do Paciente",
      "specialty-form": `Formulário – ${SPEC_NAMES[SPEC_IDS.indexOf(selectedSpec)] ?? ""}`,
      "consolidated-record": "Ficha Consolidada",
      "coordination-dashboard": "Painel de Coordenação",
      "professionals-management": "Gestão de Profissionais",
      "time-targets": "Metas de Tempo por Especialidade",
      "forms-list": "Formulários por Especialidade",
    };
    return titles[screen] ?? "Central de Acolhimento";
  };

  if (screen === "login") return <LoginScreen onLogin={handleLogin} onPublicJourney={() => setScreen("public-journey")} professionals={professionals} />;
  if (screen === "public-journey") return <PublicJourneyScreen onBack={() => setScreen("login")} />;

  const BACK_MAP: Partial<Record<Screen, Screen>> = {
    "patient-registration": "reception-dashboard",
    "specialty-form": "patient-record",
    "consolidated-record": "patient-record",
    "professionals-management": role === "coordenacao" ? "coordination-dashboard" : undefined,
    "time-targets": "coordination-dashboard",
    "patient-record": (originScreen && originScreen !== "patient-record") ? originScreen : (role === "recepcao"
      ? "reception-dashboard"
      : role === "coordenacao" || role === "administrador"
        ? "coordination-dashboard"
        : "professional-dashboard"),
  };

  const goBack = () => {
    const dest = BACK_MAP[screen];
    if (dest) {
      setScreen(dest);
      if (screen === "patient-record") setOriginScreen(null);
    }
  };

  const showBack = screen in BACK_MAP && Boolean(BACK_MAP[screen]);

  return (
    <AppLayout
      role={role!}
      screen={screen}
      onNavigate={s => { setOriginScreen(null); setScreen(s); }}
      onLogout={handleLogout}
      title={getScreenTitle()}
      onBack={showBack ? goBack : undefined}
      notifications={notifications}
      onMarkAllRead={markAllRead}
      userName={currentUser?.name}
    >
      {screen === "reception-dashboard" && <ReceptionDashboard onNavigate={setScreen} onOpenPatient={openPatient} onAddDoc={doc => setPatientDocs(ds => [...ds, doc])} patients={patientsList} onCheckinChange={handleCheckinChange} />}
      {screen === "patient-registration" && <PatientRegistrationScreen onBack={goBack} onSaved={p => { setPatientsList(prev => { const next = [p, ...prev]; saveStoredPatients(next); return next; }); PATIENTS.unshift(p); setSelectedPatient(p); setScreen("patient-record"); }} />}
      {screen === "professional-dashboard" && <ProfessionalDashboard onOpenPatient={openPatient} patients={patientsList} />}


      {screen === "coordination-dashboard" && <CoordinationDashboard onOpenPatient={openPatient} targets={targets} patients={patientsList} />}
      {screen === "professionals-management" && <ProfessionalsManagement professionals={professionals} onSaveProfessional={handleSaveProfessional} onToggleStatus={handleToggleProfessionalStatus} />}
      {screen === "forms-list" && <FormsListScreen onOpenPatient={openPatient} />}
      {screen === "time-targets" && <TimeTargetsScreen targets={targets} onChange={setTargets} />}
      {screen === "patient-record" && <PatientRecordScreen patient={selectedPatient} onOpenSpecialty={openSpecialty} onConsolidated={() => setScreen("consolidated-record")} docs={patientDocs.filter(d => d.patientId === selectedPatient.id)} onDeleteDoc={id => setPatientDocs(ds => ds.filter(d => d.id !== id))} role={role} onAcknowledgeAlert={handleAcknowledgeAlert} onResolvePendency={handleResolvePendency} equipeUsuario={equipeUsuario} onPdfExported={handlePdfExported} onSetAplicavel={handleSetAplicavel} />}
      {screen === "specialty-form" && <SpecialtyFormScreen key={`${selectedPatient.id}-${selectedSpec}`} patient={selectedPatient} specId={selectedSpec} mode={specMode} onBack={goBack} onSave={handleSaveForm} />}
      {screen === "consolidated-record" && <ConsolidatedRecordScreen patient={selectedPatient} onBack={goBack} role={role} onPdfExported={handlePdfExported} currentUser={currentUser} />}

      {/* Global Critical Alert */}
      {selectedPatient && ["patient-record", "specialty-form", "consolidated-record"].includes(screen) && (
        <GlobalCriticalAlert alerts={filterAlertsForRole(selectedPatient.alerts || [], role)} />
      )}
    </AppLayout>
  );
}
