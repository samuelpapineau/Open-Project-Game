import type { NextConfig } from 'next';
// Static export: `npm run build` outputs a fully static site to /out
const config: NextConfig = { output: 'export', images: { unoptimized: true }, trailingSlash: true };
export default config;
