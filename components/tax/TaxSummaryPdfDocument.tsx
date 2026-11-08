import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import { TaxPdfData } from '@/lib/tax/buildTaxPdfData';

// Register a clean fallback font (system Helvetica)
Font.registerHyphenationCallback((word) => [word]);

const NAVY = '#002070';
const GREEN = '#43A047';
const GREY_BG = '#f8f8f8';
const BORDER = '#e2e8f0';
const TEXT_DARK = '#0f172a';
const TEXT_MUTED = '#64748b';
const WHITE = '#ffffff';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: TEXT_DARK,
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 40,
    backgroundColor: WHITE,
  },
  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 2,
    borderBottomColor: NAVY,
    paddingBottom: 10,
    marginBottom: 16,
  },
  logoText: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: NAVY },
  logoSub: { fontSize: 8, color: TEXT_MUTED, marginTop: 2 },
  metaRight: { alignItems: 'flex-end' },
  metaText: { fontSize: 8, color: TEXT_MUTED },
  metaBold: { fontSize: 8, color: TEXT_DARK, fontFamily: 'Helvetica-Bold' },
  // Section
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    marginBottom: 6,
    marginTop: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  card: {
    backgroundColor: GREY_BG,
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: BORDER,
  },
  // Two-col layout
  row: { flexDirection: 'row', marginBottom: 4 },
  labelCell: { width: '55%', color: TEXT_MUTED },
  valueCell: { width: '45%', textAlign: 'right', fontFamily: 'Helvetica-Bold', color: TEXT_DARK },
  // Recommendation
  recCard: {
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1.5,
  },
  recBadge: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  recTitle: { fontSize: 13, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  recBody: { fontSize: 8, color: TEXT_MUTED, lineHeight: 1.5 },
  // Comparison table
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: NAVY,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 2,
  },
  tableHeaderCell: {
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
    fontSize: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  tableRowAlt: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    backgroundColor: '#f1f5f9',
  },
  tableCell: { fontSize: 8.5 },
  tableCellRight: { fontSize: 8.5, textAlign: 'right' },
  tableCellBold: { fontSize: 8.5, fontFamily: 'Helvetica-Bold' },
  col1: { width: '40%' },
  col2: { width: '30%', textAlign: 'right' },
  col3: { width: '30%', textAlign: 'right' },
  // Divider
  divider: { borderBottomWidth: 1, borderBottomColor: BORDER, marginVertical: 10 },
  // Disclaimer
  disclaimerBox: {
    backgroundColor: '#fef9c3',
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: '#fde047',
    marginTop: 14,
  },
  disclaimerTitle: { fontFamily: 'Helvetica-Bold', fontSize: 8, marginBottom: 3, color: '#713f12' },
  disclaimerText: { fontSize: 7.5, color: '#78350f', lineHeight: 1.6 },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 6,
  },
  footerText: { fontSize: 7, color: TEXT_MUTED },
  footerPage: { fontSize: 7, color: TEXT_MUTED },
  // Savings highlight
  savingsBadge: {
    backgroundColor: '#dcfce7',
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  savingsText: { fontSize: 8, color: '#15803d', fontFamily: 'Helvetica-Bold' },
});

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmt = (n: number): string => `₹${Math.round(n).toLocaleString('en-IN')}`;
const pct = (n: number): string => `${n.toFixed(2)}%`;
const fy = (year: string) => `FY ${year} (AY ${year.replace(/(\d{2})(-\d{2})/, (_, a, b) => `${+a + 1}${b}`)})`;

interface RowProps {
  label: string;
  old: string;
  neu: string;
  alt?: boolean;
  bold?: boolean;
  highlight?: boolean;
}
function CompRow({ label, old, neu, alt, bold, highlight }: RowProps) {
  const S = alt ? styles.tableRowAlt : styles.tableRow;
  const tf = bold ? styles.tableCellBold : styles.tableCell;
  const bg = highlight ? { backgroundColor: '#dcfce7' } : {};
  return (
    <View style={[S, bg]}>
      <Text style={[tf, styles.col1]}>{label}</Text>
      <Text style={[tf, styles.col2]}>{old}</Text>
      <Text style={[tf, styles.col3]}>{neu}</Text>
    </View>
  );
}

