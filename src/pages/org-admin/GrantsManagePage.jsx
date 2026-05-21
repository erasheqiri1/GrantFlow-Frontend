import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/layout/Sidebar'
import api from '../../api/axios'

const NAV = [
  { to: '/org-admin', icon: '🏠', label: 'Overview' },
  { to: '/org-admin/grants', icon: '📋', label: 'Shto grant' },
  { to: '/org-admin/applications', icon: '📬', label: 'Aplikimet' },
  { to: '/org-admin/team', icon: '👥', label: 'Ekipi' },
]

const STATUS_BADGE = {
  DRAFT:     { label: 'Draft',   bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24' },
  PUBLISHED: { label: 'Hapur',  bg: 'rgba(74,222,128,0.15)', color: '#4ade80' },
  CLOSED:    { label: 'Mbyllur', bg: 'rgba(107,114,128,0.15)', color: '#9ca3af' },
}

export default function GrantsManagePage() {
  const [grants, setGrants] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchGrants = () => {
    setLoading(true)
    api.get('/grants').then(r => setGrants(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { fetchGrants() }, [])

  const handlePublish = async (id) => { await api.patch(`/grants/${id}/publish`); fetchGrants() }
  const handleClose   = async (id) => { await api.patch(`/grants/${id}/close`);   fetchGrants() }
  const handleDelete  = async (id) => { if (!confirm('Fshi grantin?')) return; await api.delete(`/grants/${id}`); fetchGrants() }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar items={NAV} />
      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Grante</h1>
          <Link to="/org-admin/grants/new"
            className="px-4 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--accent)', color: '#0f1117' }}>
            + Grant i ri
          </Link>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Titulli', 'Vlera', 'Afati', 'Statusi', 'Veprime'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 rounded animate-pulse" style={{ background: 'var(--bg-card)' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : grants.map((g) => {
                const s = STATUS_BADGE[g.status] || STATUS_BADGE.DRAFT
                return (
                  <tr key={g.id} style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td className="px-5 py-3.5 text-sm font-medium text-white">{g.title}</td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {g.grant_value ? `${g.grant_value.toLocaleString()}€` : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {g.deadline ? new Date(g.deadline).toLocaleDateString('sq-AL', { timeZone: 'UTC' }) : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: s.bg, color: s.color }}>
                        {s.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {g.status === 'DRAFT' && (
                          <>
                            <Link to={`/org-admin/grants/${g.id}/edit`}
                              className="text-xs px-3 py-1.5 rounded-lg"
                              style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                              Ndrysho
                            </Link>
                            <button onClick={() => handlePublish(g.id)}
                              className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                              style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80' }}>
                              Publiko
                            </button>
                            <button onClick={() => handleDelete(g.id)} className="text-xs" style={{ color: 'var(--danger)' }}>✕</button>
                          </>
                        )}
                        {g.status === 'PUBLISHED' && (
                          <button onClick={() => handleClose(g.id)}
                            className="text-xs px-3 py-1.5 rounded-lg"
                            style={{ background: 'rgba(107,114,128,0.15)', color: '#9ca3af' }}>
                            Mbyll
                          </button>
                        )}
                        {g.status === 'CLOSED' && (
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Mbyllur</span>
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
