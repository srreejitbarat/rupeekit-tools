import OfficialFinancialUpdatePage, { buildDay18UpdateMetadata, getDay18Update } from '@/components/updates/OfficialFinancialUpdatePage';

const SLUG = '8th-cpc-chandigarh-visit-september-2026';
export const metadata = buildDay18UpdateMetadata(SLUG);

export default function Page() {
  return <OfficialFinancialUpdatePage update={getDay18Update(SLUG)} />;
}
