import OfficialFinancialUpdatePage, { buildDay18UpdateMetadata, getDay18Update } from '@/components/updates/OfficialFinancialUpdatePage';

const SLUG = 'small-savings-rates-july-september-2026';
export const metadata = buildDay18UpdateMetadata(SLUG);

export default function Page() {
  return <OfficialFinancialUpdatePage update={getDay18Update(SLUG)} />;
}
