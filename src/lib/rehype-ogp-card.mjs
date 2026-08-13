import { loadOgpCache, standaloneLinkUrl } from './ogp.mjs'

const el = (tagName, properties, children = []) => ({
  type: 'element',
  tagName,
  properties,
  children,
})

const text = (value) => ({ type: 'text', value })

/**
 * Replace a paragraph holding nothing but an autolinked URL with an OGP card.
 *
 * Reads the committed cache only — see src/lib/ogp.mjs. A URL that is not in
 * the cache is left exactly as it is, an ordinary link, so an unrefreshed
 * cache costs presentation rather than correctness.
 */
export default function rehypeOgpCard() {
  const cache = loadOgpCache()

  return (tree) => {
    visit(tree)
  }

  function visit(node) {
    if (!node.children) {
      return
    }

    node.children = node.children.map((child) => {
      visit(child)

      if (child.type !== 'element') {
        return child
      }

      const url = standaloneLinkUrl(child)
      const meta = url && cache[url]

      if (!meta?.title) {
        return child
      }

      return card(url, meta)
    })
  }

  function card(url, meta) {
    const body = [
      el('span', { className: ['ogp-card-title'] }, [text(meta.title)]),
    ]

    if (meta.description) {
      body.push(
        el('span', { className: ['ogp-card-description'] }, [
          text(meta.description),
        ])
      )
    }

    body.push(
      el('span', { className: ['ogp-card-site'] }, [
        text(meta.siteName || new URL(url).hostname),
      ])
    )

    const children = [el('span', { className: ['ogp-card-body'] }, body)]

    if (meta.image) {
      children.push(
        el('img', {
          className: ['ogp-card-image'],
          src: meta.image,
          alt: '',
          loading: 'lazy',
          decoding: 'async',
        })
      )
    }

    // An <a> rather than a <div> wrapping one: the whole card is the link
    // target, and it has to be valid inside the <p> position it replaces.
    return el(
      'a',
      { className: ['ogp-card'], href: url, rel: 'noopener' },
      children
    )
  }
}
