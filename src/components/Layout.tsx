'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type React from 'react'

type Props = {
  title: string
  children: React.ReactNode
}

const Layout: React.FC<Props> = ({ title, children }) => {
  const pathname = usePathname()
  const isRoot = pathname === '/'

  const header = isRoot ? (
    <h1
      style={{
        marginBottom: '24px',
        marginTop: 0,
      }}
    >
      <Link href="/">{title}</Link>
    </h1>
  ) : (
    <h3
      style={{
        fontFamily: 'Montserrat, sans-serif',
        marginTop: 0,
      }}
    >
      <Link href="/">{title}</Link>
    </h3>
  )

  return (
    <div
      style={{
        marginLeft: 'auto',
        marginRight: 'auto',
        maxWidth: '680px',
        padding: '24px 12px',
      }}
    >
      {header}
      {children}
      <footer>
        © {new Date().getFullYear()}, Built with{' '}
        <a href="https://nextjs.org">Next.js</a>
      </footer>
    </div>
  )
}

export default Layout
