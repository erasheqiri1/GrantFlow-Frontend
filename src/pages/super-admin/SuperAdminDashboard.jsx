import { useEffect, useState } from 'react'
import Sidebar from '../../components/layout/Sidebar'
import api from '../../api/axios'

const NAV = [
  { to: '/super-admin', icon: '🏠', label: 'Overview' },
  { to: '/super-admin/pending', icon: '⏳', label: 'Pret aprovim' },
  { to: '/super-admin/users', icon: '👥', label: 'Lista e userave' },
  { to: '/super-admin/audit', icon: '📋', label: 'Audit logs' },
  { to: '/super-admin/add-admin', icon: '➕', label: 'Shto super_admin' },
]

const STATUS_BADGE = {
  PENDING:  { label: 'Në pritje', bg: 'rgba(251,191,36,0.15)', color: '#fbbf24' },
  ACTIVE:   { label: 'Aktive',    bg: 'rgba(74,222,128,0.15)', color: '#4ade80' },
  REJECTED: { label: 'Refuzuar',  bg: 'rgba(248,113,113,0.15)', color: '#f87171' },
}

export default function SuperAdminDashboard() {
  const [tenants, setTenants] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/tenants').then(r => setTenants(r.data.items ?? r.data)).catch(() => {})
  }, [])

  const filtered = tenants.filter(t =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.email?.toLowerCase().includes(search.toLowerCase()) ||
    t.slug?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar items={NAV} />
      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Overview · i platformës</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Statistikat e përgjithshme të platformës
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Organizata', value: tenants.filter(t => t.status === 'ACTIVE').length, sub: '+1 këtë muaj', color: 'var(--accent)' },
            { label: 'Pret aprovim', value: tenants.filter(t => t.status === 'PENDING').length, sub: 'kërkesa aktive' },
            { label: 'Grante aktive', value: '28', sub: '+4 këtë javë' },
            { label: 'Aplikime', value: '1,240', sub: '+67 sot' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              <p className="text-3xl font-bold" style={{ color: s.color || 'white' }}>{s.value}</p>
              {s.sub && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.sub}</p>}
            </div>
          ))}
        </div>

        {/* Tenants table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-white">Organizatat</h2>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="🔍  Kërko..."
                className="px-3 py-1.5 rounded-lg text-xs text-white outline-none"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }} />
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Organizata', 'Email', 'Statusi', 'Slug', 'Aprovuar', 'Veprime'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const s = STATUS_BADGE[t.status] || STATUS_BADGE.PENDING
                return (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td className="px-5 py-3.5 text-sm font-medium text-white">{t.name}</td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>{t.email || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: s.bg, color: s.color }}>
                        {s.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{t.slug}</td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>—</td>
                    <td className="px-5 py-3.5">
                      <button className="text-xs px-3 py-1.5 rounded-lg"
                        style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                        Detajet
                      </button>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    Nuk ka organizata ende.
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
