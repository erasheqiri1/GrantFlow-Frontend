import { useEffect, useState } from 'react'
import Sidebar from '../../components/layout/Sidebar'
import api from '../../api/axios'

const NAV = [
  { to: '/super-admin',            icon: '🏠', label: 'Overview' },
  { to: '/super-admin/pending',    icon: '⏳', label: 'Pret aprovim' },
  { to: '/super-admin/users',      icon: '👥', label: 'Lista e userave' },
  { to: '/super-admin/audit',      icon: '📋', label: 'Audit logs' },
  { to: '/super-admin/add-admin',  icon: '➕', label: 'Shto super_admin' },
]

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/audit-logs?limit=200')
      .then(r => setLogs(Array.isArray(r.data) ? r.data : r.data.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = logs.filter(l =>
    l.action?.toLowerCase().includes(search.toLowerCase()) ||
    l.user_email?.toLowerCase().includes(search.toLowerCase()) ||
    l.entity?.toLowerCase().includes(search.toLowerCase()) ||
    l.tenant_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar items={NAV} />
      <main className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Regjistrimi i veprimeve të kryera në platformë
          </p>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="font-semibold text-white">{logs.length} regjistrime</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="🔍  Kërko veprim, email, entitet..."
              className="px-3 py-1.5 rounded-lg text-xs text-white outline-none w-64"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            />
          </div>

          {loading ? (
            <div className="px-5 py-16 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Duke ngarkuar...</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Veprimi', 'Entiteti', 'Useri', 'Organizata', 'IP', 'Data'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => (
                  <tr key={l.id} style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-mono font-semibold px-2 py-1 rounded"
                        style={{ background: 'rgba(96,165,250,0.1)', color: '#60a5fa' }}>
                        {l.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                      {l.entity}{l.entity_id ? ` · ${l.entity_id.slice(0, 8)}…` : ''}
                    </td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {l.user_email ?? '—'}
                    </td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {l.tenant_name ?? '—'}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                      {l.ip_address ?? '—'}
                    </td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {l.created_at ? new Date(l.created_at).toLocaleString('sq-AL') : '—'}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                      {search ? 'Nuk u gjet asnjë regjistrim.' : 'Nuk ka regjistrime ende.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}
