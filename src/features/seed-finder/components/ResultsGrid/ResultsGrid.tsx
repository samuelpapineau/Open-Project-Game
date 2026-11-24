import type { SeedResult } from '../../engine/protocol';
import ResultCard from '../ResultCard/ResultCard';
import styles from './ResultsGrid.module.css';
interface Props { items: SeedResult[]; version: string; activeSeed: string; showScore: boolean; onSelect(seed: string): void }
export default function ResultsGrid({ items, version, activeSeed, showScore, onSelect }: Props) {
  return (
    <section aria-labelledby="more-results">
      <h2 id="more-results">More results</h2>
      <div className={styles.grid}>{items.map((r) => (
        <ResultCard key={r.seed} seed={r.seed} version={version} active={r.seed === activeSeed} onSelect={() => onSelect(r.seed)}
          caption={showScore ? `≈ ${Math.round(r.score)} blocks total` : undefined} />))}</div>
    </section>
  );
}
