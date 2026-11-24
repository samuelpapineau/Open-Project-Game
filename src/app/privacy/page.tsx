import PageShell from '@/components/layout/PageShell/PageShell';
import { pageMetadata } from '@/config/metadata';

export const metadata = pageMetadata('/privacy/');
export default function Page() {
  return <PageShell title="Privacy Policy"><p>Seed generation happens in your browser. We use Google Analytics, Microsoft Clarity and Google AdSense, which may set cookies. Replace this placeholder with a reviewed policy.</p></PageShell>;
}
