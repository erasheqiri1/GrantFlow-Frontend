import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import api from '../../api/axios'

export default function ResetPasswordPage() {
  const [searchParams]        = useSearchParams()
  const navigate              = useNavigate()
  const token                 = searchParams.get('token') || ''

  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [done, setDone]           = useState(false)
  const [error, setError]         = useState('')

  useEffect(() => {
    if (!token) setError('Token mungon ose është i pavlefshëm.')
  }, [token])

  const lineStyle = {
    width: '100%', background: 'transparent', border: 'none',
    borderBottom: '1px solid rgba(255,255,255,0.15)',
    color: '#fff', fontSize: '15px', padding: '8px 0', outline: 'none',
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Fjalëkalimet nuk përputhen'); return }
    if (password.length < 8)  { setError('Minimumi 8 karaktere'); return }
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, new_password: password }, { skipAuthRedirect: true })
      setDone(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Token i pavlefshëm ose ka skaduar.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#0f1117' }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-10">
          <span style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.5px' }}>
            <span style={{ color: '#fff' }}>GRANT</span>
            <span style={{ color: '#00e676' }}>FLOW</span>
          </span>
        </div>

        {done ? (
          <div className="text-center space-y-4">
            <div className="text-4xl">✅</div>
            <h2 className="text-xl font-bold text-white">Fjalëkalimi u ndryshua!</h2>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Po të ridrejtojmë te faqja e hyrjes...
            </p>
            <Link to="/login"
              className="inline-block mt-4 text-sm font-semibold"
              style={{ color: '#00e676' }}>
              Hyr tani →
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-white mb-1">Rivendos fjalëkalimin</h1>
            <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Vendos fjalëkalimin e ri. Minimumi 8 karaktere.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Fjalëkalimi i ri */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-4"
                  style={{ color: 'rgba(255,255,255,0.35)' }}>Fjalëkalimi i ri</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'} required
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={lineStyle}
                    onFocus={e => e.target.style.borderBottomColor = '#00e676'}
                    onBlur={e => e.target.style.borderBottomColor = 'rgba(255,255,255,0.15)'}
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-xs"
                    style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {showPass ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              {/* Konfirmo */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-4"
                  style={{ color: 'rgba(255,255,255,0.35)' }}>Konfirmo fjalëkalimin</label>
                <input
                  type={showPass ? 'text' : 'password'} required
                  value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    ...lineStyle,
                    borderBottomColor: confirm && confirm !== password
                      ? 'rgba(248,113,113,0.6)'
                      : 'rgba(255,255,255,0.15)'
                  }}
                  onFocus={e => e.target.style.borderBottomColor = '#00e676'}
                  onBlur={e => e.target.style.borderBottomColor =
                    confirm && confirm !== password
                      ? 'rgba(248,113,113,0.6)'
                      : 'rgba(255,255,255,0.15)'
                  }
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-lg px-3 py-2.5 text-xs"
                  style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
                  <span className="flex-shrink-0 mt-0.5">⚠</span>
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" disabled={loading || !token}
                className="w-full py-3 rounded-xl text-sm font-bold tracking-wide transition"
                style={{ background: '#00e676', color: '#0f1117', opacity: loading || !token ? 0.7 : 1 }}>
                {loading ? 'Duke ruajtur...' : 'Ndrysho fjalëkalimin →'}
              </button>
            </form>

            <p className="text-center text-xs mt-6" style={{ color: 'rgba(255,255,255,0.3)' }}>
              <Link to="/login" className="font-semibold" style={{ color: '#00e676' }}>
                ← Kthehu te hyrja
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
