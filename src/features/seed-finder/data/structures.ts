// UI metadata. Order must match ST[] in wasm/wrapper.c. Version availability is asked from WASM.
export interface StructureInfo { label: string; glyph: string; color: string }
export const STRUCTURES: StructureInfo[] = [
  { label: 'Desert Pyramid', glyph: 'D', color: '#e8c25a' }, { label: 'Jungle Temple', glyph: 'J', color: '#3fa34d' },
  { label: 'Swamp Hut', glyph: 'S', color: '#5b6b3a' }, { label: 'Igloo', glyph: 'I', color: '#6fb8e6' },
  { label: 'Village', glyph: 'V', color: '#c97b3d' }, { label: 'Ocean Ruins', glyph: 'R', color: '#3b7ea1' },
  { label: 'Shipwreck', glyph: 'W', color: '#7a5230' }, { label: 'Ocean Monument', glyph: 'M', color: '#2fd0c0' },
  { label: 'Woodland Mansion', glyph: 'H', color: '#6e2b2b' }, { label: 'Pillager Outpost', glyph: 'O', color: '#555555' },
  { label: 'Ruined Portal', glyph: 'P', color: '#a24bd6' }, { label: 'Ancient City', glyph: 'A', color: '#103a4a' },
  { label: 'Trail Ruins', glyph: 'T', color: '#d0a070' }, { label: 'Trial Chambers', glyph: 'C', color: '#d98324' },
];
