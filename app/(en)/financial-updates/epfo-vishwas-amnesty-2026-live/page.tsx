import OfficialFinancialUpdatePage, { buildDay18UpdateMetadata, getDay18Update } from '@/components/updates/OfficialFinancialUpdatePage';

const SLUG = 'epfo-vishwas-amnesty-2026-live';
export const metadata = buildDay18UpdateMetadata(SLUG);

export default function Page() {
  return <OfficialFinancialUpdatePage update={getDay18Update(SLUG)} />;
}
