'use client';
import Button from '@/components/ui/Button/Button';
import PageShell from '@/components/layout/PageShell/PageShell';
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return <PageShell title="Something went wrong"><p>An unexpected error occurred.</p><Button onClick={reset}>Try again</Button></PageShell>;
}
