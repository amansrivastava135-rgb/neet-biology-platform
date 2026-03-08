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
  title: 'Dr. Amankumar Srivastav Pvt Tutorials | NEET Biology Preparation',
  description: 'Master NCERT Biology for NEET with chapter-wise practice, previous year questions, mock tests, and performance analytics. Expert guidance by Dr. Amankumar Srivastav.',
  keywords: ['NEET Biology', 'NCERT Biology', 'NEET Preparation', 'Biology MCQ', 'NEET PYQ', 'Medical Entrance'],
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
