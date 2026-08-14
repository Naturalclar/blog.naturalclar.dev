import Bio from '../components/Bio'
import Layout from '../components/Layout'
import PostList from '../components/PostList'
import { siteTitle } from '../data/static'
import { getPaginatedPosts } from '../lib/posts'

export default function Home() {
  return (
    <Layout title={siteTitle}>
      <Bio />
      <PostList data={getPaginatedPosts(1)} />
    </Layout>
  )
}
