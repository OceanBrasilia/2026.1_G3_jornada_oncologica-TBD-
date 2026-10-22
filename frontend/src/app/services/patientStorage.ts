/**
 * Gerenciador de persistência local (localStorage) para pacientes e rascunhos de formulários.
 * Atende aos requisitos RF-025 e RNF-009 (salvamento de rascunho e resiliência a F5/offline).
 */

const STORAGE_KEY = "jornada_oncologica_patients_v1";
const DRAFT_PREFIX = "jornada_oncologica_draft_";

export function loadStoredPatients<T>(defaultPatients: T[]): T[] {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return defaultPatients;
    }
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultPatients;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed as T[];
    }
    return defaultPatients;
  } catch (err) {
    console.warn("Não foi possível carregar dados salvos do localStorage:", err);
    return defaultPatients;
  }
}

export function saveStoredPatients<T>(patients: T[]): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
  } catch (err) {
    console.warn("Não foi possível salvar dados no localStorage:", err);
  }
}

export function saveFormDraft(patientId: string, specId: string, answers: Record<string, string>): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    const key = `${DRAFT_PREFIX}${patientId}_${specId}`;
    window.localStorage.setItem(key, JSON.stringify({
      answers,
      savedAt: new Date().toISOString(),
    }));
  } catch (err) {
    console.warn("Não foi possível salvar rascunho no localStorage:", err);
  }
}

export interface FormDraftResult {
  answers: Record<string, string>;
  savedAt?: string;
}

export function loadFormDraftWithMeta(patientId: string, specId: string): FormDraftResult | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const key = `${DRAFT_PREFIX}${patientId}_${specId}`;
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.answers) return null;
    return {
      answers: parsed.answers,
      savedAt: parsed.savedAt,
    };
  } catch {
    return null;
  }
}

export function loadFormDraft(patientId: string, specId: string): Record<string, string> | null {
  const meta = loadFormDraftWithMeta(patientId, specId);
  return meta?.answers ?? null;
}

export function clearFormDraft(patientId: string, specId: string): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    const key = `${DRAFT_PREFIX}${patientId}_${specId}`;
    window.localStorage.removeItem(key);
  } catch {
    // Ignora erro
  }
}

export function resetStoredPatients<T>(defaultPatients: T[]): T[] {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(STORAGE_KEY);
      // Limpa rascunhos antigos
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith(DRAFT_PREFIX)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => window.localStorage.removeItem(k));
    }
  } catch (err) {
    console.warn("Erro ao redefinir localStorage:", err);
  }
  return defaultPatients;
}
