'use client';
import { useEffect, useRef } from 'react';
import { getEngineClient } from '../../engine/client';
import styles from './ResultCard.module.css';

interface Props { seed: string; version: string; active: boolean; caption?: string; onSelect(): void }
export default function ResultCard({ seed, version, active, caption, onSelect }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let live = true;                                              // 128×128 samples at 16 blocks each = 2048-block overview
    getEngineClient().render({ version, seed, x0: -64, z0: -64, w: 128, h: 128, scale: 16, types: [] })
      .then((r) => { if (live) ref.current?.getContext('2d')?.putImageData(new ImageData(r.rgba, 128, 128), 0, 0); }).catch(() => {});
    return () => { live = false; };
  }, [seed, version]);
  return (
    <button className={`${styles.card} ${active ? styles.on : ''}`} onClick={onSelect} aria-pressed={active}>
      <canvas ref={ref} width={128} height={128} aria-hidden /><code>{seed}</code>{caption && <small>{caption}</small>}
    </button>
  );
}
