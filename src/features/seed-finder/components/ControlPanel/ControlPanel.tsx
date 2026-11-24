import Button from '@/components/ui/Button/Button';
import Panel from '@/components/ui/Panel/Panel';
import type { BiomeOption } from '../../engine/protocol';
import { STRUCTURES } from '../../data/structures';
import styles from './ControlPanel.module.css';

interface Props {
  versions: string[]; version: string; onVersion(v: string): void;
  biomes: BiomeOption[]; biomeId: number | null; onBiome(id: number | null): void;
  structures: number[]; selected: number[]; onToggle(i: number): void;
  ready: boolean; progress: number | null; onRandom(): void; onSearch(): void; onCancel(): void;
}
export default function ControlPanel(p: Props) {
  const searching = p.progress !== null;
  return (
    <Panel>
      <form className={styles.form} onSubmit={(e) => { e.preventDefault(); if (!searching) p.onSearch(); }}>
        <label className={styles.field}>Game version
          <select value={p.version} onChange={(e) => p.onVersion(e.target.value)} disabled={!p.ready}>
            {[...p.versions].reverse().map((v) => <option key={v}>{v}</option>)}</select></label>
        <label className={styles.field}>Biome near spawn
          <select value={p.biomeId ?? ''} onChange={(e) => p.onBiome(e.target.value === '' ? null : +e.target.value)} disabled={!p.ready}>
            <option value="">Any biome</option>
            {p.biomes.map((b) => <option key={b.id} value={b.id}>{b.name.replace(/_/g, ' ')}</option>)}</select></label>
        <fieldset className={`${styles.structs} ${styles.wide}`}><legend>Structures near spawn (closer ranks higher)</legend>
          {p.structures.map((i) => (
            <label key={i} className={styles.check}><input type="checkbox" checked={p.selected.includes(i)} onChange={() => p.onToggle(i)} />{STRUCTURES[i].label}</label>))}</fieldset>
        <div className={`${styles.actions} ${styles.wide}`}>
          <Button variant="secondary" disabled={!p.ready || searching} onClick={p.onRandom}>🎲 Random seed</Button>
          {searching ? <Button variant="secondary" onClick={p.onCancel}>Cancel ({Math.round((p.progress ?? 0) * 100)}%)</Button>
            : <Button disabled={!p.ready} onClick={p.onSearch}>Find matching seeds</Button>}
        </div>
      </form>
    </Panel>
  );
}
