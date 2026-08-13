import fs from 'node:fs'
import path from 'node:path'

export const CACHE_PATH = path.join(process.cwd(), 'src/data/ogp.json')

/**
 * Read the committed OGP cache.
 *
 * The build only ever reads this file — it never reaches the network. A URL
 * with no entry renders as a plain link, so a missing or stale cache degrades
 * the page rather than breaking the build. Run `pnpm ogp` to refresh it.
 *
 * @returns {Record<string, {title?: string, description?: string, siteName?: string, image?: string}>}
 */
export function loadOgpCache() {
  if (!fs.existsSync(CACHE_PATH)) {
    return {}
  }

  try {
    return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'))
  } catch {
    return {}
  }
}

/**
 * True for a hast <p> that holds nothing but a link to its own href — which is
 * what remark-gfm produces for a URL written on a line of its own.
 *
 * A URL in the middle of a sentence stays an inline link: a card there would
 * cut the prose in half.
 *
 * @param {import('hast').Element} node
 * @returns {string | null} the URL, or null when this is not a standalone link
 */
export function standaloneLinkUrl(node) {
  if (node.tagName !== 'p') {
    return null
  }

  const meaningful = node.children.filter(
    (child) => child.type !== 'text' || child.value.trim() !== ''
  )

  if (meaningful.length !== 1) {
    return null
  }

  const [only] = meaningful

  if (only.type !== 'element' || only.tagName !== 'a') {
    return null
  }

  const href = only.properties?.href
  const text = only.children?.[0]

  if (typeof href !== 'string' || text?.type !== 'text') {
    return null
  }

  // remark-gfm sets the link text to the URL itself for an autolink. A link
  // the author gave their own text to is left alone.
  return text.value.trim() === href ? href : null
}
