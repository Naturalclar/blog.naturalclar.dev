# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Always use `pnpm` — the version is pinned to 9.15.2 via the `packageManager` field, and Node 22.0.0 via Volta.

- `pnpm dev` — dev server on port 3000
- `pnpm build` — static export into `out/`, then copies article assets and writes `out/rss.xml`
- `pnpm lint` — `biome check`: lint, format check, and import order in one pass
- `pnpm format` — `biome check --write`: applies fixes in place
- `pnpm new` — scaffolds `content/blog/{title}/index.md` via scaffdog, prompting for a title
- `pnpm start` — serves the built `out/` directory on port 3000, for checking a production build

`pnpm start` runs `pnpm dlx serve out`, not `next start`: the build is a static export, so there is no Next.js server to start. It needs `pnpm build` to have run first.

**There is no test script and no test framework.** `pnpm test` was a placeholder `echo` that exited 0, which meant anything treating it as a gate got a pass from a repository with no tests; it was removed in #91 along with `pnpm export`, so both now fail loudly as unknown commands. Don't add a `test` script back without a suite behind it.

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

Posts live in `content/blog/{slug}/index.md`, one directory per post, with images alongside them and referenced relatively (`![alt](./diagram.png)`). Frontmatter carries `title` and `date`.

`src/lib/posts.ts` is the single entry point for post data. It reads the directory with `fs`, parses frontmatter with `gray-matter`, and converts the body to HTML at build time through `remark` → `remark-rehype` → `rehype-highlight` → `rehype-stringify`.

That chain replaced a single `remark-html` call in #103: `remark-html` goes straight to HTML and leaves nowhere to hook a highlighter in. Highlighting happens during the build, so the pages ship coloured markup and no client-side JavaScript — `highlight.js` never reaches the browser, only its theme CSS (imported in `src/app/layout.tsx`, before `globals.css` so the overrides there win). `rehype-highlight` *replaces* its language registry when `languages` is passed, so `posts.ts` spreads lowlight's `common` set rather than handing it a bare object. `detect: false` means a fence with no language is left alone instead of guessed at. Markdown is deliberately *not* in `pageExtensions` — `.md` files are data read by that module, never routes. The resulting `contentHtml` is injected with `dangerouslySetInnerHTML` in `src/app/posts/[slug]/page.tsx`, which carries a `biome-ignore` justifying it (the input is this repository's own Markdown).

Site-wide constants live in `src/data/site.json`. `src/data/static.ts` re-exports them as named exports for the app (`src/lib/metadata.ts` and the components), and `scripts/generate-rss.mjs` imports the same JSON. Edit the JSON, not the re-exports — it is the single source shared across both sides.

