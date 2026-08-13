import Link from 'next/link'

interface PaginationProps {
  currentPage: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export default function Pagination({
  currentPage,
  totalPages,
  hasNextPage,
  hasPrevPage,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  return (
    <nav className="mt-8 flex items-center justify-between py-4">
      <div>
        {hasPrevPage ? (
          <Link
            className="pagination-link"
            href={currentPage === 2 ? '/' : `/page/${currentPage - 1}`}
          >
            ← Previous
          </Link>
        ) : (
          <span className="pagination-disabled">← Previous</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Link
            key={page}
            aria-current={page === currentPage ? 'page' : undefined}
            className={
              page === currentPage
                ? 'pagination-link pagination-number pagination-number-current'
                : 'pagination-link pagination-number'
            }
            href={page === 1 ? '/' : `/page/${page}`}
          >
            {page}
          </Link>
        ))}
      </div>

      <div>
        {hasNextPage ? (
          <Link className="pagination-link" href={`/page/${currentPage + 1}`}>
            Next →
          </Link>
        ) : (
          <span className="pagination-disabled">Next →</span>
        )}
      </div>
    </nav>
  )
}
