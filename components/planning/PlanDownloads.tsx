'use client';

import { useState } from 'react';
import { csvText } from '@/lib/planning/common';
import { reportCsv, type PlanReport } from '@/lib/planning/reports';
import { secondary, muted } from './PlanningFields';

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = filename;
  document.body.appendChild(anchor); anchor.click(); anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
export default function PlanDownloads({ report, disabled, csvLabel = 'Download monthly CSV' }: { report: PlanReport; disabled: boolean; csvLabel?: string }) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  async function pdf() {
    setBusy(true); setStatus('Preparing your PDF in this browser…');
    try {
      const [{ pdf: render }, { default: PlanPdf, registerPlanFonts }] = await Promise.all([import('@react-pdf/renderer'), import('./PlanPdf')]);
      registerPlanFonts();
      const blob = await render(<PlanPdf report={report} />).toBlob();
      download(blob, `${report.filename}.pdf`); setStatus('PDF ready. Check your browser downloads.');
    } catch { setStatus('The PDF could not be prepared. Try again or download the CSV.'); }
    finally { setBusy(false); }
  }
  function csv() {
    try {
      download(new Blob(['\uFEFF', csvText(reportCsv(report))], { type: 'text/csv;charset=utf-8' }), `${report.filename}.csv`);
      setStatus('CSV ready, including inputs, assumptions and the full schedule.');
    } catch { setStatus('The CSV could not be downloaded. Check browser download permissions and try again.'); }
  }
  return <div className="space-y-3 rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
    <div className="flex flex-wrap gap-3"><button type="button" className={secondary} disabled={disabled || busy} onClick={pdf}>{busy ? 'Preparing PDF…' : 'Download plan PDF'}</button>
      <button type="button" className={secondary} disabled={disabled} onClick={csv}>{csvLabel}</button></div>
    <p className={muted}>{disabled ? 'Update the plan before downloading your changed inputs.' : 'Includes your input snapshot and assumptions. Both files are generated in your browser; this planner does not upload your financial inputs.'}</p>
    <p role="status" className="text-sm text-slate-700 dark:text-slate-200">{status}</p>
  </div>;
}
