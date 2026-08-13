import Image from 'next/image'

import { author, social } from '../data/static'

const Bio = () => {
  return (
    <div className="mb-10 flex items-center">
      <Image
        className="avatar mr-4 rounded-full"
        src="https://www.github.com/Naturalclar.png"
        width={50}
        height={50}
        alt={author}
      />
      <div className="flex flex-col gap-2">
        <p className="m-0">
          Author: <strong>{author}</strong>
        </p>
        <p className="m-0">
          <a href={`${social.x}`}>X</a> <a href={`${social.github}`}>Github</a>
        </p>
      </div>
    </div>
  )
}

export default Bio
