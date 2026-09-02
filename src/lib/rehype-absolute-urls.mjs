import { visit } from 'unist-util-visit'

/**
 * Rewrite every relative URL in the tree against a base.
 *
 * Only the feed uses this. A page on the site can leave its URLs relative,
 * because the browser resolves them against the page they came from — but a
 * feed item is read inside a client that has no such base, so `./diagram.png`
 * and `/ogp/….png` resolve to nothing there.
 *
 * Three shapes appear in this repository's articles and all three matter:
 *
 * - `./diagram.png` — an article image, sitting next to its index.md
 * - `/posts/{slug}/` — an article-to-article link, made relative in #163
 * - `/ogp/….png` — a card image emitted by rehype-ogp-card
 *
 * `new URL(value, base)` handles all of them, and leaves a URL that is
 * already absolute untouched, so http(s) links pass through unchanged. An
 * unparseable value is left alone rather than throwing: the point is to
 * improve the feed, not to fail a build over one malformed href.
 */
export default function rehypeAbsoluteUrls({ base } = {}) {
  if (!base) {
    throw new Error('rehype-absolute-urls: `base` is required')
  }

  return (tree) => {
    visit(tree, 'element', (node) => {
      const attribute =
        node.tagName === 'img' ? 'src' : node.tagName === 'a' ? 'href' : null

      if (!attribute) {
        return
      }

      const value = node.properties?.[attribute]

      if (typeof value !== 'string' || value === '') {
        return
      }

      try {
        node.properties[attribute] = new URL(value, base).href
      } catch {
        // Leave it as it was.
      }
    })
  }
}
