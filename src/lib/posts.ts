import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import powershell from 'highlight.js/lib/languages/powershell'
import { common } from 'lowlight'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import tagVocabulary from '../data/tags.json'
import { toExcerpt } from './excerpt.mjs'
import rehypeCodeTitle from './rehype-code-title.mjs'
import rehypeOgpCard from './rehype-ogp-card.mjs'

// rehype-highlight replaces its language registry when `languages` is passed,
// so spread lowlight's `common` set to keep it. powershell is not in common
// and one article uses it.
const languages = { ...common, powershell }

const postsDirectory = path.join(process.cwd(), 'content/blog')

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

/**
 * A post's tags, checked against src/data/tags.json.
 *
 * Failing the build on an unknown tag is the point: a typo would otherwise
 * pre-render its own /tags/react-nativ/ page holding one post, and nothing
 * would look broken from any page that already existed.
 */
function readTags(data: { tags?: unknown }, slug: string): string[] {
  const tags = data.tags

  if (tags === undefined) {
    return []
  }

  if (!Array.isArray(tags)) {
    throw new Error(`${slug}: frontmatter \`tags\` must be a list`)
  }

  for (const tag of tags) {
    if (!TAGS.includes(tag)) {
      throw new Error(
        `${slug}: unknown tag "${tag}". Known tags are ${TAGS.join(', ')} — add it to src/data/tags.json if it is new.`
      )
    }
  }

  return tags
}

export interface PaginatedPosts {
  posts: PostData[]
  totalPages: number
  currentPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export function getSortedPostsData(): PostData[] {
  const fileNames = fs.readdirSync(postsDirectory)
  const allPostsData = fileNames
    .filter((name) =>
      fs.statSync(path.join(postsDirectory, name)).isDirectory()
    )
    .map((name) => {
      const slug = name
      const fullPath = path.join(postsDirectory, name, 'index.md')

      if (!fs.existsSync(fullPath)) {
        return null
      }

      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const matterResult = matter(fileContents)

      return {
        slug,
        title: matterResult.data.title || slug,
        date: matterResult.data.date || '',
        content: matterResult.content,
        excerpt: toExcerpt(matterResult.content),
        tags: readTags(matterResult.data, slug),
        outdated: matterResult.data.outdated === true,
      }
    })
    .filter((post): post is PostData => post !== null)

  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1
    } else {
      return -1
    }
  })
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
  const fileNames = fs.readdirSync(postsDirectory)
  return fileNames
    .filter((name) =>
      fs.statSync(path.join(postsDirectory, name)).isDirectory()
    )
    .map((name) => ({
      params: {
        slug: name,
      },
    }))
}

export async function getPostData(
  slug: string
): Promise<PostData & { contentHtml: string }> {
  const fullPath = path.join(postsDirectory, slug, 'index.md')
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const matterResult = matter(fileContents)

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
    .process(matterResult.content)
  const contentHtml = processedContent.toString()

  return {
    slug,
    contentHtml,
    title: matterResult.data.title || slug,
    date: matterResult.data.date || '',
    content: matterResult.content,
    excerpt: toExcerpt(matterResult.content),
    tags: readTags(matterResult.data, slug),
    outdated: matterResult.data.outdated === true,
  }
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
