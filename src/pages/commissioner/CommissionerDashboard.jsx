import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import CommissionerHeader from '../../components/layout/CommissionerHeader'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

export default function CommissionerDashboard() {
  const { user } = useAuth()
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.user_id) return
    const params = { assigned_to: user.user_id, page: 1, size: 500 }

    api.get('/applications', { params })
      .then(res => {
        const items = res.data?.items ?? (Array.isArray(res.data) ? res.data : [])
        const total = res.data?.total ?? items.length

        setStats({
          total,
          pending:  items.filter(a => a.status === 'SUBMITTED').length,
          inReview: items.filter(a => a.status === 'UNDER_REVIEW').length,
          approved: items.filter(a => a.status === 'APPROVED').length,
          rejected: items.filter(a => a.status === 'REJECTED').length,
          recentPending: items
            .filter(a => ['SUBMITTED', 'UNDER_REVIEW'].includes(a.status))
            .sort((a, b) => new Date(b.submitted_at || b.created_at) - new Date(a.submitted_at || a.created_at))
            .slice(0, 5),
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user?.user_id])

  const statCards = stats ? [
    { label: 'Totale',       value: stats.total,    color: 'white' },
    { label: 'Dorëzuar',     value: stats.pending,  color: '#60a5fa' },
    { label: 'Në shqyrtim',  value: stats.inReview, color: '#fbbf24' },
    { label: 'Aprovuar',     value: stats.approved, color: '#4ade80' },
    { label: 'Refuzuar',     value: stats.rejected, color: '#f87171' },
  ] : []

  return (
    <div className="org-admin-shell min-h-screen">
      <CommissionerHeader />
      <main className="org-page-content commissioner-dashboard-content">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Paneli i komisionerit</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Shqyrto aplikimet dhe dorëzo vlerësimet
          </p>
        </div>

        <div className="grid grid-cols-5 gap-4 mb-8">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="rounded-xl p-4 animate-pulse"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', height: 88 }} />
            ))
          ) : statCards.map(s => (
            <div key={s.label} className="rounded-xl p-4"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {!loading && stats?.total === 0 && (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Nuk ke aplikime të caktuara akoma.
          </p>
        )}

        {!loading && (stats?.pending ?? 0) + (stats?.inReview ?? 0) > 0 && (
          <div className="rounded-2xl p-5" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <p className="text-sm font-semibold text-white mb-1">
              {(stats.pending + stats.inReview)} aplikim presin vendim
            </p>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              {stats.pending} të reja · {stats.inReview} në shqyrtim
            </p>

            {stats.recentPending.length > 0 && (
              <div className="space-y-2 mb-4">
                {stats.recentPending.map(app => (
                  <div key={app.id} className="flex items-center justify-between px-3 py-2 rounded-lg"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <div>
                      <p className="text-xs font-medium text-white">{app.user_name || app.user_email || '—'}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{app.grant_title || '—'}</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: app.status === 'SUBMITTED' ? 'rgba(96,165,250,0.15)' : 'rgba(168,85,247,0.15)',
                        color:      app.status === 'SUBMITTED' ? '#60a5fa' : '#a855f7',
                      }}>
                      {app.status === 'SUBMITTED' ? 'Dorëzuar' : 'Shqyrtim'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <Link to="/commissioner/applications"
              className="text-xs px-4 py-2 rounded-lg font-semibold inline-block"
              style={{ background: 'var(--accent)', color: '#0f1117' }}>
              Shiko të gjitha →
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
