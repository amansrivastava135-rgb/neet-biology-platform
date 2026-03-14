import type { Metadata } from 'next'
import { Inter, Merriweather } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
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
    default: 'Dr. Amankumar Srivastav | NEET Biology Preparation',
    template: '%s | NEET Biology by Dr. Amankumar Srivastav',
  },
  description: 'Master NCERT Biology for NEET with 3800+ MCQs, chapter-wise practice, PYQs (2010-2024), mock tests, and performance analytics. Expert guidance by Dr. Amankumar Srivastav.',
  keywords: ['NEET Biology', 'NCERT Biology', 'NEET Preparation', 'Biology MCQ', 'NEET PYQ', 'Medical Entrance', 'NEET 2025', 'NEET 2026', 'Biology Mock Test', 'NCERT MCQ'],
  authors: [{ name: 'Dr. Amankumar Srivastav' }],
  creator: 'Dr. Amankumar Srivastav',
  metadataBase: new URL('https://neet-biology-platform.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://neet-biology-platform.vercel.app',
    siteName: 'Dr. Amankumar Srivastav Pvt Tutorials',
    title: 'NEET Biology Preparation | 3800+ MCQs & Mock Tests',
    description: 'Master NCERT Biology for NEET with chapter-wise practice, PYQs, mock tests, and analytics.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NEET Biology Preparation | Dr. Amankumar Srivastav',
    description: 'Master NCERT Biology for NEET with 3800+ MCQs, mock tests, and analytics.',
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
      <body className={`${inter.variable} ${merriweather.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}