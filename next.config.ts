import type { NextConfig } from 'next';
import path from 'path';

// NEXT_PUBLIC_BASE_PATH is "" for a domain root (user.github.io, custom domain)
// or "/repo-name" for a GitHub Pages project site. It is also read by src/config/site.ts.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const config: NextConfig = {
  output: 'export',            // fully static: HTML/CSS/JS in /out, no server
  basePath,
  images: { unoptimized: true },
  trailingSlash: true,
  outputFileTracingRoot: path.join(__dirname),
};
export default config;
