// Thin C layer over Cubiomes (https://github.com/Cubitect/cubiomes).
// Everything the UI needs is exported here, so new Minecraft versions appear
// automatically after you update the cubiomes submodule and re-run `npm run wasm`.
#include <emscripten.h>
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include "generator.h"
#include "finders.h"
#include "util.h"
#include "util.h"

static Generator g;
static int mc = MC_NEWEST;
static unsigned char colors[256][3];
static char buf[4096];
// Order must match STRUCTURES in lib/catalog.js
static const int ST[] = { Desert_Pyramid, Jungle_Pyramid, Swamp_Hut, Igloo, Village, Ocean_Ruin,
  Shipwreck, Monument, Mansion, Outpost, Ruined_Portal, Ancient_City, Trail_Ruins, Trial_Chambers };
#define NST (int)(sizeof(ST)/sizeof(ST[0]))

EMSCRIPTEN_KEEPALIVE const char* versions(void) {   // oldest -> newest, comma separated
  buf[0] = 0;
  for (int i = MC_UNDEF + 1; i <= MC_NEWEST; i++) { if (buf[0]) strcat(buf, ","); strcat(buf, mc2str(i)); }
  return buf;
}
EMSCRIPTEN_KEEPALIVE void setup(const char* ver, int lo, int hi) {
  static int init = 0; if (!init) { initBiomeColors(colors); init = 1; }
  mc = str2mc(ver); if (mc < 0) mc = MC_NEWEST;
  setupGenerator(&g, mc, 0);
  applySeed(&g, DIM_OVERWORLD, ((uint64_t)(uint32_t)hi << 32) | (uint32_t)lo);
}
EMSCRIPTEN_KEEPALIVE const char* biomes(void) {     // "id:name,..." valid in the current version
  buf[0] = 0; char t[96];
  for (int id = 0; id < 256; id++) {
    const char* n = biome2str(mc, id);
    if (!n || !isOverworld(mc, id)) continue;
    snprintf(t, sizeof t, "%s%d:%s", buf[0] ? "," : "", id, n); strcat(buf, t);
  }
  return buf;
}
EMSCRIPTEN_KEEPALIVE const char* biome_name(int id) { const char* n = biome2str(mc, id); return n ? n : "unknown"; }
EMSCRIPTEN_KEEPALIVE int biome_at(int x, int z) { return getBiomeAt(&g, 1, x, 63, z); }
EMSCRIPTEN_KEEPALIVE int struct_ok(int t) { StructureConfig c; return t >= 0 && t < NST && getStructureConfig(ST[t], mc, &c); }
EMSCRIPTEN_KEEPALIVE int render(int x0, int z0, int w, int h, int scale, unsigned char* rgba, int* ids) {
  Range r = { scale, x0, z0, w, h, scale == 1 ? 63 : 15, 1 };
  int* c = allocCache(&g, r);
  if (genBiomes(&g, c, r)) { free(c); return 0; }
  for (int i = 0; i < w * h; i++) {
    ids[i] = c[i]; unsigned char* p = colors[c[i] & 255];
    rgba[i*4] = p[0]; rgba[i*4+1] = p[1]; rgba[i*4+2] = p[2]; rgba[i*4+3] = 255;
  }
  free(c); return 1;
}
// Writes (x,z) pairs of viable structures inside the block rectangle; returns count.
EMSCRIPTEN_KEEPALIVE int structs(int t, int x0, int z0, int x1, int z1, int* out, int max) {
  StructureConfig c; if (!struct_ok(t) || !getStructureConfig(ST[t], mc, &c)) return 0;
  int rs = c.regionSize * 16, n = 0, rx0 = x0 / rs - 1, rx1 = x1 / rs + 1, rz0 = z0 / rs - 1, rz1 = z1 / rs + 1;
  for (int rz = rz0; rz <= rz1; rz++) for (int rx = rx0; rx <= rx1; rx++) {
    Pos p; if (!getStructurePos(ST[t], mc, g.seed, rx, rz, &p)) continue;
    if (p.x < x0 || p.x > x1 || p.z < z0 || p.z > z1 || !isViableStructurePos(ST[t], &g, p.x, p.z, 0)) continue;
    if (n < max) { out[n*2] = p.x; out[n*2+1] = p.z; } n++;
  }
  return n < max ? n : max;
}
