import type { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';
interface Props extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: 'primary' | 'secondary' | 'ghost' }
export default function Button({ variant = 'primary', className = '', ...rest }: Props) {
  return <button type="button" className={`${styles.button} ${styles[variant]} ${className}`} {...rest} />;
}
