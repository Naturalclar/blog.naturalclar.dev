import fs from 'node:fs'
import path from 'node:path'
import { fromHtml } from 'hast-util-from-html'
import rehypeStringify from 'rehype-stringify'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import { visit } from 'unist-util-visit'
import { CACHE_PATH, loadOgpCache, standaloneLinkUrl } from '../src/lib/ogp.mjs'

// Refreshes the OGP cache the build reads. Deliberately NOT part of `pnpm
// build`: the build would otherwise depend on every third-party host an
// article links to, on every deploy, from a clean checkout.
//
// Run it after adding a link to an article, from somewhere with network
// access, and commit the result.

const IMAGE_DIR = path.join(process.cwd(), 'public/ogp')
const TIMEOUT_MS = 15000
const USER_AGENT =
  'Mozilla/5.0 (compatible; blog.naturalclar.dev OGP fetcher; +https://blog.naturalclar.dev)'

function collectUrls() {
  const postsDirectory = path.join(process.cwd(), 'content/blog')
  const urls = new Set()

  for (const slug of fs.readdirSync(postsDirectory)) {
    const file = path.join(postsDirectory, slug, 'index.md')

    if (!fs.existsSync(file)) {
      continue
    }

    const body = fs.readFileSync(file, 'utf8').replace(/^---\n.*?\n---\n/s, '')
    const tree = remark()
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypeStringify)
      .runSync(remark().use(remarkGfm).parse(body))

    visit(tree, 'element', (node) => {
      const url = standaloneLinkUrl(node)
      if (url) {
        urls.add(url)
      }
    })
  }

  return [...urls]
}

function metaContent(tree, matchers) {
  let found

  visit(tree, 'element', (node) => {
    if (node.tagName !== 'meta' || found) {
      return
    }

    const key = node.properties?.property ?? node.properties?.name
    const content = node.properties?.content

    if (
      typeof key === 'string' &&
      typeof content === 'string' &&
      matchers.includes(key.toLowerCase()) &&
      content.trim()
    ) {
      found = content.trim()
    }
  })

  return found
}

function documentTitle(tree) {
  let found

  visit(tree, 'element', (node) => {
    if (node.tagName === 'title' && !found) {
      found = node.children?.[0]?.value?.trim()
    }
  })

  return found
}

async function fetchWithTimeout(url, init = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    return await fetch(url, {
      ...init,
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': USER_AGENT, ...(init.headers ?? {}) },
    })
  } finally {
    clearTimeout(timer)
  }
}

async function downloadImage(imageUrl, url) {
  const response = await fetchWithTimeout(imageUrl)

  if (!response.ok) {
    throw new Error(`image responded ${response.status}`)
  }

  const type = response.headers.get('content-type') ?? ''
  const extension = type.includes('png')
    ? '.png'
    : type.includes('webp')
      ? '.webp'
      : type.includes('svg')
        ? '.svg'
        : '.jpg'

  // Named after the page URL rather than the image URL so a re-fetch
  // overwrites in place instead of leaving the old file behind.
  const name =
    Buffer.from(url).toString('base64url').replace(/=+$/, '').slice(0, 40) +
    extension

  fs.mkdirSync(IMAGE_DIR, { recursive: true })
  fs.writeFileSync(
    path.join(IMAGE_DIR, name),
    Buffer.from(await response.arrayBuffer())
  )

  return `/ogp/${name}`
}

async function fetchMetadata(url) {
  const response = await fetchWithTimeout(url)

  if (!response.ok) {
    throw new Error(`responded ${response.status}`)
  }

  const tree = fromHtml(await response.text())

  const title =
    metaContent(tree, ['og:title', 'twitter:title']) ?? documentTitle(tree)

  if (!title) {
    throw new Error('no og:title or <title>')
  }

  const entry = {
    title,
    description: metaContent(tree, [
      'og:description',
      'twitter:description',
      'description',
    ]),
    siteName: metaContent(tree, ['og:site_name']),
  }

  const imageUrl = metaContent(tree, ['og:image', 'twitter:image'])

  if (imageUrl) {
    try {
      entry.image = await downloadImage(new URL(imageUrl, url).href, url)
    } catch (error) {
      console.warn(`  image skipped (${error.message})`)
    }
  }

  return Object.fromEntries(
    Object.entries(entry).filter(([, value]) => value !== undefined)
  )
}

const urls = collectUrls()
const cache = loadOgpCache()
const refreshAll = process.argv.includes('--all')
const pending = refreshAll ? urls : urls.filter((url) => !cache[url])

console.log(
  `${urls.length} standalone URL(s) in articles, ${pending.length} to fetch${
    refreshAll ? ' (--all)' : ''
  }`
)

let ok = 0
let failed = 0

for (const url of pending) {
  try {
    cache[url] = await fetchMetadata(url)
    ok += 1
    console.log(`  ok    ${url} — ${cache[url].title}`)
  } catch (error) {
    failed += 1
    console.log(`  fail  ${url} — ${error.message}`)
  }
}

// Drop entries for URLs no longer used by any article, so the cache does not
// accumulate.
for (const url of Object.keys(cache)) {
  if (!urls.includes(url)) {
    delete cache[url]
    console.log(`  drop  ${url} — no longer referenced`)
  }
}

// Remove downloaded images no cache entry points at any more, so public/ogp/
// does not collect orphans as articles change.
if (fs.existsSync(IMAGE_DIR)) {
  const referenced = new Set(
    Object.values(cache)
      .map((entry) => entry.image)
      .filter(Boolean)
      .map((image) => path.basename(image))
  )

  for (const name of fs.readdirSync(IMAGE_DIR)) {
    if (!referenced.has(name)) {
      fs.unlinkSync(path.join(IMAGE_DIR, name))
      console.log(`  clean ${name} — orphaned image`)
    }
  }
}

const sorted = Object.fromEntries(
  Object.keys(cache)
    .sort()
    .map((url) => [url, cache[url]])
)

fs.writeFileSync(CACHE_PATH, `${JSON.stringify(sorted, null, 2)}\n`)

console.log(
  `cache written: ${Object.keys(sorted).length} entr(ies), ${ok} fetched, ${failed} failed`
)
console.log(
  failed
    ? 'URLs that failed stay plain links in the build — that is the intended fallback.'
    : 'All good.'
)
