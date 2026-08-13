import { toString as mdastToString } from 'mdast-util-to-string'
import { remark } from 'remark'

export const EXCERPT_LENGTH = 200

/**
 * Turn Markdown into the plain-text summary used by the listing, the meta
 * description and the RSS feed.
 *
 * Plain JavaScript rather than TypeScript so scripts/generate-rss.mjs can
 * import it too — the excerpt used to be computed separately there and in
 * src/lib/posts.ts, and the two drifted into producing raw Markdown in three
 * different places.
 *
 * @param {string} markdown Article body, without frontmatter.
 * @returns {string}
 */
export function toExcerpt(markdown) {
  const tree = remark().parse(markdown)

  // Fenced code blocks read as noise in a summary — one article's excerpt was
  // almost entirely shell commands. Inline code stays, because it is usually
  // part of a sentence.
  tree.children = tree.children.filter((node) => node.type !== 'code')

  // Flatten block by block rather than passing the whole tree to toString,
  // which concatenates with no separator and runs a heading straight into the
  // paragraph under it ("Paths Alias とはtypescript における...").
  //
  // includeImageAlt: false keeps alt text out; it describes an image the
  // summary is not showing.
  const text = tree.children
    .map((node) => mdastToString(node, { includeImageAlt: false }))
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()

  return text.length > EXCERPT_LENGTH
    ? `${text.slice(0, EXCERPT_LENGTH)}...`
    : text
}
