
export default function Pagination({ page, total, size, onChange }) {
  const totalPages = Math.ceil(total / size) || 1
  if (totalPages <= 1) return null


  const buildPages = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    const nearby = new Set(
      [1, 2, page - 1, page, page + 1, totalPages - 1, totalPages].filter(
        p => p >= 1 && p <= totalPages
      )
    )
    const sorted = [...nearby].sort((a, b) => a - b)
    const result = []
    sorted.forEach((p, i) => {
      if (i > 0 && p - sorted[i - 1] > 1) result.push('…')
      result.push(p)
    })
    return result
  }

  const pages = buildPages()

  const btnBase = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    minWidth: 32, height: 32, padding: '0 10px',
    borderRadius: 8, fontSize: 13, fontWeight: 600,
    cursor: 'pointer', transition: 'all 0.15s', border: '1px solid',
  }

  const btnNormal = {
    ...btnBase,
    background: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.55)',
  }

  const btnActive = {
    ...btnBase,
    background: 'rgba(0,230,118,0.15)',
    borderColor: 'rgba(0,230,118,0.4)',
    color: '#00e676',
  }

  const btnDisabled = {
    ...btnBase,
    background: 'transparent',
    borderColor: 'rgba(255,255,255,0.06)',
    color: 'rgba(255,255,255,0.2)',
    cursor: 'not-allowed',
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 20 }}>
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        style={page <= 1 ? btnDisabled : btnNormal}
      >
        ← Para
      </button>

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`e${i}`} style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, padding: '0 4px' }}>…</span>
        ) : (
          <button
            key={p}
            onClick={() => p !== page && onChange(p)}
            style={p === page ? btnActive : btnNormal}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        style={page >= totalPages ? btnDisabled : btnNormal}
      >
        Tjetër →
      </button>
    </div>
  )
}
