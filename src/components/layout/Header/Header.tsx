import Link from 'next/link';
import Container from '../Container/Container';
import NavLinks from './NavLinks';
import { SITE } from '@/config/site';
import { PAGES } from '@/config/navigation';
import styles from './Header.module.css';

export default function Header() {
  const links = PAGES.filter((p) => p.header).map(({ href, label }) => ({ href, label }));
  return (
    <header className={styles.header}>
      <a href="#main" className={styles.skip}>Skip to content</a>
      <Container><div className={styles.bar}>
        <Link href="/" className={styles.logo}>{SITE.brand[0]}<b>{SITE.brand[1]}</b></Link>
        <NavLinks links={links} />
      </div></Container>
    </header>
  );
}
