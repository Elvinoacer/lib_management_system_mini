import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import QueryProvider from '@/components/providers/QueryProvider'
import AuthProvider from '@/components/providers/AuthProvider'
import { Toaster } from 'sonner'
import { SessionProvider } from 'next-auth/react'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Kitabu - Your Digital Library',
    template: '%s | Kitabu'
  },
  description: 'Experience the future of reading with Kitabu. Browse thousands of digital books, purchase securely with M-Pesa, and build your personal library instantly.',
  keywords: ['digital library', 'ebooks', 'online bookstore', 'M-Pesa payments', 'Kitabu', 'reading'],
  authors: [{ name: 'Kitabu Team' }],
  creator: 'Kitabu',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: 'Kitabu',
    title: 'Kitabu - Your Digital Library',
    description: 'Experience the future of reading with Kitabu. Browse thousands of digital books and build your personal library instantly.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Kitabu - Your Digital Library Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kitabu - Your Digital Library',
    description: 'Experience the future of reading with Kitabu. Browse thousands of digital books and build your personal library instantly.',
    images: ['/og-image.png'],
    creator: '@kitabu',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <SessionProvider>
          <AuthProvider>
            <QueryProvider>
              {children}
              <Toaster position="top-center" richColors />
            </QueryProvider>
          </AuthProvider>
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  )
}
