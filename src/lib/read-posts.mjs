import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import tagVocabulary from '../data/tags.json' with { type: 'json' }
import { toExcerpt } from './excerpt.mjs'

/**
 * The one walk over content/blog/.
 *
 * Plain `.mjs` for the same reason `excerpt.mjs` is: `scripts/generate-rss.mjs`
 * is run by `node` directly and cannot import TypeScript, and this has to be
 * one module both sides read. `src/lib/posts.ts` layers the types and the
 * Markdown-to-HTML pipeline on top; the feed script takes the result as-is.
 *
 * Until #180 the feed had its own copy — its own readdirSync, isDirectory
 * filter, missing-index.md skip, gray-matter parse, `title || slug` fallback
 * and sort. The two agreed, but not on strictness: the feed read
 * `data.tags ?? []` while posts.ts validated against the vocabulary, and that
 * only stayed harmless because `next build` runs first in `pnpm build` and
 * fails before the script does. A guarantee resting on the order of two
 * commands in one npm script is not one worth keeping.
 */

const POSTS_DIRECTORY = path.join(process.cwd(), 'content/blog')

/** @type {string[]} */
export const TAGS = tagVocabulary

/**
 * A post's tags, checked against src/data/tags.json.
 *
 * Failing the build on an unknown tag is the point: a typo would otherwise
 * pre-render its own /tags/react-nativ/ page holding one post, and nothing
 * would look broken from any page that already existed.
 *
 * Missing tags fail too, and for the same reason. They used to return `[]`,
 * which meant a post with no `tags` built, listed and read normally while
 * appearing on no tag page and in no RSS category — the one failure nothing
 * put in front of you (#179). Every article carries tags, so requiring them
 * costs nothing and closes the silent case.
 */
export function readTags(data, slug) {
  const tags = data.tags

  if (tags === undefined) {
    throw new Error(
      `${slug}: frontmatter is missing \`tags\`. Pick from ${TAGS.join(', ')} — a post with no tags appears on no tag page.`
    )
  }

  if (!Array.isArray(tags)) {
    throw new Error(`${slug}: frontmatter \`tags\` must be a list`)
  }

  if (tags.length === 0) {
    throw new Error(
      `${slug}: frontmatter \`tags\` is empty. Pick from ${TAGS.join(', ')}.`
    )
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

/** Every slug with an index.md, which is what makes a directory a post. */
export function readPostSlugs() {
  return fs
    .readdirSync(POSTS_DIRECTORY)
    .filter((name) =>
      fs.statSync(path.join(POSTS_DIRECTORY, name)).isDirectory()
    )
    .filter((name) =>
      fs.existsSync(path.join(POSTS_DIRECTORY, name, 'index.md'))
    )
}

/** One post, parsed. Throws if the slug has no index.md. */
export function readPost(slug) {
  const file = path.join(POSTS_DIRECTORY, slug, 'index.md')
  const { data, content } = matter(fs.readFileSync(file, 'utf8'))

  return {
    slug,
    title: data.title || slug,
    date: data.date || '',
    content,
    excerpt: toExcerpt(content),
    tags: readTags(data, slug),
    outdated: data.outdated === true,
  }
}

/** Every post, newest first. */
export function readPosts() {
  return readPostSlugs()
    .map(readPost)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}
