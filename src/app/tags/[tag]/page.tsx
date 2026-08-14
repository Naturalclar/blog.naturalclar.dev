import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Bio from '../../../components/Bio'
import Layout from '../../../components/Layout'
import PostList from '../../../components/PostList'
import { siteTitle } from '../../../data/static'
import { generateMetadata as generateSEOMetadata } from '../../../lib/metadata'
import { getAllTags, getPostsByTag } from '../../../lib/posts'

interface TagPageProps {
  params: {
    tag: string
  }
}

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  return generateSEOMetadata({
    title: `#${params.tag}`,
    description: `${params.tag} タグの記事一覧`,
  })
}

export default function TagPage({ params }: TagPageProps) {
  const posts = getPostsByTag(params.tag)

  if (posts.length === 0) {
    notFound()
  }

  // No pagination here, unlike the home page. The largest tag holds 13 of the
  // 25 posts, so a tag page is already shorter than the archive and splitting
  // it would mean a second set of routes for no reader benefit. If a tag ever
  // outgrows that, getPaginatedPosts is the piece to reach for.
  return (
    <Layout title={`${siteTitle} - #${params.tag}`}>
      <Bio />
      <PostList
        data={{
          posts,
          totalPages: 1,
          currentPage: 1,
          hasNextPage: false,
          hasPrevPage: false,
        }}
      />
    </Layout>
  )
}

export async function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag }))
}
