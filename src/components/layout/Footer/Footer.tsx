import Link from 'next/link';
import Container from '../Container/Container';
import { SITE } from '@/config/site';
import { PAGES } from '@/config/navigation';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}><Container>
      <nav aria-label="Footer">{PAGES.filter((p) => p.footer).map((p) => <Link key={p.href} href={p.href}>{p.label}</Link>)}</nav>
      <p>© {new Date().getFullYear()} {SITE.name}. Not affiliated with Mojang or Microsoft. Minecraft is a trademark of Mojang AB.</p>
    </Container></footer>
  );
}
