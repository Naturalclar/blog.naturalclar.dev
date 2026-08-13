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

  // The Montserrat family the h3 used to set inline is already applied to
  // every heading in globals.css, so it is not repeated here.
  const header = isRoot ? (
    <h1 className="mt-0 mb-6">
      <Link href="/">{title}</Link>
    </h1>
  ) : (
    <h3 className="mt-0">
      <Link href="/">{title}</Link>
    </h3>
  )

  return (
    <div className="mx-auto max-w-[680px] px-3 py-6">
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
