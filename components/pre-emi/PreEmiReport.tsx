import React from "react";
import path from "node:path";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
  Font,
} from "@react-pdf/renderer";
import {
  comparePlans,
  comparisonHorizon,
  MODEL_ASSUMPTIONS,
  MODEL_VERSION,
  MODE_LABELS,
  monthLabel,
  simulatePlan,
  type PaymentMode,
  type PlanInput,
} from "@/lib/pre-emi/engine";
import { lenderQuestions, preEmiSources } from "@/data/pre-emi";

Font.register({
  family: "RupeeKitReport",
  src: path.join(process.cwd(), "public/fonts/RupeeKitReport-Regular.ttf"),
});
Font.register({
  family: "RupeeKitReportBold",
  src: path.join(process.cwd(), "public/fonts/RupeeKitReport-Bold.ttf"),
});
Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: {
    padding: 38,
    paddingBottom: 48,
    fontFamily: "RupeeKitReport",
    fontSize: 9,
    color: "#183149",
    letterSpacing: 0,
  },
  brand: {
    fontSize: 13,
    fontFamily: "RupeeKitReportBold",
    color: "#003080",
    marginBottom: 22,
  },
  eyebrow: {
    fontSize: 8,
    color: "#35813b",
    letterSpacing: 1.3,
    marginBottom: 6,
  },
  title: {
    fontFamily: "RupeeKitReportBold",
    fontSize: 26,
    lineHeight: 1.16,
    marginBottom: 12,
  },
  subtitle: { fontSize: 10, color: "#586b7a", marginBottom: 20 },
  hero: {
    backgroundColor: "#13344e",
    color: "#ffffff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  label: { fontSize: 9, color: "#d7e4ed", marginBottom: 7 },
  number: {
    fontSize: 29,
    lineHeight: 1.25,
    fontFamily: "RupeeKitReportBold",
    marginBottom: 6,
  },
  heroText: { fontSize: 9, color: "#d7e4ed" },
  heading: {
    fontSize: 13,
    fontFamily: "RupeeKitReportBold",
    marginTop: 16,
    marginBottom: 9,
  },
  row: {
    flexDirection: "row",
    borderBottom: "1 solid #dce5e9",
    paddingVertical: 9,
  },
  first: { width: "34%", paddingRight: 8, color: "#536777" },
  cell: { width: "22%", paddingRight: 5, fontSize: 8 },
  tableHead: {
    backgroundColor: "#edf3f4",
    fontFamily: "RupeeKitReportBold",
    paddingHorizontal: 5,
  },
  small: { fontSize: 8, color: "#586b7a", marginTop: 8, lineHeight: 1.55 },
  columns: { flexDirection: "row", gap: 20 },
  column: { width: "48%" },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottom: "1 solid #e8edef",
    gap: 10,
  },
  inputLabel: { color: "#586b7a", fontSize: 8, flex: 1 },
  inputValue: {
    fontSize: 8,
    fontFamily: "RupeeKitReportBold",
    maxWidth: 105,
    textAlign: "right",
  },
  item: { fontSize: 9, marginBottom: 9, lineHeight: 1.55 },
  footer: {
    position: "absolute",
    bottom: 22,
    left: 38,
    right: 38,
    fontSize: 7,
    color: "#647887",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  link: { fontSize: 8, color: "#003080", marginBottom: 8 },
});
const cash = (n: number) => `INR ${Math.round(n).toLocaleString("en-IN")}`;
const ascii = (s: string) =>
  s.replace(/[–—]/g, "-").replace(/×/g, "x").replace(/÷/g, "/");
function Footer() {
  return (
    <Text
      fixed
      style={{
        position: "absolute",
        bottom: 22,
        left: 38,
        fontFamily: "RupeeKitReport",
        fontSize: 7,
        color: "#647887",
      }}
      render={({ pageNumber, totalPages }) =>
        `RupeeKit | ${MODEL_VERSION} | Educational estimate                                      ${pageNumber} / ${totalPages}`
      }
    />
  );
}
function InputRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.inputRow}>
      <Text style={styles.inputLabel}>{label}</Text>
      <Text style={styles.inputValue}>{value}</Text>
    </View>
  );
}

