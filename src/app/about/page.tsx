import PageShell from '@/components/layout/PageShell/PageShell';
import { pageMetadata } from '@/config/metadata';

export const metadata = pageMetadata('/about/');
export default function Page() {
  return <PageShell title="About MC Masters"><p>MC Masters is a free Minecraft seed finder and map viewer. World generation runs locally via Cubiomes compiled to WebAssembly.</p></PageShell>;
}
