import React from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Metadata } from 'next'
import Layout from '../../../components/Layout'
import Bio from '../../../components/Bio'
import { getAllPostSlugs, getPostData, getAdjacentPosts } from '../../../lib/posts'
import { generateMetadata as generateSEOMetadata } from '../../../lib/metadata'
import { siteTitle } from '../../../data/static'

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

export async function generateMetadata({ params }: BlogPostProps): Promise<Metadata> {
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