import fs from 'node:fs'
import path from 'node:path'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import { visit } from 'unist-util-visit'

// Checks every external link in content/blog/ and reports what has rotted.
//
// Deliberately NOT part of `pnpm build` or of ci.yml, for the same reason
// `pnpm ogp` is not: the deploy builds from a clean checkout on every push,
// and a checker there would put every deploy at the mercy of every host the
// articles link to. This runs on demand instead — see
// .github/workflows/links.yml — so a dead link is visible without ever being
// able to hold the site back.
//
//   pnpm links                 check everything
//   pnpm links --host=github.com   only that host
//
// Exit status is 1 when something is broken or unreachable, so a run that
// finds rot shows up red in the Actions list.

const TIMEOUT_MS = 15000
const CONCURRENCY = 6
const RETRIES = 2
const BACKOFF_MS = [2000, 5000]
const MAX_BACKOFF_MS = 15000
const USER_AGENT =
  'Mozilla/5.0 (compatible; blog.naturalclar.dev link checker; +https://blog.naturalclar.dev)'

function flag(name, fallback) {
  const found = process.argv.find((arg) => arg.startsWith(`--${name}=`))
  return found ? found.slice(name.length + 3) : fallback
}

const timeoutMs = Number(flag('timeout', TIMEOUT_MS))
const concurrency = Number(flag('concurrency', CONCURRENCY))
const hostFilter = flag('host')

/**
 * Every external URL in the archive, with the articles that reference it.
 *
 * `definition` is in the list alongside `link` and `image` because a
 * reference-style link (`[text][ref]` with `[ref]: https://…` at the foot of
 * the article) keeps its URL there and nowhere else — 2019-overview writes
 * its links that way, so a walk over `link` alone would miss them entirely.
 */
function collectLinks() {
  const postsDirectory = path.join(process.cwd(), 'content/blog')
  const links = new Map()

  for (const slug of fs.readdirSync(postsDirectory).sort()) {
    const file = path.join(postsDirectory, slug, 'index.md')

    if (!fs.existsSync(file)) {
      continue
    }

    const body = fs.readFileSync(file, 'utf8').replace(/^---\n.*?\n---\n/s, '')
    const tree = remark().use(remarkGfm).parse(body)

    visit(tree, ['link', 'image', 'definition'], (node) => {
      const url = node.url ?? ''

      if (!/^https?:\/\//.test(url)) {
        return
      }

      if (!links.has(url)) {
        links.set(url, new Set())
      }

      links.get(url).add(slug)
    })
  }

  return [...links].map(([url, slugs]) => ({ url, slugs: [...slugs] }))
}

async function fetchWithTimeout(url, init) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, {
      ...init,
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': USER_AGENT },
    })
  } finally {
    clearTimeout(timer)
  }
}

/**
 * HEAD, falling back to GET.
 *
 * A HEAD is enough to tell a live page from a dead one and costs the host
 * nothing, but plenty of servers answer it 405 or 501 without meaning the
 * page is gone. GitHub also rate-limits, so 429 is retried the same way the
 * OGP fetcher retries it — honouring Retry-After, since the host knows better
 * than a fixed backoff does.
 */
async function probe(url) {
  let response = await fetchWithTimeout(url, { method: 'HEAD' })

  if ([403, 405, 501].includes(response.status)) {
    response = await fetchWithTimeout(url, { method: 'GET' })
  }

  for (
    let attempt = 0;
    response.status === 429 && attempt < RETRIES;
    attempt++
  ) {
    const after = Number(response.headers.get('retry-after'))
    const wait = Math.min(
      Number.isFinite(after) && after > 0 ? after * 1000 : BACKOFF_MS[attempt],
      MAX_BACKOFF_MS
    )

    await new Promise((resolve) => setTimeout(resolve, wait))
    response = await fetchWithTimeout(url, { method: 'GET' })
  }

  return response
}

/** Trailing slashes are not a move, and neither is the same page over https. */
function normalize(url) {
  return url.replace(/^http:/, 'https:').replace(/\/$/, '')
}

async function check({ url, slugs }) {
  let response

  try {
    response = await probe(url)
  } catch (error) {
    // A timeout, a DNS failure or a TLS error. Reported apart from a 404
    // because it says the host could not be reached, not that the page is
    // gone — a checker that conflates the two cries wolf on every blip.
    return {
      url,
      slugs,
      state: 'unreachable',
      detail:
        error.name === 'AbortError' || error.name === 'TimeoutError'
          ? `no answer in ${timeoutMs}ms`
          : (error.cause?.message ?? error.message),
    }
  }

  const { status } = response

  if (status === 401 || status === 403 || status === 429) {
    // The host refused the checker rather than the page. Reported, but not
    // as rot: these are the answers a bot gets from a page a reader sees.
    return { url, slugs, state: 'refused', detail: String(status) }
  }

  if (status >= 400) {
    return { url, slugs, state: 'broken', detail: String(status) }
  }

  if (normalize(response.url) !== normalize(url)) {
    return { url, slugs, state: 'moved', detail: response.url }
  }

  return { url, slugs, state: 'ok', detail: String(status) }
}

/** A fixed pool rather than one fetch per URL: 120 at once is a small DoS. */
async function pool(items, worker) {
  const results = []
  let next = 0

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      while (next < items.length) {
        const index = next++
        results[index] = await worker(items[index])
      }
    })
  )

  return results
}

const SECTIONS = [
  ['broken', 'Broken'],
  ['unreachable', 'Unreachable'],
  ['moved', 'Moved'],
  ['refused', 'Refused the checker'],
]

const links = collectLinks().filter(
  ({ url }) => !hostFilter || new URL(url).hostname === hostFilter
)

console.log(`checking ${links.length} external link(s) in content/blog/`)

const results = await pool(links, check)

for (const [state, heading] of SECTIONS) {
  const matching = results.filter((result) => result.state === state)

  if (!matching.length) {
    continue
  }

  console.log(`\n## ${heading} (${matching.length})\n`)

  for (const { url, slugs, detail } of matching) {
    console.log(`- ${url}\n  ${detail}\n  in: ${slugs.join(', ')}`)
  }
}

const counts = SECTIONS.map(
  ([state]) => `${results.filter((r) => r.state === state).length} ${state}`
)

console.log(
  `\n${results.filter((r) => r.state === 'ok').length} ok, ${counts.join(', ')}`
)

// Only broken and unreachable fail the run. A move still reaches the page a
// reader wanted, and a refusal is about the checker, not the archive.
const failing = results.filter((r) =>
  ['broken', 'unreachable'].includes(r.state)
).length

if (failing) {
  console.log(
    'Rewriting an old article to chase link rot is a judgement call — this run only makes it visible.'
  )
  process.exitCode = 1
}
