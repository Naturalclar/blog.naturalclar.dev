import React from 'react'
import { StaticQuery, graphql } from 'gatsby'
import Image from 'gatsby-image'

import { rhythm } from '../utils/typography'

const Bio = () => {
  return (
    <StaticQuery
      query={bioQuery}
      render={data => {
        const { author, social } = data.site.siteMetadata
        return (
          <div style={{ display: `flex`, marginBottom: rhythm(2.5) }}>
            <Image
              fixed={{width: 50, height: 50, srcSet:'https://www.github.com/Naturalclar.png', src:'https://www.github.com/Naturalclar.png'}}
              alt={author}
              style={{
                marginRight: rhythm(1 / 2),
                marginBottom: 0,
                minWidth: 50,
                borderRadius: `100%`,
              }}
            />
            <p>
              Author: <strong>{author}</strong>
              <p>
                <a href={`${social.twitter}`}>Twitter</a>{' '}
                <a href={`${social.github}`}>Github</a>
              </p>
            </p>
          </div>
        )
      }}
    />
  )
}

const bioQuery = graphql`
  query BioQuery {
    site {
      siteMetadata {
        author
        social {
          twitter
          github
        }
      }
    }
  }
`

export default Bio
