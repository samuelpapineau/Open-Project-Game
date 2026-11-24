export const SITE = {
  name: 'MC Masters',
  brand: ['MC', 'Masters'] as const,
  tagline: 'Minecraft Seed Finder & Map Viewer',
  description: 'Find Minecraft seeds by biome and nearby structures for any Java Edition version, and explore a zoomable chunk map instantly in your browser.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com',
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? '',
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'contact@example.com',
} as const;
