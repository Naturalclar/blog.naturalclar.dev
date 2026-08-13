import { format } from 'date-fns'
import Link from 'next/link'
import Bio from '../components/Bio'
import Layout from '../components/Layout'
import Pagination from '../components/Pagination'
import { siteTitle } from '../data/static'
import { getPaginatedPosts } from '../lib/posts'

export default function Home() {
  const paginatedData = getPaginatedPosts(1)

  return (
    <Layout title={siteTitle}>
      <Bio />
      {paginatedData.posts.map((post) => (
        <div key={post.slug}>
          <h3 className="mb-1">
            <Link href={`/posts/${post.slug}`}>{post.title}</Link>
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
