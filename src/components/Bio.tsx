import Image from 'next/image'

import { author, avatar, social } from '../data/static'
import { GitHubIcon, XIcon } from './SocialIcons'

const Bio = () => {
  return (
    <div className="mb-10 flex items-center">
      <Image
        className="avatar mr-4 rounded-full"
        src={avatar}
        width={50}
        height={50}
        alt={author}
      />
      <div className="flex flex-col gap-2">
        <p className="m-0">
          Author: <strong>{author}</strong>
        </p>
        <p className="m-0 flex items-center gap-3">
          <a className="social-link" href={social.x} aria-label="X profile">
            <XIcon />
          </a>
          <a
            className="social-link"
            href={social.github}
            aria-label="GitHub profile"
          >
            <GitHubIcon />
          </a>
        </p>
      </div>
    </div>
  )
}

export default Bio
