import React from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { notFound } from 'next/navigation'
import Layout from '../../../components/Layout'
import Bio from '../../../components/Bio'
import Pagination from '../../../components/Pagination'
import { getPaginatedPosts } from '../../../lib/posts'
import { siteTitle } from '../../../data/static'

interface PageProps {
  params: {
    page: string
  }
}

export default function Page({ params }: PageProps) {
  const pageNumber = parseInt(params.page, 10)
  
  if (isNaN(pageNumber) || pageNumber < 1) {
    notFound()
  }

  const paginatedData = getPaginatedPosts(pageNumber, 10)
  
  if (paginatedData.posts.length === 0 && pageNumber > 1) {
    notFound()
  }

  return (
    <Layout title={`${siteTitle} - Page ${pageNumber}`}>
      <Bio />
      {paginatedData.posts.map((post) => (
        <div key={post.slug}>
          <h3
            style={{
              marginBottom: '4px',
            }}
          >
            <Link href={`/posts/${post.slug}`} style={{ boxShadow: 'none' }}>
              {post.title}
            </Link>
          </h3>
          <small>
            {post.date && format(new Date(post.date), 'MMMM dd, yyyy')}
          </small>
          <p>{post.excerpt}</p>
        </div>
      ))}
      <Pagination
        currentPage={paginatedData.currentPage}
        totalPages={paginatedData.totalPages}
        hasNextPage={paginatedData.hasNextPage}
        hasPrevPage={paginatedData.hasPrevPage}
      />
    </Layout>
  )
}

export async function generateStaticParams() {
  const paginatedData = getPaginatedPosts(1, 10)
  const pages = []
  
  for (let i = 2; i <= paginatedData.totalPages; i++) {
    pages.push({ page: i.toString() })
  }
  
  return pages
}