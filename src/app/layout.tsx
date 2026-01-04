import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navigation, Footer } from '@/components/layout';
import { Providers } from './providers';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://globalcover.com';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#006fc5' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'GlobalCover - Insurance Marketplace for Digital Nomads',
    template: '%s | GlobalCover',
  },
  description: 'The insurance marketplace built for digital nomads and expats. Compare travel, health, property, and liability insurance from 30+ providers. Join our membership for exclusive benefits and up to 40% off.',
  keywords: [
    'digital nomad insurance',
    'expat insurance',
    'travel insurance',
    'health insurance abroad',
    'remote worker insurance',
    'international health insurance',
    'nomad health coverage',
    'location independent insurance',
    'freelancer insurance',
    'global health insurance',
  ],
  authors: [{ name: 'GlobalCover' }],
  creator: 'GlobalCover',
  publisher: 'GlobalCover',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'GlobalCover - Insurance Marketplace for Digital Nomads',
    description: 'Compare and purchase insurance designed for location-independent professionals. Join 10,000+ nomads who trust GlobalCover.',
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: 'GlobalCover',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GlobalCover - Insurance for Digital Nomads',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GlobalCover - Insurance for Digital Nomads',
    description: 'Compare and purchase insurance designed for location-independent professionals.',
    creator: '@globalcover',
    images: ['/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: baseUrl,
  },
  category: 'insurance',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Providers>
          <Navigation />
          <main className="flex-1 pt-16 lg:pt-20">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
