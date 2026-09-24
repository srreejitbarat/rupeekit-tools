import { describe, expect, it } from 'vitest';
import { renderToBuffer } from '@react-pdf/renderer';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import PlanPdf, { registerPlanFonts } from '@/components/planning/PlanPdf';
import { carLeaseReport, noCostReport, remittanceReport } from '@/lib/micro-tools/reports';
import { CAR_LEASE_EXAMPLE, calculateCarLease } from '@/lib/micro-tools/car-lease';
import { NO_COST_EXAMPLE, calculateNoCost } from '@/lib/micro-tools/no-cost-emi';
import { REMITTANCE_EXAMPLE, calculateRemittance } from '@/lib/micro-tools/remittance';

describe('decision tool PDF exports', () => {
  it.each([
    noCostReport(NO_COST_EXAMPLE, calculateNoCost(NO_COST_EXAMPLE)),
    remittanceReport(REMITTANCE_EXAMPLE, calculateRemittance(REMITTANCE_EXAMPLE)),
    carLeaseReport(CAR_LEASE_EXAMPLE, calculateCarLease(CAR_LEASE_EXAMPLE)),
  ])('renders $filename with currencies and the submitted snapshot', async report => {
    registerPlanFonts(path.join(process.cwd(), 'public/fonts'));
    const buffer = await renderToBuffer(<PlanPdf report={report} />);
    expect(buffer.subarray(0, 5).toString()).toBe('%PDF-'); expect(buffer.length).toBeGreaterThan(15_000);
    if (process.env.RUPEEKIT_MICRO_PDF_QA_DIR) {
      await mkdir(process.env.RUPEEKIT_MICRO_PDF_QA_DIR, { recursive: true });
      await writeFile(path.join(process.env.RUPEEKIT_MICRO_PDF_QA_DIR, `${report.filename}.pdf`), buffer);
    }
  }, 30_000);
});
