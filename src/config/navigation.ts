// To add a page: create src/app/<route>/page.tsx and add one entry here.
// Header, footer, sitemap and page metadata all read from this list.
export interface PageEntry { href: string; label: string; title: string; description: string; header?: boolean; footer?: boolean }
export const PAGES: PageEntry[] = [
  { href: '/', label: 'Seed Finder', title: 'Minecraft Seed Finder', description: 'Find Minecraft seeds by biome and structures near spawn.', header: true },
  { href: '/about/', label: 'About', title: 'About', description: 'Learn how MC Masters finds Minecraft seeds using Cubiomes and WebAssembly, entirely in your browser.', header: true, footer: true },
  { href: '/contact/', label: 'Contact', title: 'Contact', description: 'Contact MC Masters with feedback, bug reports or business enquiries.', header: true, footer: true },
  { href: '/terms/', label: 'Terms', title: 'Terms and Conditions', description: 'Terms and conditions for using the MC Masters website.', footer: true },
  { href: '/privacy/', label: 'Privacy', title: 'Privacy Policy', description: 'How MC Masters handles data, cookies, analytics and advertising.', footer: true },
  { href: '/disclaimer/', label: 'Disclaimer', title: 'Disclaimer', description: 'MC Masters is not affiliated with Mojang or Microsoft. Results are provided as-is.', footer: true },
];
