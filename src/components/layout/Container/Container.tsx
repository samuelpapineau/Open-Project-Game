import type { ReactNode } from 'react';
import styles from './Container.module.css';
export default function Container({ children, narrow = false }: { children: ReactNode; narrow?: boolean }) {
  return <div className={`${styles.container} ${narrow ? styles.narrow : ''}`}>{children}</div>;
}
