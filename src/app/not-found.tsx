import React from 'react'
import Link from 'next/link'
import Layout from '../components/Layout'
import { siteTitle } from '../data/static'

export default function NotFound() {
  return (
    <Layout title={siteTitle}>
      <h1>404 - Page Not Found</h1>
      <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
      <p>
        <Link href="/">Go back to the homepage</Link>
      </p>
    </Layout>
  )
}