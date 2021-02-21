import * as React from 'react'
import { StaticQuery, graphql } from 'gatsby'
import Image from 'gatsby-image'

import { rhythm } from '../utils/typography'

const Bio = () => {
  return (
    <StaticQuery
      query={bioQuery}
      render={(data) => {
        const { author, social } = data.site.siteMetadata
        return (
          <div style={styles.container}>
            <Image
              fixed={data.avatar.childImageSharp.fixed}
              alt={author}
              style={styles.avatar}
            />
            <div>
              <p style={styles.authorString}>
                Author: <strong>{author}</strong>
              </p>
              <p>
                <a href={`${social.twitter}`}>Twitter</a>{' '}
                <a href={`${social.github}`}>Github</a>
              </p>
            </div>
          </div>
        )
      }}
    />
  )
}

const styles = {
  container: { display: `flex`, marginBottom: rhythm(2.5) },
  avatar: {
    marginRight: rhythm(1 / 2),
    marginBottom: 0,
    minWidth: 50,
    borderRadius: `100%`,
  },
  authorString: {
    margin: '0',
  },
}

const bioQuery = graphql`
  query BioQuery {
    avatar: file(absolutePath: { regex: "/profile-pic.jpg/" }) {
      childImageSharp {
        fixed(width: 50, height: 50) {
          ...GatsbyImageSharpFixed
        }
      }
    }
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
