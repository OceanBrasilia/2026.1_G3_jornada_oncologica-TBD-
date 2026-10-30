import { describe, it, expect, beforeEach } from "vitest";
import {
  loadStoredPatients,
  saveStoredPatients,
  saveFormDraft,
  loadFormDraft,
  clearFormDraft,
  resetStoredPatients
} from "./patientStorage";

class MemoryStorage {
  private store: Record<string, string> = {};

  get length() {
    return Object.keys(this.store).length;
  }

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] ?? null;
  }
}

describe("patientStorage", () => {
  beforeEach(() => {
    const memStorage = new MemoryStorage();
    // @ts-expect-error Mocking global window.localStorage in node test environment
    globalThis.window = {
      localStorage: memStorage,
    };
  });

  it("carrega lista padrão quando localStorage está vazio", () => {
    const defaultList = [{ id: "1", name: "Paciente Teste" }];
    const res = loadStoredPatients(defaultList);
    expect(res).toEqual(defaultList);
  });

  it("salva e recupera lista de pacientes no localStorage", () => {
    const defaultList = [{ id: "1", name: "Paciente Teste" }];
    const updatedList = [{ id: "1", name: "Paciente Teste Alterado" }];
    saveStoredPatients(updatedList);

    const res = loadStoredPatients(defaultList);
    expect(res).toEqual(updatedList);
  });

  it("salva, carrega e limpa rascunho de formulário", () => {
    const patientId = "pac-123";
    const specId = "nutricao";
    const answers = { "Peso": "70", "Altura": "1.75" };

    expect(loadFormDraft(patientId, specId)).toBeNull();

    saveFormDraft(patientId, specId, answers);
    expect(loadFormDraft(patientId, specId)).toEqual(answers);

    clearFormDraft(patientId, specId);
    expect(loadFormDraft(patientId, specId)).toBeNull();
  });

  it("resetStoredPatients limpa pacientes e rascunhos retornando padrão", () => {
    const defaultList = [{ id: "1", name: "Padrão" }];
    saveStoredPatients([{ id: "1", name: "Alterado" }]);
    saveFormDraft("1", "nutricao", { "Peso": "80" });

    const res = resetStoredPatients(defaultList);
    expect(res).toEqual(defaultList);
    expect(loadStoredPatients(defaultList)).toEqual(defaultList);
    expect(loadFormDraft("1", "nutricao")).toBeNull();
  });
});
