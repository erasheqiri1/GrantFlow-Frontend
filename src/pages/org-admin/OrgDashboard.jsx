import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/layout/Sidebar'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'

const NAV = [
  { to: '/org-admin', icon: '🏠', label: 'Overview' },
  { to: '/org-admin/grants', icon: '📋', label: 'Shto grant' },
  { to: '/org-admin/applications', icon: '📬', label: 'Aplikimet' },
  { to: '/org-admin/team', icon: '👥', label: 'Ekipi' },
]

function StatCard({ label, value, sub, color }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-3xl font-bold" style={{ color: color || 'white' }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  )
}

const STATUS_BADGE = {
  DRAFT:     { label: 'Draft',   bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24' },
  PUBLISHED: { label: 'Hapur',  bg: 'rgba(74,222,128,0.15)', color: 'var(--accent)' },
  CLOSED:    { label: 'Mbyllur', bg: 'rgba(107,114,128,0.15)', color: '#9ca3af' },
}

export default function OrgDashboard() {
  const { user } = useAuthStore()
  const [grants, setGrants] = useState([])

  useEffect(() => {
    api.get('/grants').then(r => setGrants(r.data)).catch(() => {})
  }, [])

  const published = grants.filter(g => g.status === 'PUBLISHED').length
  const totalApps = grants.reduce((s, g) => s + 0, 0)

  const firstName = user?.full_name?.split(' ')[0] || 'Admin'

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar items={NAV} />

      <main className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Mirë se erdhe, {firstName}</h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {user?.tenant_slug?.toUpperCase()} · ORG_ADMIN
            </p>
          </div>
          <Link to="/org-admin/grants/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition"
            style={{ background: 'var(--accent)', color: '#0f1117' }}>
            + Grant i ri
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard label="Grante aktive" value={published} sub={`${grants.length} në shqyrtim`} color="var(--accent)" />
          <StatCard label="Aplikime totale" value="—" sub="+23 sot" />
          <StatCard label="Anëtarë ekipit" value="—" sub="1 ftesë aktive" />
          <StatCard label="Aprovuar" value="—" sub="këtë sezon" color="var(--accent)" />
        </div>

        {/* Grants table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
            <div>
              <h2 className="font-semibold text-white">Grante e mia</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Të gjitha grantet e {user?.tenant_slug?.toUpperCase()}
              </p>
            </div>
            <Link to="/org-admin/grants" className="text-xs" style={{ color: 'var(--accent)' }}>Shiko të gjitha →</Link>
          </div>

          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Titulli', 'Buxheti', 'Aplikime', 'Afati', 'Statusi', 'Veprime'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grants.slice(0, 5).map((g) => {
                const s = STATUS_BADGE[g.status] || STATUS_BADGE.DRAFT
                return (
                  <tr key={g.id} className="transition" style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td className="px-5 py-3.5 text-sm font-medium text-white">{g.title}</td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {g.grant_value ? `${g.grant_value.toLocaleString()}€` : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>—</td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {g.deadline ? new Date(g.deadline).toLocaleDateString('sq-AL', { timeZone: 'UTC' }) : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: s.bg, color: s.color }}>
                        {s.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Link to={g.status === 'DRAFT' ? `/org-admin/grants/${g.id}/edit` : '/org-admin/applications'}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg transition"
                        style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                        {g.status === 'DRAFT' ? 'Ndrysho' : 'Shiko'}
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {grants.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    Nuk ka grante ende. <Link to="/org-admin/grants/new" style={{ color: 'var(--accent)' }}>Krijo të parin →</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
