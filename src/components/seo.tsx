import React from 'react'
import Helmet from 'react-helmet'
import { StaticQuery, graphql } from 'gatsby'

type Props = {
  description: string,
  lang: string,
  meta: any[],
  keywords: string[],
  title: string,
  thumbnail: {childImageSharp:{sizes:{src:string}}}
}

function SEO({ description, lang, meta, keywords, title, thumbnail }:Props) {
  const imageSrc = thumbnail && thumbnail.childImageSharp.sizes.src;
  const origin = typeof window !== "undefined" ? window.location.origin : ""
  return (
    <StaticQuery
      query={detailsQuery}
      render={data => {
        const metaDescription =
          description || data.site.siteMetadata.description
        return (
          <Helmet
            htmlAttributes={{
              lang,
            }}
            title={title}
            titleTemplate={`%s | ${data.site.siteMetadata.title}`}
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
                name: `twitter:card`,
                content: `summary_large_image`,
              },
              {
                name: `twitter:creator`,
                content: data.site.siteMetadata.author,
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
                content: imageSrc? origin + imageSrc : origin + data.defaultThumbnail.childImageSharp.sizes.src
              }
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
      }}
    />
  )
}

SEO.defaultProps = {
  lang: `jp`,
  meta: [],
  keywords: ['react','react-native'],
}

export default SEO

const detailsQuery = graphql`
  query DefaultSEOQuery {
    defaultThumbnail: file(absolutePath: { regex: "/twitter-card.png/" }) {
      childImageSharp {
        sizes(maxWidth: 600) {
              ...GatsbyImageSharpSizes
        }
      }
    }
    site {
      siteMetadata {
        title
        description
        author
      }
    }
  }
`
