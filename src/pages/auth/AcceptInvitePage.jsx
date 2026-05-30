import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

export default function AcceptInvitePage() {
  const [params]   = useSearchParams()
  const navigate   = useNavigate()
  const { login }  = useAuth()
  const token      = params.get('token')

  const [form, setForm] = useState({ first_name: '', last_name: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [showPass, setShowPass] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const inp = 'w-full px-4 py-2.5 rounded-lg text-sm text-white outline-none transition'
  const inpStyle = { background: 'var(--bg-card)', border: '1px solid var(--border)' }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      setError('Fjalëkalimet nuk përputhen')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/invite/accept', {
        token,
        first_name: form.first_name,
        last_name:  form.last_name,
        password:   form.password,
      })

      login(res.data.access_token, res.data.refresh_token, {
        user_id:     res.data.user_id,
        role:        res.data.role,
        tenant_slug: res.data.tenant_slug,
      })
      const role = res.data.role
      if (role === 'SUPER_ADMIN')       navigate('/super-admin')
      else if (role === 'ORG_ADMIN')    navigate('/org-admin')
      else if (role === 'COMMISSIONER') navigate('/commissioner')
      else navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Gabim gjatë aktivizimit')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="auth-page min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <p className="text-4xl mb-3">⚠️</p>
          <p className="text-white font-semibold">Link i pavlefshëm</p>
          <Link to="/login" className="text-sm mt-2 block" style={{ color: 'var(--accent)' }}>
            Kthehu te kyçja →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page invite-activate-page min-h-screen flex items-center justify-center py-10"
      style={{ background: 'var(--bg-primary)' }}>
      <div className="invite-activate-wrap w-full px-4">

        <div className="invite-activate-logo flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
            style={{ background: 'var(--accent-dim)', border: '2px solid var(--accent)' }}>
            <span className="text-xl font-black" style={{ color: 'var(--accent)' }}>G</span>
          </div>
          <div className="text-xl font-black tracking-wide">
            <span className="text-white">GRANT</span>
            <span style={{ color: 'var(--accent)' }}>FLOW</span>
          </div>
        </div>

        <div className="invite-activate-card rounded-2xl p-8"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <h1 className="text-xl font-bold text-white text-center mb-1">Aktivizo llogarinë</h1>
          <p className="text-center text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            Vendos emrin dhe fjalëkalimin për të përfunduar regjistrimin
          </p>

          {error && (
            <div className="rounded-lg px-4 py-3 mb-4 text-sm"
              style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="invite-activate-form space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Emri *</label>
                <input required value={form.first_name} onChange={set('first_name')}
                  placeholder="Emri" className={inp} style={inpStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Mbiemri *</label>
                <input required value={form.last_name} onChange={set('last_name')}
                  placeholder="Mbiemri" className={inp} style={inpStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>
            </div>

            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Fjalëkalimi *</label>
              <div className="relative">
                <input required type={showPass ? 'text' : 'password'}
                  value={form.password} onChange={set('password')}
                  placeholder="Min. 8 karaktere, 1 e madhe, 1 numër, 1 special"
                  className={`${inp} pr-10`} style={inpStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                  style={{ color: 'var(--text-muted)' }}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Konfirmo fjalëkalimin *</label>
              <div className="relative">
                <input required type={showPass ? 'text' : 'password'}
                  value={form.confirm} onChange={set('confirm')}
                  placeholder="Konfirmo fjalëkalimin"
                  className={`${inp} pr-10`} style={inpStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                  style={{ color: 'var(--text-muted)' }}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-sm transition mt-2"
              style={{ background: loading ? 'var(--accent-dark)' : 'var(--accent)', color: '#0f1117' }}>
              {loading ? 'Duke aktivizuar...' : 'Aktivizo llogarinë →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
