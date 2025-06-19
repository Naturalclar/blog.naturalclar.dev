# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `pnpm dev` or `pnpm develop` - Start the Gatsby development server
- `pnpm build` - Build the static site for production
- `pnpm clean` - Clean the Gatsby cache and public directory
- `pnpm start` - Alias for `pnpm develop`

### Code Quality
- `pnpm lint` - Run ESLint on JavaScript/TypeScript files
- `pnpm format` - Format code using Prettier

### Content Generation
- `pnpm new` - Generate new blog post using scaffdog (prompts for title)

## Architecture

This is a Gatsby-based static blog site with the following key architectural components:

### Content Structure
- Blog posts are written in Markdown/MDX format in `content/blog/`
- Each blog post lives in its own directory with an `index.md` file
- Assets (images) are stored alongside posts or in `content/assets/`
- Posts support frontmatter with `title` and `date` fields

### Gatsby Configuration
- **MDX Integration**: Posts are processed using `gatsby-plugin-mdx` with support for `.md` and `.mdx` files
- **Image Processing**: Uses `gatsby-plugin-sharp` and `gatsby-remark-images` for optimized image handling
- **RSS Feed**: Automatically generated at `/rss.xml` via `gatsby-plugin-feed`
- **PWA Features**: Includes offline support and web app manifest
- **Analytics**: Google Analytics integration (tracking ID: UA-92016705-3)

### TypeScript Setup
- TypeScript is enabled with `gatsby-plugin-typescript`
- JSX compilation set to "react" mode
- Strict type checking enabled
- ESLint configured with TypeScript parser and React plugin

### Page Generation
- Blog post pages are dynamically created in `gatsby-node.js`
- Each post gets a slug based on its directory name
- Posts include previous/next navigation context
- Template located at `src/templates/blog-post.js`

### Component Structure
- `src/components/Layout.tsx` - Main layout wrapper with header and footer
- `src/components/Bio.tsx` - Author bio component
- `src/components/seo.tsx` - SEO metadata component
- Components use inline styles rather than CSS modules

### Content Generation Workflow
- Use `pnpm new` to scaffold new blog posts via scaffdog
- Posts are created in `content/blog/{title}/index.md` format
- Scaffdog template automatically adds current timestamp and title frontmatter

### Deployment
- Site deploys to Netlify (status badge indicates deploy status)
- Production URL: https://blog.naturalclar.dev
- Node.js version pinned to 20.10.0 via Volta

## Package Manager
This project uses pnpm. Always use `pnpm` commands instead of `npm` or `yarn`.