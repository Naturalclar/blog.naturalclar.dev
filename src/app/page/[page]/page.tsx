import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Bio from '../../../components/Bio'
import Layout from '../../../components/Layout'
import PostList from '../../../components/PostList'
import { siteTitle } from '../../../data/static'
import { generateMetadata as generateSEOMetadata } from '../../../lib/metadata'
import { getPaginatedPosts } from '../../../lib/posts'

interface PageProps {
  // A Promise since Next 15: route params are awaited rather than read. The
  // page still renders once at build time — `output: 'export'` has not
  // changed — so this is a signature change, not a change in when the work
  // happens.
  params: Promise<{
    page: string
  }>
}

// A pagination page is the case a canonical exists for: /page/2/ holds the
// same entries the listing will hold once enough posts push them down. Title
// and description are the inherited defaults, unchanged.
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { page } = await params
  return generateSEOMetadata({ path: `/page/${page}/` })
}

export default async function Page({ params }: PageProps) {
  const { page } = await params
  const pageNumber = parseInt(page, 10)

  if (Number.isNaN(pageNumber) || pageNumber < 1) {
    notFound()
  }

  const paginatedData = getPaginatedPosts(pageNumber)

  if (paginatedData.posts.length === 0 && pageNumber > 1) {
    notFound()
  }

  return (
    <Layout title={`${siteTitle} - Page ${pageNumber}`}>
      <Bio />
      <PostList data={paginatedData} />
    </Layout>
  )
}

export async function generateStaticParams() {
  const paginatedData = getPaginatedPosts(1)
  const pages = []

  for (let i = 2; i <= paginatedData.totalPages; i++) {
    pages.push({ page: i.toString() })
  }

  return pages
}
