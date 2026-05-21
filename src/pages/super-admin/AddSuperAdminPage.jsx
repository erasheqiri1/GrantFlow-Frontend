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
  const [form, setForm] = useState({ email: '', password: '', first_name: '', last_name: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const res = await api.post('/users/super-admin', form)
      setSuccess(res.data.message)
      setForm({ email: '', password: '', first_name: '', last_name: '' })
    } catch (err) {
      setError(err.response?.data?.detail || 'Gabim gjatë krijimit')
    } finally {
      setLoading(false)
    }
  }

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar items={NAV} />
      <main className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Shto Super Admin</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Krijo llogari të re me privilegje Super Admin
          </p>
        </div>

        <div className="max-w-md">
          <div className="rounded-2xl p-6" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>

            {success && (
              <div className="rounded-lg px-4 py-3 mb-4 text-sm"
                style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}>
                {success}
              </div>
            )}
            {error && (
              <div className="rounded-lg px-4 py-3 mb-4 text-sm"
                style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Emri</label>
                  <input required value={form.first_name} onChange={set('first_name')}
                    placeholder="Emri"
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Mbiemri</label>
                  <input required value={form.last_name} onChange={set('last_name')}
                    placeholder="Mbiemri"
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email</label>
                <input required type="email" value={form.email} onChange={set('email')}
                  placeholder="admin@grantflow.com"
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Fjalëkalimi</label>
                <input required type="password" value={form.password} onChange={set('password')}
                  placeholder="Minimum 8 karaktere"
                  minLength={8}
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-2.5 rounded-lg font-semibold text-sm transition mt-2"
                style={{ background: loading ? 'var(--accent-dark)' : 'var(--accent)', color: '#0f1117' }}>
                {loading ? 'Duke krijuar...' : '➕  Krijo Super Admin'}
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
