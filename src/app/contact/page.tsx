import PageShell from '@/components/layout/PageShell/PageShell';
import { pageMetadata } from '@/config/metadata';
import { SITE } from '@/config/site';
export const metadata = pageMetadata('/contact/');
export default function Page() {
  return <PageShell title="Contact"><p>Email us at <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p></PageShell>;
}
