# naturalclar.dev

[![CI](https://github.com/Naturalclar/blog.naturalclar.dev/actions/workflows/ci.yml/badge.svg)](https://github.com/Naturalclar/blog.naturalclar.dev/actions/workflows/ci.yml)

A personal tech blog built with Next.js, focusing on React Native, TypeScript, and modern web development.

## 🚀 Quick Start

### Prerequisites
- Node.js 22.0.0 (managed via Volta)
- pnpm 9.15.2 (package manager, defined via packageManager field)

### Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production (creates static export in out/ directory)
pnpm build

# Serve the built site from out/ to preview it
pnpm start
```

Visit `http://localhost:3000` to view the site, both for `pnpm dev` and for `pnpm start`.

There is no production server: the build is a fully static export, so `pnpm start` serves the files in `out/` rather than running Next.js.

## ✍️ Writing Posts

Create new blog posts using scaffdog:

```bash
pnpm new
```

It asks for three things — a slug, a title, and one or more tags — and writes `content/blog/{slug}/index.md` with the frontmatter already filled in.

The slug and the title are separate questions on purpose: the slug becomes the directory name and the URL, so it is English kebab-case, while the title is what readers see and is usually Japanese.

### Manual Post Creation

Alternatively, create posts manually:

1. Create a new folder in `content/blog/` named after the slug you want in the URL (English kebab-case)
2. Add an `index.md` file with frontmatter:

```markdown
---
title: 'Your Post Title'
date: '2024-01-01T00:00:00.000Z'
tags: ['tooling']
---

Your content here...
```

`tags` is required, and every tag has to be one of those listed in `src/data/tags.json`. A post with no tags, or with a tag outside that list, fails the build with a message naming the vocabulary — a post that is not on any tag page is a post nobody can find, so this is checked rather than assumed.

`outdated: true` is the one optional field: it puts a notice above the article saying the advice may have aged. It is set per article, never derived from the date.

## 🛠️ Code Quality

```bash
# Lint code
pnpm lint

# Lint the Japanese prose in content/
pnpm lint:text

# Format code
pnpm format
```

CI runs `pnpm lint` and `pnpm lint:text`, so both have to pass before a branch is mergeable. They are separate commands because they cover disjoint trees: Biome excludes `content/`, and textlint reads nothing else.

## 🏗️ Built With

- **Next.js** - React framework with static site generation
- **TypeScript** - Type safety
- **remark** - Markdown parsed and rendered to HTML at build time
- **Biome** - Linting, formatting, and import sorting
- **gray-matter** - Frontmatter parsing
- **Feed** - RSS feed generation
- **GitHub Pages** - Hosting and deployment

## 📝 License

MIT - See [LICENSE](LICENSE) file for details.
