import React from 'react'

import { rhythm } from '../utils/typography'
import { author, social } from '../data/static'

const Bio = () => {
  return (
    <div style={{ display: `flex`, marginBottom: rhythm(2.5) }}>
      <img
        src={'https://www.github.com/Naturalclar.png'}
        width={50}
        height={50}
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
          <a href={`${social.x}`}>X</a> <a href={`${social.github}`}>Github</a>
        </p>
      </p>
    </div>
  )
}

export default Bio
