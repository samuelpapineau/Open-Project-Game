import type { Metadata } from 'next';
import { PAGES } from './navigation';
export function pageMetadata(href: string): Metadata {
  const p = PAGES.find((x) => x.href === href);
  if (!p) throw new Error(`Unknown page ${href}: add it to src/config/navigation.ts`);
  return { title: p.title, description: p.description, alternates: { canonical: p.href }, openGraph: { title: p.title, description: p.description } };
}
