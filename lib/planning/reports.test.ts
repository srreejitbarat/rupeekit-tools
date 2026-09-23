import { describe, expect, it } from 'vitest';
import { HOME_LOAN_EXAMPLE, planHomeLoan } from './home-loan';
import { SIP_GOALS_EXAMPLE, planSipGoals } from './sip-goals';
import { SALARY_CASH_EXAMPLE, planSalaryCash } from './salary-cash';
import { homeReport, sipReport, salaryReport, reportCsv } from './reports';
import { csvText } from './common';

describe('planning reports', () => {
  it('exports every loan month for every option, including fees and a snapshot', () => {
    const result = planHomeLoan(HOME_LOAN_EXAMPLE);
    const report = homeReport(HOME_LOAN_EXAMPLE, result);
    expect(report.schedule).toHaveLength(1 + result.options.length * result.horizon);
    expect(report.inputs).toContainEqual(['Outstanding loan balance (INR)', '50,00,000']);
    expect(report.assumptions.join(' ')).toContain('Intramonth');
    expect(reportCsv(report).flat().join(' ')).toContain('Protected');
  });
  it('exports each SIP contribution without unsafe spreadsheet labels', () => {
    const input = { ...SIP_GOALS_EXAMPLE, goals: [{ ...SIP_GOALS_EXAMPLE.goals[0], name: '=1+1' }] };
    const result = planSipGoals(input);
    const report = sipReport(input, result);
    expect(report.schedule).toHaveLength(1 + result.goals[0].months);
    expect(csvText(reportCsv(report))).toContain('"\'=1+1"');
    expect(report.assumptions.join(' ')).toContain('not promised returns');
  });
  it('exports two full salary calendars and explains held tax rules and bonus exposure', () => {
    const report = salaryReport(SALARY_CASH_EXAMPLE, planSalaryCash(SALARY_CASH_EXAMPLE));
    expect(report.schedule).toHaveLength(25);
    expect(report.schedule[1][1]).toBe('2026-10');
    expect(report.schedule[24][1]).toBe('2027-09');
    expect(report.assumptions.join(' ')).toContain('future years');
    expect(report.schedule[0]).toContain('Gross clawback exposure');
  });
});
