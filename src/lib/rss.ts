import { Feed } from 'feed'
import fs from 'fs'
import path from 'path'
import { getSortedPostsData } from './posts'
import { author, siteDescription, siteTitle, siteUrl } from '../data/static'

export function generateRSSFeed() {
  const posts = getSortedPostsData()
  
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
      email: 'jesse.katsumata@gmail.com',
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
          email: 'jesse.katsumata@gmail.com',
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