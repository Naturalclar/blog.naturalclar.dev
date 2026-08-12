const fs = require('node:fs')
const path = require('node:path')
const { Feed } = require('feed')
const {
  author,
  authorEmail,
  siteDescription,
  siteTitle,
  siteUrl,
} = require('../src/data/site.json')

function readPostsFromDirectory() {
  const postsDirectory = path.join(process.cwd(), 'content/blog')
  const fileNames = fs.readdirSync(postsDirectory)

  return fileNames
    .filter((name) =>
      fs.statSync(path.join(postsDirectory, name)).isDirectory()
    )
    .map((name) => {
      const fullPath = path.join(postsDirectory, name, 'index.md')

      if (!fs.existsSync(fullPath)) {
        return null
      }

      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const matter = require('gray-matter')
      const matterResult = matter(fileContents)

      return {
        slug: name,
        title: matterResult.data.title || name,
        date: matterResult.data.date || '',
        content: matterResult.content,
        excerpt: `${matterResult.content.substring(0, 200)}...`,
      }
    })
    .filter((post) => post !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

function generateRSSFeed() {
  const posts = readPostsFromDirectory()

  const feed = new Feed({
    title: siteTitle,
    description: siteDescription,
    id: siteUrl,
    link: siteUrl,
    language: 'en',
    image: `${siteUrl}/twitter-card.png`,
    favicon: `${siteUrl}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}, ${author}`,
    updated: new Date(posts[0]?.date || new Date()),
    generator: 'Next.js',
    feedLinks: {
      rss2: `${siteUrl}/rss.xml`,
    },
    author: {
      name: author,
      email: authorEmail,
      link: siteUrl,
    },
  })

  posts.forEach((post) => {
    feed.addItem({
      title: post.title,
      id: `${siteUrl}/posts/${post.slug}`,
      link: `${siteUrl}/posts/${post.slug}`,
      description: post.excerpt,
      content: post.content,
      author: [
        {
          name: author,
          email: authorEmail,
          link: siteUrl,
        },
      ],
      date: new Date(post.date),
    })
  })

  // Write RSS feed to public directory
  const publicDir = path.join(process.cwd(), 'public')
  const rssPath = path.join(publicDir, 'rss.xml')

  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }

  fs.writeFileSync(rssPath, feed.rss2())
}

generateRSSFeed()
console.log('RSS feed generated successfully!')
