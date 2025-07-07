import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FinanceAI - AI-Powered Investment Analysis',
  description: 'Get intelligent insights on stocks and cryptocurrencies with advanced AI analysis. Discover optimal entry and exit points based on real-time market data.',
  keywords: 'AI, finance, stocks, cryptocurrency, investment, analysis, trading',
  authors: [{ name: 'FinanceAI Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
