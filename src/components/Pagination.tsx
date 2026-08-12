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
    <nav
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '2rem',
        padding: '1rem 0',
      }}
    >
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

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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
