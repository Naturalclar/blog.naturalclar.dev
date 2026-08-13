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

This will prompt you for a title and generate a new post directory in `content/blog/` with the proper frontmatter structure.

### Manual Post Creation

Alternatively, create posts manually:

1. Create a new folder in `content/blog/` with your post title (kebab-case)
2. Add an `index.md` file with frontmatter:

```markdown
---
title: 'Your Post Title'
date: '2024-01-01T00:00:00.000Z'
---

Your content here...
```

## 🛠️ Code Quality

```bash
# Lint code
pnpm lint

# Format code
pnpm format
```

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
