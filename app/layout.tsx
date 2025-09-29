import type { Metadata, Viewport } from 'next'
import { AuthProvider } from '@/app/contexts/AuthContext'
import './globals.css'
import { Inter } from 'next/font/google'
import { Mynerve } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const dancing = Mynerve({ subsets: ['latin'], weight: '400', variable: '--font-handwriting' })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'ourlittlecorner — a little corner for us',
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
    title: 'ourlittlecorner — a little corner for us',
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
    title: 'ourlittlecorner — a little corner for us',
    description:
      'A cozy shared space for us — memories, music, journals, and special days.',
    images: ['/images/flower-pattern.png'],
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

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf6f2' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0a0a' },
  ],
  colorScheme: 'light dark',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${dancing.variable}`}>
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}