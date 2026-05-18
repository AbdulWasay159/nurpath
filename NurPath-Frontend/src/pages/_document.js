import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Theme color — gold for Android chrome bar */}
        <meta name="theme-color" content="#C9A84C" />

        {/* iOS PWA support */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="NurPath" />

        {/* iOS icons — add these image files to /public/icons/ */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192.png" />

        {/* Splash screen color for iOS */}
        <meta name="msapplication-TileColor" content="#080D13" />
        <meta name="msapplication-TileImage" content="/icons/icon-192.png" />

        {/* Viewport for mobile */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />

        {/* App description for SEO */}
        <meta name="description" content="Track your daily Salah, find prayer times, view masjid timings, and stay connected to your deen." />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
