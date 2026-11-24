'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';

export default function NavLinks({ links }: { links: { href: string; label: string }[] }) {
  const path = usePathname(), [open, setOpen] = useState(false);
  return (
    <>
      <button className={styles.toggle} aria-expanded={open} aria-controls="site-nav" onClick={() => setOpen((o) => !o)}>
        <span className="sr">Menu</span>{open ? '✕' : '☰'}</button>
      <nav id="site-nav" className={`${styles.nav} ${open ? styles.open : ''}`} aria-label="Main">
        {links.map((l) => (
          <Link key={l.href} href={l.href} aria-current={path === l.href ? 'page' : undefined} onClick={() => setOpen(false)}>{l.label}</Link>))}
      </nav>
    </>
  );
}
