# MC Masters
Static Next.js + TypeScript site. World generation = Cubiomes → WebAssembly, run in a Web Worker.

## Setup
1. `npm install`
2. Install Emscripten (emsdk) and run its env script, then `npm run wasm` (**re-run after pulling this version**: the build now targets workers).
3. `cp .env.example .env.local` and fill in IDs.
4. `npm run dev` · `npm run typecheck` · `npm run build` (static site in `out/`).

## Structure
- `src/app` – routes only (thin). `src/config` – site info, **navigation (add pages here)**, ad slots.
- `src/components/{layout,ui}` – shared components, each in its own folder with a `.module.css`.
- `src/features/seed-finder` – **all** map/generation code (engine worker, client, UI). Exposes only `SeedFinder`; new pages never touch it.
- `src/styles/globals.css` – design tokens + reset only.

## Adding a page
Create `src/app/<name>/page.tsx` using `PageShell`, add an entry to `src/config/navigation.ts` (header/footer/sitemap/metadata update automatically).

## New Minecraft versions
`git -C wasm/cubiomes pull && npm run wasm`. Versions, biomes and structures in the menus come from the WASM module.
