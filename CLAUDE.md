# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Always use `pnpm` — the version is pinned to 9.15.2 via the `packageManager` field, and Node 22.0.0 via Volta.

- `pnpm dev` — dev server on port 3000
- `pnpm build` — static export into `out/`, then writes `out/rss.xml`
- `pnpm lint` — `biome check`: lint, format check, and import order in one pass
- `pnpm format` — `biome check --write`: applies fixes in place
- `pnpm new` — scaffolds `content/blog/{title}/index.md` via scaffdog, prompting for a title

To preview a production build, serve the static output (`npx serve@latest out`).

### Scripts that do not work

Three entries in `package.json` are stale and fail if run. Don't reach for them, and don't assume they indicate a supported workflow:

- `pnpm start` — `next start` is incompatible with `output: 'export'` and exits with an error
- `pnpm export` — `next export` was removed in Next 14
- `pnpm test` — a placeholder `echo`; there is no test framework in this repository

## Workflow

Work on a branch off `master`; never commit to `master` directly.

**Pushing is not the end of a change — open the pull request as part of the same step, without waiting to be asked.** A pushed branch with no PR is invisible: nobody is looking at the branch list, so the work reads as unfinished. Treat `git push -u origin <branch>` and opening the PR as one action.

- Put `Closes #N` in the PR body when the change resolves an issue, so merging closes it
- There is no PR template in this repository
- Merge with squash. The history uses `<subject> (#N)` titles — see #87, #88, #94, #96
- CI runs on both `push` and `pull_request` (see the CI section below), so a branch is checked twice. Let it pass before merging

Stopping after the push and asking whether to open a PR is the wrong default here — open it, and say so.

## Architecture

A Next.js App Router blog that builds to a fully static export and deploys to Netlify at https://blog.naturalclar.dev. There is no server at runtime: no middleware, no Server Actions, no route handlers, no rewrites, and `images.unoptimized` is set. Anything requiring a Next.js server will not work here.

### Content pipeline

Posts live in `content/blog/{slug}/index.md`, one directory per post, with images alongside them. Frontmatter carries `title` and `date`.

`src/lib/posts.ts` is the single entry point for post data. It reads the directory with `fs`, parses frontmatter with `gray-matter`, and converts the body to HTML with `remark` + `remark-html` at build time. Markdown is deliberately *not* in `pageExtensions` — `.md` files are data read by that module, never routes. The resulting `contentHtml` is injected with `dangerouslySetInnerHTML` in `src/app/posts/[slug]/page.tsx`, which carries a `biome-ignore` justifying it (the input is this repository's own Markdown).

Site-wide constants live in `src/data/site.json`. `src/data/static.ts` re-exports them as named exports for the app (`src/lib/metadata.ts` and the components), and `scripts/generate-rss.js` `require`s the same JSON. Edit the JSON, not the re-exports — it is the single source shared across the TypeScript and CommonJS sides.

### Static assets

`public/` is the served static directory and **is tracked in git** — it holds `robots.txt` and `twitter-card.png` (the OG image `src/lib/metadata.ts` points every page at). `next build` copies it to the export root, so those files answer at `/robots.txt` and `/twitter-card.png`.

The favicon is `src/app/favicon.ico`, using the App Router file convention rather than `public/`: that is what emits the `<link rel="icon">` tag into the HTML, and it adds one route to the static page count.

Until #95 these lived in a root `static/` directory and in `content/assets/`, neither of which Next.js serves from — they reached `out/static/` and nowhere respectively, so `/robots.txt`, `/favicon.ico`, and the OG image were all 404. Both directories are gone now; don't reintroduce them. Anything that should answer at a URL belongs in `public/`.

### RSS generation

`pnpm build` runs `next build && node scripts/generate-rss.js`. The script writes `out/rss.xml` — directly into the export directory, not into `public/`.

That ordering is load-bearing, so don't "tidy" it by moving the write to `public/`: `next build` copies `public/` into `out/` before the script runs, so a feed written there would reach `out/` only on a later rebuild that happened to find the previous run's file. This was a real bug (#89) — clean checkouts, which is what CI and Netlify build from, shipped no feed at all. The script now throws if `out/` is absent rather than silently writing somewhere that never gets deployed.

One duplication remains in the same area: `scripts/generate-rss.js` re-implements the post reading that `src/lib/posts.ts` already does — its own `readdirSync` walk, `gray-matter` parse, excerpt slice, and sort. The two must be kept in agreement by hand. Being CommonJS, the script cannot import the TypeScript module; closing this properly needs a TypeScript-aware runner for the script.

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
