import { format } from 'date-fns'
import type { Metadata } from 'next'
import Link from 'next/link'
import Bio from '../../../components/Bio'
import Layout from '../../../components/Layout'
import { siteTitle } from '../../../data/static'
import { generateMetadata as generateSEOMetadata } from '../../../lib/metadata'
import {
  getAdjacentPosts,
  getAllPostSlugs,
  getPostData,
} from '../../../lib/posts'

interface BlogPostProps {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  const paths = getAllPostSlugs()
  return paths.map((path) => ({
    slug: path.params.slug,
  }))
}

export async function generateMetadata({
  params,
}: BlogPostProps): Promise<Metadata> {
  const post = await getPostData(params.slug)
  return generateSEOMetadata({
    title: post.title,
    description: post.excerpt,
  })
}

export default async function BlogPost({ params }: BlogPostProps) {
  const post = await getPostData(params.slug)
  const { previous, next } = getAdjacentPosts(params.slug)

  return (
    <Layout title={siteTitle}>
      <h1>{post.title}</h1>
      <p
        style={{
          display: 'block',
          marginBottom: '16px',
        }}
      >
        {post.date && format(new Date(post.date), 'MMMM dd, yyyy')}
      </p>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: contentHtml is
          built at build time from the repository's own Markdown via remark, so
          there is no untrusted input. */}
      <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
      <hr
        style={{
          marginBottom: '16px',
        }}
      />
      <Bio />

      <ul
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          listStyle: 'none',
          padding: 0,
        }}
      >
        <li>
          {previous && (
            <Link href={`/posts/${previous.slug}`} rel="prev">
              ← {previous.title}
            </Link>
          )}
        </li>
        <li>
          {next && (
            <Link href={`/posts/${next.slug}`} rel="next">
              {next.title} →
            </Link>
          )}
        </li>
      </ul>
    </Layout>
  )
}
