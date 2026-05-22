import type { Metadata } from 'next'
import { Inter, Merriweather } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { PWAInstall } from '@/components/pwa-install'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
});

const merriweather = Merriweather({ 
  subsets: ["latin"],
  weight: ['400', '700', '900'],
  variable: '--font-merriweather'
});

export const metadata: Metadata = {
  title: {
    default: 'MASTER360 – NEET Biology Mock Tests, MCQs & PYQs Platform',
    template: '%s | MASTER360',
  },
  description: 'MASTER360 is a complete NEET Biology preparation platform with 3800+ MCQs, chapter-wise practice, PYQs (2010-2025), mock tests, and performance analytics by Dr. Amankumar Srivastav.',
  keywords: [
    'MASTER360', 'NEET Biology', 'NCERT Biology', 'NEET Preparation',
    'Biology MCQ', 'NEET PYQ', 'Medical Entrance', 'NEET 2025', 'NEET 2026',
    'Biology Mock Test', 'NCERT MCQ', 'Dr. Amankumar Srivastav',
  ],
  authors: [{ name: 'Dr. Amankumar Srivastav' }],
  creator: 'MASTER360',
  metadataBase: new URL('https://master360.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://master360.vercel.app',
    siteName: 'MASTER360',
    title: 'MASTER360 – NEET Biology Mock Tests, MCQs & PYQs Platform',
    description: 'MASTER360 is a complete NEET Biology preparation platform with MCQs, PYQs, mock tests, and analytics.',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'MASTER360 – NEET Biology Preparation Platform',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MASTER360 – NEET Biology Preparation Platform',
    description: 'MASTER360: 3800+ MCQs, PYQs, mock tests, and performance analytics for NEET Biology.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  verification: {
    google: '8wjsGDVb9cj7iZPsFWXiZMmoWln2hjb7bbE5R8piAfk',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#166534" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body className={`${inter.variable} ${merriweather.variable} font-sans antialiased`}>
        {children}
        <PWAInstall />
        <Analytics />
      </body>
    </html>
  )
}