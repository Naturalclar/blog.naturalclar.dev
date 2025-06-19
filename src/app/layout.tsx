import { Metadata } from 'next'
import { generateMetadata } from '../lib/metadata'
import './globals.css'

export const metadata: Metadata = generateMetadata()

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}