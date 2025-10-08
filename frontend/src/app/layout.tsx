import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VoteFight - Social Voting Platform',
  description: 'Create voting battles and let the community decide the winner',
  keywords: 'voting, battles, social, community, polls, decisions',
  authors: [{ name: 'VoteFight Team' }],
  openGraph: {
    title: 'VoteFight - Social Voting Platform',
    description: 'Create voting battles and let the community decide the winner',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VoteFight - Social Voting Platform',
    description: 'Create voting battles and let the community decide the winner',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  )
}