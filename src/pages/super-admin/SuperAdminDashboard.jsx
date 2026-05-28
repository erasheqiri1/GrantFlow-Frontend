import { useEffect, useState, useCallback } from 'react'
import SuperAdminHeader from '../../components/layout/SuperAdminHeader'
import Pagination from '../../components/Pagination'
import api from '../../api/axios'

const STATUS_BADGE = {
  PENDING:  { label: 'Në pritje', bg: 'rgba(251,191,36,0.15)', color: '#fbbf24' },
  ACTIVE:   { label: 'Aktive',    bg: 'rgba(74,222,128,0.15)', color: '#4ade80' },
  REJECTED: { label: 'Refuzuar',  bg: 'rgba(248,113,113,0.15)', color: '#f87171' },
}

const PAGE_SIZE = 15

export default function SuperAdminDashboard() {
  const [tenants,  setTenants]  = useState([])
  const [stats,    setStats]    = useState({ total_grants: 0, total_applications: 0 })
  const [counts,   setCounts]   = useState({ active: 0, pending: 0 })
  const [search,   setSearch]   = useState('')
  const [page,     setPage]     = useState(1)
  const [total,    setTotal]    = useState(0)
  const [loading,  setLoading]  = useState(true)

  const loadTable = useCallback((p = page) => {
    setLoading(true)
    api.get('/tenants', { params: { page: p, size: PAGE_SIZE } })
      .then(r => {
        setTenants(r.data?.items ?? (Array.isArray(r.data) ? r.data : []))
        setTotal(r.data?.total ?? 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page])

  const loadStats = () => {
    api.get('/tenants/stats').then(r => setStats(r.data)).catch(() => {})
    Promise.all([
      api.get('/tenants', { params: { status: 'ACTIVE',  page: 1, size: 1 } }),
      api.get('/tenants', { params: { status: 'PENDING', page: 1, size: 1 } }),
    ]).then(([aRes, pRes]) => {
      setCounts({
        active:  aRes.data?.total ?? 0,
        pending: pRes.data?.total ?? 0,
      })
    }).catch(() => {})
  }

  useEffect(() => {
    loadTable()
    loadStats()
    const onFocus = () => { loadTable(); loadStats() }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [loadTable])

  const filtered = tenants.filter(t =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.email?.toLowerCase().includes(search.toLowerCase()) ||
    t.slug?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="org-admin-shell min-h-screen">
      <SuperAdminHeader />
      <main className="org-page-content">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Paneli i platformës</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Statistikat e përgjithshme të platformës
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Organizata aktive', value: counts.active,            sub: `${total} gjithsej`,             color: 'var(--accent)' },
            { label: 'Pret aprovim',      value: counts.pending,           sub: 'kërkesa aktive' },
            { label: 'Grante aktive',     value: stats.total_grants,       sub: 'nga të gjitha org-at' },
            { label: 'Aplikime',          value: stats.total_applications, sub: 'nga të gjitha org-at' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              <p className="text-3xl font-bold" style={{ color: s.color || 'white' }}>{s.value}</p>
              {s.sub && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.sub}</p>}
            </div>
          ))}
        </div>

        {/* Tenants table */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-white">
                Organizatat
                <span className="ml-2 text-xs font-normal" style={{ color: 'var(--text-muted)' }}>
                  ({total} gjithsej)
                </span>
              </h2>
              <div className="super-search">
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Kërko..."
                  className="text-xs text-white outline-none"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="px-5 py-16 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              Duke ngarkuar...
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Organizata', 'Email', 'Statusi', 'Slug'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium"
                      style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => {
                  const s = STATUS_BADGE[t.status] || STATUS_BADGE.PENDING
                  return (
                    <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td className="px-5 py-3.5 text-sm font-medium text-white">{t.name}</td>
                      <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {t.email || '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ background: s.bg, color: s.color }}>
                          {s.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                        {t.slug}
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-sm"
                      style={{ color: 'var(--text-muted)' }}>
                      {search ? 'Nuk u gjet asnjë organizatë.' : 'Nuk ka organizata ende.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <Pagination page={page} total={total} size={PAGE_SIZE}
          onChange={p => { setPage(p); loadTable(p) }} />
      </main>
    </div>
  )
}
