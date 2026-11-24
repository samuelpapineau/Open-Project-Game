import PageShell from '@/components/layout/PageShell/PageShell';
import { pageMetadata } from '@/config/metadata';

export const metadata = pageMetadata('/terms/');
export default function Page() {
  return <PageShell title="Terms and Conditions"><p>By using this site you agree to use it lawfully and at your own risk. Replace this placeholder with reviewed legal text.</p></PageShell>;
}
