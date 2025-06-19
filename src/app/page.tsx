import React from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import Layout from '../components/Layout'
import Bio from '../components/Bio'
import { getSortedPostsData } from '../lib/posts'
import { siteTitle } from '../data/static'

export default function Home() {
  const posts = getSortedPostsData()

  return (
    <Layout title={siteTitle}>
      <Bio />
      {posts.map((post) => (
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
    </Layout>
  )
}