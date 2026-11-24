'use client';
import { useEffect } from 'react';
import styles from './AdSlot.module.css';
declare global { interface Window { adsbygoogle?: unknown[] } }

// <AdSlot slot={AD_SLOTS.homeTop} /> — reserves space up front so ads never shift the layout.
export default function AdSlot({ slot, format = 'auto' }: { slot: string; format?: string }) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  useEffect(() => { if (client) try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch { /* blocked */ } }, [client]);
  if (!client) return <div className={`${styles.ad} ${styles.placeholder}`} aria-hidden>Ad space</div>;
  return <ins className={`adsbygoogle ${styles.ad}`} data-ad-client={client} data-ad-slot={slot} data-ad-format={format} data-full-width-responsive="true" />;
}
