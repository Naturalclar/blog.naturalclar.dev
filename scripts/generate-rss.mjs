import fs from 'node:fs'
import path from 'node:path'
import { Feed } from 'feed'
import site from '../src/data/site.json' with { type: 'json' }
import { readPosts } from '../src/lib/read-posts.mjs'

// ESM rather than CommonJS so this can import the shared modules under
// src/lib/, which have to be ones the TypeScript side can import too. The
// excerpt was the first (#112); the walk over content/blog/ followed in #180,
// after living here as a second copy that had to be kept in agreement by hand.
const { author, authorEmail, siteDescription, siteTitle, siteUrl } = site

function generateRSSFeed() {
  const posts = readPosts()

  const feed = new Feed({
    title: siteTitle,
    description: siteDescription,
    id: siteUrl,
    link: siteUrl,
    // Every article is Japanese, and the pages have said lang="ja" since #143;
    // the feed kept declaring English, which is what a reader's client groups
    // and filters on.
    language: 'ja',
    image: `${siteUrl}/twitter-card.png`,
    favicon: `${siteUrl}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}, ${author}`,
    updated: new Date(posts[0]?.date || new Date()),
    // Not Next.js: it never sees this file. The script runs after the export,
    // and writes straight into out/ for the reason in #89.
    generator: 'scripts/generate-rss.mjs',
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
      category: post.tags.map((name) => ({ name })),
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

  // Write the feed straight into the export directory. Writing it to public/
  // instead would be too late: `next build` copies public/ into out/ before
  // this script runs, so the feed would only ever reach out/ on a rebuild that
  // happened to find a previous run's file.
  const outDir = path.join(process.cwd(), 'out')

  if (!fs.existsSync(outDir)) {
    throw new Error(
      `Export directory not found at ${outDir}. Run \`next build\` first — this script is meant to run after it, as \`pnpm build\` does.`
    )
  }

  fs.writeFileSync(path.join(outDir, 'rss.xml'), feed.rss2())
}

generateRSSFeed()
console.log('RSS feed generated successfully!')
