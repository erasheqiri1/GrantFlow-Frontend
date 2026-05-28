export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const pages = []
  const delta = 2
  const left  = Math.max(1, page - delta)
  const right = Math.min(totalPages, page + delta)

  if (left > 1) {
    pages.push(1)
    if (left > 2) pages.push('...')
  }
  for (let i = left; i <= right; i++) pages.push(i)
  if (right < totalPages) {
    if (right < totalPages - 1) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-1.5 rounded-lg text-sm font-semibold transition disabled:opacity-30"
        style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }}>
        ‹
      </button>

      {pages.map((p, i) =>
        p === '...'
          ? <span key={`ellipsis-${i}`} className="px-2 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>…</span>
          : <button
              key={p}
              onClick={() => onPageChange(p)}
              className="w-8 h-8 rounded-lg text-sm font-bold transition"
              style={{
                background: p === page ? '#00e676' : 'rgba(255,255,255,0.06)',
                color:      p === page ? '#0a0d14' : 'rgba(255,255,255,0.7)',
              }}>
              {p}
            </button>
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-1.5 rounded-lg text-sm font-semibold transition disabled:opacity-30"
        style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }}>
        ›
      </button>
    </div>
  )
}
