import { useState, useEffect } from 'react'
import Sidebar from '../../components/layout/Sidebar'
import api from '../../api/axios'

const NAV = [
  { to: '/org-admin', icon: '🏠', label: 'Overview' },
  { to: '/org-admin/grants', icon: '📋', label: 'Shto grant' },
  { to: '/org-admin/applications', icon: '📬', label: 'Aplikimet' },
  { to: '/org-admin/team', icon: '👥', label: 'Ekipi' },
]

const STATUS_BADGE = {
  SUBMITTED:    { label: 'Dorëzuar',    bg: 'rgba(96,165,250,0.15)',  color: '#60a5fa' },
  UNDER_REVIEW: { label: 'Në shqyrtim', bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24' },
  APPROVED:     { label: 'Aprovuar',    bg: 'rgba(74,222,128,0.15)',  color: '#4ade80' },
  REJECTED:     { label: 'Refuzuar',    bg: 'rgba(248,113,113,0.15)', color: '#f87171' },
}

export default function ApplicationsReviewPage() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')

  useEffect(() => {
    setLoading(true)
    const params = status ? { status } : {}
    api.get('/applications', { params }).then(r => setApps(r.data)).finally(() => setLoading(false))
  }, [status])

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar items={NAV} />
      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Aplikimet</h1>
          <div className="flex items-center gap-2">
            {['', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].map((s) => (
              <button key={s} onClick={() => setStatus(s)}
                className="text-xs px-3 py-1.5 rounded-lg font-medium transition"
                style={{
                  background: status === s ? 'var(--accent-dim)' : 'var(--bg-card)',
                  color: status === s ? 'var(--accent)' : 'var(--text-muted)',
                  border: `1px solid ${status === s ? 'rgba(74,222,128,0.3)' : 'var(--border)'}`,
                }}>
                {s || 'Të gjitha'}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Aplikanti', 'Statusi', 'Dorëzuar', 'Veprime'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    {[...Array(4)].map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 rounded animate-pulse" style={{ background: 'var(--bg-card)' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : apps.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    Nuk ka aplikime.
                  </td>
                </tr>
              ) : apps.map((app) => {
                const s = STATUS_BADGE[app.status] || STATUS_BADGE.SUBMITTED
                return (
                  <tr key={app.id} style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-white font-mono">{app.id.slice(0, 8)}...</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: s.bg, color: s.color }}>
                        {s.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString('sq-AL') : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <button className="text-xs px-3 py-1.5 rounded-lg"
                        style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                        Shiko
                      </button>
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
