import SiteLayout from '@/components/layout/SiteLayout';
export { metadata } from '@/components/layout/SiteLayout';

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return <SiteLayout locale="en">{children}</SiteLayout>;
}
