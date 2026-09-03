import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

/**
 * Fail on a repository path named in the docs or the source that no longer
 * resolves.
 *
 * The documentation here is load-bearing — AGENTS.md is mostly "why", and its
 * value depends on a reader being able to follow a named path to the code. A
 * path that has rotted does worse than say nothing: it sends someone looking
 * for a file that is not there and casts doubt on the reasoning around it.
 * That is what #205 was, a comment pointing at `scripts/generate-rss.js` three
 * releases after the file became `.mjs`.
 *
 * Safe in ci.yml by the same test textlint passes and `pnpm links` fails: it
 * reads only this repository's own files, so it is deterministic and offline,
 * and no third-party host can redden a deploy through it.
 */

// Only paths under a directory this repository actually owns. Anchoring on
// these rather than "anything with a slash and a dot" is what keeps URLs,
// package names (`highlight.js/lib/languages/powershell`) and bare filenames
// out of the results.
const ROOTS = ['src', 'scripts', 'public', '.github', '.scaffdog']

/**
 * Two details here are guards against measured mistakes, not style.
 *
 * The trailing `\b` and the longest-first extension order each prevent the
 * same bug independently: alternation is leftmost-first rather than
 * longest-match, so a bare `ts|tsx` truncates `PostLink.tsx` to `PostLink.ts`
 * and reports a file that does not exist — 15 false positives when this was
 * first written by hand. Measured, truncation needs *both* `ts` before `tsx`
 * *and* no `\b`; with the `\b` present the order no longer matters. Both are
 * kept, and the order is the one a reader is more likely to preserve by
 * accident.
 *
 * The character class deliberately does not escape `]`: `[...\[\]...]` ends
 * the class early and the pattern then matches nothing at all, reporting a
 * clean tree while checking none of it. That is the dangerous failure — it
 * looks exactly like success — and it is what `selfTest` below exists to
 * catch.
 */
const PATH_PATTERN = new RegExp(
  `(?:${ROOTS.map((r) => r.replace('.', '\\.')).join('|')})` +
    String.raw`\/[A-Za-z0-9_.\[\]/-]+` +
    String.raw`\.(?:tsx|json|mjs|yml|css|ico|png|txt|xml|md|ts|js)\b`,
  'g'
)

/**
 * `content/` is deliberately not scanned. Article prose cites paths from the
 * projects it is about — `src/components/Button.ts`,
 * `src/screens/LoginScreen.ts` and `src/Entrypoint/Options.ts` all appear in
 * articles, and none of them are files here.
 */
const SKIP_PREFIXES = ['content/']

/** Files worth reading: text this repository wrote. */
const SCANNED_EXTENSIONS = [
  '.ts',
  '.tsx',
  '.mjs',
  '.js',
  '.md',
  '.json',
  '.yml',
  '.css',
]

function trackedFiles() {
  return execFileSync('git', ['ls-files'], { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean)
    .filter((file) => !SKIP_PREFIXES.some((prefix) => file.startsWith(prefix)))
    .filter((file) => SCANNED_EXTENSIONS.includes(path.extname(file)))
}

/** Every missing path, as `{ path, file, line }`. */
export function findMissingPaths(files = trackedFiles()) {
  const missing = []

  for (const file of files) {
    const lines = fs.readFileSync(file, 'utf8').split('\n')

    lines.forEach((text, index) => {
      for (const match of text.matchAll(PATH_PATTERN)) {
        const found = match[0]

        if (!fs.existsSync(found)) {
          missing.push({ path: found, file, line: index + 1 })
        }
      }
    })
  }

  return missing
}

/**
 * Prove the checker can fail before trusting it to pass.
 *
 * A path checker that matches nothing reports a clean tree, which is
 * indistinguishable from working. So the run asserts on known-good strings
 * every time rather than only when someone remembers to test it.
 *
 * What this does and does not cover, checked by breaking the pattern
 * deliberately: a class that matches nothing makes it throw, which is the
 * failure worth guarding. Reordering the extensions does *not* make it throw,
 * because the `\b` already prevents the truncation on its own — so that guard
 * rests on the comment above the pattern, not on this.
 */
function selfTest() {
  const cases = [
    ['src/lib/definitely-not-here.mjs', true, 'a missing .mjs path'],
    ['src/lib/routes.mjs', false, 'a real .mjs path'],
    ['src/components/PostLink.tsx', false, 'a real .tsx path, not truncated'],
    ['src/data/tags.json', false, 'a real .json path, not truncated'],
    ['src/app/posts/[slug]/page.tsx', false, 'a real path with [brackets]'],
  ]

  for (const [candidate, shouldBeMissing, description] of cases) {
    const matched = [...`see ${candidate} here`.matchAll(PATH_PATTERN)].map(
      (m) => m[0]
    )

    if (!matched.includes(candidate)) {
      throw new Error(
        `check-paths self-test: the pattern did not match ${candidate} (${description}). It matched ${JSON.stringify(matched)}. A pattern that matches nothing reports a clean tree.`
      )
    }

    if (!fs.existsSync(candidate) !== shouldBeMissing) {
      throw new Error(
        `check-paths self-test: expected ${candidate} to be ${shouldBeMissing ? 'missing' : 'present'} (${description})`
      )
    }
  }
}

selfTest()

const missing = findMissingPaths()
const scanned = trackedFiles().length

if (missing.length === 0) {
  console.log(`No broken paths. Scanned ${scanned} tracked files.`)
  process.exit(0)
}

console.error(`Broken paths in ${missing.length} place(s):\n`)

for (const { path: broken, file, line } of missing) {
  console.error(`  ${file}:${line}`)
  console.error(`      ${broken} does not exist\n`)
}

console.error(
  'Either the path is a typo, or the file moved and the reference was left behind.'
)
process.exit(1)
