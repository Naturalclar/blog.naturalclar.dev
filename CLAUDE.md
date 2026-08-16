# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Always use `pnpm` — the version is pinned to 9.15.2 via the `packageManager` field, and Node 22.0.0 via Volta.

- `pnpm dev` — dev server on port 3000
- `pnpm build` — static export into `out/`, then copies article assets and writes `out/rss.xml`
- `pnpm lint` — `biome check`: lint, format check, and import order in one pass
- `pnpm lint:text` — textlint over the articles. Separate from `pnpm lint` because the two cover disjoint trees: Biome excludes `content/`, textlint reads nothing else. Both run in CI
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

A Next.js App Router blog that builds to a fully static export and deploys to GitHub Pages at https://blog.naturalclar.dev. There is no server at runtime: no middleware, no Server Actions, no route handlers, no rewrites, and `images.unoptimized` is set. Anything requiring a Next.js server will not work here.

### Content pipeline

Posts live in `content/blog/{slug}/index.md`, one directory per post, with images alongside them and referenced relatively (`![alt](./diagram.png)`). Frontmatter carries `title`, `date`, `tags` (see below) and an optional `outdated` flag.

`src/lib/posts.ts` is the single entry point for post data. It reads the directory with `fs`, parses frontmatter with `gray-matter`, and converts the body to HTML at build time through `remark` → `remark-rehype` → `rehype-highlight` → `rehype-code-title` → `rehype-ogp-card` → `rehype-stringify`.

That chain replaced a single `remark-html` call in #103: `remark-html` goes straight to HTML and leaves nowhere to hook a highlighter in. Highlighting happens during the build, so the pages ship coloured markup and no client-side JavaScript — `highlight.js` never reaches the browser, only its theme CSS (imported in `src/app/layout.tsx`, before `globals.css` so the overrides there win). `rehype-highlight` *replaces* its language registry when `languages` is passed, so `posts.ts` spreads lowlight's `common` set rather than handing it a bare object. `detect: false` means a fence with no language is left alone instead of guessed at.

