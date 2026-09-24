import { Document, Page, Text, View, Font, StyleSheet } from '@react-pdf/renderer';
import type { PlanReport } from '@/lib/planning/reports';

const styles = StyleSheet.create({
  page: { paddingTop: 38, paddingBottom: 48, paddingHorizontal: 38, fontFamily: 'RupeeKitPlanning', fontSize: 9, color: '#15283b', lineHeight: 1.5 },
  eyebrow: { color: '#0f766e', fontSize: 10, fontWeight: 700, marginBottom: 9 },
  title: { fontSize: 22, fontWeight: 700, lineHeight: 1.2, marginBottom: 9 },
  subtitle: { color: '#526477', fontSize: 10, marginBottom: 18 },
  section: { marginTop: 16, marginBottom: 7, fontSize: 12, fontWeight: 700, color: '#0f615c' },
  line: { marginBottom: 6 },
  row: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#d9e2e8', paddingVertical: 7 },
  head: { backgroundColor: '#edf5f4', fontWeight: 700 },
  cell: { flexGrow: 1, flexBasis: 0, paddingHorizontal: 6, fontSize: 8 },
  footer: { position: 'absolute', top: 810, left: 38, fontFamily: 'RupeeKitPlanning', fontSize: 8, color: '#526477' },
  url: { fontSize: 8, color: '#526477', marginTop: 10 },
});

export function registerPlanFonts(root = '/fonts') {
  Font.register({ family: 'RupeeKitPlanning', fonts: [
    { src: `${root}/RupeeKitReport-Regular.ttf`, fontWeight: 400 },
    { src: `${root}/RupeeKitReport-Bold.ttf`, fontWeight: 700 },
  ] });
  Font.registerHyphenationCallback(word => [word]);
}
function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return <View><View style={[styles.row, styles.head]} wrap={false}>{headers.map((header, i) => <Text style={styles.cell} key={i}>{header}</Text>)}</View>
    {rows.map((row, i) => <View style={styles.row} key={i} wrap={false}>{row.map((cell, j) => <Text style={styles.cell} key={j}>{cell}</Text>)}</View>)}
  </View>;
}
export default function PlanPdf({ report }: { report: PlanReport }) {
  return <Document title={report.title} author="RupeeKit" subject="An illustrative financial plan based on entered assumptions">
    <Page size="A4" style={styles.page}>
      <Text fixed style={styles.footer} render={({ pageNumber, totalPages }) => `RupeeKit | Educational estimate | Page ${pageNumber} of ${totalPages}`}>RupeeKit | Educational estimate</Text>
      <Text style={styles.eyebrow}>RUPEEKIT / YOUR PLANNING REPORT</Text>
      <Text style={styles.title}>{report.title}</Text><Text style={styles.subtitle}>{report.subtitle}</Text>
      {report.sections.map((section, i) => <View key={i} wrap={false}>
        <Text style={styles.section} minPresenceAhead={55}>{section.title}</Text>
        {section.lines?.map((line, j) => <Text key={j} style={styles.line}>{line}</Text>)}
        {section.headers && section.rows && <Table headers={section.headers} rows={section.rows} />}
      </View>)}
      <Text style={styles.section} minPresenceAhead={70}>How to read this plan</Text>
      {report.assumptions.map((assumption, i) => <Text key={i} style={styles.line}>{i + 1}. {assumption}</Text>)}
      <Text style={styles.section} minPresenceAhead={80}>Your input snapshot</Text>
      <Text style={styles.line}>{report.inputNote ?? 'Amounts are in INR. Rates and percentages, month counts, dates and tax-rule years retain their entered units. Download CSV on the calculator for the complete monthly schedule.'}</Text>
      <Table headers={['Input', 'Value']} rows={report.inputs} />
      <Text style={styles.url}>{report.url}</Text>
    </Page>
  </Document>;
}
