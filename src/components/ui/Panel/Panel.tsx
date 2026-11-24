import type { ReactNode } from 'react';
import styles from './Panel.module.css';
export default function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`${styles.panel} ${className}`}>{children}</section>;
}
