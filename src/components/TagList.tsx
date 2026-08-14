import Link from 'next/link'

type Props = {
  tags: string[]
}

/**
 * A post's tags, as links to the tag page.
 *
 * Deliberately not pills or chips: the site is plain text on white, and a row
 * of coloured badges would be the loudest thing on the listing. A `#` prefix
 * and a muted colour is enough to read as metadata rather than prose.
 */
const TagList: React.FC<Props> = ({ tags }) =>
  tags.length > 0 ? (
    <ul className="tag-list">
      {tags.map((tag) => (
        <li key={tag}>
          {/* `#${tag}` as one expression, not `#{tag}`: two adjacent children
              make React emit a `<!-- -->` separator between the text nodes. */}
          <Link href={`/tags/${tag}/`}>{`#${tag}`}</Link>
        </li>
      ))}
    </ul>
  ) : null

export default TagList
