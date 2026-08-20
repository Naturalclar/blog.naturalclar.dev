import type { Metadata } from 'next'
import { author, siteDescription, siteTitle, siteUrl } from '../data/static'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  thumbnail?: string
  /**
   * The page's own path, site-relative and with the trailing slash
   * `trailingSlash: true` makes the site serve — `/posts/foo/`, not
   * `/posts/foo`, or the canonical advertises a URL that redirects.
   *
   * This used to be hardcoded to siteUrl, so all 40 pages in the export told
   * crawlers they were the home page while carrying a correct per-page
   * og:title — a share preview that looks right and resolves somewhere else
   * (#177). Resolved against metadataBase, so callers pass a path.
   */
  path?: string
  /**
   * Set on an article, from its frontmatter date. Its presence is what makes
   * the page an `article` rather than a `website`.
   */
  publishedTime?: string
}

export function generateMetadata({
  title = siteTitle,
  description = siteDescription,
  keywords = ['react', 'react-native', 'nextjs', 'blog'],
  thumbnail,
  path = '/',
  publishedTime,
}: SEOProps = {}): Metadata {
  const fullTitle = title === siteTitle ? title : `${title} | ${siteTitle}`
  const imageUrl = thumbnail
    ? `${siteUrl}${thumbnail}`
    : `${siteUrl}/twitter-card.png`

  const openGraph = {
    title: fullTitle,
    description,
    url: path,
    siteName: siteTitle,
    // The document has been lang="ja" since #143; the Open Graph block never
    // said so.
    locale: 'ja_JP',
    images: [
      {
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: title,
      },
    ],
  }

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    authors: [{ name: author }],
    creator: author,
    publisher: author,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: path,
    },
    openGraph: publishedTime
      ? { ...openGraph, type: 'article', publishedTime, authors: [author] }
      : { ...openGraph, type: 'website' },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      creator: '@natural_clar',
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}
