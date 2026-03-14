import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Beyond The Body — Mental Wellness & Healing',
  description:
    'Beyond The Body is a safe, judgment-free space where heart, soul, and mind unite. Evidence-based therapy, expert support, and a community that understands your journey.',
  icons: { icon: '/img/btb-logo.png' },
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
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Outfit:wght@300;400;500;600&family=Italiana&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
