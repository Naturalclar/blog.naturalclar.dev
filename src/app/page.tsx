import type { Metadata } from 'next'
import Bio from '../components/Bio'
import Layout from '../components/Layout'
import PostList from '../components/PostList'
import { siteTitle } from '../data/static'
import { generateMetadata as generateSEOMetadata } from '../lib/metadata'
import { getPaginatedPosts } from '../lib/posts'

// Only to give the page its own canonical and og:url. Everything else falls
// back to the same defaults it used to inherit from the root layout, so the
// title and description are unchanged.
export const metadata: Metadata = generateSEOMetadata({ path: '/' })

export default function Home() {
  return (
    <Layout title={siteTitle}>
      <Bio />
      <PostList data={getPaginatedPosts(1)} />
    </Layout>
  )
}
