// All heavy WASM work happens here so the UI thread never blocks (smooth zoom, scroll and navigation).
import { createEngine, type Engine, type WasmModule } from './core';
import { searchSeeds } from './search';
import type { Request, Response } from './protocol';

interface Ctx {
  postMessage(m: Response, transfer?: Transferable[]): void;
  importScripts(...urls: string[]): void;
  onmessage: ((e: MessageEvent<Request>) => void) | null;
  createCubiomes?: (o: { locateFile: (f: string) => string }) => Promise<WasmModule>;
}
const ctx = self as unknown as Ctx;
let ready: Promise<Engine> | null = null;
const cancelled = new Set<number>();

function boot(base: string): Promise<Engine> {
  return (async () => {
    try { ctx.importScripts(`${base}/wasm/cubiomes.js`); } catch { throw new Error('Missing /wasm/cubiomes.js — run "npm run wasm" (see README).'); }
    const m = await ctx.createCubiomes!({ locateFile: (f) => `${base}/wasm/${f}` });
    return createEngine(m);
  })();
}
const done = (id: number, data: unknown, t?: Transferable[]) => ctx.postMessage({ id, kind: 'done', data }, t);

ctx.onmessage = async ({ data: r }) => {
  if (r.type === 'cancel') { cancelled.add(r.target); return; }
  try {
    if (r.type === 'init') { ready = boot(r.base); return done(r.id, (await ready).versions()); }
    const e = await ready!;
    if (r.type === 'meta') return done(r.id, e.meta(r.version));
    if (r.type === 'render') { const out = e.render(r); return done(r.id, out, [out.rgba.buffer, out.ids.buffer]); }
    if (r.type === 'search') {
      const items = await searchSeeds(e, r, (data) => ctx.postMessage({ id: r.id, kind: 'progress', data }), () => cancelled.has(r.id));
      cancelled.delete(r.id); return done(r.id, items);
    }
  } catch (err) { ctx.postMessage({ id: r.id, kind: 'error', message: err instanceof Error ? err.message : String(err) }); }
};
