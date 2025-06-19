# naturalclar.dev

[![Netlify Status](https://api.netlify.com/api/v1/badges/4eeb8f5b-187b-4276-8175-2756306151bd/deploy-status)](https://app.netlify.com/sites/blissful-goldwasser-9f3e3a/deploys)

A personal tech blog built with Gatsby, focusing on React Native, TypeScript, and modern web development.

## 🚀 Quick Start

### Prerequisites
- Node.js 20.10.0 (managed via Volta)
- pnpm (package manager)

### Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Clean cache
pnpm clean
```

Visit `http://localhost:8000` to view the site locally.

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

- **Gatsby** - Static site generator
- **TypeScript** - Type safety
- **MDX** - Enhanced markdown with React components
- **ESLint + Prettier** - Code quality and formatting
- **Netlify** - Hosting and deployment

## 📝 License

MIT - See [LICENSE](LICENSE) file for details.
