const fs = require('node:fs')
const path = require('node:path')

// Articles keep their images next to index.md, and the Markdown references
// them relatively (`./diagram.png`). content/ is only read as data at build
// time and is never copied into the export, so those references resolved to
// nothing. With trailingSlash the article lives at /posts/{slug}/, which means
// the images belong beside its index.html in out/posts/{slug}/.
function copyPostAssets() {
  const postsDirectory = path.join(process.cwd(), 'content/blog')
  const outPostsDirectory = path.join(process.cwd(), 'out/posts')

  if (!fs.existsSync(path.join(process.cwd(), 'out'))) {
    throw new Error(
      `Export directory not found at ${path.join(process.cwd(), 'out')}. Run \`next build\` first — this script is meant to run after it, as \`pnpm build\` does.`
    )
  }

  let copied = 0

  for (const slug of fs.readdirSync(postsDirectory)) {
    const postDirectory = path.join(postsDirectory, slug)

    if (!fs.statSync(postDirectory).isDirectory()) {
      continue
    }

    const assets = fs
      .readdirSync(postDirectory)
      .filter((name) => name !== 'index.md')

    if (assets.length === 0) {
      continue
    }

    const destination = path.join(outPostsDirectory, slug)
    fs.mkdirSync(destination, { recursive: true })

    for (const asset of assets) {
      fs.cpSync(
        path.join(postDirectory, asset),
        path.join(destination, asset),
        {
          recursive: true,
        }
      )
      copied += 1
    }
  }

  return copied
}

const copied = copyPostAssets()
console.log(`Copied ${copied} article asset(s) into out/posts/`)