A fence can also name a file — ```` ```js fooReducer.ts ```` — and `src/lib/rehype-code-title.mjs` renders that as a caption above the block. The words after the language are the info string's *meta*, which `rehype-highlight` ignores; `mdast-util-to-hast` does carry them through as `code.data.meta`, which is what the plugin reads, so it has to run after `remark-rehype`. The syntax is inherited from `gatsby-remark-code-titles` and produced nothing at all between the move off Gatsby and #122. Two forms are treated as saying nothing and produce no caption: `subtitle='…'` is unwrapped to its quoted text, and a meta equal to the language (```` ```sh sh ````) is dropped. Markdown is deliberately *not* in `pageExtensions` — `.md` files are data read by that module, never routes. The resulting `contentHtml` is injected with `dangerouslySetInnerHTML` in `src/app/posts/[slug]/page.tsx`, which carries a `biome-ignore` justifying it (the input is this repository's own Markdown).

Site-wide constants live in `src/data/site.json`. `src/data/static.ts` re-exports them as named exports for the app (`src/lib/metadata.ts` and the components), and `scripts/generate-rss.mjs` imports the same JSON. Edit the JSON, not the re-exports — it is the single source shared across both sides.

The listing summary, the meta description and the RSS item description all come from one place too: `toExcerpt` in `src/lib/excerpt.mjs`. It parses the Markdown and flattens it to text rather than slicing the source, which is what used to leak link syntax and code fences into all three (#112). It is plain `.mjs` on purpose — TypeScript for the app, importable from the RSS script, which is why that script is ESM.

### OGP cards

A URL written on a line of its own becomes an Open Graph card; a URL inside a sentence stays an inline link. `remark-gfm` is what turns a bare URL into a link node at all — without it they rendered as plain text, not even clickable (#117).

`src/lib/rehype-ogp-card.mjs` does the replacement and **reads `src/data/ogp.json` only** — the build never touches the network. A URL with no cache entry is left as an ordinary link, so an unrefreshed cache costs presentation, never a red build.

`pnpm ogp` refreshes that cache: it walks `content/blog/`, fetches the URLs it does not already have, downloads their OG images into `public/ogp/`, drops entries and images no article references any more, and writes the result. `--all` re-fetches everything rather than only the missing entries — which is what you need to fill in an entry cached without its `image`, since a plain run skips any URL already present.

**You normally do not run it by hand.** `.github/workflows/ogp.yml` runs it and opens a pull request with the result: automatically when a push to `master` touches `content/**`, and on demand through *Run workflow*, which takes an `all` checkbox for the `--all` behaviour. Running it locally still works and is the fastest way to check one link.

Deliberately not part of `pnpm build`: the deploy builds from a clean checkout, so a build-time fetch would put every deploy at the mercy of every host an article links to. The workflow is the opposite arrangement — the fetch happens on its own schedule and lands as a reviewable commit, and the build only ever reads what is committed.

### Link checking

The archive spans 2019 onward and a lot of what it points at has moved or gone away. `pnpm links` (`scripts/check-links.mjs`) walks `content/blog/` and reports what has rotted, in five buckets that are deliberately not collapsed into pass/fail:

- **broken** — 4xx/5xx. The page is gone.
- **unreachable** — DNS, TLS or timeout. The *host* could not be reached, which is not the same claim; conflating the two makes the checker cry wolf on every blip.
- **moved** — reached, but the final URL after redirects differs. Still works for a reader, so it does not fail the run.
- **refused** — 401/403/429. The host turned the checker away, not the page. GitHub does this readily.
- **ok**

Only *broken* and *unreachable* set a non-zero exit. `--host=` narrows a run to one hostname, `--timeout=` and `--concurrency=` are for the fixture tests.

It walks `link`, `image` **and `definition`** nodes: a reference-style link keeps its URL in the definition at the foot of the article and nowhere else, and `2019-overview` writes its links that way — a walk over `link` alone silently misses them.

Article-to-article links are checked too, against the filesystem rather than the network. They used to be written as absolute `https://blog.naturalclar.dev/{slug}/` URLs, and two of them survived the move off Gatsby still pointing at a URL shape this site no longer serves — the first Link check run caught both as 404s. They are relative now (`/posts/{slug}/`), which cannot rot the same way, but relative links need no fetching and so would have dropped out of the run entirely; `checkInternal` verifies the slug exists instead, and a typo fails like a dead host. Only `/posts/` is verified — `/page/N/` and `/tags/x/` are generated from data the script would have to duplicate, and no article links to one. Requests are HEAD first, falling back to GET on 403/405/501, because plenty of servers refuse HEAD without meaning the page is gone; 429 is retried honouring `Retry-After`, the same as the OGP fetcher.

`.github/workflows/links.yml` is where it actually runs — on demand, and monthly. **Not in `ci.yml`**, for the same reason `pnpm ogp` is not in `pnpm build`: `ci.yml` deploys, and a link check there would let any third-party host redden a deploy. Nothing about link rot should be able to block a merge.

Results from a sandboxed environment are not evidence. A proxy that denies CONNECT shows up as 55 *unreachable* and a gateway that blocks `github.com` shows up as 55 *refused* — neither says anything about the archive. Trust the workflow run, not a local one.

Fixing what it finds is a separate judgement call: rewriting an old article to chase link rot is not obviously right for a dated archive. The checker exists to make the damage visible, not to decide that.

### Static assets

`public/` is the served static directory and **is tracked in git** — it holds `robots.txt` and `twitter-card.png` (the OG image `src/lib/metadata.ts` points every page at). `next build` copies it to the export root, so those files answer at `/robots.txt` and `/twitter-card.png`.

Two files there exist for the host rather than for readers, and both have to be in `public/` rather than the repository root, because the Pages artifact is `out/` and only `public/` is copied into it:

- `CNAME` holds `blog.naturalclar.dev`. It is what keeps the custom domain attached — a deploy whose artifact lacks it can clear the setting.
- `.nojekyll` is insurance. Pages deployed through Actions is served as-is with no Jekyll step, so it changes nothing today; it matters only if the Pages source is ever switched back to a branch, where Jekyll would drop `_next/` for its leading underscore and take every stylesheet and script with it. `next build` does copy dotfiles, which was worth checking rather than assuming.

The favicon is `src/app/favicon.ico`, using the App Router file convention rather than `public/`: that is what emits the `<link rel="icon">` tag into the HTML, and it adds one route to the static page count.

Until #95 these lived in a root `static/` directory and in `content/assets/`, neither of which Next.js serves from — they reached `out/static/` and nowhere respectively, so `/robots.txt`, `/favicon.ico`, and the OG image were all 404. Both directories are gone now; don't reintroduce them. Anything that should answer at a URL belongs in `public/`.

### Post-build scripts

`pnpm build` is `next build`, then two Node scripts that write into `out/` — the export directory that gets uploaded as the Pages artifact. Both throw if `out/` is absent rather than writing somewhere that never ships, so run them only after a build.

`scripts/copy-post-assets.js` copies everything except `index.md` from `content/blog/{slug}/` into `out/posts/{slug}/`. `content/` is read as data and is never copied by Next.js, so without this the relative image references in articles resolve to nothing — which was #97, and left every article image 404. `trailingSlash` puts each article at `/posts/{slug}/`, so its images belong next to its `index.html`. The rule is deliberately "every file but the Markdown", which also copies assets no article currently references.

`scripts/generate-rss.mjs` writes `out/rss.xml`.

### RSS generation

The feed goes directly into the export directory, not into `public/`.

That ordering is load-bearing, so don't "tidy" it by moving the write to `public/`: `next build` copies `public/` into `out/` before the script runs, so a feed written there would reach `out/` only on a later rebuild that happened to find the previous run's file. This was a real bug (#89) — clean checkouts, which is what the deploy builds from, shipped no feed at all. The script now throws if `out/` is absent rather than silently writing somewhere that never gets deployed.

One duplication remains in the same area: `scripts/generate-rss.mjs` re-implements the post reading that `src/lib/posts.ts` already does — its own `readdirSync` walk, `gray-matter` parse and sort. The excerpt is no longer among them, since both call `toExcerpt`, but the walk itself must still be kept in agreement by hand. Closing it properly needs a TypeScript-aware runner so the script can import `posts.ts` directly.

### Pagination

`getPaginatedPosts(page, postsPerPage)` in `src/lib/posts.ts` backs the home page (`src/app/page.tsx`) and `src/app/page/[page]/page.tsx`, which pre-renders pages 2..N via `generateStaticParams`.

Both pages hand the result to `src/components/PostList.tsx` and render nothing of the listing themselves. They used to hold a full copy each — entry markup and the `Pagination` block — so a change to either had to be made twice, and a change made once looked correct until someone paged forward. Anything that touches how a post is listed belongs in that component.

The page size lives in one place, `POSTS_PER_PAGE` in `src/lib/posts.ts`, and reaches the callers as the parameter's default — so call it as `getPaginatedPosts(page)` and don't pass a size. `generateStaticParams` decides *which* `/page/N` routes exist while the page component decides *which posts* each one slices out; if those two ever disagree the build still succeeds, and the damage shows up only as missing or blank pagination pages.

### Tags

Frontmatter carries `tags: ['react-native', 'typescript']`, and **`src/data/tags.json` is the vocabulary** — `readTags` in `src/lib/posts.ts` throws on anything not in that list. That is deliberate: a typo would otherwise pre-render its own `/tags/react-nativ/` page holding one post, and nothing would look broken from any page that already existed. Adding a tag means adding it to the JSON first.

`getAllTags()` returns only tags at least one post carries, in the order the JSON lists them, and it is what `generateStaticParams` in `src/app/tags/[tag]/page.tsx` iterates — so an unused entry in the vocabulary costs nothing and produces no route.

`src/app/tags/page.tsx` is the index over those same tags, and it takes `getAllTags()`'s order as-is — the hand-ordered "most central first" of `tags.json`, which stays put as the archive grows, unlike sorting by count. It is linked from the footer in `src/components/Layout.tsx` rather than from the listing: the tag pages need a way in from outside a post, and the footer is the one place on every page that can offer it without competing with the articles. Until #157 there was no such link and `/tags/` itself 404ed, so a tag page was reachable only from an article and was a dead end once you got there.

**Tag pages are not paginated.** They hand `PostList` a single-page `PaginatedPosts` shape, and `Pagination` returns `null` when `totalPages <= 1`, so nothing renders. The largest tag holds 13 of 25 posts; splitting that would mean a second set of routes for no reader benefit. `getPaginatedPosts` is the piece to reach for if a tag ever outgrows it.

`scripts/generate-rss.mjs` reads `tags` straight from the frontmatter for its `<category>` elements rather than going through `posts.ts` — the same hand-kept duplication as the rest of that script.

### Dated articles

`outdated: true` in the frontmatter puts a notice above the article body, via `src/components/OutdatedNotice.tsx`. It is **set per article, never derived from the date**: `you-might-not-need-thunk` and `typescript-allowing-unused-param` are 2019 posts whose advice still holds, while `whats-new-in-react-native-0.62` recommends an API that no longer exists. An "older than N years" rule would be wrong in both directions.

Five articles carry it today — the React Native version write-ups and the Re-architecture piece, whose subject matter has since changed under them. The year in the notice comes from the post's own date, formatted in `Asia/Tokyo` for the same reason `PostDate` is.

The notice renders **outside `.article-body`** so `prose` does not reach it; a callout inside the article body would inherit typography's paragraph and link rules and need a `:where()` fight to undo them.

### Styling

**Tailwind CSS 4** with `@tailwindcss/typography`, configured in CSS rather than a JS config: `src/app/globals.css` opens with `@import "tailwindcss"` and `@plugin "@tailwindcss/typography"`, and `postcss.config.mjs` wires up `@tailwindcss/postcss`.

Three things about this setup are easy to get wrong:

- **Everything after those two directives is deliberately unlayered.** Tailwind's own output sits in `@layer base/components/utilities`, and unlayered CSS beats layered CSS regardless of specificity — that is what lets the rules in this file override preflight and prose. Don't wrap them in `@layer`.
- **Preflight resets more than it looks like.** Heading sizes, paragraph margins and list styling are all stripped site-wide. `prose` restores them inside the article, but the header, the listing and anything else outside it need the defaults written back — which is what the `p`, `ul, ol` and `h1`–`h6` rules in `globals.css` are for. Removing them silently flattens the home page.
- **`prose` is applied through `@apply` in `globals.css`, not a `className`.** The article `<div>` carries a lint suppression for `dangerouslySetInnerHTML`, and a suppression only covers the line directly after it — adding classes to the JSX wraps the attributes and breaks it.

Where prose and the existing styling disagree, prefer prose's own customisation hooks over specificity fights: the code block colours come from `--tw-prose-pre-bg` / `--tw-prose-pre-code` set on `.article-body`, because `prose` targets `:where(pre)` and would otherwise outrank a bare `pre` rule.

That outranking is why the `pre` rule's own `border-radius: 4px` and `padding: 1em` never take effect inside an article — a code block actually renders at prose's 6px and 1rem. The `.article-body .code-block*` rules that style a captioned block are written against those measured values, not against the `pre` rule above them. Check with the browser, not the stylesheet, before matching one to the other.

Component styling is still a mix: `src/components/` and the page files carry inline `style={{}}` objects that predate Tailwind. Migrating them is tracked separately — until then, expect both.

### Tooling

**Biome** (`biome.json`) is the sole toolchain for linting, formatting, and import sorting; it replaced ESLint + Prettier. Three configuration choices matter:

- `vcs.useIgnoreFile` is on, so `.gitignore` drives exclusions
- `content/` is excluded, so authored posts are never reformatted
- `css.parser.tailwindDirectives` is on, without which `@plugin` and `@apply` fail to parse

Note Biome reads the literal string `biome-ignore` inside CSS comments as a suppression directive and errors on it, so don't mention the mechanism by name in a stylesheet comment.

Formatting follows the previous Prettier conventions: single quotes, no semicolons, 2-space indent, `es5` trailing commas.

Because `eslint-config-next` was removed, **the Next.js-specific rules (`@next/next/*`) and the React Hooks rules are not enforced** — Biome does not implement them. Nothing checks for `exhaustive-deps` violations or `no-img-element`.

**textlint** (`.textlintrc.json`) covers what Biome deliberately does not: the Japanese prose in `content/`. It runs as its own CI step, which is safe in `ci.yml` — unlike the link check — because it reads only this repository's Markdown and so is deterministic and offline.

`preset-ja-technical-writing` is installed but **most of it is switched off**, and the file lists every rule explicitly rather than relying on defaults, so turning one on is a deliberate edit. Only rules that catch *errors* are enabled — invisible characters, unmatched brackets, doubled words, ら抜き言葉, 誤用. The style half (`sentence-length`, `no-doubled-joshi`, `ja-no-redundant-expression`, `arabic-kanji-numbers`, …) is off: it reported 270 problems across 24 of the 25 articles, and rewriting how the author wrote in 2019 to satisfy a linter is not what this repository wants. A linter that fails on day one gets switched off on day two.

Two rules are configured against false positives that were measured, not guessed:

- `ja-no-successive-word` takes `allow: ["一つ"]`. It reads the idiom `一つ一つ` as a doubled word — three hits in `writing-native-module-in-swift` alone — and `arabic-kanji-numbers` (now off) used to rewrite it to `1つ一つ`.
- `no-mix-dearu-desumasu` is **off**. It hard-prefers ですます rather than following the document: it flagged `patching-with-pnpm` and `typescript-allowing-unused-param`, both written entirely in である, with a tally reading `である: 1, ですます: 0`. Enabling it would mean rewriting the voice of those articles.

**Imports are relative everywhere, and `tsconfig.json` no longer declares path aliases.** They were configured but unused, and #93 removed them rather than adopting them: `scripts/*.mjs` are run by Node directly, so `@/…` cannot resolve there, and the `.mjs` modules under `src/lib/` are imported from both sides. Aliases could therefore only ever cover part of the tree, with an invisible boundary — an alias added to `src/lib/excerpt.mjs` would pass lint and `tsc` and break `pnpm build` at the RSS step. One convention avoids that.

### CI

`.github/workflows/ci.yml` runs `pnpm lint`, `pnpm lint:text` and then `pnpm build` on Node 22 for every push and pull request, **and deploys**: on a push to `master` the same job uploads `out/` as the Pages artifact and a second job publishes it. Deploying from the job that built it means the export that ships is the one that was just linted and built, and the Node and pnpm versions are written down once.

The deploy job carries its own `pages: write` / `id-token: write`; the workflow default is `contents: read`, so a pull request build never holds deploy permissions. Its concurrency group does **not** cancel in progress — the site is replaced wholesale, so an interrupted deploy is a broken site.

The Pages source must stay on **GitHub Actions** (Settings → Pages). Switching it to a branch would both break this workflow and reintroduce Jekyll — see the static assets section.

**There are no deploy previews.** A pull request is checked by `ci.yml` alone; nothing renders the result before merge. Netlify used to provide one, and that is the visible cost of #138.

`.github/workflows/links.yml` checks the archive's external links (see the Link checking section above). It is the one workflow that is *expected* to go red sometimes — a broken link is a report, not a build failure, and nothing downstream depends on it.

`.github/workflows/label.yml` auto-labels new issues by keyword — an issue whose title or body contains "post" gets `Post Idea`, and "feature" gets `feature request`.

### Dependabot

`.github/dependabot.yml` covers two ecosystems, `npm` and `github-actions`, both monthly. Monthly rather than weekly because there is no test suite: every update is reviewed by reading it and watching `pnpm lint && pnpm build` go green, and a weekly cadence turns that into a chore that gets skipped. Security updates ignore the schedule regardless.

Routine updates are **grouped into one pull request** per ecosystem. For npm the group is minor and patch only — majors are deliberately left out so each arrives alone and can be read alone, which is what you want when `next` 14→15 drags React 19 behind it, or when `tailwindcss` and `biome` move config formats. For actions the group takes majors too: they are nearly all first-party and an action major is usually a runner bump, so splitting them would mean four pull requests against one release note.

Dependabot does **not** touch the Node and pnpm pins — those live in `volta` and `packageManager`, and stay a manual decision. Its pull requests do get CI, unlike the OGP workflow's: they come from branches in this repository pushed by a different app, so `ci.yml` runs on both the push and the pull request.

`.github/workflows/ogp.yml` refreshes the OGP cache and opens a pull request (see the OGP section above). Two things about it are worth knowing before changing it:

- **It needs write permissions the repository does not grant by default.** Settings → Actions → General → Workflow permissions must be *Read and write*, with *Allow GitHub Actions to create and approve pull requests* ticked. Without them the run fails at the push or the `gh pr create`.
- **Its pull request gets no checks at all.** GitHub does not trigger workflows from events raised with `GITHUB_TOKEN`, so `ci.yml` never runs on it, and since the move off Netlify there is no deploy preview either. The run summary in the workflow's own log — which URLs were fetched, which failed — is the only evidence of what it did. Read it before merging.
