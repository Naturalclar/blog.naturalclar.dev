import React from 'react'
import { StaticQuery, graphql } from 'gatsby'
import Image from 'gatsby-image'

import { rhythm } from '../utils/typography'

const Bio = () => {
  return (
    <StaticQuery
      query={bioQuery}
      render={data => {
        const { author, social, org } = data.site.siteMetadata
        return (
          <div style={{ display: `flex`, marginBottom: rhythm(2.5) }}>
            <Image
              fixed={data.avatar.childImageSharp.fixed}
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
              <p>Member of <a href={`${org.reactNativeCommunity}`}>react-native-community</a> and <a href={`${org.reasonReactNative}`}>reason-react-native</a></p>
              <p>Staff of <a href={`${org.jsconfjp}`}>JSConfJP</a> and <a href={`${org.tsconfjp}`}>TSConfJP</a></p>
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
