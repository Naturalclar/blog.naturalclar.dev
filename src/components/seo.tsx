import React from 'react'
import Helmet from 'react-helmet'
import { author, siteDescription, siteTitle } from '../data/static'

type Props = {
  description: string
  lang: string
  meta: any[]
  keywords: string[]
  title: string
}

function SEO({ description, lang, meta, keywords, title }: Props) {

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://blog.naturalclar.dev/'

  const metaDescription =
    description || siteDescription
  return (
    <Helmet
      htmlAttributes={{
        lang,
      }}
      title={title}
      titleTemplate={`%s | ${siteTitle}`}
      meta={[
        {
          name: `description`,
          content: metaDescription,
        },
        {
          property: `og:title`,
          content: title,
        },
        {
          property: `og:description`,
          content: metaDescription,
        },
        {
          property: `og:type`,
          content: `website`,
        },
        {
          property: `og:image`,
          content: `${origin}/twitter-card.png`,
        },
        {
          name: `twitter:card`,
          content: `summary_large_image`,
        },
        {
          name: `twitter:creator`,
          content: author,
        },
        {
          name: `twitter:title`,
          content: title,
        },
        {
          name: `twitter:description`,
          content: metaDescription,
        },
        {
          name: `twitter:image:src`,
          content: `${origin}/twitter-card.png`,
        },
      ]
        .concat(
          keywords.length > 0
            ? {
              name: `keywords`,
              content: keywords.join(`, `),
            }
            : []
        )
        .concat(meta)}
    />
  )
}

SEO.defaultProps = {
  lang: `jp`,
  meta: [],
  keywords: ['react', 'react-native'],
}

export default SEO
