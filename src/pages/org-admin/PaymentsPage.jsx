import { useState, useEffect, useCallback } from 'react'
import OrgHeader from '../../components/layout/OrgHeader'
import Pagination from '../../components/Pagination'
import api from '../../api/axios'

const PAYMENT_BADGE = {
  PENDING: { label: 'Në pritje', bg: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: 'rgba(251,191,36,0.3)' },
  PAID:    { label: 'Paguar',    bg: 'rgba(74,222,128,0.12)',  color: '#4ade80', border: 'rgba(74,222,128,0.3)' },
}

function fmtAmount(amount, currency = 'EUR') {
  if (amount == null) return '—'
  return `€${Number(amount).toLocaleString('sq-AL', { minimumFractionDigits: 2 })}`
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('sq-AL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}


function MarkPaidModal({ payment, onClose, onSuccess }) {
  const [note,    setNote]    = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleConfirm = async () => {
    setLoading(true)
    setError('')
    try {
      await api.patch(`/payments/application/${payment.application_id}`, {
        note: note.trim() || null,
      })
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.detail || 'Gabim gjatë shënimit të pagesës')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(4px)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        width: '100%',
        maxWidth: 440,
        overflow: 'hidden',
      }}>
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 className="text-base font-bold text-white">Konfirmo pagesën</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Transferi bankar u bë</p>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-sm"
            style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-1">
          {[
            ['Marrësi',  payment.applicant_name || payment.applicant_email || '—'],
            ['Email',    payment.applicant_email || '—'],
            ['IBAN',     payment.applicant_iban  || '—'],
            ['Granti',   payment.grant_title || '—'],
            ['Shuma',    fmtAmount(payment.amount, payment.currency)],
          ].map(([lbl, val]) => (
            <div key={lbl} className="flex items-center justify-between py-2.5"
              style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{lbl}</span>
              <span className="text-sm font-semibold"
                style={{
                  color: lbl === 'Shuma' ? '#4ade80' : lbl === 'IBAN' ? '#e2e8f0' : 'var(--text-secondary)',
                  fontFamily: lbl === 'IBAN' ? 'monospace' : undefined,
                  letterSpacing: lbl === 'IBAN' ? '0.05em' : undefined,
                }}>
                {val}
              </span>
            </div>
          ))}

          <div className="pt-4 space-y-3">
            <div>
              <label className="text-xs block mb-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>
                Shënim (opsional)
              </label>
              <input
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Shënim shtesë..."
                className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4" style={{ borderTop: '1px solid var(--border)' }}>
          {error && <p className="text-xs mb-3" style={{ color: 'var(--danger)' }}>{error}</p>}
          <div className="flex gap-3">
            <button onClick={onClose} disabled={loading}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold"
              style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              Anulo
            </button>
            <button onClick={handleConfirm} disabled={loading}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold"
              style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.4)' }}>
              {loading ? 'Duke ruajtur...' : 'Konfirmo pagesën'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const PAGE_SIZE = 20
const STATUS_FILTERS = { '': 'Të gjitha', 'PENDING': 'Në pritje', 'PAID': 'Paguar' }

export default function PaymentsPage() {
  const [payments, setPayments] = useState([])
  const [total,    setTotal]    = useState(0)
  const [page,     setPage]     = useState(1)
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('')
  const [modal,    setModal]    = useState(null)

  const fetchPayments = useCallback((p = page, s = filter) => {
    setLoading(true)
    const params = { page: p, size: PAGE_SIZE }
    if (s) params.status = s
    api.get('/payments', { params })
      .then(r => {
        setPayments(r.data?.items ?? [])
        setTotal(r.data?.total ?? 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page, filter])

  useEffect(() => { setPage(1); fetchPayments(1, filter) }, [filter])

  const handleSuccess = () => {
    setModal(null)
    fetchPayments(page, filter)
  }


  const pendingCount = payments.filter(p => p.status === 'PENDING').length
  const paidTotal    = payments
    .filter(p => p.status === 'PAID')
    .reduce((s, p) => s + (Number(p.amount) || 0), 0)

  return (
    <div className="org-admin-shell min-h-screen">
      <OrgHeader />
      <main className="org-page-content">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Pagesat</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {total} pagesë{total !== 1 ? '' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {Object.entries(STATUS_FILTERS).map(([s, label]) => (
              <button key={s}
                onClick={() => setFilter(s)}
                className="text-xs px-3 py-1.5 rounded-lg font-medium transition"
                style={{
                  background: filter === s ? 'var(--accent-dim)' : 'var(--bg-card)',
                  color:      filter === s ? 'var(--accent)'     : 'var(--text-muted)',
                  border: `1px solid ${filter === s ? 'rgba(74,222,128,0.3)' : 'var(--border)'}`,
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl p-4"
            style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <p className="text-xs mb-1 font-medium" style={{ color: '#fbbf24' }}>Në pritje</p>
            <p className="text-2xl font-black text-white">{pendingCount}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>pagesë{pendingCount !== 1 ? '' : ''} pa u kryer</p>
          </div>
          <div className="rounded-xl p-4"
            style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)' }}>
            <p className="text-xs mb-1 font-medium" style={{ color: '#4ade80' }}>Totali i paguar</p>
            <p className="text-2xl font-black text-white">
              €{paidTotal.toLocaleString('sq-AL', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>në këtë faqe</p>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Aplikanti', 'Granti', 'Shuma', 'Statusi', 'Paguar më', ''].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium"
                    style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 rounded animate-pulse" style={{ background: 'var(--bg-card)' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm"
                    style={{ color: 'var(--text-muted)' }}>
                    {filter === 'PENDING'
                      ? 'Nuk ka pagesa në pritje.'
                      : filter === 'PAID'
                        ? 'Nuk ka pagesa të kryera.'
                        : 'Nuk ka pagesa ende. Finalizoni një grant për të krijuar pagesa automatikisht.'
                    }
                  </td>
                </tr>
              ) : payments.map(p => {
                const badge = PAYMENT_BADGE[p.status] || PAYMENT_BADGE.PENDING
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-white">
                        {p.applicant_name || p.applicant_email || '—'}
                      </p>
                      {p.applicant_name && p.applicant_email && (
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {p.applicant_email}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {p.grant_title || '—'}
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="text-sm font-bold" style={{ color: '#4ade80' }}>
                        {fmtAmount(p.amount, p.currency)}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                        {badge.label}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {p.paid_at ? (
                        <span>
                          {fmtDate(p.paid_at)}
                          {p.reference && (
                            <span className="block text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                              Ref: {p.reference}
                            </span>
                          )}
                        </span>
                      ) : '—'}
                    </td>

                    <td className="px-5 py-3.5">
                      {p.status === 'PENDING' ? (
                        <button
                          onClick={() => setModal(p)}
                          className="text-xs px-3 py-1.5 rounded-lg font-semibold transition"
                          style={{
                            background: 'rgba(251,191,36,0.12)',
                            color: '#fbbf24',
                            border: '1px solid rgba(251,191,36,0.3)',
                          }}>
                          Dërgo pagesën
                        </button>
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {p.note || '—'}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          total={total}
          size={PAGE_SIZE}
          onChange={p => { setPage(p); fetchPayments(p, filter) }}
        />
      </main>

      {modal && (
        <MarkPaidModal
          payment={modal}
          onClose={() => setModal(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}
