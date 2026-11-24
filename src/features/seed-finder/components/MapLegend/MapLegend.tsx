import { STRUCTURES } from '../../data/structures';
import styles from './MapLegend.module.css';
export default function MapLegend({ types }: { types: number[] }) {
  return (
    <ul className={styles.legend} aria-label="Map legend">
      {types.map((t) => <li key={t}><i style={{ background: STRUCTURES[t].color }}>{STRUCTURES[t].glyph}</i>{STRUCTURES[t].label}</li>)}
      <li><i className={styles.origin}>+</i>World origin (0, 0)</li><li><i className={styles.grid} />Chunk grid (zoom in)</li>
    </ul>
  );
}
