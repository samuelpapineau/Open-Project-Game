// Seed search. Hard requirements (biome near spawn, every chosen structure) keep variance tiny;
// the score then ranks seeds by how close their structures are to spawn (lower = better).
import type { Engine } from './core';
import type { SearchParams, SeedResult } from './protocol';
import { randomSeed } from '../lib/seed';

const BIOME_RADIUS = 160, STRUCT_RADIUS = 1400;

function evaluate(e: Engine, p: SearchParams, seed: string): number | null {
  e.setSeed(p.version, seed);
  if (p.biomeId !== null) {
    let hit = false;
    for (let x = -BIOME_RADIUS; x <= BIOME_RADIUS && !hit; x += 32)
      for (let z = -BIOME_RADIUS; z <= BIOME_RADIUS; z += 32) if (e.biomeAt(x, z) === p.biomeId) { hit = true; break; }
    if (!hit) return null;                              // cheap check first
  }
  let score = 0;
  for (const t of p.types) {
    const list = e.structures(t, -STRUCT_RADIUS, -STRUCT_RADIUS, STRUCT_RADIUS, STRUCT_RADIUS, 60);
    if (!list.length) return null;
    score += Math.min(...list.map((q) => Math.hypot(q.x, q.z)));
  }
  return score;
}

export async function searchSeeds(e: Engine, p: SearchParams, onProgress: (f: number) => void, cancelled: () => boolean): Promise<SeedResult[]> {
  const found: SeedResult[] = [];
  for (let i = 0; i < p.maxTries && found.length < p.count * 3 && !cancelled(); i++) {
    const seed = randomSeed(), score = evaluate(e, p, seed);
    if (score !== null) found.push({ seed, score });
    if (i % 20 === 0) { onProgress(i / p.maxTries); await new Promise((r) => setTimeout(r)); } // yield so cancel messages arrive
  }
  return found.sort((a, b) => a.score - b.score).slice(0, p.count);
}
