// pages/_document.js — Next.js custom document for PWA support
// Drop into: frontend/src/pages/_document.js

import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* ── PWA / App install ── */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content="WC2026" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="WC2026" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* ── Theme colors ── */}
        <meta name="theme-color" content="#8A1538" />
        <meta name="msapplication-TileColor" content="#8A1538" />
        <meta name="msapplication-navbutton-color" content="#8A1538" />

        {/* ── SEO / OG ── */}
        <meta name="description" content="FIFA World Cup 2026 AI Travel Companion — plan matches, hotels & itineraries" />
        <meta property="og:title" content="FIFA World Cup 2026 – AI Travel Companion" />
        <meta property="og:description" content="Plan your World Cup 2026 trip with AI" />
        <meta property="og:type" content="website" />

        {/* ── Icons (you'll generate these — see README) ── */}
        <link rel="icon" type="image/svg+xml" href="/icons/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192.png" />

        {/* ── Font ── */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
