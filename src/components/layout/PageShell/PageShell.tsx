import type { ReactNode } from 'react';
import Container from '../Container/Container';
import styles from './PageShell.module.css';
// Standard wrapper for text pages (about, contact, legal...).
export default function PageShell({ title, children }: { title: string; children: ReactNode }) {
  return <Container narrow><article className={styles.prose}><h1>{title}</h1>{children}</article></Container>;
}