interface KVProps { label: string; value: string; }
function KV({ label, value }: KVProps) {
  return (
    <View style={styles.row}>
      <Text style={[styles.tableCell, styles.labelCell]}>{label}</Text>
      <Text style={[styles.tableCell, styles.valueCell]}>{value}</Text>
    </View>
  );
}

// ─── Main PDF Document ───────────────────────────────────────────────────────
interface Props { data: TaxPdfData; }

export function TaxSummaryPdfDocument({ data }: Props) {
  const isNewBetter = data.recommendedRegime === 'New';
  const isOldBetter = data.recommendedRegime === 'Old';
  const recCardStyle = {
    ...styles.recCard,
    borderColor: isNewBetter ? GREEN : isOldBetter ? '#6366f1' : '#94a3b8',
    backgroundColor: isNewBetter ? '#f0fdf4' : isOldBetter ? '#eef2ff' : '#f8fafc',
  };
  const recBadgeColor = isNewBetter ? GREEN : isOldBetter ? '#4f46e5' : '#64748b';
  const recTitleColor = isNewBetter ? '#14532d' : isOldBetter ? '#3730a3' : TEXT_DARK;

  const regimeName = (r: 'Old' | 'New' | 'Equal') =>
    r === 'Old' ? 'Old Regime' : r === 'New' ? 'New Regime' : 'Both Equal';

  return (
    <Document
      title={`RupeeKit Income Tax Summary - FY ${data.financialYear}`}
      author="RupeeKit"
      subject="Income Tax Estimate Summary"
      creator="RupeeKit (rupeekit.co.in)"
    >
      <Page size="A4" style={styles.page}>
        {/* ── Header ─────────────────────────────────────────────── */}
        <View style={styles.headerRow} fixed>
          <View>
            <Text style={styles.logoText}>RupeeKit</Text>
            <Text style={styles.logoSub}>Income Tax Calculator Summary</Text>
            <Text style={styles.logoSub}>Old vs New Regime Estimate</Text>
          </View>
          <View style={styles.metaRight}>
            <Text style={styles.metaBold}>{data.assessmentYear ? `FY ${data.financialYear} / AY ${data.assessmentYear}` : `Tax Year ${data.financialYear}`}</Text>
            <Text style={styles.metaText}>Generated: {data.generatedAt}</Text>
            <Text style={styles.metaText}>Educational estimate only</Text>
          </View>
        </View>

        {/* ── Section 1: Inputs ──────────────────────────────────── */}
        <Text style={styles.sectionTitle}>1. Your Input Summary</Text>
        <View style={styles.card}>
          <KV label="Tax period" value={data.assessmentYear ? `FY ${data.financialYear} (AY ${data.assessmentYear})` : `Tax Year ${data.financialYear}`} />
          <KV label="Salaried Employee" value={data.isSalaried ? 'Yes' : 'No'} />
          <KV label="Gross Annual Income" value={fmt(data.grossIncome)} />
          {data.standardDeductionOld > 0 && <KV label="Standard Deduction (Old Regime)" value={fmt(data.standardDeductionOld)} />}
          {data.standardDeductionNew > 0 && <KV label="Standard Deduction (New Regime)" value={fmt(data.standardDeductionNew)} />}
          {data.hraExemption > 0 && <KV label="HRA / Exempt Allowances" value={fmt(data.hraExemption)} />}
          {data.section80C > 0 && <KV label="Section 80C (PPF, ELSS, EPF, LIC)" value={fmt(data.section80C)} />}
          {data.section80D > 0 && <KV label="Section 80D (Health Insurance)" value={fmt(data.section80D)} />}
          {data.homeLoanInterest > 0 && <KV label="Home Loan Interest (Sec 24b)" value={fmt(data.homeLoanInterest)} />}
          {data.employerNPS > 0 && <KV label="Employer NPS (Sec 80CCD(2))" value={fmt(data.employerNPS)} />}
          {data.otherDeductionsOldRegime > 0 && <KV label="Other Deductions (Old Regime Only)" value={fmt(data.otherDeductionsOldRegime)} />}
          {data.otherDeductionsBothRegimes > 0 && <KV label="Other Deductions (Both Regimes)" value={fmt(data.otherDeductionsBothRegimes)} />}
        </View>

        {/* ── Section 2: Recommendation ──────────────────────────── */}
        <Text style={styles.sectionTitle}>2. Recommendation</Text>
        <View style={recCardStyle}>
          <Text style={[styles.recBadge, { color: recBadgeColor }]}>Recommended Regime</Text>
          <Text style={[styles.recTitle, { color: recTitleColor }]}>{regimeName(data.recommendedRegime)}</Text>
          {data.savingsAmount > 0 && (
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsText}>Estimated saving: {fmt(data.savingsAmount)}</Text>
            </View>
          )}
        </View>

        {/* ── Section 3: Estimate Summary ────────────────────────── */}
        <Text style={styles.sectionTitle}>3. Tax Estimate Summary</Text>
        <View style={styles.card}>
          <KV label="Old Regime – Final Tax" value={fmt(data.old_finalTax)} />
          <KV label="New Regime – Final Tax" value={fmt(data.new_finalTax)} />
          <KV label="Taxable Income (Old Regime)" value={fmt(data.old_taxableIncome)} />
          <KV label="Taxable Income (New Regime)" value={fmt(data.new_taxableIncome)} />
          {data.old_rebate > 0 && <KV label="Rebate Applied (Old Regime)" value={fmt(data.old_rebate)} />}
          {data.new_rebate > 0 && <KV label="Rebate Applied (New Regime)" value={fmt(data.new_rebate)} />}
          <KV label="Health & Education Cess (Old)" value={fmt(data.old_cess)} />
          <KV label="Health & Education Cess (New)" value={fmt(data.new_cess)} />
          <KV label="Effective Tax Rate (Old)" value={pct(data.old_effectiveTaxRate)} />
          <KV label="Effective Tax Rate (New)" value={pct(data.new_effectiveTaxRate)} />
          <KV label="Cess Rate" value="4% (included in above)" />
        </View>

        {/* ── Section 4: Why ─────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>4. Why This Regime Is Recommended</Text>
        <View style={styles.card}>
          <Text style={{ fontSize: 8.5, lineHeight: 1.6, color: TEXT_DARK }}>{data.explanation}</Text>
        </View>

        {/* ── Section 5: Comparison Table ────────────────────────── */}
        <Text style={styles.sectionTitle}>5. Side-by-Side Comparison</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.col1]}>Component</Text>
          <Text style={[styles.tableHeaderCell, styles.col2]}>Old Regime</Text>
          <Text style={[styles.tableHeaderCell, styles.col3]}>New Regime</Text>
        </View>
        <CompRow label="Gross Income" old={fmt(data.grossIncome)} neu={fmt(data.grossIncome)} />
        <CompRow label="Total Deductions" old={fmt(data.old_totalDeductions)} neu={fmt(data.new_totalDeductions)} alt />
        <CompRow label="Taxable Income" old={fmt(data.old_taxableIncome)} neu={fmt(data.new_taxableIncome)} />
        <CompRow label="Slab Tax (before rebate)" old={fmt(data.old_totalSlabTax)} neu={fmt(data.new_totalSlabTax)} alt />
        <CompRow label="Rebate" old={fmt(data.old_rebate)} neu={fmt(data.new_rebate)} />
        {(data.old_surcharge > 0 || data.new_surcharge > 0) && (
          <CompRow label="Surcharge after marginal relief" old={fmt(data.old_surcharge)} neu={fmt(data.new_surcharge)} />
        )}
        <CompRow label="Health & Edu. Cess (4%)" old={fmt(data.old_cess)} neu={fmt(data.new_cess)} alt />
        <CompRow
          label="Final Estimated Tax"
          old={fmt(data.old_finalTax)}
          neu={fmt(data.new_finalTax)}
          bold
          highlight={data.recommendedRegime !== 'Equal'}
        />

        {/* ── Disclaimer ─────────────────────────────────────────── */}
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerTitle}>⚠ Educational Estimate Only</Text>
          <Text style={styles.disclaimerText}>
            This report is an educational estimate generated from the values entered by the user. RupeeKit does not provide financial, tax, legal, or investment advice. Tax rules can change by financial year. Please verify latest slabs, rebates, deductions, and filing rules with the official Income Tax Department portal (incometax.gov.in) or a qualified chartered accountant before acting.
          </Text>
        </View>

        {/* ── Footer ─────────────────────────────────────────────── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>RupeeKit  •  rupeekit.co.in/tools/income-tax-calculator-old-vs-new-regime-india</Text>
          <Text
            style={styles.footerPage}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
