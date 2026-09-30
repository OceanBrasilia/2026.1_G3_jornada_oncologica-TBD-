import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { DadoGeral, DivergenciaCampo, LinhaDetalhe, ResumoNutricao, ResumoPsicologia } from "../consolidado/buildConsolidatedView";

const styles = StyleSheet.create({
  page: { padding: 32, paddingBottom: 48, fontSize: 9, fontFamily: "Helvetica", color: "#1A2332" },
  header: { marginBottom: 12, borderBottomWidth: 2, borderBottomColor: "#1A2332", paddingBottom: 8 },
  systemName: { fontSize: 8, color: "#6B7A8D", textTransform: "uppercase", letterSpacing: 1 },
  title: { fontSize: 16, fontFamily: "Helvetica-Bold", marginTop: 2 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 6 },
  metaItem: { fontSize: 8, color: "#6B7A8D", marginRight: 14, marginBottom: 2 },
  section: { marginBottom: 10 },
  sectionTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", marginBottom: 6, borderBottomWidth: 1, borderBottomColor: "#D5E6F3", paddingBottom: 3 },
  row: { flexDirection: "row", marginBottom: 4 },
  rowLabel: { width: 160, color: "#6B7A8D", fontFamily: "Helvetica-Bold" },
  rowValue: { flex: 1 },
  specCard: { marginBottom: 10, borderWidth: 1, borderColor: "#D5E6F3", borderRadius: 4, padding: 8 },
  specHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6, alignItems: "center" },
  specName: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  specMeta: { fontSize: 8, color: "#6B7A8D" },
  resumoBox: { backgroundColor: "#F2FAF9", borderWidth: 1, borderColor: "#D3EFEA", borderRadius: 4, padding: 6, marginBottom: 6 },
  divergenceCard: { backgroundColor: "#FFFBEB", borderWidth: 1, borderColor: "#FCD34D", borderRadius: 4, padding: 6, marginBottom: 6 },
  emptyText: { fontStyle: "italic", color: "#9AAABB" },
  footer: { position: "absolute", bottom: 20, left: 32, right: 32, fontSize: 7, color: "#9AAABB", textAlign: "center", borderTopWidth: 1, borderTopColor: "#EEF2F7", paddingTop: 4 },
  pageNumber: { position: "absolute", bottom: 20, right: 32, fontSize: 7, color: "#9AAABB" },
});

export interface EspecialidadePdf {
  nome: string;
  status: string;
  profissional?: string;
  horario?: string;
  detalhes: LinhaDetalhe[];
  resumoNutricao?: ResumoNutricao | null;
  resumoPsicologia?: ResumoPsicologia | null;
}

export interface FichaConsolidadaPdfProps {
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
  /** Número da exportação deste paciente (1, 2, 3…) — RF-018. */
  versao: number;
  exportadoPor: string;
  dadosCompartilhados: DadoGeral[];
  divergencias: { campo: string; label: string; valor: string; origem: string; outrasRespostas: DivergenciaCampo[] }[];
  especialidades: EspecialidadePdf[];
}

/** Documento PDF da Ficha Consolidada (RF-018) — gerado com @react-pdf/renderer (vetorial, texto selecionável). */
export function FichaConsolidadaPdf({ patient, geradoEm, versao, exportadoPor, dadosCompartilhados, divergencias, especialidades }: FichaConsolidadaPdfProps) {
  return (
    <Document title={`Ficha Consolidada - ${patient.id}`}>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header} fixed>
          <Text style={styles.systemName}>Jornada Conectada — Acolhimento Oncológico HUB</Text>
          <Text style={styles.title}>Ficha Consolidada Multidisciplinar</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaItem}>Paciente: {patient.name} ({patient.id})</Text>
            <Text style={styles.metaItem}>{patient.age} anos</Text>
            <Text style={styles.metaItem}>{patient.diagnosis} · CID {patient.cid}</Text>
            <Text style={styles.metaItem}>Chegada: {patient.date} às {patient.arrivalTime}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaItem}>Versão do documento: {versao}</Text>
            <Text style={styles.metaItem}>Gerado em {geradoEm}</Text>
            <Text style={styles.metaItem}>Exportado por: {exportadoPor}</Text>
          </View>
        </View>

        {dadosCompartilhados.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dados compartilhados entre especialidades</Text>
            {dadosCompartilhados.map(d => (
              <View style={styles.row} key={d.campo} wrap={false}>
                <Text style={styles.rowLabel}>{d.label}</Text>
                <Text style={styles.rowValue}>{d.valor} ({d.origem})</Text>
              </View>
            ))}
          </View>
        )}

        {divergencias.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Alertas de divergência</Text>
            {divergencias.map(d => (
              <View style={styles.divergenceCard} key={d.campo} wrap={false}>
                <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 2 }}>{d.label}</Text>
                <Text>{d.origem}: {d.valor}</Text>
                {d.outrasRespostas.map((r, i) => (
                  <Text key={i}>{r.especialidades.join(", ")}: {r.valor}</Text>
                ))}
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Evolução e conduta por especialidade</Text>
          {especialidades.map(sp => (
            <View style={styles.specCard} key={sp.nome}>
              <View style={styles.specHeader} wrap={false}>
                <Text style={styles.specName}>{sp.nome} — {sp.status}</Text>
                {(sp.profissional || sp.horario) && (
                  <Text style={styles.specMeta}>{sp.profissional}{sp.horario ? ` · ${sp.horario}` : ""}</Text>
                )}
              </View>

              {sp.resumoNutricao && (
                <View style={styles.resumoBox} wrap={false}>
                  <Text>IMC: {sp.resumoNutricao.imc}{sp.resumoNutricao.imc !== "—" ? " kg/m²" : ""} ({sp.resumoNutricao.imcFormula})</Text>
                  <Text>ASG-PPP: {sp.resumoNutricao.asgTotal} pontos — {sp.resumoNutricao.asgTriage.text}</Text>
                </View>
              )}
              {sp.resumoPsicologia && (
                <View style={styles.resumoBox} wrap={false}>
                  <Text>IRPO: {sp.resumoPsicologia.irpoTotal} pontos ({sp.resumoPsicologia.respondidas}/27 questões){sp.resumoPsicologia.irpoRisk ? ` — ${sp.resumoPsicologia.irpoRisk.level}` : ""}</Text>
                  {sp.resumoPsicologia.irpoRisk && <Text>{sp.resumoPsicologia.irpoRisk.indication}</Text>}
                </View>
              )}

              {sp.detalhes.length === 0 ? (
                <Text style={styles.emptyText}>Sem registros detalhados.</Text>
              ) : (
                sp.detalhes.map(d => (
                  <View style={styles.row} key={d.campo} wrap={false}>
                    <Text style={styles.rowLabel}>{d.label}</Text>
                    <Text style={styles.rowValue}>{d.valor}</Text>
                  </View>
                ))
              )}
            </View>
          ))}
        </View>

        <Text style={styles.footer} fixed>
          Documento de apoio ao acolhimento — não substitui o prontuário oficial
        </Text>
        <Text
          style={styles.pageNumber}
          fixed
          render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
        />
      </Page>
    </Document>
  );
}
