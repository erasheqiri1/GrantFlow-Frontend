import { useState } from 'react'
import Sidebar from '../../components/layout/Sidebar'
import api from '../../api/axios'

const NAV = [
  { to: '/super-admin',            icon: '🏠', label: 'Overview' },
  { to: '/super-admin/pending',    icon: '⏳', label: 'Pret aprovim' },
  { to: '/super-admin/users',      icon: '👥', label: 'Lista e userave' },
  { to: '/super-admin/audit',      icon: '📋', label: 'Audit logs' },
  { to: '/super-admin/add-admin',  icon: '➕', label: 'Shto super_admin' },
]

export default function AddSuperAdminPage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError]     = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const res = await api.post('/users/invite-super-admin', { email })
      setSuccess(res.data.message)
      setEmail('')
    } catch (err) {
      setError(err.response?.data?.detail || 'Gabim gjatë dërgimit të ftesës')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar items={NAV} />
      <main className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Shto Super Admin</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Dërgo ftesë me email — personi vendos vetë fjalëkalimin
          </p>
        </div>

        <div className="max-w-md">
          <div className="rounded-2xl p-6" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>

            {/* Hapat */}
            <div className="flex items-start gap-3 mb-6 p-3 rounded-xl"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="space-y-2 text-xs w-full" style={{ color: 'var(--text-secondary)' }}>
                {[
                  ['1', 'Fut email-in e personit'],
                  ['2', 'Sistemi dërgon link ftese (skadon pas 48h)'],
                  ['3', 'Personi klikon linkun dhe vendos fjalëkalimin'],
                  ['4', 'Llogaria aktivizohet automatikisht si Super Admin'],
                ].map(([n, txt]) => (
                  <div key={n} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>{n}</span>
                    {txt}
                  </div>
                ))}
              </div>
            </div>

            {success && (
              <div className="rounded-lg px-4 py-3 mb-4 text-sm flex items-center gap-2"
                style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}>
                ✅ {success}
              </div>
            )}
            {error && (
              <div className="rounded-lg px-4 py-3 mb-4 text-sm"
                style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5"
                  style={{ color: 'var(--text-secondary)' }}>
                  Email i personit
                </label>
                <input
                  required type="email"
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@grantflow.com"
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-2.5 rounded-lg font-semibold text-sm transition"
                style={{ background: loading ? 'var(--accent-dark)' : 'var(--accent)', color: '#0f1117' }}>
                {loading ? 'Duke dërguar...' : '✉  Dërgo ftesën'}
              </button>
            </form>
          </div>

          <p className="text-xs mt-3 px-1" style={{ color: 'var(--text-muted)' }}>
            Super Admin ka qasje të plotë në platformë: aprovim organizatash, menaxhim userave dhe audit logs.
          </p>
        </div>
      </main>
    </div>
  )
}
