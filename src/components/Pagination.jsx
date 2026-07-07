export default function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null

  // Build page number list with ellipsis
  const pages = []
  const delta = 1 // pages around current

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= page - delta && i <= page + delta)
    ) {
      pages.push(i)
    } else if (
      pages[pages.length - 1] !== '...'
    ) {
      pages.push('...')
    }
  }

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        className="pg-btn"
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
      >
        ‹
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`e${i}`} className="pg-ellipsis">…</span>
        ) : (
          <button
            key={p}
            className={`pg-btn${p === page ? ' active' : ''}`}
            onClick={() => p !== page && onPage(p)}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        )
      )}

      <button
        className="pg-btn"
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
      >
        ›
      </button>
    </nav>
  )
}
