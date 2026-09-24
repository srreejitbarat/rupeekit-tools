import SiteLayout from '@/components/layout/SiteLayout';
export { metadata } from '@/components/layout/SiteLayout';

export default function HindiLayout({ children }: { children: React.ReactNode }) {
  return <SiteLayout locale="hi">{children}</SiteLayout>;
}
