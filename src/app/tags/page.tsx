import type { Metadata } from 'next'
import Link from 'next/link'
import Bio from '../../components/Bio'
import Layout from '../../components/Layout'
import { siteTitle } from '../../data/static'
import { generateMetadata as generateSEOMetadata } from '../../lib/metadata'
import { getAllTags, getPostsByTag } from '../../lib/posts'

export const metadata: Metadata = generateSEOMetadata({
  title: 'タグ',
  description: 'タグ別の記事一覧',
  path: '/tags/',
})

export default function TagsIndex() {
  // getAllTags() returns only the tags at least one post carries, in the order
  // src/data/tags.json lists them — a hand-ordered "most central first" that
  // stays put as the archive grows, unlike sorting by count.
  const tags = getAllTags().map((tag) => ({
    tag,
    // Seven passes over 25 posts at build time. A getTagCounts() would save
    // six of them and earn nothing at this size.
    count: getPostsByTag(tag).length,
  }))

  return (
    <Layout title={`${siteTitle} - タグ`}>
      <Bio />
      <h1>タグ</h1>
      <ul className="tag-index">
        {tags.map(({ tag, count }) => (
          <li key={tag}>
            <Link href={`/tags/${tag}/`}>{`#${tag}`}</Link>
            <span className="tag-index-count">{count}</span>
          </li>
        ))}
      </ul>
    </Layout>
  )
}
