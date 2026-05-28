import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import OrgHeader from '../../components/layout/OrgHeader'
import api from '../../api/axios'

function StatCard({ label, value, sub, color }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-3xl font-bold" style={{ color: color || 'white' }}>{value ?? '—'}</p>
      {sub && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  )
}

export default function OrgDashboard() {
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/grants',       { params: { page: 1, size: 500 } }).catch(() => ({ data: {} })),
      api.get('/applications', { params: { page: 1, size: 500 } }).catch(() => ({ data: {} })),
      api.get('/team',         { params: { page: 1, size: 200 } }).catch(() => ({ data: {} })),
    ]).then(([gRes, aRes, tRes]) => {
      const grants  = gRes.data?.items  ?? (Array.isArray(gRes.data)  ? gRes.data  : [])
      const apps    = aRes.data?.items  ?? (Array.isArray(aRes.data)  ? aRes.data  : [])
      const members = tRes.data?.items  ?? (Array.isArray(tRes.data)  ? tRes.data  : [])

      const totalGrants  = gRes.data?.total  ?? grants.length
      const totalApps    = aRes.data?.total  ?? apps.length
      const totalMembers = tRes.data?.total  ?? members.length

      setStats({
        totalGrants,
        published:  grants.filter(g => g.status === 'PUBLISHED').length,
        totalApps,
        approved:   apps.filter(a => a.status === 'APPROVED').length,
        pending:    apps.filter(a => ['SUBMITTED', 'UNDER_REVIEW'].includes(a.status)).length,
        totalMembers,
        recentApps: apps
          .sort((a, b) => new Date(b.submitted_at || b.created_at) - new Date(a.submitted_at || a.created_at))
          .slice(0, 5),
      })
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div className="org-admin-shell min-h-screen">
      <OrgHeader />

      <main className="org-page-content">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Paneli i organizatës</h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Monitoro grantet, aplikimet dhe ekipin
            </p>
          </div>
          <Link to="/org-admin/grants/new"
            className="org-primary-button flex items-center justify-center rounded-xl text-sm font-semibold transition"
            style={{ background: 'var(--accent)', color: '#0f1117' }}>
            Grant i ri
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Grante aktive"
            value={loading ? '—' : stats?.published}
            sub={loading ? '' : `${stats?.totalGrants} gjithsej`}
            color="var(--accent)"
          />
          <StatCard
            label="Aplikime totale"
            value={loading ? '—' : stats?.totalApps}
            sub={loading ? '' : `${stats?.pending} në pritje`}
          />
          <StatCard
            label="Anëtarë ekipit"
            value={loading ? '—' : stats?.totalMembers}
            sub="komisioner + admin"
          />
          <StatCard
            label="Aprovuar"
            value={loading ? '—' : stats?.approved}
            sub="gjithsej"
            color="#4ade80"
          />
        </div>

        {/* Aplikimet e fundit */}
        {!loading && stats?.recentApps?.length > 0 && (
          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="font-semibold text-white text-sm">Aplikimet e fundit</span>
              <Link to="/org-admin/applications"
                className="text-xs font-semibold"
                style={{ color: 'var(--accent)' }}>
                Shiko të gjitha →
              </Link>
            </div>
            <table className="w-full">
              <tbody>
                {stats.recentApps.map(app => {
                  const STATUS_COLOR = {
                    SUBMITTED:    '#60a5fa',
                    UNDER_REVIEW: '#a855f7',
                    APPROVED:     '#4ade80',
                    REJECTED:     '#f87171',
                  }
                  const STATUS_LABEL = {
                    SUBMITTED: 'Dorëzuar', UNDER_REVIEW: 'Shqyrtim',
                    APPROVED: 'Aprovuar', REJECTED: 'Refuzuar',
                  }
                  const c = STATUS_COLOR[app.status] || 'white'
                  return (
                    <tr key={app.id} style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td className="px-5 py-3 text-sm font-medium text-white">
                        {app.user_name || app.user_email || '—'}
                      </td>
                      <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                        {app.grant_title || '—'}
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-semibold px-2 py-1 rounded-full"
                          style={{ background: `${c}18`, color: c }}>
                          {STATUS_LABEL[app.status] || app.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                        {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString('sq-AL') : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
