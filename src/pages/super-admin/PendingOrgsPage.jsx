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

export default function PendingOrgsPage() {
  const [orgs, setOrgs] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState(null)

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
                      <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }}>
                        {org.slug}
                      </span>
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
    </div>
  )
}
