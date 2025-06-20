import React from 'react'
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
            href={currentPage === 2 ? '/' : `/page/${currentPage - 1}`}
            style={{
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          >
            ← Previous
          </Link>
        ) : (
          <span
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              color: '#ccc',
            }}
          >
            ← Previous
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Link
            key={page}
            href={page === 1 ? '/' : `/page/${page}`}
            style={{
              textDecoration: 'none',
              padding: '0.5rem 0.75rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: page === currentPage ? '#007acc' : 'transparent',
              color: page === currentPage ? 'white' : 'inherit',
            }}
          >
            {page}
          </Link>
        ))}
      </div>

      <div>
        {hasNextPage ? (
          <Link
            href={`/page/${currentPage + 1}`}
            style={{
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          >
            Next →
          </Link>
        ) : (
          <span
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              color: '#ccc',
            }}
          >
            Next →
          </span>
        )}
      </div>
    </nav>
  )
}