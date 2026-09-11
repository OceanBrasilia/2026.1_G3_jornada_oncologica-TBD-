import { describe, it, expect } from "vitest";
import { podeVerConfidencial, filterAlertsForRole } from "./visibleAlerts";
import { AlertCategory, AlertLevel, PatientAlert } from "../types/alerts";

describe("podeVerConfidencial", () => {
  it("profissional e coordenacao podem ver", () => {
    expect(podeVerConfidencial("profissional")).toBe(true);
    expect(podeVerConfidencial("coordenacao")).toBe(true);
  });

  it("recepcao e ausência de perfil (portal público) não podem ver", () => {
    expect(podeVerConfidencial("recepcao")).toBe(false);
    expect(podeVerConfidencial(null)).toBe(false);
  });
});

describe("filterAlertsForRole", () => {
  const alerts: PatientAlert[] = [
    { id: "a", category: AlertCategory.PSYCHOSOCIAL_RISK, level: [AlertLevel.LEVEL_3], title: "Confidencial", description: "", active: true, confidential: true },
    { id: "b", category: AlertCategory.ALLERGY, level: [AlertLevel.LEVEL_3], title: "Alergia", description: "", active: true },
  ];

  it("mostra tudo para profissional/coordenacao", () => {
    expect(filterAlertsForRole(alerts, "profissional")).toHaveLength(2);
  });

  it("esconde alertas confidenciais para recepcao e portal público", () => {
    expect(filterAlertsForRole(alerts, "recepcao").map(a => a.id)).toEqual(["b"]);
    expect(filterAlertsForRole(alerts, null).map(a => a.id)).toEqual(["b"]);
  });
});
