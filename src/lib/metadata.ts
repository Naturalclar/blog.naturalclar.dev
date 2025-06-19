import { Metadata } from 'next'
import { author, siteDescription, siteTitle, siteUrl } from '../data/static'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  thumbnail?: string
}

export function generateMetadata({
  title = siteTitle,
  description = siteDescription,
  keywords = ['react', 'react-native', 'nextjs', 'blog'],
  thumbnail,
}: SEOProps = {}): Metadata {
  const fullTitle = title === siteTitle ? title : `${title} | ${siteTitle}`
  const imageUrl = thumbnail ? `${siteUrl}${thumbnail}` : `${siteUrl}/twitter-card.png`

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    authors: [{ name: author }],
    creator: author,
    publisher: author,
    metadataBase: new URL(siteUrl),
    openGraph: {
      title: fullTitle,
      description,
      type: 'website',
      url: siteUrl,
      siteName: siteTitle,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
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