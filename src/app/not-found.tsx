import type { Metadata } from 'next'
import Link from 'next/link'
import Layout from '../components/Layout'
import { siteTitle } from '../data/static'

// No canonical, and noindex. The export writes this route to out/404.html,
// out/404/ and out/_not-found/ — GitHub Pages serves the first with a 404
// status, but the other two answer 200 at real paths. Without this they
// inherit the root layout's metadata and tell a crawler they are the home
// page, which is the same defect #177 fixed everywhere else.
export const metadata: Metadata = {
  title: `404 - Page Not Found | ${siteTitle}`,
  // null rather than omitted: the root layout sets one, and inheriting it
  // would leave a noindex page pointing its canonical at a different URL,
  // which is the contradiction search engines tell you not to ship.
  alternates: {
    canonical: null,
  },
  robots: {
    index: false,
    follow: true,
  },
}

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
