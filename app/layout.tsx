import type { Metadata } from 'next'
import { AuthProvider } from '@/app/contexts/AuthContext'
import './globals.css'
import { Inter } from 'next/font/google'
import { Reenie_Beanie } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const dancing = Reenie_Beanie({ subsets: ['latin'], weight: '400', variable: '--font-handwriting' })

export const metadata: Metadata = {
  title: {
    default: 'ourlittlecorner — a tiny home for us',
    template: '%s · ourlittlecorner',
  },
  description:
    'A cozy shared space for us — memories, music, journals, and special days.',
  applicationName: 'ourlittlecorner',
  generator: 'v0.dev',
  keywords: [
    'ourlittlecorner',
    'memories',
    'journals',
    'music',
    'albums',
    'special days',
    'love',
    'couple',
    'personal site',
  ],
  authors: [{ name: 'us' }],
  creator: 'ourlittlecorner',
  category: 'personal',
  icons: {
    icon: '/images/flower-pattern.png',
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'ourlittlecorner — a tiny home for us',
    description:
      'A cozy shared space for us — memories, music, journals, and special days.',
    url: '/',
    siteName: 'ourlittlecorner',
    images: [
      {
        url: '/images/flower-pattern.png',
        width: 512,
        height: 512,
        alt: 'ourlittlecorner',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ourlittlecorner — a tiny home for us',
    description:
      'A cozy shared space for us — memories, music, journals, and special days.',
    images: ['/images/flower-pattern.png'],
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf6f2' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0a0a' },
  ],
  colorScheme: 'light dark',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${dancing.variable}`}>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}