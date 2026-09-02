import powershell from 'highlight.js/lib/languages/powershell'
import { common } from 'lowlight'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeAbsoluteUrls from './rehype-absolute-urls.mjs'
import rehypeCodeTitle from './rehype-code-title.mjs'
import rehypeOgpCard from './rehype-ogp-card.mjs'

/**
 * The one Markdown-to-HTML pipeline, shared by the pages and the feed.
 *
 * Plain `.mjs` for the same reason `excerpt.mjs` and `read-posts.mjs` are:
 * `scripts/generate-rss.mjs` runs under plain node and cannot import
 * TypeScript, and this has to be one module both sides read. It lived in
 * `posts.ts` until #203, where the feed shipped `post.content` — the raw
 * Markdown — into `<content:encoded>`, a field readers render as HTML. 102
 * headings and 144 code fences reached subscribers as literal text.
 *
 * remark-html is deliberately not used: it goes straight to HTML and leaves
 * no point to hook a highlighter in. Going through rehype colours the code at
 * build time, so the pages ship plain markup and no client-side JS.
 */

// rehype-highlight replaces its language registry when `languages` is passed,
// so spread lowlight's `common` set to keep it. powershell is not in common
// and one article uses it.
const languages = { ...common, powershell }

/**
 * @param {string} markdown
 * @param {{ absoluteBase?: string }} [options]
 *   `absoluteBase` rewrites relative URLs against it — the feed needs this,
 *   the pages do not. Passing it is what keeps the two outputs differing only
 *   where they have to.
 */
export async function renderMarkdown(markdown, { absoluteBase } = {}) {
  const processor = remark()
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeHighlight, { detect: false, languages })
    .use(rehypeCodeTitle)
    .use(rehypeOgpCard)

  if (absoluteBase) {
    processor.use(rehypeAbsoluteUrls, { base: absoluteBase })
  }

  processor.use(rehypeStringify)

  return String(await processor.process(markdown))
}
