import site from '../data/site.json' with { type: 'json' }

/**
 * Every URL shape the site serves, in one place.
 *
 * Plain `.mjs` for the same reason `excerpt.mjs`, `read-posts.mjs` and
 * `render-markdown.mjs` are: `scripts/generate-rss.mjs` runs under plain node
 * and cannot import TypeScript, and the feed is one of the callers that has
 * to agree with the pages.
 *
 * These were written out at fourteen call sites across nine files until #213.
 * That is what #204 was: the feed said `/posts/{slug}` while the sitemap and
 * the canonical said `/posts/{slug}/`, so all 26 items pointed at a URL that
 * 301s and disagreed with the page's own canonical. Nothing caught it because
 * the two spellings lived in different files and never met.
 *
 * The trailing slash is not decoration — `trailingSlash: true` means the
 * slashless spelling redirects, so it belongs in the one place that decides.
 */

const { siteUrl } = site

/** `/posts/{slug}/` */
export const postPath = (slug) => `/posts/${slug}/`

/** `/tags/{tag}/` */
export const tagPath = (tag) => `/tags/${tag}/`

/** The tag index. */
export const TAGS_PATH = '/tags/'

/**
 * `/page/{n}/`, except page 1, which is the site root rather than
 * `/page/1/` — a rule `Pagination.tsx` used to spell out twice.
 */
export const pagePath = (page) => (page === 1 ? '/' : `/page/${page}/`)

/** Absolute forms, for the feed and the sitemap. */
export const absoluteUrl = (path) => `${siteUrl}${path}`
export const postUrl = (slug) => absoluteUrl(postPath(slug))
export const tagUrl = (tag) => absoluteUrl(tagPath(tag))
export const pageUrl = (page) => absoluteUrl(pagePath(page))
