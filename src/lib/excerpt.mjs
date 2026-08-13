import { toString as mdastToString } from 'mdast-util-to-string'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'

export const EXCERPT_LENGTH = 200

/** Blocks that hold other blocks rather than text of their own. */
const CONTAINERS = new Set(['list', 'listItem', 'blockquote'])

/**
 * Flatten sibling blocks to text, separated by a space.
 *
 * Block by block rather than one `toString` over the whole tree, because that
 * concatenates with no separator at all and runs each block into the next —
 * 「Paths Alias とはtypescript における…」, which was #112. The same applies one
 * level down: a list handed to `toString` whole comes back as
 * 「useFocusEffectuseIsFocused」, so containers recurse instead.
 *
 * `includeImageAlt: false` keeps alt text out; it describes an image the
 * summary is not showing.
 *
 * @param {import('mdast').RootContent[]} nodes
 * @returns {string}
 */
function flattenBlocks(nodes) {
  return nodes
    .filter((node) => !isNoise(node))
    .map((node) =>
      CONTAINERS.has(node.type)
        ? flattenBlocks(node.children)
        : mdastToString(node, { includeImageAlt: false })
    )
    .filter(Boolean)
    .join(' ')
}

/**
 * Blocks whose text does not belong in a one-paragraph summary.
 *
 * - **code** — one article's excerpt was almost entirely shell commands.
 *   Inline code stays, because it is usually part of a sentence.
 * - **heading** — a section title spliced into running prose reads as a
 *   non-sequitur: 「…まとめて行きます。 Flipper のサポート 0.62は主に…」.
 * - **a paragraph that is only a link to itself** — the form `rehype-ogp-card`
 *   turns into a card in the article body. Flattened, it is the URL string:
 *   react-navigation-v4-new-hooks opened its excerpt with a raw github.com
 *   URL. A link inside a sentence is left alone; its text is prose.
 *
 * @param {import('mdast').RootContent} node
 */
function isNoise(node) {
  return (
    node.type === 'code' || node.type === 'heading' || isStandaloneLink(node)
  )
}

/**
 * The mdast counterpart of `standaloneLinkUrl` in ./ogp.mjs, which reads the
 * same shape after remark-rehype has turned it into hast. Kept separate
 * rather than shared: one walks `paragraph → link → text`, the other
 * `p → a → text`, and merging them would obscure both.
 *
 * @param {import('mdast').RootContent} node
 */
function isStandaloneLink(node) {
  if (node.type !== 'paragraph') {
    return false
  }

  const meaningful = node.children.filter(
    (child) => child.type !== 'text' || child.value.trim() !== ''
  )

  if (meaningful.length !== 1) {
    return false
  }

  const [only] = meaningful

  if (only.type !== 'link' || only.children.length !== 1) {
    return false
  }

  const [text] = only.children

  return text.type === 'text' && text.value.trim() === only.url
}

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
  // remark-gfm is what turns a bare URL into a link node. Without it the
  // article parses differently here than it does in posts.ts, and a URL on a
  // line of its own stays plain text — which is why the rule below could not
  // see it, and why the excerpt opened with a raw github.com URL.
  const tree = remark().use(remarkGfm).parse(markdown)

  const text = flattenBlocks(tree.children).replace(/\s+/g, ' ').trim()

  return text.length > EXCERPT_LENGTH
    ? `${text.slice(0, EXCERPT_LENGTH)}...`
    : text
}
