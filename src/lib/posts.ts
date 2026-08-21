import powershell from 'highlight.js/lib/languages/powershell'
import { common } from 'lowlight'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import {
  readPost,
  readPostSlugs,
  readPosts,
  TAGS as tagVocabulary,
} from './read-posts.mjs'
import rehypeCodeTitle from './rehype-code-title.mjs'
import rehypeOgpCard from './rehype-ogp-card.mjs'

// rehype-highlight replaces its language registry when `languages` is passed,
// so spread lowlight's `common` set to keep it. powershell is not in common
// and one article uses it.
const languages = { ...common, powershell }

export interface PostData {
  slug: string
  title: string
  date: string
  content: string
  excerpt: string
  tags: string[]
  outdated: boolean
}

export const TAGS: string[] = tagVocabulary

export interface PaginatedPosts {
  posts: PostData[]
  totalPages: number
  currentPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

/**
 * The walk itself lives in read-posts.mjs, which scripts/generate-rss.mjs
 * imports too — see the note there. This adds only the types.
 */
export function getSortedPostsData(): PostData[] {
  return readPosts() as PostData[]
}

// Callers should leave postsPerPage alone: the page component and
// generateStaticParams have to agree on it, or the routes that get
// pre-rendered stop matching the posts each one slices out.
export const POSTS_PER_PAGE = 10

export function getPaginatedPosts(
  page: number = 1,
  postsPerPage: number = POSTS_PER_PAGE
): PaginatedPosts {
  const allPosts = getSortedPostsData()
  const totalPages = Math.ceil(allPosts.length / postsPerPage)
  const startIndex = (page - 1) * postsPerPage
  const endIndex = startIndex + postsPerPage
  const posts = allPosts.slice(startIndex, endIndex)

  return {
    posts,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  }
}

export function getAllPostSlugs() {
  return readPostSlugs().map((slug: string) => ({ params: { slug } }))
}

export async function getPostData(
  slug: string
): Promise<PostData & { contentHtml: string }> {
  const post = readPost(slug) as PostData

  // remark-html is not used here because it goes straight to HTML and leaves
  // no point to hook a highlighter in. Going through rehype colours the code
  // at build time, so the pages ship plain markup and no client-side JS.
  const processedContent = await remark()
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeHighlight, { detect: false, languages })
    .use(rehypeCodeTitle)
    .use(rehypeOgpCard)
    .use(rehypeStringify)
    .process(post.content)

  return { ...post, contentHtml: processedContent.toString() }
}

/** Tags that at least one post carries, in the order src/data/tags.json lists them. */
export function getAllTags(): string[] {
  const used = new Set(getSortedPostsData().flatMap((post) => post.tags))

  return TAGS.filter((tag) => used.has(tag))
}

export function getPostsByTag(tag: string): PostData[] {
  return getSortedPostsData().filter((post) => post.tags.includes(tag))
}

export function getAdjacentPosts(currentSlug: string) {
  const posts = getSortedPostsData()
  const currentIndex = posts.findIndex((post) => post.slug === currentSlug)

  return {
    previous: currentIndex > 0 ? posts[currentIndex - 1] : null,
    next: currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null,
  }
}
