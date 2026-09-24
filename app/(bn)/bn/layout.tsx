import SiteLayout from '@/components/layout/SiteLayout';
export { metadata } from '@/components/layout/SiteLayout';

export default function BengaliLayout({ children }: { children: React.ReactNode }) {
  return <SiteLayout locale="bn">{children}</SiteLayout>;
}
