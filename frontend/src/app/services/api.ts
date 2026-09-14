// ─── API Client Service ────────────────────────────────────────────────────────

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface ApiPatient {
  id: string;
  codigo_publico: string;
  nome_completo: string;
  data_nascimento: string;
  cpf: string;
  name?: string;
  email?: string;
  diagnosis?: string;
  treatment_stage?: string;
  created_at: string;
}

export interface PatientCreatePayload {
  codigo_publico?: string;
  nome_completo: string;
  data_nascimento: string;
  cpf: string;
  name?: string;
  email?: string;
  diagnosis?: string;
  treatment_stage?: string;
  phone?: string;
  address?: string;
  emergency?: string;
  companion?: string;
  cid?: string;
  origin?: string;
  cns?: string;
}

export interface PublicJourneyStep {
  id: string;
  area_id: string;
  nome: string;
  status: 'PENDENTE' | 'EM_ATENDIMENTO' | 'ATENDIDO' | 'NAO_SE_APLICA';
  ordem: number;
  iniciada_em?: string | null;
  finalizada_em?: string | null;
}

export interface PublicJourneyResponse {
  paciente: {
    id: string;
    codigo_publico: string;
    nome_completo: string;
    data_nascimento: string | null;
  };
  jornada: {
    id: string | null;
    codigo: string | null;
    status: string;
    data_acolhimento: string | null;
    etapas: PublicJourneyStep[];
  } | null;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let errorDetail = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData?.detail) {
        errorDetail = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
      }
    } catch {
      // Ignora erro no parse de JSON
    }
    throw new Error(errorDetail);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // Autenticação
  async login(email: string, password: string): Promise<LoginResponse> {
    return request<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // Pacientes
  async getPatients(skip = 0, limit = 100): Promise<ApiPatient[]> {
    return request<ApiPatient[]>(`/pacientes?skip=${skip}&limit=${limit}`);
  },

  async getPatientById(id: string): Promise<ApiPatient> {
    return request<ApiPatient>(`/pacientes/${id}`);
  },

  async createPatient(payload: PatientCreatePayload): Promise<ApiPatient> {
    return request<ApiPatient>('/pacientes', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Consulta Pública de Jornada
  async getPublicJourney(idOuNome: string): Promise<PublicJourneyResponse> {
    return request<PublicJourneyResponse>(`/pacientes/${encodeURIComponent(idOuNome)}/jornada`);
  },
};