export default function PreEmiReport({
  input,
  mode,
}: {
  input: PlanInput;
  mode: PaymentMode;
}) {
  const results = comparePlans(input);
  const result = results.find((r) => r.mode === mode)!;
  const horizon = comparisonHorizon(input);
  const delays = [0, 6, 12].map((delay) =>
    simulatePlan(input, mode, delay, horizon),
  );
  return (
    <Document
      title="RupeeKit Pre-EMI Home Plan"
      author="RupeeKit"
      subject="Loan, rent and reserve planning"
      creator="RupeeKit"
    >
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>RupeeKit / HOME PLANNING</Text>
        <Text style={styles.eyebrow}>YOUR PRE-EMI PLAN</Text>
        <Text style={styles.title}>Plan the wait.{"\n"}Protect your cash.</Text>
        <Text style={styles.subtitle}>
          {MODE_LABELS[mode]} | {input.delayMonths} months of possession delay
          {"\n"}Plan starts {monthLabel(input.startMonth, 1)}. Cash comparison
          through {monthLabel(input.startMonth, horizon)}.
        </Text>
        <View style={styles.hero}>
          <Text style={styles.label}>
            {result.extraCashNeeded > 0
              ? "LARGEST RESERVE SHORTFALL"
              : "LOWEST CASH BALANCE"}
          </Text>
          <Text style={styles.number}>
            {cash(
              result.extraCashNeeded > 0
                ? result.extraCashNeeded
                : result.lowestCash,
            )}
          </Text>
          <Text style={styles.heroText}>
            Protected reserve: {cash(input.protectedReserve)}. Lowest cash{" "}
            {result.lowestCashMonth === 0
              ? "at the start"
              : `in ${monthLabel(input.startMonth, result.lowestCashMonth)}`}
            : {cash(result.lowestCash)}.
          </Text>
        </View>
        <InputRow
          label="Peak monthly outflow (all expenses)"
          value={`${cash(result.peakOutflow)} / ${monthLabel(input.startMonth, result.peakOutflowMonth)}`}
        />
        <InputRow
          label="Loan outstanding at possession"
          value={cash(result.debtAtPossession)}
        />
        <InputRow
          label="Total loan interest / payoff month"
          value={`${cash(result.totalInterest)} / ${monthLabel(input.startMonth, result.payoffMonth)}`}
        />
        <Text style={styles.heading}>Compare on the same date</Text>
        <View style={[styles.row, styles.tableHead]}>
          <Text style={styles.first}>
            At {monthLabel(input.startMonth, horizon)}
          </Text>
          {results.map((r) => (
            <Text key={r.mode} style={styles.cell}>
              {MODE_LABELS[r.mode]}
            </Text>
          ))}
        </View>
        {[
          { label: "Liquid cash", key: "cashAtHorizon" },
          { label: "Loan still outstanding", key: "debtAtHorizon" },
          {
            label: "Interest paid to this date",
            key: "interestThroughHorizon",
          },
          { label: "Largest reserve shortfall", key: "extraCashNeeded" },
        ].map((item) => (
          <View style={styles.row} key={item.key}>
            <Text style={styles.first}>{item.label}</Text>
            {results.map((r) => (
              <Text key={r.mode} style={styles.cell}>
                {cash(r[item.key as "cashAtHorizon"])}
              </Text>
            ))}
          </View>
        ))}
        <Text style={styles.heading}>
          Possession-delay check / selected strategy
        </Text>
        <View style={[styles.row, styles.tableHead]}>
          <Text style={styles.first}>Through the same date</Text>
          {delays.map((r) => (
            <Text key={r.delay} style={styles.cell}>
              {r.delay === 0 ? "On time" : `+${r.delay} months`}
            </Text>
          ))}
        </View>
        <View style={styles.row}>
          <Text style={styles.first}>Rent paid</Text>
          {delays.map((r) => (
            <Text key={r.delay} style={styles.cell}>
              {cash(r.rentThroughHorizon)}
            </Text>
          ))}
        </View>
        <View style={styles.row}>
          <Text style={styles.first}>Largest reserve shortfall</Text>
          {delays.map((r) => (
            <Text key={r.delay} style={styles.cell}>
              {cash(r.extraCashNeeded)}
            </Text>
          ))}
        </View>
        <Text style={styles.small}>
          Negative cash is an unfunded gap. Reserve shortfall is measured under
          the displayed payment schedule. More available cash can change
          reserve-limited prepayments. Lifetime interest and same-date interest
          cover different periods.
        </Text>
        <Footer />
      </Page>
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>RupeeKit / YOUR INPUTS</Text>
        <Text style={styles.title}>The assumptions behind your plan.</Text>
        <View style={styles.columns}>
          <View style={styles.column}>
            <Text style={styles.heading}>Loan & timing</Text>
            <InputRow label="Sanctioned loan" value={cash(input.loanAmount)} />
            <InputRow
              label="Annual interest rate"
              value={`${input.annualRate}%`}
            />
            <InputRow
              label="Repayment tenure"
              value={`${input.tenureMonths} months`}
            />
            <InputRow
              label="Base possession"
              value={monthLabel(input.startMonth, input.possessionMonth)}
            />
            <InputRow
              label="Base full-EMI start"
              value={monthLabel(input.startMonth, input.emiStartMonth)}
            />
            <InputRow
              label="Chosen possession delay"
              value={`${input.delayMonths} months`}
            />
            <InputRow
              label="Move future stages with delay"
              value={
                input.shiftConstruction
                  ? "Yes; first stage unchanged"
                  : "No; possession only"
              }
            />
            <InputRow
              label="Rate rise / start month"
              value={`+${input.rateIncrease}% points / month ${input.rateChangeMonth}`}
            />
            <InputRow
              label="No-income period"
              value={`${input.incomePauseMonths} months from month ${input.incomePauseMonth}`}
            />
            <InputRow
              label="Monthly extra payment"
              value={cash(input.monthlyPrepayment)}
            />
            <InputRow
              label="Annual extra payment"
              value={cash(input.annualPrepayment)}
            />
            <InputRow
              label="Extras start / reserve limit"
              value={`Month ${input.prepaymentStartMonth} / ${input.protectReserve ? "On" : "Off"}`}
            />
          </View>
          <View style={styles.column}>
            <Text style={styles.heading}>Household cash</Text>
            <InputRow
              label="Monthly take-home income"
              value={cash(input.monthlyIncome)}
            />
            <InputRow
              label="Monthly living expenses"
              value={cash(input.livingExpenses)}
            />
            <InputRow label="Other monthly EMIs" value={cash(input.otherEmi)} />
            <InputRow label="Monthly rent" value={cash(input.rent)} />
            <InputRow
              label="Annual rent escalation"
              value={`${input.rentEscalation}%`}
            />
            <InputRow
              label="Starting liquid cash"
              value={cash(input.startingCash)}
            />
            <InputRow
              label="Protected reserve"
              value={cash(input.protectedReserve)}
            />
            <InputRow label="Move-in budget" value={cash(input.moveInCost)} />
            <InputRow label="Selected strategy" value={MODE_LABELS[mode]} />
            <InputRow
              label="Effective possession"
              value={monthLabel(input.startMonth, result.possessionMonth)}
            />
            <InputRow
              label="Effective full-EMI switch"
              value={monthLabel(input.startMonth, result.emiStartMonth)}
            />
            <InputRow
              label="Extra payments held back in cash period"
              value={cash(result.skippedPrepayment)}
            />
          </View>
        </View>
        <Text style={styles.heading}>Builder / loan schedule before delay</Text>
        <View style={[styles.row, styles.tableHead]}>
          <Text style={styles.first}>Month / date</Text>
          <Text style={styles.cell}>Loan %</Text>
          <Text style={styles.cell}>Bank draw</Text>
          <Text style={styles.cell}>Your own cash</Text>
        </View>
        {input.tranches.map((t, i) => (
          <View key={i} style={[styles.row, { paddingVertical: 5 }]} wrap={false}>
            <Text style={styles.first}>
              {t.month} / {monthLabel(input.startMonth, t.month)}
            </Text>
            <Text style={styles.cell}>{t.percent}%</Text>
            <Text style={styles.cell}>
              {cash((input.loanAmount * t.percent) / 100)}
            </Text>
            <Text style={styles.cell}>{cash(t.ownCash)}</Text>
          </View>
        ))}
        <Text style={styles.small}>
          Bank draws pay for the property. They are not household income. Your
          own contributions are additional cash payments. Download the CSV from
          the calculator for the full monthly loan and cash ledger.
        </Text>
        <Footer />
      </Page>
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>RupeeKit / CHECK BEFORE YOU COMMIT</Text>
        <Text style={styles.title}>
          Make the bank’s rules part of your plan.
        </Text>
        <Text style={styles.heading}>Questions for your lender</Text>
        {lenderQuestions.map((q, i) => (
          <Text key={q} style={styles.item}>
            {i + 1}. {ascii(q)}
          </Text>
        ))}
        <Text style={styles.heading}>Calculation methodology</Text>
        {MODEL_ASSUMPTIONS.map((a, i) => (
          <Text key={a} style={styles.item}>
            {i + 1}. {ascii(a)}
          </Text>
        ))}
        <Text style={styles.heading}>Official references</Text>
        {preEmiSources.map((s) => (
          <Link key={s.href} src={s.href} style={styles.link}>
            {s.label}
          </Link>
        ))}
        <Text style={styles.small}>
          Methodology checked 23 September 2026. RBI&apos;s housing-loan FAQ is
          used for the pre-EMI definition, not its historical tax or fee
          examples. No bank approval, tax benefit or possession date is
          guaranteed by this estimate.
        </Text>
        <Link
          src="https://www.rupeekit.co.in/tools/pre-emi-calculator-india"
          style={styles.link}
        >
          Revisit the planner: www.rupeekit.co.in/tools/pre-emi-calculator-india
        </Link>
        <Footer />
      </Page>
    </Document>
  );
}
