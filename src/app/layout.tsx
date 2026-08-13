import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
// Imported before globals.css so the overrides there win: the theme sets its
// own background and padding on .hljs, which would fight the pre styling.
import 'highlight.js/styles/github.css'
import { generateMetadata } from '../lib/metadata'
import './globals.css'

// The headings in globals.css have asked for Montserrat since the Gatsby days,
// but nothing ever loaded it, so they silently fell back to sans-serif (#104).
// next/font self-hosts the files into the export, so no request leaves for
// Google at runtime. No weight is given because Montserrat is a variable font
// and the headings use both 600 and 700.
const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
})

export const metadata: Metadata = generateMetadata()

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body>{children}</body>
    </html>
  )
}
