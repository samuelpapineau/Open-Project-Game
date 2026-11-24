import type { Metadata } from 'next';
import Container from '@/components/layout/Container/Container';
import AdSlot from '@/components/ui/AdSlot/AdSlot';
import { AD_SLOTS } from '@/config/ads';
import { SITE } from '@/config/site';
import { SeedFinder } from '@/features/seed-finder';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: { absolute: `${SITE.name} – ${SITE.tagline}` }, description: SITE.description, alternates: { canonical: '/' },
};

export default function Home() {
  return (
    <>
      {/* Start fetching the engine while the page hydrates. */}
      <link rel="preload" href={`${SITE.basePath}/wasm/cubiomes.wasm`} as="fetch" crossOrigin="anonymous" />
      <Container>
        <section className={styles.hero}><h1>Minecraft Seed Finder</h1>
          <p>Pick a version, a biome and the structures you want near spawn. Seeds are searched in your browser and ranked by distance.</p></section>
        <SeedFinder adTop={<AdSlot slot={AD_SLOTS.homeTop} />} adBottom={<AdSlot slot={AD_SLOTS.homeBottom} />} />
        <section className={styles.how}><h2>How it works</h2>
          <p>{SITE.name} uses Cubiomes compiled to WebAssembly — the same world-generation algorithms Minecraft uses — so maps match the game. Everything runs locally in your browser; nothing is sent to a server.</p></section>
      </Container>
    </>
  );
}
