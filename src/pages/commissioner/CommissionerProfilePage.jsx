import { useState, useEffect } from 'react'
import Sidebar from '../../components/layout/Sidebar'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { to: '/commissioner',              icon: '🏠', label: 'Dashboard' },
  { to: '/commissioner/applications', icon: '📋', label: 'Aplikimet' },
  { to: '/commissioner/profile',      icon: '👤', label: 'Profili' },
]

export default function CommissionerProfilePage() {
  const { user } = useAuth()
  const [profile,  setProfile]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [success,  setSuccess]  = useState('')
  const [error,    setError]    = useState('')

  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '' })

  useEffect(() => {
    api.get('/profile/me')
      .then(r => {
        setProfile(r.data)
        setForm({
          first_name: r.data.first_name || '',
          last_name:  r.data.last_name  || '',
          phone:      r.data.phone      || '',
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async e => {
    e.preventDefault()
    setSaving(true); setError(''); setSuccess('')
    try {
      await api.patch('/profile/me', form)
      setSuccess('Profili u ruajt.')
    } catch (err) {
      setError(err.response?.data?.detail || 'Gabim gjatë ruajtjes')
    } finally { setSaving(false) }
  }

  const inp  = 'w-full px-4 py-2.5 rounded-lg text-sm text-white outline-none transition'
  const inpS = { background: 'var(--bg-card)', border: '1px solid var(--border)' }
  const focus = e => (e.target.style.borderColor = 'var(--accent)')
  const blur  = e => (e.target.style.borderColor = 'var(--border)')

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar items={NAV} />
      <main className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Profili im</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {user?.tenant_slug?.toUpperCase()} · KOMISIONER
          </p>
        </div>

        <div className="max-w-xl space-y-5">

          {/* Info bazë */}
          <form onSubmit={handleSave}>
            <div className="rounded-2xl p-6" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <h2 className="font-semibold text-white mb-4">Informata personale</h2>

              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-10 rounded-lg animate-pulse" style={{ background: 'var(--bg-card)' }} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Email — read-only */}
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Email</label>
                    <div className="px-4 py-2.5 rounded-lg text-sm"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                      {profile?.email || '—'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Emri</label>
                      <input value={form.first_name}
                        onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))}
                        placeholder="Emri" className={inp} style={inpS} onFocus={focus} onBlur={blur} />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Mbiemri</label>
                      <input value={form.last_name}
                        onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))}
                        placeholder="Mbiemri" className={inp} style={inpS} onFocus={focus} onBlur={blur} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Telefoni</label>
                    <input value={form.phone}
                      onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="p.sh. +383 44 000 000" className={inp} style={inpS} onFocus={focus} onBlur={blur} />
                  </div>

                  {error && (
                    <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>
                  )}
                  {success && (
                    <p className="text-xs" style={{ color: '#4ade80' }}>{success}</p>
                  )}

                  <button type="submit" disabled={saving}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold transition"
                    style={{ background: 'var(--accent)', color: '#0f1117' }}>
                    {saving ? 'Duke ruajtur...' : 'Ruaj ndryshimet'}
                  </button>
                </div>
              )}
            </div>
          </form>


        </div>
      </main>
    </div>
  )
}
