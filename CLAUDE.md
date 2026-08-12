# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Always use `pnpm` — the version is pinned to 9.15.2 via the `packageManager` field, and Node 22.0.0 via Volta.

- `pnpm dev` — dev server on port 3000
- `pnpm build` — static export into `out/`, then generates the RSS feed (see the RSS caveat below)
- `pnpm lint` — `biome check`: lint, format check, and import order in one pass
- `pnpm format` — `biome check --write`: applies fixes in place
- `pnpm new` — scaffolds `content/blog/{title}/index.md` via scaffdog, prompting for a title

To preview a production build, serve the static output (`npx serve@latest out`).

### Scripts that do not work

Three entries in `package.json` are stale and fail if run. Don't reach for them, and don't assume they indicate a supported workflow:

- `pnpm start` — `next start` is incompatible with `output: 'export'` and exits with an error
- `pnpm export` — `next export` was removed in Next 14
- `pnpm test` — a placeholder `echo`; there is no test framework in this repository

## Architecture

A Next.js App Router blog that builds to a fully static export and deploys to Netlify at https://blog.naturalclar.dev. There is no server at runtime: no middleware, no Server Actions, no route handlers, no rewrites, and `images.unoptimized` is set. Anything requiring a Next.js server will not work here.

### Content pipeline

Posts live in `content/blog/{slug}/index.md`, one directory per post, with images alongside them or in `content/assets/`. Frontmatter carries `title` and `date`.

`src/lib/posts.ts` is the single entry point for post data. It reads the directory with `fs`, parses frontmatter with `gray-matter`, and converts the body to HTML with `remark` + `remark-html` at build time. Markdown is deliberately *not* in `pageExtensions` — `.md` files are data read by that module, never routes. The resulting `contentHtml` is injected with `dangerouslySetInnerHTML` in `src/app/posts/[slug]/page.tsx`, which carries a `biome-ignore` justifying it (the input is this repository's own Markdown).

Site-wide constants (`author`, `social`, `siteTitle`, `siteDescription`, `siteUrl`) live in `src/data/static.ts` and feed both `src/lib/metadata.ts` and the components.

### RSS generation, and its ordering bug

`pnpm build` runs `next build && node scripts/generate-rss.js`. The script writes to `public/rss.xml` — but `next build` has already copied `public/` into `out/` by then.

**On a clean checkout the feed never reaches `out/`.** Verified: after `rm -rf out public && pnpm build`, `public/rss.xml` exists and `out/rss.xml` does not. A second local build appears to work only because it copies the *previous* run's stale file. CI and Netlify build from a clean tree, so they hit the broken case every time. Fix by writing into `out/` or by generating before `next build` — but note that `out/` does not exist until `next build` runs.

Two related traps in the same area:

- `src/lib/rss.ts` is dead code. It duplicates the script's logic and is imported by nothing. Editing it has no effect on the build; the script at `scripts/generate-rss.js` is what runs.
- That script is CommonJS and cannot import `src/data/static.ts`, so it **hardcodes its own copies** of `siteUrl`, `author`, and the site title. Changing `src/data/static.ts` alone will silently desync the feed.

### Pagination

`getPaginatedPosts(page, perPage)` in `src/lib/posts.ts` backs the home page (`src/app/page.tsx`) and `src/app/page/[page]/page.tsx`, which pre-renders pages 2..N via `generateStaticParams`. The page size of `10` is hardcoded at all three call sites rather than shared — change one and you must change the others or the page count and slicing disagree.

### Tooling

**Biome** (`biome.json`) is the sole toolchain for linting, formatting, and import sorting; it replaced ESLint + Prettier. Two configuration choices matter:

- `vcs.useIgnoreFile` is on, so `.gitignore` drives exclusions
- `content/` is excluded, so authored posts are never reformatted

Formatting follows the previous Prettier conventions: single quotes, no semicolons, 2-space indent, `es5` trailing commas.

Because `eslint-config-next` was removed, **the Next.js-specific rules (`@next/next/*`) and the React Hooks rules are not enforced** — Biome does not implement them. Nothing checks for `exhaustive-deps` violations or `no-img-element`.

`tsconfig.json` defines `@/*` path aliases, but no source file uses them; imports are relative throughout. Match the surrounding relative style rather than introducing aliases piecemeal.

`main.css` at the repository root is unreferenced; the stylesheet actually in use is `src/app/globals.css`, imported from `src/app/layout.tsx`.

### CI

`.github/workflows/ci.yml` runs `pnpm lint` then `pnpm build` on Node 22 for every push and pull request. `.github/workflows/label.yml` auto-labels new issues by keyword — an issue whose title or body contains "post" gets `Post Idea`, and "feature" gets `feature request`.
