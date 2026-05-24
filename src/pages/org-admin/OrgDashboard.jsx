import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import OrgHeader from '../../components/layout/OrgHeader'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

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