The listing summary, the meta description and the RSS item description all come from one place too: `toExcerpt` in `src/lib/excerpt.mjs`. It parses the Markdown and flattens it to text rather than slicing the source, which is what used to leak link syntax and code fences into all three (#112). It is plain `.mjs` on purpose — TypeScript for the app, importable from the RSS script, which is why that script is ESM.

### OGP cards

A URL written on a line of its own becomes an Open Graph card; a URL inside a sentence stays an inline link. `remark-gfm` is what turns a bare URL into a link node at all — without it they rendered as plain text, not even clickable (#117).

`src/lib/rehype-ogp-card.mjs` does the replacement and **reads `src/data/ogp.json` only** — the build never touches the network. A URL with no cache entry is left as an ordinary link, so an unrefreshed cache costs presentation, never a red build.

`pnpm ogp` refreshes that cache: it walks `content/blog/`, fetches the URLs it does not already have, downloads their OG images into `public/ogp/`, drops entries and images no article references any more, and writes the result. Run it after adding a link, from somewhere with network access, and commit both the JSON and the images. `--all` re-fetches everything rather than only the missing entries.

Deliberately not part of `pnpm build`: CI and Netlify build from clean checkouts, so a build-time fetch would put every deploy at the mercy of every host an article links to.

### Static assets

`public/` is the served static directory and **is tracked in git** — it holds `robots.txt` and `twitter-card.png` (the OG image `src/lib/metadata.ts` points every page at). `next build` copies it to the export root, so those files answer at `/robots.txt` and `/twitter-card.png`.

The favicon is `src/app/favicon.ico`, using the App Router file convention rather than `public/`: that is what emits the `<link rel="icon">` tag into the HTML, and it adds one route to the static page count.

Until #95 these lived in a root `static/` directory and in `content/assets/`, neither of which Next.js serves from — they reached `out/static/` and nowhere respectively, so `/robots.txt`, `/favicon.ico`, and the OG image were all 404. Both directories are gone now; don't reintroduce them. Anything that should answer at a URL belongs in `public/`.

### Post-build scripts

`pnpm build` is `next build`, then two Node scripts that write into `out/` — the export directory Netlify deploys. Both throw if `out/` is absent rather than writing somewhere that never ships, so run them only after a build.

`scripts/copy-post-assets.js` copies everything except `index.md` from `content/blog/{slug}/` into `out/posts/{slug}/`. `content/` is read as data and is never copied by Next.js, so without this the relative image references in articles resolve to nothing — which was #97, and left every article image 404. `trailingSlash` puts each article at `/posts/{slug}/`, so its images belong next to its `index.html`. The rule is deliberately "every file but the Markdown", which also copies assets no article currently references.

`scripts/generate-rss.mjs` writes `out/rss.xml`.

### RSS generation

The feed goes directly into the export directory, not into `public/`.

That ordering is load-bearing, so don't "tidy" it by moving the write to `public/`: `next build` copies `public/` into `out/` before the script runs, so a feed written there would reach `out/` only on a later rebuild that happened to find the previous run's file. This was a real bug (#89) — clean checkouts, which is what CI and Netlify build from, shipped no feed at all. The script now throws if `out/` is absent rather than silently writing somewhere that never gets deployed.

One duplication remains in the same area: `scripts/generate-rss.mjs` re-implements the post reading that `src/lib/posts.ts` already does — its own `readdirSync` walk, `gray-matter` parse and sort. The excerpt is no longer among them, since both call `toExcerpt`, but the walk itself must still be kept in agreement by hand. Closing it properly needs a TypeScript-aware runner so the script can import `posts.ts` directly.

### Pagination

`getPaginatedPosts(page, postsPerPage)` in `src/lib/posts.ts` backs the home page (`src/app/page.tsx`) and `src/app/page/[page]/page.tsx`, which pre-renders pages 2..N via `generateStaticParams`.

The page size lives in one place, `POSTS_PER_PAGE` in `src/lib/posts.ts`, and reaches the callers as the parameter's default — so call it as `getPaginatedPosts(page)` and don't pass a size. `generateStaticParams` decides *which* `/page/N` routes exist while the page component decides *which posts* each one slices out; if those two ever disagree the build still succeeds, and the damage shows up only as missing or blank pagination pages.

### Styling

**Tailwind CSS 4** with `@tailwindcss/typography`, configured in CSS rather than a JS config: `src/app/globals.css` opens with `@import "tailwindcss"` and `@plugin "@tailwindcss/typography"`, and `postcss.config.mjs` wires up `@tailwindcss/postcss`.

Three things about this setup are easy to get wrong:

- **Everything after those two directives is deliberately unlayered.** Tailwind's own output sits in `@layer base/components/utilities`, and unlayered CSS beats layered CSS regardless of specificity — that is what lets the rules in this file override preflight and prose. Don't wrap them in `@layer`.
- **Preflight resets more than it looks like.** Heading sizes, paragraph margins and list styling are all stripped site-wide. `prose` restores them inside the article, but the header, the listing and anything else outside it need the defaults written back — which is what the `p`, `ul, ol` and `h1`–`h6` rules in `globals.css` are for. Removing them silently flattens the home page.
- **`prose` is applied through `@apply` in `globals.css`, not a `className`.** The article `<div>` carries a lint suppression for `dangerouslySetInnerHTML`, and a suppression only covers the line directly after it — adding classes to the JSX wraps the attributes and breaks it.

Where prose and the existing styling disagree, prefer prose's own customisation hooks over specificity fights: the code block colours come from `--tw-prose-pre-bg` / `--tw-prose-pre-code` set on `.article-body`, because `prose` targets `:where(pre)` and would otherwise outrank a bare `pre` rule.

Component styling is still a mix: `src/components/` and the page files carry inline `style={{}}` objects that predate Tailwind. Migrating them is tracked separately — until then, expect both.

### Tooling

**Biome** (`biome.json`) is the sole toolchain for linting, formatting, and import sorting; it replaced ESLint + Prettier. Three configuration choices matter:

- `vcs.useIgnoreFile` is on, so `.gitignore` drives exclusions
- `content/` is excluded, so authored posts are never reformatted
- `css.parser.tailwindDirectives` is on, without which `@plugin` and `@apply` fail to parse

Note Biome reads the literal string `biome-ignore` inside CSS comments as a suppression directive and errors on it, so don't mention the mechanism by name in a stylesheet comment.

Formatting follows the previous Prettier conventions: single quotes, no semicolons, 2-space indent, `es5` trailing commas.

Because `eslint-config-next` was removed, **the Next.js-specific rules (`@next/next/*`) and the React Hooks rules are not enforced** — Biome does not implement them. Nothing checks for `exhaustive-deps` violations or `no-img-element`.

**Imports are relative everywhere, and `tsconfig.json` no longer declares path aliases.** They were configured but unused, and #93 removed them rather than adopting them: `scripts/*.mjs` are run by Node directly, so `@/…` cannot resolve there, and the `.mjs` modules under `src/lib/` are imported from both sides. Aliases could therefore only ever cover part of the tree, with an invisible boundary — an alias added to `src/lib/excerpt.mjs` would pass lint and `tsc` and break `pnpm build` at the RSS step. One convention avoids that.

### CI

`.github/workflows/ci.yml` runs `pnpm lint` then `pnpm build` on Node 22 for every push and pull request. `.github/workflows/label.yml` auto-labels new issues by keyword — an issue whose title or body contains "post" gets `Post Idea`, and "feature" gets `feature request`.
