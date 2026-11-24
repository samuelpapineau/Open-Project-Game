// Main-thread handle to the worker: promise-based API, lazily created, one instance per page.
import { SITE } from '@/config/site';
import type { MetaResult, NewRequest, RenderParams, RenderResult, Response, SearchParams, SeedResult } from './protocol';

interface Pending { resolve(v: unknown): void; reject(e: Error): void; onProgress?: (n: number) => void }

export class EngineClient {
  private worker = new Worker(new URL('./engine.worker.ts', import.meta.url), { name: 'mc-masters-engine' });
  private pending = new Map<number, Pending>();
  private metaCache = new Map<string, Promise<MetaResult>>();
  private seq = 0;
  private ready: Promise<string[]>;

  constructor() {
    this.worker.onmessage = ({ data: r }: MessageEvent<Response>) => {
      const p = this.pending.get(r.id); if (!p) return;
      if (r.kind === 'progress') return p.onProgress?.(r.data);
      this.pending.delete(r.id);
      if (r.kind === 'error') p.reject(new Error(r.message)); else p.resolve(r.data);
    };
    this.worker.onerror = (e) => { this.pending.forEach((p) => p.reject(new Error(e.message))); this.pending.clear(); };
    this.ready = this.call<string[]>({ type: 'init', base: SITE.basePath });
  }

  private call<T>(req: NewRequest, opts: { onProgress?: (n: number) => void; signal?: AbortSignal } = {}): Promise<T> {
    const id = ++this.seq;
    return new Promise<T>((resolve, reject) => {
      this.pending.set(id, { resolve: resolve as (v: unknown) => void, reject, onProgress: opts.onProgress });
      this.worker.postMessage({ ...req, id });
      opts.signal?.addEventListener('abort', () => {
        this.worker.postMessage({ type: 'cancel', id: ++this.seq, target: id });
        this.pending.delete(id); reject(new DOMException('Aborted', 'AbortError'));
      }, { once: true });
    });
  }
  versions() { return this.ready; }
  meta(version: string) {
    let m = this.metaCache.get(version);
    if (!m) { m = this.ready.then(() => this.call<MetaResult>({ type: 'meta', version })); this.metaCache.set(version, m); }
    return m;
  }
  async render(p: RenderParams) { await this.ready; return this.call<RenderResult>({ type: 'render', ...p }); }
  async search(p: SearchParams, onProgress: (n: number) => void, signal: AbortSignal) {
    await this.ready; return this.call<SeedResult[]>({ type: 'search', ...p }, { onProgress, signal });
  }
}
let instance: EngineClient | undefined;
export const getEngineClient = () => (instance ??= new EngineClient());
