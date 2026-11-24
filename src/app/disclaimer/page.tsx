import PageShell from '@/components/layout/PageShell/PageShell';
import { pageMetadata } from '@/config/metadata';

export const metadata = pageMetadata('/disclaimer/');
export default function Page() {
  return <PageShell title="Disclaimer"><p>MC Masters is an unofficial fan tool, not affiliated with Mojang AB or Microsoft. Results may differ from the game on unsupported versions.</p></PageShell>;
}
