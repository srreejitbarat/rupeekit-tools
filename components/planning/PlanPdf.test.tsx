import { describe, expect, it } from 'vitest';
import { renderToBuffer } from '@react-pdf/renderer';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import PlanPdf, { registerPlanFonts } from './PlanPdf';
import { homeReport, sipReport, salaryReport } from '@/lib/planning/reports';
import { HOME_LOAN_EXAMPLE, planHomeLoan } from '@/lib/planning/home-loan';
import { SIP_GOALS_EXAMPLE, planSipGoals } from '@/lib/planning/sip-goals';
import { SALARY_CASH_EXAMPLE, planSalaryCash } from '@/lib/planning/salary-cash';

describe('downloadable planning PDFs', () => {
  it.each([
    homeReport(HOME_LOAN_EXAMPLE, planHomeLoan(HOME_LOAN_EXAMPLE)),
    sipReport(SIP_GOALS_EXAMPLE, planSipGoals(SIP_GOALS_EXAMPLE)),
    salaryReport(SALARY_CASH_EXAMPLE, planSalaryCash(SALARY_CASH_EXAMPLE)),
  ])('renders $filename with the shipped rupee fonts', async report => {
    registerPlanFonts(path.join(process.cwd(), 'public/fonts'));
    const buffer = await renderToBuffer(<PlanPdf report={report} />);
    expect(buffer.subarray(0, 5).toString()).toBe('%PDF-');
    expect(buffer.length).toBeGreaterThan(15_000);
    // Optional local visual QA, without checking generated binaries into git.
    if (process.env.RUPEEKIT_PDF_QA_DIR) {
      await mkdir(process.env.RUPEEKIT_PDF_QA_DIR, { recursive: true });
      await writeFile(path.join(process.env.RUPEEKIT_PDF_QA_DIR, `${report.filename}.pdf`), buffer);
    }
  }, 30_000);
});
