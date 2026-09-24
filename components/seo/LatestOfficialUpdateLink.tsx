'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type UpdateLink = { href: string; label: string };

const TOOL_UPDATE_LINKS: Record<string, UpdateLink> = {
  '/tools/8th-pay-commission-salary-calculator-india': {
    href: '/financial-updates/8th-cpc-chandigarh-visit-september-2026',
    label: 'Latest official 8th CPC update',
  },
  '/tools/8th-pay-commission-arrears-calculator-india': {
    href: '/financial-updates/8th-cpc-chandigarh-visit-september-2026',
    label: 'Latest official 8th CPC update',
  },
  '/tools/8th-pay-commission-pension-calculator-india': {
    href: '/financial-updates/8th-cpc-chandigarh-visit-september-2026',
    label: 'Latest official 8th CPC update',
  },
  '/tools/home-loan-emi-calculator-india': {
    href: '/financial-updates/rbi-repo-rate-5-25-august-2026',
    label: 'RBI August 2026 rate update',
  },
  '/tools/personal-loan-emi-calculator-india': {
    href: '/financial-updates/rbi-repo-rate-5-25-august-2026',
    label: 'RBI August 2026 rate update',
  },
  '/tools/reduce-emi-vs-tenure-calculator-india': {
    href: '/financial-updates/rbi-repo-rate-5-25-august-2026',
    label: 'RBI August 2026 rate update',
  },
  '/tools/ppf-calculator-india': {
    href: '/financial-updates/small-savings-rates-july-september-2026',
    label: 'Jul-Sep 2026 small-savings rates',
  },
  '/tools/sukanya-samriddhi-yojana-calculator-india': {
    href: '/financial-updates/small-savings-rates-july-september-2026',
    label: 'Jul-Sep 2026 small-savings rates',
  },
  '/tools/scss-calculator-india': {
    href: '/financial-updates/small-savings-rates-july-september-2026',
    label: 'Jul-Sep 2026 small-savings rates',
  },
  '/tools/post-office-monthly-income-scheme-calculator-india': {
    href: '/financial-updates/small-savings-rates-july-september-2026',
    label: 'Jul-Sep 2026 small-savings rates',
  },
  '/tools/income-tax-calculator-old-vs-new-regime-india': {
    href: '/financial-updates/income-tax-itr7-utility-available-august-2026',
    label: 'Latest Income Tax portal update',
  },
  '/tools/epf-corpus-calculator-india': {
    href: '/financial-updates/epfo-vishwas-amnesty-2026-live',
    label: 'Latest EPFO official update',
  },
};

export default function LatestOfficialUpdateLink() {
  const pathname = usePathname();
  const update = TOOL_UPDATE_LINKS[pathname];
  if (!update) return null;

  return (
    <p className="mt-2 text-xs text-brandMuted dark:text-slate-400">
      <span className="font-semibold">Official update:</span>{' '}
      <Link href={update.href} className="font-semibold text-brandNavy underline underline-offset-2 hover:text-brandDeepNavy dark:text-slate-200 dark:hover:text-white">
        {update.label}
      </Link>
    </p>
  );
}
