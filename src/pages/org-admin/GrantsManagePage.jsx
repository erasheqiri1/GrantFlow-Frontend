import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import OrgHeader from '../../components/layout/OrgHeader'
import api from '../../api/axios'

const STATUS_BADGE = {
  DRAFT:     { label: 'Draft',       bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24' },
  PUBLISHED: { label: 'Hapur',      bg: 'rgba(74,222,128,0.15)',  color: '#4ade80' },
  CLOSED:    { label: 'Mbyllur',    bg: 'rgba(107,114,128,0.15)', color: '#9ca3af' },
  FINALIZED: { label: 'Finalizuar', bg: 'rgba(96,165,250,0.15)',  color: '#60a5fa' },
}

const STATUS_FILTERS = ['', 'DRAFT', 'PUBLISHED', 'CLOSED', 'FINALIZED']
const STATUS_LABELS  = { '': 'Të gjitha', DRAFT: 'Draft', PUBLISHED: 'Hapur', CLOSED: 'Mbyllur', FINALIZED: 'Finalizuar' }

export default function GrantsManagePage() {
  const [grants,    setGrants]    = useState([])
  const [appCounts, setAppCounts] = useState({})   // { grant_id: count }
  const [loading,   setLoading]   = useState(true)
  const [filter,    setFilter]    = useState('')

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [gRes, aRes] = await Promise.all([
        api.get('/grants'),
        api.get('/applications').catch(() => ({ data: [] })),
      ])
      const gs   = Array.isArray(gRes.data) ? gRes.data : []
      const apps = Array.isArray(aRes.data) ? aRes.data : aRes.data?.items ?? []

      // numëro aplikimet per grant
      const counts = {}
      apps.forEach(a => { counts[a.grant_id] = (counts[a.grant_id] || 0) + 1 })

      setGrants(gs)
      setAppCounts(counts)
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handlePublish = async (id) => {
    if (!confirm('Publiko këtë grant?')) return
    try { await api.patch(`/grants/${id}/publish`) } catch (e) { alert(e.response?.data?.detail || 'Gabim') }
    fetchAll()
  }

  const handleDelete = async (id) => {
    if (!confirm('Fshi këtë grant? Ky veprim nuk kthehet.')) return
    try { await api.delete(`/grants/${id}`) } catch (e) { alert(e.response?.data?.detail || 'Gabim') }
    fetchAll()
  }

  const visible = filter ? grants.filter(g => g.status === filter) : grants

  return (
    <div className="org-admin-shell min-h-screen">
      <OrgHeader />
      <main className="org-page-content">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Grante</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {grants.length} gjithsej · {grants.filter(g => g.status === 'PUBLISHED').length} aktive
            </p>
          </div>
          <Link to="/org-admin/grants/new"
            className="org-primary-button flex items-center justify-center rounded-xl text-sm font-semibold"
            style={{ background: 'var(--accent)', color: '#0f1117' }}>
            Grant i ri
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4">
          {STATUS_FILTERS.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className="text-xs px-3 py-1.5 rounded-lg font-medium transition"
              style={{
                background: filter === s ? 'var(--accent-dim)' : 'var(--bg-card)',
                color:      filter === s ? 'var(--accent)'     : 'var(--text-muted)',
                border: `1px solid ${filter === s ? 'rgba(74,222,128,0.3)' : 'var(--border)'}`,
              }}>
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Titulli', 'Aplikime', 'Afati', 'Max fitues', 'Statusi', 'Veprime'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 rounded animate-pulse" style={{ background: 'var(--bg-card)' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    Nuk ka grante.{' '}
                    <Link to="/org-admin/grants/new" style={{ color: 'var(--accent)' }}>Krijo të parin →</Link>
                  </td>
                </tr>
              ) : visible.map(g => {
                const s       = STATUS_BADGE[g.status] || STATUS_BADGE.DRAFT
                const count   = appCounts[g.id] || 0
                const expired = g.status === 'PUBLISHED' && g.deadline && new Date(g.deadline) < new Date()
                return (
                  <tr key={g.id} style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                    {/* Titulli */}
                    <td className="px-5 py-3.5">
                      <Link to={`/org-admin/grants/${g.id}/edit`}
                        className="text-sm font-medium text-white hover:underline">
                        {g.title}
                      </Link>
                      {g.description && (
                        <p className="text-xs mt-0.5 truncate max-w-xs" style={{ color: 'var(--text-muted)' }}>
                          {g.description}
                        </p>
                      )}
                    </td>

                    {/* Aplikime */}
                    <td className="px-5 py-3.5">
                      {count > 0 ? (
                        <Link to={`/org-admin/applications?grant_id=${g.id}`}
                          className="text-sm font-semibold"
                          style={{ color: 'var(--accent)' }}>
                          {count} →
                        </Link>
                      ) : (
                        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>

                    {/* Afati */}
                    <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {g.deadline
                        ? new Date(g.deadline).toLocaleDateString('sq-AL', { timeZone: 'UTC' })
                        : '—'}
                    </td>

                    {/* Max fitues */}
                    <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {g.max_applicants ?? '—'}
                    </td>

                    {/* Statusi */}
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: expired ? 'rgba(239,68,68,0.15)' : s.bg, color: expired ? '#f87171' : s.color }}>
                        {expired ? 'Skaduar' : s.label}
                      </span>
                    </td>

                    {/* Veprime */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        {g.status === 'DRAFT' && (
                          <>
                            <Link to={`/org-admin/grants/${g.id}/edit`}
                              className="text-xs px-3 py-1.5 rounded-lg"
                              style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                              ✏️ Ndrysho
                            </Link>
                            <button onClick={() => handlePublish(g.id)}
                              className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                              style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' }}>
                              Publiko
                            </button>
                            <button onClick={() => handleDelete(g.id)}
                              className="text-xs px-2 py-1.5 rounded-lg"
                              style={{ color: 'var(--danger)' }}>✕</button>
                          </>
                        )}

                        {(g.status === 'PUBLISHED' || g.status === 'CLOSED' || g.status === 'FINALIZED') && (
                          <Link to={`/org-admin/grants/${g.id}/edit`}
                            className="text-xs px-3 py-1.5 rounded-lg"
                            style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                            👁 Shiko
                          </Link>
                        )}

                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
