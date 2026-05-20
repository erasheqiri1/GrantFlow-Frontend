import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [form, setForm] = useState({ email: '', password: '', tenant_slug: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = { email: form.email, password: form.password }
      if (form.tenant_slug) payload.tenant_slug = form.tenant_slug
      const res = await api.post('/auth/login', payload)
      const { access_token, role, user_id, tenant_slug } = res.data
      login(access_token, { role, user_id, tenant_slug })
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Email ose fjalëkalim i gabuar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-md px-4">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ background: 'var(--accent-dim)', border: '2px solid var(--accent)' }}>
            <span className="text-2xl font-black" style={{ color: 'var(--accent)' }}>G</span>
          </div>
          <div className="text-2xl font-black tracking-wide">
            <span className="text-white">GRANT</span>
            <span style={{ color: 'var(--accent)' }}>FLOW</span>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <h1 className="text-xl font-bold text-white text-center mb-1">Mirë se vini!</h1>
          <p className="text-center text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            Hyni në llogarinë tuaj për të vazhduar
          </p>

          {error && (
            <div className="rounded-lg px-4 py-3 mb-4 text-sm" style={{ background: 'rgba(248,113,113,0.1)', color: 'var(--danger)', border: '1px solid rgba(248,113,113,0.2)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base" style={{ color: 'var(--text-muted)' }}>✉</span>
                <input
                  type="email" required value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Shkruaj email-in"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm text-white outline-none transition"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Fjalëkalimi</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base" style={{ color: 'var(--text-muted)' }}>🔒</span>
                <input
                  type={showPass ? 'text' : 'password'} required value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Shkruaj fjalëkalimin"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg text-sm text-white outline-none transition"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                  style={{ color: 'var(--text-muted)' }}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
              <div className="text-right mt-1">
                <span className="text-xs cursor-pointer" style={{ color: 'var(--accent)' }}>Keni harruar fjalëkalimin?</span>
              </div>
            </div>

            {/* Tenant slug — vetëm për staf */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Organizata <span style={{ color: 'var(--text-muted)' }}>(vetëm për staf)</span>
              </label>
              <input
                type="text" value={form.tenant_slug}
                onChange={(e) => setForm({ ...form, tenant_slug: e.target.value })}
                placeholder="p.sh. uni-prishtina"
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white outline-none transition"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-sm transition mt-2"
              style={{ background: loading ? 'var(--accent-dark)' : 'var(--accent)', color: '#0f1117' }}>
              {loading ? 'Duke u kyçur...' : 'Hyr tani'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>ose</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            Nuk keni llogari?{' '}
            <Link to="/register" className="font-semibold" style={{ color: 'var(--accent)' }}>Regjistrohu</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
