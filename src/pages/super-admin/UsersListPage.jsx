import { useEffect, useState } from 'react'
import Sidebar from '../../components/layout/Sidebar'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { to: '/super-admin',            icon: '🏠', label: 'Overview' },
  { to: '/super-admin/pending',    icon: '⏳', label: 'Pret aprovim' },
  { to: '/super-admin/users',      icon: '👥', label: 'Lista e userave' },
  { to: '/super-admin/audit',      icon: '📋', label: 'Audit logs' },
  { to: '/super-admin/add-admin',  icon: '➕', label: 'Shto super_admin' },
]

const ROLE_STYLE = {
  SUPER_ADMIN:  { bg: 'rgba(167,139,250,0.15)', color: '#a78bfa' },
  ORG_ADMIN:    { bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24' },
  COMMISSIONER: { bg: 'rgba(96,165,250,0.15)',  color: '#60a5fa' },
  APPLICANT:    { bg: 'rgba(74,222,128,0.15)',  color: '#4ade80' },
}

export default function UsersListPage() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState(null)
  const { user: currentUser } = useAuth()

  const loadUsers = () => {
    api.get('/users')
      .then(r => setUsers(r.data.items ?? r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadUsers()
    window.addEventListener('focus', loadUsers)
    return () => window.removeEventListener('focus', loadUsers)
  }, [])

  const toggleActive = async (u) => {
    const action = u.is_active ? 'deaktivizoni' : 'aktivizoni'
    if (!confirm(`A jeni i sigurt që doni ta ${action} "${u.email}"?`)) return
    setActionId(u.id)
    try {
      const res = await api.patch(`/users/${u.id}/toggle-active`)
      // Update direkt në state pa pritur fetch të ri
      setUsers(prev => prev.map(x =>
        x.id === u.id ? { ...x, is_active: res.data.is_active } : x
      ))
    } catch (err) {
      alert(err.response?.data?.detail || 'Gabim')
    } finally {
      setActionId(null)
    }
  }

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.last_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar items={NAV} />
      <main className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Lista e userave</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Të gjithë përdoruesit e platformës
          </p>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="font-semibold text-white">{users.length} përdorues gjithsej</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="🔍  Kërko sipas emrit ose email..."
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
                  {['Emri', 'Email', 'Roli', 'Statusi', 'Regjistruar', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => {
                  const rs = ROLE_STYLE[u.role] || { bg: 'var(--bg-card)', color: 'var(--text-muted)' }
                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td className="px-5 py-3.5 text-sm font-medium text-white">
                        {u.first_name || u.last_name ? `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: rs.bg, color: rs.color }}>
                          {u.role ?? '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {u.tenant_status === 'PENDING' ? (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>
                            Në pritje
                          </span>
                        ) : (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={{
                              background: u.is_active ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.1)',
                              color: u.is_active ? '#4ade80' : '#f87171',
                            }}>
                            {u.is_active ? 'Aktiv' : 'Joaktiv'}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('sq-AL') : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        {u.id !== currentUser?.user_id && u.tenant_status !== 'PENDING' && (
                          <button
                            disabled={actionId === u.id}
                            onClick={() => toggleActive(u)}
                            className="text-xs px-3 py-1.5 rounded-lg transition"
                            style={u.is_active
                              ? { background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }
                              : { background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }
                            }>
                            {actionId === u.id ? '...' : u.is_active ? 'Deaktivo' : 'Aktivo'}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                      {search ? 'Nuk u gjet asnjë përdorues.' : 'Nuk ka përdorues ende.'}
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
