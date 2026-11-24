// Messages exchanged between the UI (client.ts) and the Web Worker (engine.worker.ts).
export interface Point { x: number; z: number }
export interface BiomeOption { id: number; name: string }
export interface MetaResult { biomes: BiomeOption[]; structures: number[] }
export interface RenderParams { version: string; seed: string; x0: number; z0: number; w: number; h: number; scale: number; types: number[] }
export interface RenderResult { rgba: Uint8ClampedArray<ArrayBuffer>; ids: Int32Array<ArrayBuffer>; markers: Record<number, Point[]> }
export interface SearchParams { version: string; biomeId: number | null; types: number[]; count: number; maxTries: number }
export interface SeedResult { seed: string; score: number }

export type Request = { id: number } & (
  | { type: 'init'; base: string }
  | { type: 'meta'; version: string }
  | ({ type: 'render' } & RenderParams)
  | ({ type: 'search' } & SearchParams)
  | { type: 'cancel'; target: number });
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
export type NewRequest = DistributiveOmit<Request, 'id'>;
export type Response =
  | { id: number; kind: 'done'; data: unknown }
  | { id: number; kind: 'progress'; data: number }
  | { id: number; kind: 'error'; message: string };
