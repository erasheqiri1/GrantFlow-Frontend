import { useEffect, useState, useCallback } from 'react'
import SuperAdminHeader from '../../components/layout/SuperAdminHeader'
import Pagination from '../../components/Pagination'
import api from '../../api/axios'

const NAV = [
  { to: '/super-admin',            icon: '🏠', label: 'Overview' },
  { to: '/super-admin/pending',    icon: '⏳', label: 'Pret aprovim' },
  { to: '/super-admin/users',      icon: '👥', label: 'Lista e userave' },
  { to: '/super-admin/audit',      icon: '📋', label: 'Audit logs' },
  { to: '/super-admin/add-admin',  icon: '➕', label: 'Shto super_admin' },
]

/* ─── Modal me detaje + Aprovo / Refuzo ─── */
function OrgModal({ org, onClose, onApprove, onReject, actionId }) {
  const busy = actionId === org.id
  const docUrl  = org.doc_path ? `/${org.doc_path.replace(/\\/g, '/')}` : null
  const docName = org.doc_path ? org.doc_path.split(/[\\/]/).pop() : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.65)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-lg rounded-2xl relative"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent)' }}>
              <span className="text-base font-black" style={{ color: 'var(--accent)' }}>
                {org.name?.[0]?.toUpperCase() || '?'}
              </span>
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{org.name}</h2>
              <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>/{org.slug}</span>
            </div>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-sm"
            style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-0">
          {[
            ['Email',               org.email || '—'],
            ['NIPT',                org.nipt  || 'Nuk është dhënë'],
            ['Slug',                org.slug],
            ['Data e regjistrimit', org.created_at
              ? new Date(org.created_at).toLocaleString('sq-AL', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })
              : '—'],
          ].map(([label, val]) => (
            <div key={label} className="flex gap-3 py-2.5"
              style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="text-xs w-36 flex-shrink-0 font-medium"
                style={{ color: 'var(--text-muted)' }}>{label}</span>
              <span className="text-xs flex-1 break-all"
                style={{ color: 'var(--text-secondary)' }}>{val}</span>
            </div>
          ))}

          {/* Dokument */}
          <div className="flex gap-3 py-2.5">
            <span className="text-xs w-36 flex-shrink-0 font-medium"
              style={{ color: 'var(--text-muted)' }}>Dokument</span>
            <span className="text-xs flex-1">
              {docUrl
                ? <a href={docUrl} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 font-medium hover:underline"
                    style={{ color: 'var(--accent)' }}>
                    📎 {docName}
                  </a>
                : <span style={{ color: 'var(--text-muted)' }}>Nuk është ngarkuar</span>}
            </span>
          </div>
        </div>

        {/* Footer — Aprovo / Refuzo */}
        <div className="px-6 py-4 flex gap-3"
          style={{ borderTop: '1px solid var(--border)' }}>
          <button
            disabled={busy} onClick={onApprove}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition"
            style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' }}>
            {busy ? 'Duke procesuar...' : '✓ Aprovo organizatën'}
          </button>
          <button
            disabled={busy} onClick={onReject}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition"
            style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
            {busy ? '...' : '✕ Refuzo'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Karta e një organizate ─── */
function OrgCard({ org, onView }) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-4 transition"
      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>

      {/* Top row: ikon + emri + badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Ikona e institucionit */}
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent)' }}>
            <span className="text-lg font-black" style={{ color: 'var(--accent)' }}>
              {org.name?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
          <div>
            <p className="font-semibold text-white text-sm leading-tight">{org.name}</p>
            <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>/{org.slug}</span>
          </div>
        </div>

        {/* Badge Në pritje */}
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
          style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)' }}>
          ⊙ Në pritje
        </span>
      </div>

      {/* Info */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <span style={{ color: 'var(--text-muted)' }}>✉</span>
          {org.email || '—'}
        </div>
        {org.created_at && (
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>📅</span>
            Regjistruar: {new Date(org.created_at).toLocaleDateString('sq-AL')}
          </div>
        )}
      </div>

      {/* Buton */}
      <div className="flex justify-end pt-1">
        <button
          onClick={() => onView(org)}
          className="text-xs font-semibold px-4 py-2 rounded-lg transition flex items-center gap-1.5"
          style={{ background: 'var(--bg-card)', color: 'white', border: '1px solid var(--border)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-dim)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.borderColor = 'var(--border)' }}
        >
          Shqyrto kërkesën <span style={{ fontSize: '10px' }}>›</span>
        </button>
      </div>
    </div>
  )
}

const PAGE_SIZE = 20

/* ─── Faqja kryesore ─── */
export default function PendingOrgsPage() {
  const [orgs,     setOrgs]     = useState([])
  const [loading,  setLoading]  = useState(true)
  const [actionId, setActionId] = useState(null)
  const [selected, setSelected] = useState(null)
  const [page,     setPage]     = useState(1)
  const [total,    setTotal]    = useState(0)

  const load = useCallback((p = page) => {
    setLoading(true)
    api.get('/tenants', { params: { status: 'PENDING', page: p, size: PAGE_SIZE } })
      .then(r => {
        setOrgs(r.data?.items ?? r.data ?? [])
        setTotal(r.data?.total ?? 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page])

  useEffect(() => {
    load()
    const onFocus = () => load()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [load])

  const approve = async (id) => {
    setActionId(id)
    try {
      await api.patch(`/tenants/${id}/status`, { status: 'APPROVED' })
      setSelected(null)
      load()
    } catch (err) {
      alert(err.response?.data?.detail || 'Gabim gjatë aprovimit')
    } finally {
      setActionId(null)
    }
  }

  const reject = async (id) => {
    if (!confirm('A jeni i sigurt që doni ta refuzoni këtë organizatë?')) return
    setActionId(id)
    try {
      await api.patch(`/tenants/${id}/status`, { status: 'REJECTED' })
      setSelected(null)
      load()
    } catch (err) {
      alert(err.response?.data?.detail || 'Gabim gjatë refuzimit')
    } finally {
      setActionId(null)
    }
  }

  return (
    <div className="org-admin-shell min-h-screen">
      <SuperAdminHeader />
      <main className="org-page-content">

        {/* Titulli */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Organizata në pritje</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Kërkesa për regjistrim që presin aprovimin tuaj
          </p>
        </div>

        {/* Counter */}
        <div className="mb-5">
          <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
            {total} {total === 1 ? 'kërkesë' : 'kërkesa'}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-20 text-sm" style={{ color: 'var(--text-muted)' }}>
            Duke ngarkuar...
          </div>
        ) : orgs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-sm font-medium text-white">Asnjë kërkesë në pritje</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Të gjitha organizatat janë procesuar
            </p>
          </div>
        ) : (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
            {orgs.map(org => (
              <OrgCard key={org.id} org={org} onView={setSelected} />
            ))}
          </div>
        )}

        <Pagination page={page} total={total} size={PAGE_SIZE}
          onChange={p => { setPage(p); load(p) }} />
      </main>

      {/* Modal */}
      {selected && (
        <OrgModal
          org={selected}
          onClose={() => setSelected(null)}
          onApprove={() => approve(selected.id)}
          onReject={() => reject(selected.id)}
          actionId={actionId}
        />
      )}
    </div>
  )
}
