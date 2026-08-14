import { notFound } from 'next/navigation'
import Bio from '../../../components/Bio'
import Layout from '../../../components/Layout'
import PostList from '../../../components/PostList'
import { siteTitle } from '../../../data/static'
import { getPaginatedPosts } from '../../../lib/posts'

interface PageProps {
  params: {
    page: string
  }
}

export default function Page({ params }: PageProps) {
  const pageNumber = parseInt(params.page, 10)

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
