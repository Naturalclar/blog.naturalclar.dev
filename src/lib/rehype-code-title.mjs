import { visit } from 'unist-util-visit'

/**
 * Renders the fence info string's trailing words as a caption above the block.
 *
 *     ```js fooReducer.ts
 *
 * rehype-highlight reads only the first word as the language and everything
 * after it was dropped, so five articles labelled their blocks with filenames
 * that never reached the page. mdast-util-to-hast does carry the rest through
 * as `code.data.meta`, which is what this reads.
 *
 * The syntax is inherited from gatsby-remark-code-titles, which rendered it
 * into a title bar before the blog moved off Gatsby. Nothing replaced it.
 */
export default function rehypeCodeTitle() {
  return (tree) => {
    const targets = []

    // Collected first and replaced afterwards: mutating during the walk would
    // put the <pre> back in the tree inside its own new <figure>, and the
    // visitor would find it again.
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'pre' || !parent || index === undefined) {
        return
      }

      const [code] = node.children
      const title = code ? titleOf(code) : null

      if (title) {
        targets.push({ parent, index, node, title })
      }
    })

    for (const { parent, index, node, title } of targets.reverse()) {
      parent.children[index] = {
        type: 'element',
        tagName: 'figure',
        properties: { className: ['code-block'] },
        children: [
          {
            type: 'element',
            tagName: 'figcaption',
            properties: { className: ['code-block-title'] },
            children: [{ type: 'text', value: title }],
          },
          node,
        ],
      }
    }
  }
}

/**
 * The caption for a <code>, or null when the meta says nothing worth showing.
 *
 * @param {import('hast').Element} code
 * @returns {string | null}
 */
function titleOf(code) {
  if (code.tagName !== 'code' || typeof code.data?.meta !== 'string') {
    return null
  }

  const meta = code.data.meta.trim()

  if (!meta) {
    return null
  }

  // `subtitle='Add code above to index.js'` — the other spelling in the
  // archive, from the same Gatsby plugin.
  const subtitle = meta.match(/^subtitle=(['"])([\s\S]*)\1$/)

  if (subtitle) {
    return subtitle[2].trim() || null
  }

  // ```sh sh — the language written twice rather than a filename. A caption
  // reading "sh" above a shell block is noise.
  const language = languageOf(code)

  if (language && meta.toLowerCase() === language.toLowerCase()) {
    return null
  }

  return meta
}

function languageOf(code) {
  const classes = code.properties?.className

  if (!Array.isArray(classes)) {
    return null
  }

  const found = classes.find(
    (name) => typeof name === 'string' && name.startsWith('language-')
  )

  return found ? found.slice('language-'.length) : null
}
