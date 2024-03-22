import React from 'react'

import { author, social } from '../data/static'

const Bio = () => {
  return (
    <div
      style={{
        display: `flex`,
        alignItems: 'center',
        marginBottom: '40px',
      }}
    >
      <img
        src={'https://www.github.com/Naturalclar.png'}
        width={50}
        height={50}
        alt={author}
        style={{
          marginRight: '16px',
          marginBottom: 0,
          minWidth: 50,
          borderRadius: `100%`,
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p style={{ margin: 0 }}>
          Author: <strong>{author}</strong>
        </p>
        <p style={{ margin: 0 }}>
          <a href={`${social.x}`}>X</a> <a href={`${social.github}`}>Github</a>
        </p>
      </div>
    </div>
  )
}

export default Bio
