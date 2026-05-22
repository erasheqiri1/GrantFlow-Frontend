import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/layout/Sidebar'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { to: '/org-admin',        icon: '🏠', label: 'Overview' },
  { to: '/org-admin/grants', icon: '📋', label: 'Grante' },
  { to: '/org-admin/team',   icon: '👥', label: 'Ekipi' },
  { to: '/notifications',    icon: '🔔', label: 'Njoftimet' },
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

export default function OrgDashboard() {
  const { user } = useAuth()
  const [grants,  setGrants]  = useState([])
  const [apps,    setApps]    = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/grants').catch(() => ({ data: [] })),
      api.get('/applications').catch(() => ({ data: [] })),
      api.get('/team').catch(() => ({ data: [] })),
    ]).then(([gRes, aRes, tRes]) => {
      setGrants(Array.isArray(gRes.data) ? gRes.data : [])
      setApps(Array.isArray(aRes.data) ? aRes.data : aRes.data?.items ?? [])
      setMembers(Array.isArray(tRes.data) ? tRes.data : [])
    }).finally(() => setLoading(false))
  }, [])

  const published = grants.filter(g => g.status === 'PUBLISHED').length
  const approved  = apps.filter(a => a.status === 'APPROVED').length
  const pending   = apps.filter(a => ['SUBMITTED', 'UNDER_REVIEW'].includes(a.status)).length

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
          <StatCard label="Grante aktive"    value={loading ? '—' : published}       sub={`${grants.length} gjithsej`} color="var(--accent)" />
          <StatCard label="Aplikime totale"  value={loading ? '—' : apps.length}     sub={`${pending} në pritje`} />
          <StatCard label="Anëtarë ekipit"   value={loading ? '—' : members.length}  sub="komisioner + admin" />
          <StatCard label="Aprovuar"         value={loading ? '—' : approved}         sub="gjithsej" color="#4ade80" />
        </div>

      </main>
    </div>
  )
}
