import { useEffect, useState } from 'react'
import Sidebar from '../../components/layout/Sidebar'
import api from '../../api/axios'

const NAV = [
  { to: '/super-admin',            icon: '🏠', label: 'Overview' },
  { to: '/super-admin/pending',    icon: '⏳', label: 'Pret aprovim' },
  { to: '/super-admin/users',      icon: '👥', label: 'Lista e userave' },
  { to: '/super-admin/audit',      icon: '📋', label: 'Audit logs' },
  { to: '/super-admin/add-admin',  icon: '➕', label: 'Shto super_admin' },
]

function DetailRow({ label, children }) {
  return (
    <div className="flex gap-3 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
      <span className="text-xs w-32 flex-shrink-0 font-medium" style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
      <span className="text-xs flex-1 break-all" style={{ color: 'var(--text-secondary)' }}>
        {children}
      </span>
    </div>
  )
}

function OrgModal({ org, onClose, onApprove, onReject, actionId }) {
  const busy = actionId === org.id
  const docUrl = org.doc_path ? `/${org.doc_path.replace(/\\/g, '/')}` : null
  const docName = org.doc_path ? org.doc_path.split(/[\\/]/).pop() : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.65)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-lg rounded-2xl relative"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 className="text-base font-bold text-white">Detajet e organizatës</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Shqyrtoni para aprovimit</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-sm transition"
            style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {/* Badge */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent)' }}>
              <span className="text-base font-black" style={{ color: 'var(--accent)' }}>
                {org.name?.[0]?.toUpperCase() || '?'}
              </span>
            </div>
            <div>
              <p className="font-semibold text-white text-sm">{org.name}</p>
              <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }}>
                {org.slug}
              </span>
            </div>
          </div>

          <div>
            <DetailRow label="Slug">
              <span className="font-mono">{org.slug}</span>
            </DetailRow>
            <DetailRow label="Email">{org.email || '—'}</DetailRow>
            <DetailRow label="NIPT">
              {org.nipt
                ? <span className="font-mono">{org.nipt}</span>
                : <span style={{ color: 'var(--text-muted)' }}>Nuk është dhënë</span>}
            </DetailRow>
            <DetailRow label="Dokument verifikimi">
              {docUrl ? (
                <a
                  href={docUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-medium hover:underline"
                  style={{ color: 'var(--accent)' }}
                >
                  📎 {docName}
                </a>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>Nuk është ngarkuar</span>
              )}
            </DetailRow>
            <DetailRow label="Data e regjistrimit">
              {org.created_at
                ? new Date(org.created_at).toLocaleString('sq-AL', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })
                : '—'}
            </DetailRow>
          </div>
        </div>

        {/* Footer — actions */}
        <div className="px-6 py-4 flex gap-3" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            disabled={busy}
            onClick={onApprove}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition"
            style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' }}
          >
            {busy ? 'Duke procesuar...' : '✓ Aprovo organizatën'}
          </button>
          <button
            disabled={busy}
            onClick={onReject}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition"
            style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}
          >
            {busy ? '...' : '✕ Refuzo'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PendingOrgsPage() {
  const [orgs, setOrgs] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState(null)
  const [selected, setSelected] = useState(null)

  const load = () => {
    setLoading(true)
    api.get('/tenants?status=PENDING')
      .then(r => setOrgs(r.data.items ?? r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const approve = async (id) => {
    setActionId(id)
    try {
      await api.patch(`/tenants/${id}/approve`)
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
      await api.patch(`/tenants/${id}/reject`)
      setSelected(null)
      load()
    } catch (err) {
      alert(err.response?.data?.detail || 'Gabim gjatë refuzimit')
    } finally {
      setActionId(null)
    }
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar items={NAV} />
      <main className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Organizata në pritje</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Kërkesa për regjistrim që presin aprovimin tuaj
          </p>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="font-semibold text-white">
              {orgs.length} kërkesë{orgs.length !== 1 ? '' : ''}
            </span>
          </div>

          {loading ? (
            <div className="px-5 py-16 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              Duke ngarkuar...
            </div>
          ) : orgs.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <p className="text-4xl mb-3">✅</p>
              <p className="text-sm font-medium text-white">Asnjë kërkesë në pritje</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Të gjitha organizatat janë procesuar</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {orgs.map(org => (
                <div key={org.id} className="px-5 py-4 flex items-center justify-between gap-4"
                  style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-white text-sm truncate">{org.name}</p>
                      <span className="text-xs font-mono px-2 py-0.5 rounded"
                        style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }}>
                        {org.slug}
                      </span>
                      {org.doc_path && (
                        <span className="text-xs px-2 py-0.5 rounded"
                          style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}>
                          📎 dok
                        </span>
                      )}
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{org.email || '—'}</p>
                    {org.created_at && (
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        Regjistruar: {new Date(org.created_at).toLocaleDateString('sq-AL')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setSelected(org)}
                      className="px-4 py-2 rounded-lg text-xs font-semibold transition"
                      style={{ background: 'var(--bg-card)', color: 'white', border: '1px solid var(--border)' }}
                    >
                      Detajet →
                    </button>
                    <button
                      disabled={actionId === org.id}
                      onClick={() => approve(org.id)}
                      className="px-4 py-2 rounded-lg text-xs font-semibold transition"
                      style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' }}>
                      {actionId === org.id ? '...' : '✓ Aprovo'}
                    </button>
                    <button
                      disabled={actionId === org.id}
                      onClick={() => reject(org.id)}
                      className="px-4 py-2 rounded-lg text-xs font-semibold transition"
                      style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
                      {actionId === org.id ? '...' : '✕ Refuzo'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Details modal */}
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
