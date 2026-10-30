import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  Footer,
  PageNumber,
  ShadingType,
} from "docx";
import type { DadoGeral, DivergenciaCampo } from "../consolidado/buildConsolidatedView";
import type { EspecialidadePdf } from "../pdf/FichaConsolidadaPdf";
import { gerarNomeArquivoExportacao, type TipoConteudoExportacao } from "./nomeArquivo";

export interface ExportarDocxProps {
  patient: {
    id: string;
    name: string;
    age: number;
    diagnosis: string;
    cid: string;
    date: string;
    arrivalTime: string;
  };
  geradoEm: string;
  versao: number;
  exportadoPor: string;
  dadosCompartilhados: DadoGeral[];
  divergencias: { campo: string; label: string; valor: string; origem: string; outrasRespostas: DivergenciaCampo[] }[];
  especialidades: EspecialidadePdf[];
  tipo?: TipoConteudoExportacao;
  especialidadeNome?: string;
  nomeArquivo?: string;
}

export type ExportarDocxResultado = { ok: true; nomeArquivo: string } | { ok: false; erro: string };

const FONT_FAMILY = "Arial";
const COR_TITULO = "1A2332";
const COR_SECUNDARIA = "6B7A8D";
const COR_AZUL = "1B6CA8";
const COR_BORDA = "D5E6F3";
const COR_FUNDO_CABECALHO = "F4F7FB";
const COR_FUNDO_RESUMO = "F2FAF9";
const COR_BORDA_RESUMO = "D3EFEA";
const COR_FUNDO_DIVERGENCIA = "FFFBEB";
const COR_BORDA_DIVERGENCIA = "FCD34D";

const borderSuave = {
  style: BorderStyle.SINGLE,
  size: 1,
  color: COR_BORDA,
};

const semBordas = {
  top: { style: BorderStyle.NONE, size: 0, color: "auto" },
  bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
  left: { style: BorderStyle.NONE, size: 0, color: "auto" },
  right: { style: BorderStyle.NONE, size: 0, color: "auto" },
};

/**
 * Constrói e exporta um arquivo Word (.docx) estruturado para o atendimento do paciente,
 * respeitando os mesmos dados e divisões da Ficha Consolidada (RF-018).
 */
