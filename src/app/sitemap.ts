import type { MetadataRoute } from 'next';
import { PAGES } from '@/config/navigation';
import { SITE } from '@/config/site';
export const dynamic = 'force-static';
export default function sitemap(): MetadataRoute.Sitemap { return PAGES.map((p) => ({ url: `${SITE.url}${p.href}`, lastModified: new Date() })); }
