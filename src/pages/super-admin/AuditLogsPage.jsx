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

const ACTION_LABEL = {
  // Grante
  CREATE_GRANT:        'Krijoi grantin',
  PUBLISH_GRANT:       'Publikoi grantin',
  CLOSE_GRANT:         'Mbylli grantin',
  UPDATE_GRANT:        'Ndryshoi grantin',
  DELETE_GRANT:        'Fshiu grantin',
  // Aplikime
  SUBMIT_APPLICATION:  'Dorëzoi aplikimin',
  APPROVE_APPLICATION: 'Aprovoi aplikimin',
  REJECT_APPLICATION:  'Refuzoi aplikimin',
  // Organizata
  APPROVE_TENANT:      'Aprovoi organizatën',
  REJECT_TENANT:       'Refuzoi organizatën',
  // Përdorues
  ACTIVATE_USER:       'Aktivizoi përdoruesin',
  DEACTIVATE_USER:     'Deaktivizoi përdoruesin',
  CREATE_SUPER_ADMIN:  'Krijoi super admin',
  INVITE_SUPER_ADMIN:  'Dërgoi ftesë super admin',
  // Team
  INVITE_USER:         'Ftoi anëtar ekipi',
  REMOVE_MEMBER:       'Largoi anëtarin',
}

export default function AuditLogsPage() {
  const [logs, setLogs]       = useState([])
  const [search, setSearch]   = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/audit-logs?limit=200')
      .then(r => setLogs(Array.isArray(r.data) ? r.data : r.data.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = logs.filter(l =>
    l.user_email?.toLowerCase().includes(search.toLowerCase()) ||
    l.action?.toLowerCase().includes(search.toLowerCase()) ||
    l.entity?.toLowerCase().includes(search.toLowerCase()) ||
    l.tenant_name?.toLowerCase().includes(search.toLowerCase())
  )

  const formatDate = (d) => d ? new Date(d).toLocaleString('sq-AL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }) : '—'

  const parseDetails = (raw) => {
    if (!raw) return {}
    try { return typeof raw === 'string' ? JSON.parse(raw) : raw } catch { return {} }
  }

  const formatEntity = (l) => {
    const d = parseDetails(l.details)
    const short = l.entity_id ? `${l.entity_id.slice(0, 8)}…` : null
    const base  = (type) => short ? `${type} · ${short}` : type

    if (l.action?.includes('GRANT')) {
      const name = d.title || l.tenant_name
      return name ? `grant · ${name}` : base('grant')
    }
    if (l.action?.includes('APPLICATION')) {
      return d.grant_title ? `aplikim · ${d.grant_title}` : base('application')
    }
    if (['APPROVE_TENANT', 'REJECT_TENANT'].includes(l.action)) {
      return d.org_name || l.tenant_name || base('tenant')
    }
    if (['ACTIVATE_USER', 'DEACTIVATE_USER', 'CREATE_SUPER_ADMIN',
         'INVITE_SUPER_ADMIN', 'INVITE_USER', 'REMOVE_MEMBER'].includes(l.action)) {
      return d.email || d.invited_email || base('user')
    }
    // fallback i përgjithshëm
    return l.tenant_name || (l.entity && short ? `${l.entity} · ${short}` : l.entity) || '—'
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar items={NAV} />
      <main className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Gjithë aktivitetet në sistem
          </p>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="font-semibold text-white">{logs.length} regjistrime</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="🔍  Kërko përdorues, veprim, entitet..."
              className="px-3 py-1.5 rounded-lg text-xs text-white outline-none w-72"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            />
          </div>

          {loading ? (
            <div className="px-5 py-16 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              Duke ngarkuar...
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Koha', 'Përdoruesi', 'Veprimi', 'Entiteti'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium"
                      style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => (
                  <tr key={l.id} style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                    <td className="px-5 py-3.5 text-xs" style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {formatDate(l.created_at)}
                    </td>

                    <td className="px-5 py-3.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {l.user_email ?? '—'}
                    </td>

                    <td className="px-5 py-3.5 text-xs font-medium text-white">
                      {ACTION_LABEL[l.action] ?? l.action}
                    </td>

                    <td className="px-5 py-3.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {formatEntity(l)}
                    </td>

                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-sm"
                      style={{ color: 'var(--text-muted)' }}>
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