export async function exportarDocumentoDocx(props: ExportarDocxProps): Promise<ExportarDocxResultado> {
  try {
    const isEspecialidade = props.tipo === "especialidade";
    const tituloPrincipal = isEspecialidade
      ? `Ficha de Atendimento — ${props.especialidadeNome || props.especialidades[0]?.nome || "Especialidade"}`
      : "Ficha Consolidada Multidisciplinar";

    const nomeFinal =
      props.nomeArquivo ||
      gerarNomeArquivoExportacao({
        pacienteNome: props.patient.name,
        prontuario: props.patient.id,
        tipo: props.tipo ?? (props.especialidades.length === 1 && props.especialidadeNome ? "especialidade" : "completo"),
        especialidadeNome: props.especialidadeNome ?? (props.especialidades.length === 1 ? props.especialidades[0]?.nome : undefined),
        formato: "docx",
      });

    const children: (Paragraph | Table)[] = [];

    // 1. Cabeçalho institucional
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "JORNADA CONECTADA — ACOLHIMENTO ONCOLÓGICO HUB",
            font: FONT_FAMILY,
            size: 16, // 8pt
            color: COR_SECUNDARIA,
            bold: true,
          }),
        ],
        spacing: { after: 80 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: tituloPrincipal,
            font: FONT_FAMILY,
            size: 32, // 16pt
            bold: true,
            color: COR_TITULO,
          }),
        ],
        spacing: { after: 140 },
      })
    );

    // 2. Metadados do paciente em tabela limpa
    const metaTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: borderSuave,
        bottom: borderSuave,
        left: { style: BorderStyle.NONE, size: 0, color: "auto" },
        right: { style: BorderStyle.NONE, size: 0, color: "auto" },
        insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "auto" },
        insideVertical: { style: BorderStyle.NONE, size: 0, color: "auto" },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: "Paciente: ", font: FONT_FAMILY, size: 18, bold: true, color: COR_TITULO }),
                    new TextRun({ text: `${props.patient.name} (${props.patient.id})`, font: FONT_FAMILY, size: 18, color: COR_TITULO }),
                  ],
                  spacing: { after: 60 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: `${props.patient.age} anos · `, font: FONT_FAMILY, size: 18, color: COR_SECUNDARIA }),
                    new TextRun({ text: `${props.patient.diagnosis} (CID ${props.patient.cid})`, font: FONT_FAMILY, size: 18, color: COR_SECUNDARIA }),
                  ],
                  spacing: { after: 60 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: `Chegada: ${props.patient.date} às ${props.patient.arrivalTime}`, font: FONT_FAMILY, size: 18, color: COR_SECUNDARIA }),
                  ],
                }),
              ],
              margins: { top: 100, bottom: 100, left: 100, right: 100 },
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: `Versão do documento: ${props.versao}`, font: FONT_FAMILY, size: 18, color: COR_SECUNDARIA }),
                  ],
                  spacing: { after: 60 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: `Gerado em: ${props.geradoEm}`, font: FONT_FAMILY, size: 18, color: COR_SECUNDARIA }),
                  ],
                  spacing: { after: 60 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: `Exportado por: ${props.exportadoPor}`, font: FONT_FAMILY, size: 18, color: COR_SECUNDARIA }),
                  ],
                }),
              ],
              margins: { top: 100, bottom: 100, left: 100, right: 100 },
            }),
          ],
        }),
      ],
    });

    children.push(metaTable);
    children.push(new Paragraph({ spacing: { after: 200 } }));

    // 3. Dados compartilhados (apenas no documento completo ou se houver)
    if (!isEspecialidade && props.dadosCompartilhados && props.dadosCompartilhados.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Dados compartilhados entre especialidades",
              font: FONT_FAMILY,
              size: 22, // 11pt
              bold: true,
              color: COR_AZUL,
            }),
          ],
          spacing: { before: 180, after: 100 },
        })
      );

      const rowsCompartilhados = [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 35, type: WidthType.PERCENTAGE },
              shading: { fill: COR_FUNDO_CABECALHO, type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: "Campo", font: FONT_FAMILY, size: 18, bold: true, color: COR_TITULO })] })],
              margins: { top: 80, bottom: 80, left: 100, right: 100 },
            }),
            new TableCell({
              width: { size: 65, type: WidthType.PERCENTAGE },
              shading: { fill: COR_FUNDO_CABECALHO, type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: "Valor informado (Origem)", font: FONT_FAMILY, size: 18, bold: true, color: COR_TITULO })] })],
              margins: { top: 80, bottom: 80, left: 100, right: 100 },
            }),
          ],
        }),
        ...props.dadosCompartilhados.map(
          d =>
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 35, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ children: [new TextRun({ text: d.label, font: FONT_FAMILY, size: 18, bold: true, color: COR_SECUNDARIA })] })],
                  margins: { top: 60, bottom: 60, left: 100, right: 100 },
                }),
                new TableCell({
                  width: { size: 65, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ children: [new TextRun({ text: `${d.valor} (${d.origem})`, font: FONT_FAMILY, size: 18, color: COR_TITULO })] })],
                  margins: { top: 60, bottom: 60, left: 100, right: 100 },
                }),
              ],
            })
        ),
      ];

      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: borderSuave,
            bottom: borderSuave,
            left: borderSuave,
            right: borderSuave,
            insideHorizontal: borderSuave,
            insideVertical: borderSuave,
          },
          rows: rowsCompartilhados,
        })
      );
      children.push(new Paragraph({ spacing: { after: 200 } }));
    }

    // 4. Alertas de divergência (se houver, no completo)
    if (!isEspecialidade && props.divergencias && props.divergencias.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Alertas de divergência",
              font: FONT_FAMILY,
              size: 22,
              bold: true,
              color: "B45309",
            }),
          ],
          spacing: { before: 180, after: 100 },
        })
      );

      for (const d of props.divergencias) {
        const divRows: Paragraph[] = [
          new Paragraph({
            children: [new TextRun({ text: d.label, font: FONT_FAMILY, size: 18, bold: true, color: "92400E" })],
            spacing: { after: 40 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `${d.origem}: `, font: FONT_FAMILY, size: 18, bold: true, color: COR_TITULO }),
              new TextRun({ text: d.valor, font: FONT_FAMILY, size: 18, color: COR_TITULO }),
            ],
            spacing: { after: 40 },
          }),
        ];

        for (const r of d.outrasRespostas) {
          divRows.push(
            new Paragraph({
              children: [
                new TextRun({ text: `${r.especialidades.join(", ")}: `, font: FONT_FAMILY, size: 18, bold: true, color: COR_TITULO }),
                new TextRun({ text: r.valor, font: FONT_FAMILY, size: 18, color: COR_TITULO }),
              ],
              spacing: { after: 40 },
            })
          );
        }

        children.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: COR_BORDA_DIVERGENCIA },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: COR_BORDA_DIVERGENCIA },
              left: { style: BorderStyle.SINGLE, size: 1, color: COR_BORDA_DIVERGENCIA },
              right: { style: BorderStyle.SINGLE, size: 1, color: COR_BORDA_DIVERGENCIA },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: COR_FUNDO_DIVERGENCIA, type: ShadingType.CLEAR },
                    children: divRows,
                    margins: { top: 100, bottom: 100, left: 120, right: 120 },
                  }),
                ],
              }),
            ],
          })
        );
        children.push(new Paragraph({ spacing: { after: 100 } }));
      }
    }

    // 5. Especialidades (completo ou selecionada)
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: isEspecialidade ? "Registro da Especialidade" : "Evolução e conduta por especialidade",
            font: FONT_FAMILY,
            size: 22,
            bold: true,
            color: COR_AZUL,
          }),
        ],
        spacing: { before: 200, after: 120 },
      })
    );

    for (const sp of props.especialidades) {
      // Título da especialidade
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${sp.nome} — ${sp.status}`,
              font: FONT_FAMILY,
              size: 20,
              bold: true,
              color: COR_TITULO,
            }),
            sp.profissional || sp.horario
              ? new TextRun({
                  text: `   (${[sp.profissional, sp.horario].filter(Boolean).join(" · ")})`,
                  font: FONT_FAMILY,
                  size: 16,
                  color: COR_SECUNDARIA,
                })
              : new TextRun(""),
          ],
          spacing: { before: 160, after: 80 },
        })
      );

      // Card de Nutrição (se houver)
      if (sp.resumoNutricao) {
        const asgTexto =
          sp.resumoNutricao.asgPreenchido && sp.resumoNutricao.asgTotal !== null && sp.resumoNutricao.asgTriage
            ? `ASG-PPP: ${sp.resumoNutricao.asgTotal} pontos — ${sp.resumoNutricao.asgTriage.text}`
            : "ASG-PPP: Não preenchido";

        children.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: COR_BORDA_RESUMO },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: COR_BORDA_RESUMO },
              left: { style: BorderStyle.SINGLE, size: 1, color: COR_BORDA_RESUMO },
              right: { style: BorderStyle.SINGLE, size: 1, color: COR_BORDA_RESUMO },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: COR_FUNDO_RESUMO, type: ShadingType.CLEAR },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `IMC: ${sp.resumoNutricao.imc}${sp.resumoNutricao.imc !== "—" ? " kg/m²" : ""} (${sp.resumoNutricao.imcFormula})`,
                            font: FONT_FAMILY,
                            size: 18,
                            bold: true,
                            color: COR_AZUL,
                          }),
                        ],
                        spacing: { after: 40 },
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: asgTexto, font: FONT_FAMILY, size: 18, color: COR_TITULO })],
                      }),
                    ],
                    margins: { top: 80, bottom: 80, left: 100, right: 100 },
                  }),
                ],
              }),
            ],
          })
        );
        children.push(new Paragraph({ spacing: { after: 80 } }));
      }

      // Card de Psicologia (se houver)
      if (sp.resumoPsicologia) {
        const riskLevel = sp.resumoPsicologia.irpoRisk ? ` — ${sp.resumoPsicologia.irpoRisk.level}` : "";
        children.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: COR_BORDA_RESUMO },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: COR_BORDA_RESUMO },
              left: { style: BorderStyle.SINGLE, size: 1, color: COR_BORDA_RESUMO },
              right: { style: BorderStyle.SINGLE, size: 1, color: COR_BORDA_RESUMO },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: COR_FUNDO_RESUMO, type: ShadingType.CLEAR },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `IRPO: ${sp.resumoPsicologia.irpoTotal} pontos (${sp.resumoPsicologia.respondidas}/27 questões)${riskLevel}`,
                            font: FONT_FAMILY,
                            size: 18,
                            bold: true,
                            color: COR_AZUL,
                          }),
                        ],
                        spacing: { after: 40 },
                      }),
                      ...(sp.resumoPsicologia.irpoRisk
                        ? [
                            new Paragraph({
                              children: [new TextRun({ text: sp.resumoPsicologia.irpoRisk.indication, font: FONT_FAMILY, size: 18, color: COR_TITULO })],
                            }),
                          ]
                        : []),
                    ],
                    margins: { top: 80, bottom: 80, left: 100, right: 100 },
                  }),
                ],
              }),
            ],
          })
        );
        children.push(new Paragraph({ spacing: { after: 80 } }));
      }

      // Detalhes da especialidade
      if (sp.detalhes.length === 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "Sem registros detalhados.",
                font: FONT_FAMILY,
                size: 18,
                italics: true,
                color: COR_SECUNDARIA,
              }),
            ],
            spacing: { after: 120 },
          })
        );
      } else {
        const specTableRows = sp.detalhes.map(
          d =>
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 35, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ children: [new TextRun({ text: d.label, font: FONT_FAMILY, size: 18, bold: true, color: COR_SECUNDARIA })] })],
                  margins: { top: 60, bottom: 60, left: 100, right: 100 },
                }),
                new TableCell({
                  width: { size: 65, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ children: [new TextRun({ text: d.valor, font: FONT_FAMILY, size: 18, color: COR_TITULO })] })],
                  margins: { top: 60, bottom: 60, left: 100, right: 100 },
                }),
              ],
            })
        );

        children.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: borderSuave,
              bottom: borderSuave,
              left: borderSuave,
              right: borderSuave,
              insideHorizontal: borderSuave,
              insideVertical: borderSuave,
            },
            rows: specTableRows,
          })
        );
        children.push(new Paragraph({ spacing: { after: 140 } }));
      }
    }

    // Criação do Documento DOCX
    const doc = new Document({
      title: tituloPrincipal,
      description: `Exportação de documento clínico - ${props.patient.name} (${props.patient.id})`,
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1000,
                bottom: 1000,
                left: 1000,
                right: 1000,
              },
            },
          },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: "Documento de apoio ao acolhimento — não substitui o prontuário oficial  |  Página ",
                      font: FONT_FAMILY,
                      size: 16,
                      color: COR_SECUNDARIA,
                    }),
                    new TextRun({
                      children: [PageNumber.CURRENT],
                      font: FONT_FAMILY,
                      size: 16,
                      color: COR_SECUNDARIA,
                    }),
                    new TextRun({
                      text: " de ",
                      font: FONT_FAMILY,
                      size: 16,
                      color: COR_SECUNDARIA,
                    }),
                    new TextRun({
                      children: [PageNumber.TOTAL_PAGES],
                      font: FONT_FAMILY,
                      size: 16,
                      color: COR_SECUNDARIA,
                    }),
                  ],
                }),
              ],
            }),
          },
          children,
        },
      ],
    });

    // Gera o Blob e dispara o download no navegador
    const blob = await Packer.toBlob(doc);

    // Se estiver no navegador, dispara o download via link temporário
    if (typeof window !== "undefined" && typeof document !== "undefined" && window.URL?.createObjectURL) {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = nomeFinal;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }

    return { ok: true, nomeArquivo: nomeFinal };
  } catch (erro) {
    console.error("Falha ao gerar o arquivo DOCX:", erro);
    return { ok: false, erro: "Não foi possível gerar o arquivo Word (.docx) agora. Tente novamente em instantes." };
  }
}
