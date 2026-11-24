'use client';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Button from '@/components/ui/Button/Button';
import Panel from '@/components/ui/Panel/Panel';
import { getEngineClient } from '../../engine/client';
import type { MetaResult, SeedResult } from '../../engine/protocol';
import { randomSeed } from '../../lib/seed';
import ControlPanel from '../ControlPanel/ControlPanel';
import MapLegend from '../MapLegend/MapLegend';
import ResultsGrid from '../ResultsGrid/ResultsGrid';
import SeedMap from '../SeedMap/SeedMap';
import styles from './SeedFinder.module.css';

interface ResultSet { items: SeedResult[]; version: string; types: number[]; names: Record<number, string> }
export interface SeedFinderProps { adTop?: ReactNode; adBottom?: ReactNode }   // injected so the feature stays ad-agnostic

export default function SeedFinder({ adTop, adBottom }: SeedFinderProps) {
  const client = useMemo(() => getEngineClient(), []);
  const [versions, setVersions] = useState<string[]>([]), [version, setVersion] = useState('');
  const [meta, setMeta] = useState<MetaResult | null>(null), [biomeId, setBiomeId] = useState<number | null>(null), [types, setTypes] = useState<number[]>([]);
  const [set, setSet] = useState<ResultSet | null>(null), [active, setActive] = useState(''), [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState(''), [copied, setCopied] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const fail = (e: unknown) => setError(e instanceof Error ? e.message : String(e));

  useEffect(() => { client.versions().then((v) => { setVersions(v); setVersion(v[v.length - 1]); }).catch(fail); }, [client]);
  useEffect(() => {                                   // menus follow the selected version (data comes from the WASM engine)
    if (!version) return; let live = true; setBiomeId(null); setTypes([]);
    client.meta(version).then((m) => live && setMeta(m)).catch(fail); return () => { live = false; };
  }, [client, version]);
  useEffect(() => () => abort.current?.abort(), []);

  const names = useMemo(() => Object.fromEntries((meta?.biomes ?? []).map((b) => [b.id, b.name])), [meta]);
  const show = (items: SeedResult[]) => { setSet({ items, version, types, names }); setActive(items[0]?.seed ?? ''); setError(''); };
  const onRandom = () => show([{ seed: randomSeed(), score: 0 }]);
  const onSearch = async () => {
    const ctl = new AbortController(); abort.current = ctl; setProgress(0); setError('');
    try {
      const items = await client.search({ version, biomeId, types, count: 12, maxTries: 4000 }, setProgress, ctl.signal);
      show(items); if (!items.length) setError('No matching seeds found. Try fewer structures or a different biome.');
    } catch (e) { if (!(e instanceof DOMException)) fail(e); } finally { setProgress(null); }
  };
  const copy = async () => { await navigator.clipboard?.writeText(active); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  return (
    <div>
      <ControlPanel versions={versions} version={version} onVersion={setVersion} biomes={meta?.biomes ?? []} biomeId={biomeId} onBiome={setBiomeId}
        structures={meta?.structures ?? []} selected={types} onToggle={(i) => setTypes((t) => (t.includes(i) ? t.filter((x) => x !== i) : [...t, i]))}
        ready={!!meta} progress={progress} onRandom={onRandom} onSearch={onSearch} onCancel={() => abort.current?.abort()} />
      {adTop}
      {error && <p role="alert" className={error.startsWith('No matching') ? styles.empty : styles.error}>{error}</p>}
      {set && active && (
        <Panel>
          <header className={styles.seedBar}><h2>Seed: <code>{active}</code></h2>
            <Button variant="ghost" onClick={copy}>{copied ? 'Copied ✓' : 'Copy'}</Button></header>
          <SeedMap seed={active} version={set.version} markerTypes={set.types} biomeNames={set.names} />
          <MapLegend types={set.types} />
        </Panel>)}
      {set && set.items.length > 1 && <ResultsGrid items={set.items} version={set.version} activeSeed={active} showScore={set.types.length > 0}
        onSelect={(s) => { setActive(s); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />}
      {adBottom}
    </div>
  );
}
