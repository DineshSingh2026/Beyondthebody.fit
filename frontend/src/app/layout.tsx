import type { Metadata, Viewport } from 'next';
import './globals.css';
import '@/styles/dashboard.css';
import '@/styles/mobile.css';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';
import ZoomLock from '@/components/ZoomLock';

export const metadata: Metadata = {
  title: 'Beyond The Body — Mental Wellness & Healing',
  description:
    'Beyond The Body is a safe, judgment-free space where heart, soul, and mind unite. Evidence-based therapy, expert support, and a community that understands your journey.',
  icons: { icon: '/img/btb-logo-app.png' },
  applicationName: 'Beyond The Body',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Beyond TB',
  },
  formatDetection: { telephone: false, email: false },
  manifest: '/manifest.json',
  other: {
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#0a1a0f',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a1a0f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Italiana&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/img/btb-logo-app.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Beyond TB" />
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-1170x2532.png"
          media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-1125x2436.png"
          media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-828x1792.png"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-750x1334.png"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-2732x2048.png"
          media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)"
        />
      </head>
      <body>
        <ZoomLock />
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
