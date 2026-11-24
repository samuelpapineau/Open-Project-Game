import Link from 'next/link';
import PageShell from '@/components/layout/PageShell/PageShell';
export default function NotFound() { return <PageShell title="Page not found"><p>That page doesn’t exist. <Link href="/">Back to the seed finder</Link>.</p></PageShell>; }
