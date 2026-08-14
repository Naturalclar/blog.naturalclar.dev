import { format } from 'date-fns'

type Props = {
  date: string
}

/**
 * A post's date, as a `<time>` so it is machine-readable.
 *
 * The listing and the article page both showed a formatted string and nothing
 * else, so nothing on the page said "this is a date" — feed readers and search
 * engines had to guess from the text, which is exactly the part that changes
 * if the format ever does.
 *
 * Renders the element only, with no styling of its own: the listing wraps it
 * in `<small>` and the article page in a `<p>`, and those stay the callers'
 * business. What is shared is the format string and the `dateTime` value,
 * which were the two things that could drift apart between the two.
 *
 * `post.date` is the ISO 8601 string straight out of the frontmatter
 * (`2024-01-06T01:44:03.725Z`), which is already a valid `datetime`.
 */
const PostDate: React.FC<Props> = ({ date }) =>
  date ? (
    <time dateTime={date}>{format(new Date(date), 'MMMM dd, yyyy')}</time>
  ) : null

export default PostDate
