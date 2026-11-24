'use client';
import { useCallback, useEffect, useRef } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';
import { getEngineClient } from '../../engine/client';
import type { Point } from '../../engine/protocol';
import { STRUCTURES } from '../../data/structures';
import styles from './SeedMap.module.css';

const SCALES = [1, 4, 16, 64, 256], MIN_BPP = 0.25, MAX_BPP = 256, MARGIN = 0.25, HOME = { cx: 0, cz: 0, bpp: 4 };
interface Frame { canvas: HTMLCanvasElement; ids: Int32Array; markers: Record<number, Point[]>; x0: number; z0: number; sw: number; sh: number; scale: number }
interface Props { seed: string; version: string; markerTypes: number[]; biomeNames: Record<number, string> }

/**
 * Pan/zoom model: the last rendered frame (rendered in the worker with a margin) is re-drawn instantly
 * on every interaction (cheap canvas transform); a debounced request fetches a sharper frame afterwards.
 */
export default function SeedMap({ seed, version, markerTypes, biomeNames }: Props) {
  const box = useRef<HTMLDivElement>(null), canvas = useRef<HTMLCanvasElement>(null);
  const xEl = useRef<HTMLSpanElement>(null), zEl = useRef<HTMLSpanElement>(null), bEl = useRef<HTMLSpanElement>(null);
  const view = useRef({ ...HOME }), frame = useRef<Frame | null>(null), token = useRef(0), timer = useRef(0);
  const pointers = useRef(new Map<number, { x: number; y: number }>()), pinch = useRef(0);
  const names = useRef(biomeNames);
  useEffect(() => { names.current = biomeNames; }, [biomeNames]);

  const paint = useCallback(() => {
    const c = canvas.current, b = box.current; if (!c || !b) return;
    const W = b.clientWidth, H = b.clientHeight; if (c.width !== W || c.height !== H) { c.width = W; c.height = H; }
    const g = c.getContext('2d'); if (!g) return;
    const { cx, cz, bpp } = view.current, ox = cx - (W * bpp) / 2, oz = cz - (H * bpp) / 2;
    const px = (x: number) => (x - ox) / bpp, pz = (z: number) => (z - oz) / bpp;
    g.fillStyle = '#1b2a3a'; g.fillRect(0, 0, W, H);
    const fr = frame.current;
    if (fr) { g.imageSmoothingEnabled = false; g.drawImage(fr.canvas, px(fr.x0 * fr.scale), pz(fr.z0 * fr.scale), (fr.sw * fr.scale) / bpp, (fr.sh * fr.scale) / bpp); }
    if (bpp <= 2) {                                                   // chunk grid (16 blocks)
      g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 1; g.beginPath();
      for (let x = Math.floor(ox / 16) * 16; px(x) < W; x += 16) { g.moveTo(px(x) + .5, 0); g.lineTo(px(x) + .5, H); }
      for (let z = Math.floor(oz / 16) * 16; pz(z) < H; z += 16) { g.moveTo(0, pz(z) + .5); g.lineTo(W, pz(z) + .5); }
      g.stroke();
    }
    g.strokeStyle = '#f33'; g.lineWidth = 2; g.beginPath();           // world origin
    g.moveTo(px(0) - 8, pz(0)); g.lineTo(px(0) + 8, pz(0)); g.moveTo(px(0), pz(0) - 8); g.lineTo(px(0), pz(0) + 8); g.stroke();
    if (!fr) return;
    g.font = 'bold 11px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (const [t, pts] of Object.entries(fr.markers)) {
      const s = STRUCTURES[+t];
      for (const p of pts) {
        const x = px(p.x), z = pz(p.z); if (x < -10 || z < -10 || x > W + 10 || z > H + 10) continue;
        g.fillStyle = s.color; g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.arc(x, z, 9, 0, 7); g.fill(); g.stroke();
        g.fillStyle = '#fff'; g.fillText(s.glyph, x, z);
      }
    }
  }, []);

  const fetchFrame = useCallback(async () => {
    const b = box.current; if (!b || !b.clientWidth) return;
    const { cx, cz, bpp } = view.current, W = b.clientWidth, H = b.clientHeight;
    const scale = SCALES.find((s) => s >= bpp * 0.7) ?? 256;
    const spanX = W * bpp * (1 + 2 * MARGIN), spanZ = H * bpp * (1 + 2 * MARGIN);
    const x0 = Math.floor((cx - spanX / 2) / scale), z0 = Math.floor((cz - spanZ / 2) / scale);
    const w = Math.ceil(spanX / scale) + 1, h = Math.ceil(spanZ / scale) + 1, t = ++token.current;
    try {
      const r = await getEngineClient().render({ version, seed, x0, z0, w, h, scale, types: markerTypes });
      if (t !== token.current) return;                                // a newer request superseded this one
      const off = document.createElement('canvas'); off.width = w; off.height = h;
      off.getContext('2d')?.putImageData(new ImageData(r.rgba, w, h), 0, 0);
      frame.current = { canvas: off, ids: r.ids, markers: r.markers, x0, z0, sw: w, sh: h, scale }; paint();
    } catch (e) { console.error('Map render failed', e); }
  }, [version, seed, markerTypes, paint]);

  const schedule = useCallback(() => { window.clearTimeout(timer.current); timer.current = window.setTimeout(fetchFrame, 60); }, [fetchFrame]);
  const moved = useCallback(() => { paint(); schedule(); }, [paint, schedule]);

  useEffect(() => {                                                   // new seed/version → reset
    view.current = { ...HOME }; frame.current = null; paint(); void fetchFrame();
    return () => { token.current++; window.clearTimeout(timer.current); };
  }, [fetchFrame, paint]);
  useEffect(() => { const b = box.current; if (!b) return; const ro = new ResizeObserver(moved); ro.observe(b); return () => ro.disconnect(); }, [moved]);

  const zoomAt = useCallback((factor: number, sx: number, sy: number) => {
    const b = box.current; if (!b) return;
    const v = view.current, W = b.clientWidth, H = b.clientHeight, nb = Math.min(MAX_BPP, Math.max(MIN_BPP, v.bpp * factor));
    const wx = v.cx + (sx - W / 2) * v.bpp, wz = v.cz + (sy - H / 2) * v.bpp;     // keep world point under cursor fixed
    v.bpp = nb; v.cx = wx - (sx - W / 2) * nb; v.cz = wz - (sy - H / 2) * nb; moved();
  }, [moved]);
  const zoomCenter = (f: number) => { const b = box.current; if (b) zoomAt(f, b.clientWidth / 2, b.clientHeight / 2); };

  // Wheel must be a non-passive native listener so the page never scrolls while zooming the map.
  useEffect(() => {
    const c = canvas.current; if (!c) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault(); const r = c.getBoundingClientRect();
      const d = e.deltaY * (e.deltaMode === 1 ? 16 : 1);
      zoomAt(Math.min(2, Math.max(0.5, Math.exp(d * 0.0015))), e.clientX - r.left, e.clientY - r.top);
    };
    c.addEventListener('wheel', onWheel, { passive: false }); return () => c.removeEventListener('wheel', onWheel);
  }, [zoomAt]);

  const updateHud = (sx: number, sy: number) => {
    const b = box.current; if (!b) return;
    const { cx, cz, bpp } = view.current, wx = Math.round(cx + (sx - b.clientWidth / 2) * bpp), wz = Math.round(cz + (sy - b.clientHeight / 2) * bpp);
    if (xEl.current) xEl.current.textContent = String(wx); if (zEl.current) zEl.current.textContent = String(wz);
    const fr = frame.current;
    if (fr && bEl.current) { const id = fr.ids[(Math.floor(wz / fr.scale) - fr.z0) * fr.sw + (Math.floor(wx / fr.scale) - fr.x0)]; bEl.current.textContent = (names.current[id] ?? '').replace(/_/g, ' '); }
  };
  const onPointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId); const r = e.currentTarget.getBoundingClientRect();
    pointers.current.set(e.pointerId, { x: e.clientX - r.left, y: e.clientY - r.top }); pinch.current = 0;
  };
  const onPointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect(), sx = e.clientX - r.left, sy = e.clientY - r.top;
    if (sx >= 0 && sy >= 0 && sx <= r.width && sy <= r.height) updateHud(sx, sy);   // HUD freezes once the cursor leaves the map
    const prev = pointers.current.get(e.pointerId); if (!prev) return;
    pointers.current.set(e.pointerId, { x: sx, y: sy });
    if (pointers.current.size === 2) {                                // two-finger pinch zoom
      const [a, b] = [...pointers.current.values()], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch.current) zoomAt(pinch.current / d, (a.x + b.x) / 2, (a.y + b.y) / 2); pinch.current = d;
    } else { view.current.cx -= (sx - prev.x) * view.current.bpp; view.current.cz -= (sy - prev.y) * view.current.bpp; moved(); }
  };
  const onPointerEnd = (e: PointerEvent<HTMLCanvasElement>) => { pointers.current.delete(e.pointerId); pinch.current = 0; };
  const onKeyDown = (e: KeyboardEvent<HTMLCanvasElement>) => {
    const v = view.current, step = 100 * v.bpp, k = e.key;
    if (k === 'ArrowLeft') v.cx -= step; else if (k === 'ArrowRight') v.cx += step; else if (k === 'ArrowUp') v.cz -= step; else if (k === 'ArrowDown') v.cz += step;
    else if (k === '+' || k === '=') return zoomCenter(0.7); else if (k === '-') return zoomCenter(1.4);
    else if (k === '0') view.current = { ...HOME }; else return;
    e.preventDefault(); moved();
  };

  return (
    <div className={styles.box} ref={box}>
      <canvas ref={canvas} className={styles.canvas} tabIndex={0} role="img" aria-label={`Biome map for seed ${seed}. Arrow keys pan, plus and minus zoom.`}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerEnd} onPointerCancel={onPointerEnd}
        onDoubleClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); zoomAt(0.5, e.clientX - r.left, e.clientY - r.top); }} onKeyDown={onKeyDown} />
      <div className={styles.hud}>X: <span ref={xEl}>–</span><br />Z: <span ref={zEl}>–</span><span ref={bEl} className={styles.biome} /></div>
      <div className={styles.zoom}>
        <button onClick={() => zoomCenter(0.6)} aria-label="Zoom in">+</button>
        <button onClick={() => zoomCenter(1.6)} aria-label="Zoom out">−</button>
        <button onClick={() => { view.current = { ...HOME }; moved(); }} aria-label="Reset view">⌂</button>
      </div>
    </div>
  );
}
