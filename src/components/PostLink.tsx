import Link from 'next/link'
import { postPath } from '../lib/routes.mjs'

type Props = {
  slug: string
  rel?: string
  children: React.ReactNode
}

/**
 * A link to an article, at the URL the site actually serves.
 *
 * `trailingSlash: true` puts every article at `/posts/{slug}/`, and that is
 * what its own canonical, its `og:url` and its sitemap entry say. Next
 * normally keeps `<Link href>` in step by appending the slash for you — but
 * `normalizePathTrailingSlash` skips a path whose last segment contains a dot,
 * reading it as a filename, and *removes* the slash instead. Two slugs here
 * contain one: `whats-new-in-react-native-0.62` and
 * `whats-coming-up-in-react-native-0.63`. Writing the slash out by hand does
 * not help; it is stripped back off (#192).
 *
 * So those two get a plain `<a>`, which is not normalized at all. That reads
 * like a downgrade and isn't: a `<Link>` to the slashless URL already cost a
 * full page load, because the host answers it with a 301 to the slashed one
 * and the browser follows it as a document navigation. The `<a>` lands on the
 * same page one round trip earlier, and the href in the HTML now agrees with
 * the canonical a crawler reads on arrival.
 *
 * The dot check is deliberately on the slug rather than a hardcoded list of
 * the two: a third dotted slug is one `pnpm new` away, and would otherwise
 * reintroduce this silently.
 */
export default function PostLink({ slug, rel, children }: Props) {
  const href = postPath(slug)

  if (slug.includes('.')) {
    return (
      <a href={href} rel={rel}>
        {children}
      </a>
    )
  }

  return (
    <Link href={href} rel={rel}>
      {children}
    </Link>
  )
}
