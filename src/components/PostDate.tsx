type Props = {
  date: string
}

/**
 * The publication date, formatted as the author's calendar day in Tokyo.
 *
 * **The timezone is the point.** The frontmatter records an instant, and
 * formatting it wherever the build happens to run — UTC on the Actions runner
 * — showed 7 of the 25 posts a day early: `2019-08-28T18:00:00.000Z` is
 * 2019年8月29日 in Tokyo but 8月28日 in UTC. A publication date is a calendar
 * day in the author's locale, not an instant rendered wherever CI stands.
 *
 * `Intl.DateTimeFormat` rather than date-fns because it takes a timeZone
 * without a plugin, and `ja-JP` with a long month is already 年月日 — so this
 * is one fewer dependency rather than one more.
 *
 * Built once at module scope: a formatter is expensive to construct and every
 * post on the listing wants the same one.
 */
const formatter = new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'Asia/Tokyo',
})

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
 * business. What is shared is the format and the `dateTime` value, which were
 * the two things that could drift apart between the two.
 *
 * `dateTime` gets the ISO 8601 string straight out of the frontmatter, so the
 * machine-readable value stays the instant while the display is the local day.
 */
const PostDate: React.FC<Props> = ({ date }) =>
  date ? <time dateTime={date}>{formatter.format(new Date(date))}</time> : null

export default PostDate
