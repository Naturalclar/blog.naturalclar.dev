# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `pnpm dev` - Start the Next.js development server
- `pnpm build` - Build the static site for production and generate RSS feed
- `pnpm start` - Start the Next.js production server
- `pnpm export` - Export static files (deprecated in favor of static export config)

### Code Quality
- `pnpm lint` - Run ESLint on JavaScript/TypeScript files
- `pnpm format` - Format code using Prettier

### Content Generation
- `pnpm new` - Generate new blog post using scaffdog (prompts for title)

## Architecture

This is a Next.js-based static blog site with the following key architectural components:

### Content Structure
- Blog posts are written in Markdown/MDX format in `content/blog/`
- Each blog post lives in its own directory with an `index.md` file
- Assets (images) are stored alongside posts or in `content/assets/`
- Posts support frontmatter with `title` and `date` fields

### Next.js Configuration
- **MDX Integration**: Posts are processed using `@next/mdx` with support for `.md` and `.mdx` files
- **Static Site Generation**: Uses Next.js App Router with static export for build output
- **RSS Feed**: Generated via custom script (`scripts/generate-rss.js`) that runs after build
- **TypeScript**: Full TypeScript support with strict type checking
- **ESLint**: Configured with Next.js ESLint plugin

### Page Generation
- Blog post pages use Next.js App Router with dynamic routes at `src/app/posts/[slug]/page.tsx`
- Posts are processed using `gray-matter` for frontmatter parsing
- Static generation with `generateStaticParams` for all blog posts
- Posts are fetched from `content/blog/` directory structure

### Component Structure
- `src/app/layout.tsx` - Root layout with metadata and global styles
- `src/app/page.tsx` - Homepage with blog post listing
- `src/app/posts/[slug]/page.tsx` - Dynamic blog post pages
- `src/components/Layout.tsx` - Main layout wrapper with header and footer
- `src/components/Bio.tsx` - Author bio component
- `src/lib/posts.ts` - Blog post data fetching utilities
- `src/lib/metadata.ts` - SEO metadata utilities
- `src/lib/rss.ts` - RSS feed generation utilities

### Build Output
- **Development**: `pnpm dev` runs Next.js dev server on port 3000
- **Production Build**: `pnpm build` creates optimized static export in `out/` directory
- **Static Files**: Built site can be served from `out/` directory as static files

### Content Generation Workflow
- Use `pnpm new` to scaffold new blog posts via scaffdog
- Posts are created in `content/blog/{title}/index.md` format
- Scaffdog template automatically adds current timestamp and title frontmatter

### Deployment
- Site deploys to Netlify (status badge indicates deploy status)
- Production URL: https://blog.naturalclar.dev
- Node.js version pinned to 22.0.0 via Volta
- Package manager pinned to pnpm 9.15.2 via packageManager field

## Package Manager
This project uses pnpm. Always use `pnpm` commands instead of `npm` or `yarn`.
Specific version (9.15.2) is defined in package.json `packageManager` field for corepack.