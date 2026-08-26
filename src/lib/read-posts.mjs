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

let cache = null

/**
 * What the cache is keyed on: which posts exist, and when any of them last
 * changed. `statSync` on 26 files is microseconds; `readPost` on 26 files is
 * milliseconds, because `toExcerpt` parses the whole body with remark.
 *
 * Keyed rather than held forever so a long-lived process cannot serve stale
 * posts. Note this is *not* what makes `pnpm dev` pick up an edit: it does not
 * pick one up either way — measured on this walk and on the uncached one
 * before it, an edited article is unchanged in the dev server 30 seconds
 * later, because the dev render is cached above this layer. The fingerprint is
 * here so that this module is correct on its own terms.
 *
 * An `NODE_ENV === 'production'` check would have been shorter and is the
 * usual shape, but it splits the behaviour across environments and gets it
 * wrong in a third: `node scripts/generate-rss.mjs` run by hand sets no
 * NODE_ENV at all.
 */
function fingerprint(slugs) {
  let newest = 0

  for (const slug of slugs) {
    const { mtimeMs } = fs.statSync(
      path.join(POSTS_DIRECTORY, slug, 'index.md')
    )

    if (mtimeMs > newest) {
      newest = mtimeMs
    }
  }

  return `${slugs.join(',')}@${newest}`
}

/**
 * Every post, newest first.
 *
 * Memoised because the callers each walk the whole archive and there are a lot
 * of them: `getAllTags`, `getPostsByTag` once per tag page, `getAdjacentPosts`
 * once per article, `getPaginatedPosts` once per listing page, and
 * `src/app/sitemap.ts` through all of those. None is wrong on its own; the
 * cost only shows up added together, which is why it went unnoticed until it
 * was counted — 1,586 parses of 26 articles in one build, about 60% of the
 * build's wall time (#190).
 *
 * The array is returned as-is rather than copied, so a caller that sorted it
 * in place would corrupt the cache for everyone after it. None does: they
 * `slice`, `filter`, `flatMap` or index.
 */
export function readPosts() {
  const slugs = readPostSlugs()
  const key = fingerprint(slugs)

  if (cache?.key === key) {
    return cache.posts
  }

  const posts = slugs.map(readPost).sort((a, b) => (a.date < b.date ? 1 : -1))
  cache = { key, posts }

  return posts
}
