// Typed wrapper around the Cubiomes WASM exports. Runs inside the worker only.
import { STRUCTURES } from '../data/structures';
import type { BiomeOption, MetaResult, Point, RenderParams, RenderResult } from './protocol';

export interface WasmModule {
  cwrap<R>(name: string, ret: string | null, args: string[]): (...a: (string | number)[]) => R;
  _malloc(n: number): number; _free(p: number): void; HEAPU8: Uint8Array<ArrayBuffer>; HEAP32: Int32Array<ArrayBuffer>;
}

export function createEngine(m: WasmModule) {
  const n6 = ['number', 'number', 'number', 'number', 'number', 'number'];
  const f = {
    versions: m.cwrap<string>('versions', 'string', []), setup: m.cwrap<void>('setup', null, ['string', 'number', 'number']),
    biomes: m.cwrap<string>('biomes', 'string', []), biomeAt: m.cwrap<number>('biome_at', 'number', ['number', 'number']),
    structOk: m.cwrap<number>('struct_ok', 'number', ['number']),
    render: m.cwrap<number>('render', 'number', [...n6, 'number']), structs: m.cwrap<number>('structs', 'number', [...n6, 'number']),
  };
  let cur = '';
  const setSeed = (version: string, seed: string) => {
    const key = `${version}|${seed}`; if (key === cur) return; cur = key;   // skip redundant re-setup
    const b = BigInt.asIntN(64, BigInt(seed));
    f.setup(version, Number(BigInt.asIntN(32, b)), Number(BigInt.asIntN(32, b >> 32n)));
  };
  const structures = (type: number, x0: number, z0: number, x1: number, z1: number, max = 400): Point[] => {
    const p = m._malloc(max * 8), n = f.structs(type, x0, z0, x1, z1, p, max);
    const a = m.HEAP32.slice(p >> 2, (p >> 2) + n * 2); m._free(p);
    return Array.from({ length: n }, (_, i) => ({ x: a[i * 2], z: a[i * 2 + 1] }));
  };
  return {
    versions: () => f.versions().split(','),
    biomeAt: (x: number, z: number) => f.biomeAt(x, z),
    structures, setSeed,
    meta(version: string): MetaResult {
      setSeed(version, '0');
      const biomes: BiomeOption[] = f.biomes().split(',').map((s) => { const [id, ...n] = s.split(':'); return { id: +id, name: n.join(':') }; });
      return { biomes, structures: STRUCTURES.map((_, i) => i).filter((i) => f.structOk(i)) };
    },
    render(p: RenderParams): RenderResult {
      setSeed(p.version, p.seed);
      const n = p.w * p.h, pr = m._malloc(n * 4), pi = m._malloc(n * 4);
      f.render(p.x0, p.z0, p.w, p.h, p.scale, pr, pi);
      const rgba = new Uint8ClampedArray(m.HEAPU8.slice(pr, pr + n * 4)), ids = m.HEAP32.slice(pi >> 2, (pi >> 2) + n);
      m._free(pr); m._free(pi);
      const markers: Record<number, Point[]> = {};
      for (const t of p.types) markers[t] = structures(t, p.x0 * p.scale, p.z0 * p.scale, (p.x0 + p.w) * p.scale, (p.z0 + p.h) * p.scale);
      return { rgba, ids, markers };
    },
  };
}
export type Engine = ReturnType<typeof createEngine>;
