import type { Metadata } from 'next'
// Imported before globals.css so the overrides there win: the theme sets its
// own background and padding on .hljs, which would fight the pre styling.
import 'highlight.js/styles/github.css'
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
