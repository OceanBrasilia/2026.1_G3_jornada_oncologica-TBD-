import { describe, expect, it } from "vitest";
import { agruparChipsPorEixo } from "./Level3Chips";
import { AlertCategory, AlertLevel, PatientAlert } from "../../types/alerts";

const alerta = (id: string, category: AlertCategory, level: AlertLevel[], active = true): PatientAlert =>
  ({ id, category, level, title: id, description: id, active });

describe("agruparChipsPorEixo", () => {
  it("junta dois alertas do mesmo eixo num único chip", () => {
    const grupos = agruparChipsPorEixo([
      alerta("asg", AlertCategory.CLINICAL_RISK, [AlertLevel.LEVEL_2, AlertLevel.LEVEL_3, AlertLevel.LEVEL_4]),
      alerta("disfagia", AlertCategory.CLINICAL_RISK, [AlertLevel.LEVEL_3]),
      alerta("dor", AlertCategory.SEVERE_SYMPTOMS, [AlertLevel.LEVEL_2, AlertLevel.LEVEL_3]),
    ]);
    expect(grupos.map(([eixo, lista]) => [eixo, lista.length])).toEqual([
      [AlertCategory.CLINICAL_RISK, 2],
      [AlertCategory.SEVERE_SYMPTOMS, 1],
    ]);
  });

  it("ignora alertas inativos e alertas sem Nível 3", () => {
    const grupos = agruparChipsPorEixo([
      alerta("inativo", AlertCategory.CLINICAL_RISK, [AlertLevel.LEVEL_3], false),
      alerta("so-nivel-1", AlertCategory.PSYCHOSOCIAL_RISK, [AlertLevel.LEVEL_1]),
    ]);
    expect(grupos).toEqual([]);
  });

  it("segue a ordem dos eixos da Nota Técnica", () => {
    const grupos = agruparChipsPorEixo([
      alerta("psi", AlertCategory.PSYCHOSOCIAL_RISK, [AlertLevel.LEVEL_3]),
      alerta("disp", AlertCategory.DEVICE_USAGE, [AlertLevel.LEVEL_3]),
      alerta("clin", AlertCategory.CLINICAL_RISK, [AlertLevel.LEVEL_3]),
    ]);
    expect(grupos.map(([eixo]) => eixo)).toEqual([
      AlertCategory.CLINICAL_RISK,
      AlertCategory.DEVICE_USAGE,
      AlertCategory.PSYCHOSOCIAL_RISK,
    ]);
  });
});
