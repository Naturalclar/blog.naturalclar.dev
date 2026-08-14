import Link from 'next/link'
import type { PaginatedPosts } from '../lib/posts'
import Pagination from './Pagination'
import PostDate from './PostDate'
import TagList from './TagList'

type Props = {
  data: PaginatedPosts
}

/**
 * The listing, shared by the home page and /page/[page].
 *
 * Both rendered this markup in full, so any change to an entry had to be made
 * twice or page 1 and page 2 would drift apart — and the drift would look
 * like nothing until someone paged forward.
 */
const PostList: React.FC<Props> = ({ data }) => (
  <>
    {data.posts.map((post) => (
      /* mb-10 rather than the 19px the entries used to fall into: that was
         barely more than the 16px between a post's own date and excerpt, so
         ten posts read as one column of text. The gap between posts now has
         to be obviously larger than the gaps inside one. */
      <div key={post.slug} className="mb-10">
        <h3 className="mb-1">
          <Link href={`/posts/${post.slug}`}>{post.title}</Link>
        </h3>
        <small>
          <PostDate date={post.date} />
        </small>
        <TagList tags={post.tags} />
        <p>{post.excerpt}</p>
      </div>
    ))}
    <Pagination
      currentPage={data.currentPage}
      totalPages={data.totalPages}
      hasNextPage={data.hasNextPage}
      hasPrevPage={data.hasPrevPage}
    />
  </>
)

export default PostList
