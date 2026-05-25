import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  const lineStyle = {
    width: '100%', background: 'transparent', border: 'none',
    borderBottom: '1px solid rgba(255,255,255,0.15)',
    color: '#fff', fontSize: '15px', padding: '8px 0', outline: 'none',
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email }, { skipAuthRedirect: true })
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Ndodhi një gabim. Provo përsëri.')
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

        {sent ? (
          <div className="text-center space-y-4">
            <div className="text-4xl">📧</div>
            <h2 className="text-xl font-bold text-white">Kontrollo emailin</h2>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Nëse adresa <strong style={{ color: '#fff' }}>{email}</strong> ekziston,
              do të marrësh një link për rivendosjen e fjalëkalimit.
            </p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Linku skadon pas 1 ore.
            </p>
            <Link to="/login"
              className="inline-block mt-4 text-sm font-semibold"
              style={{ color: '#00e676' }}>
              ← Kthehu te hyrja
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-white mb-1">Harruat fjalëkalimin?</h1>
            <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Shkruani emailin tuaj dhe do t'ju dërgojmë udhëzime.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-4"
                  style={{ color: 'rgba(255,255,255,0.35)' }}>Email</label>
                <input
                  type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="emri@shembull.com"
                  style={lineStyle}
                  onFocus={e => e.target.style.borderBottomColor = '#00e676'}
                  onBlur={e => e.target.style.borderBottomColor = 'rgba(255,255,255,0.15)'}
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-lg px-3 py-2.5 text-xs"
                  style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
                  <span className="flex-shrink-0 mt-0.5">⚠</span>
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-bold tracking-wide transition"
                style={{ background: '#00e676', color: '#0f1117', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Duke dërguar...' : 'Dërgo linkun →'}
              </button>
            </form>

            <p className="text-center text-xs mt-6" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Kujtohet fjalëkalimi?{' '}
              <Link to="/login" className="font-semibold" style={{ color: '#00e676' }}>
                Hyr
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
