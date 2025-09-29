import type { Metadata } from 'next'
import { AuthProvider } from '@/app/contexts/AuthContext'
import './globals.css'
import { Inter } from 'next/font/google'
import { Reenie_Beanie } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const dancing = Reenie_Beanie({ subsets: ['latin'], weight: '400', variable: '--font-handwriting' })

export const metadata: Metadata = {
  title: 'ourlittlecorner.',
  description: 'ourlittlecorner. - Our little corner',
  generator: 'v0.dev',
  icons: {
    icon: '/images/flower-pattern.png', // Path relative to the public folder
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