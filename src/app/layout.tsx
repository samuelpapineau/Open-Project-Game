import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import Script from 'next/script';
import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';
import { SITE } from '@/config/site';
import '@/styles/globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url), applicationName: SITE.name, description: SITE.description,
  title: { default: `${SITE.name} – ${SITE.tagline}`, template: `%s | ${SITE.name}` },
  openGraph: { siteName: SITE.name, type: 'website', title: `${SITE.name} – ${SITE.tagline}`, description: SITE.description },
  twitter: { card: 'summary' }, robots: { index: true, follow: true },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0f1218' };

export default function RootLayout({ children }: { children: ReactNode }) {
  const ga = process.env.NEXT_PUBLIC_GA_ID, clarity = process.env.NEXT_PUBLIC_CLARITY_ID, ads = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  return (
    <html lang="en"><body>
      <Header /><main id="main">{children}</main><Footer />
      {/* Third-party scripts load after the page is interactive so they never delay navigation. */}
      {ga && <>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="lazyOnload" />
        <Script id="ga" strategy="lazyOnload">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${ga}');`}</Script></>}
      {clarity && <Script id="clarity" strategy="lazyOnload">{`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${clarity}");`}</Script>}
      {ads && <Script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ads}`} crossOrigin="anonymous" strategy="lazyOnload" />}
    </body></html>
  );
}
