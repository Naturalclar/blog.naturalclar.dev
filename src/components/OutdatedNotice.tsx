type Props = {
  date: string
}

/**
 * The year the post was written, in Tokyo — the same reasoning as PostDate:
 * the year belongs to the author's calendar, not the build's timezone.
 */
const year = new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric',
  timeZone: 'Asia/Tokyo',
})

/**
 * Shown above an article whose frontmatter says `outdated: true`.
 *
 * Set per article rather than by age. A rule like "older than N years" would
 * be wrong in both directions here: you-might-not-need-thunk and
 * typescript-allowing-unused-param are 2019 posts whose advice still holds,
 * while whats-new-in-react-native-0.62 recommends an API that no longer
 * exists. Only the author knows which is which.
 *
 * Rendered outside `.article-body` so `prose` does not style it — a callout
 * inside the article would inherit typography's paragraph and link rules.
 */
const OutdatedNotice: React.FC<Props> = ({ date }) =>
  date ? (
    // One template literal rather than text around {year.format(...)}: adjacent
    // children make React emit `<!-- -->` separators between the text nodes.
    <p className="outdated-notice">
      {`この記事は${year.format(new Date(date))}に書かれたものです。当時の情報にもとづいているため、現在は状況が変わっている可能性があります。`}
    </p>
  ) : null

export default OutdatedNotice
