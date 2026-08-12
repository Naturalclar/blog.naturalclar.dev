// Values live in site.json so that scripts/generate-rss.js, which is plain
// CommonJS and cannot import TypeScript, reads the same source.
import site from './site.json'

export const author = site.author
export const authorEmail = site.authorEmail
export const social = site.social
export const siteDescription = site.siteDescription
export const siteTitle = site.siteTitle
export const siteUrl = site.siteUrl
