import {
  readPost,
  readPostSlugs,
  readPosts,
  TAGS as tagVocabulary,
} from './read-posts.mjs'
import { renderMarkdown } from './render-markdown.mjs'

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

  // No `absoluteBase`: a page's own URLs stay relative, because the browser
  // resolves them against the page. Only the feed needs them absolute.
  const contentHtml = await renderMarkdown(post.content)

  return { ...post, contentHtml }
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
