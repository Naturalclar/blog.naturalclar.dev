import type { MetadataRoute } from 'next'
import { siteUrl } from '../data/static'
import {
  getAllTags,
  getPaginatedPosts,
  getPostsByTag,
  getSortedPostsData,
} from '../lib/posts'

/**
 * Required under `output: 'export'`. Next treats a sitemap as a route handler,
 * and a route handler is dynamic until told otherwise, so the build fails with
 * "export const dynamic = force-static ... not configured on route
 * /sitemap.xml" rather than emitting the file. Nothing here reads a request;
 * the whole thing is filesystem data resolved at build time.
 */
export const dynamic = 'force-static'

/**
 * Every URL the site serves, built from the same functions the routes are.
 *
 * Deliberately not a second hand-kept list: `generateStaticParams` in the
 * three dynamic routes derives its paths from `getSortedPostsData`,
 * `getAllTags` and `getPaginatedPosts`, and so does this. The cautionary
 * example is `scripts/generate-rss.mjs`, which walks `content/blog/` itself
 * and has to be kept in agreement by hand.
 *
 * `trailingSlash: true`, so every entry carries the slash the site actually
 * serves — without it the sitemap advertises 37 URLs that all redirect.
 *
 * 404 is left out on purpose. The export writes that route to `out/404/` and
 * `out/_not-found/` as well as `out/404.html`, and those two answer 200; they
 * carry `robots: { index: false }` from #177 and have no business here.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getSortedPostsData()
  // Sorted newest first, so the head of any slice is that page's freshest.
  const lastModified = (date: string | undefined) =>
    date ? new Date(date) : undefined

  const { totalPages } = getPaginatedPosts(1)

  const listing = [
    { url: `${siteUrl}/`, lastModified: lastModified(posts[0]?.date) },
    ...Array.from({ length: totalPages - 1 }, (_, index) => {
      const page = index + 2
      return {
        url: `${siteUrl}/page/${page}/`,
        lastModified: lastModified(getPaginatedPosts(page).posts[0]?.date),
      }
    }),
  ]

  const articles = posts.map((post) => ({
    url: `${siteUrl}/posts/${post.slug}/`,
    lastModified: lastModified(post.date),
  }))

  const tags = [
    { url: `${siteUrl}/tags/`, lastModified: lastModified(posts[0]?.date) },
    ...getAllTags().map((tag) => ({
      url: `${siteUrl}/tags/${tag}/`,
      lastModified: lastModified(getPostsByTag(tag)[0]?.date),
    })),
  ]

  return [...listing, ...articles, ...tags]
}
