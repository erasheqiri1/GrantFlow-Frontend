import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [role, setRole] = useState('applicant') // 'applicant' | 'org'
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', confirm_password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm_password) {
      setError('Fjalëkalimet nuk përputhen')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/register', {
        full_name: `${form.first_name} ${form.last_name}`.trim(),
        email: form.email,
        password: form.password,
      })
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.detail || 'Gabim gjatë regjistrimit')
    } finally {
      setLoading(false)
    }
  }

  const inp = "w-full px-5 py-4 rounded-lg text-base text-white outline-none transition"
  const inpStyle = { background: 'var(--bg-card)', border: '1px solid var(--border)' }

  return (
    <div className="min-h-screen flex items-center justify-center py-12" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-lg px-6">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2" style={{ background: 'var(--accent-dim)', border: '2px solid var(--accent)' }}>
            <span className="text-xl font-black" style={{ color: 'var(--accent)' }}>G</span>
          </div>
          <div className="text-xl font-black tracking-wide">
            <span className="text-white">GRANT</span><span style={{ color: 'var(--accent)' }}>FLOW</span>
          </div>
        </div>

        <div className="rounded-2xl p-8" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <h1 className="text-xl font-bold text-white text-center mb-1">Krijo llogarinë tënde</h1>
          <p className="text-center text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
            Zgjidhni rolin tuaj për të vazhduar me regjistrimin
          </p>

          {/* Role tabs */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button onClick={() => setRole('applicant')}
              className="flex items-center gap-2 p-3 rounded-xl transition text-left"
              style={{
                background: role === 'applicant' ? 'var(--accent-dim)' : 'var(--bg-card)',
                border: `1px solid ${role === 'applicant' ? 'var(--accent)' : 'var(--border)'}`,
              }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: role === 'applicant' ? 'var(--accent)' : 'var(--border)' }}>
                <span className="text-sm font-semibold">A</span>
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: role === 'applicant' ? 'var(--accent)' : 'white' }}>Aplikant</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Apliko në grante</div>
              </div>
            </button>

            <button onClick={() => setRole('org')}
              className="flex items-center gap-2 p-3 rounded-xl transition text-left"
              style={{
                background: role === 'org' ? 'var(--accent-dim)' : 'var(--bg-card)',
                border: `1px solid ${role === 'org' ? 'var(--accent)' : 'var(--border)'}`,
              }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: role === 'org' ? 'var(--accent)' : 'var(--border)' }}>
                <span className="text-sm">🏛</span>
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: role === 'org' ? 'var(--accent)' : 'white' }}>Organizatë</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Publiko grante</div>
              </div>
            </button>
          </div>

          {error && (
            <div className="rounded-lg px-4 py-3 mb-4 text-sm" style={{ background: 'rgba(248,113,113,0.1)', color: 'var(--danger)', border: '1px solid rgba(248,113,113,0.2)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {role === 'applicant' ? (
              <>
                {/* Llogaria e aplikantit */}
                <div className="text-xs font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                  <span>👤</span> Llogaria e aplikantit
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Emri</label>
                    <input required value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })}
                      placeholder="Shkruaj emrin" className={inp} style={inpStyle}
                      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Mbiemri</label>
                    <input required value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })}
                      placeholder="Shkruaj mbiemrin" className={inp} style={inpStyle}
                      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Email</label>
                  <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="Shkruaj email-in" className={inp} style={inpStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Fjalëkalimi</label>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} required value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      placeholder="Krijo fjalëkalimin" className={`${inp} pr-10`} style={inpStyle}
                      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {showPass ? '🙈' : '👁'}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Konfirmo fjalëkalimin</label>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} required value={form.confirm_password}
                      onChange={e => setForm({ ...form, confirm_password: e.target.value })}
                      placeholder="Konfirmo fjalëkalimin" className={`${inp} pr-10`} style={inpStyle}
                      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {showPass ? '🙈' : '👁'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-xl p-4 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="text-3xl mb-2">🏛</div>
                <p className="text-sm font-medium text-white mb-1">Regjistro organizatën</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Plotëso formularin e organizatës — pas regjistrimit Super Admin e aprovon llogarinë tuaj.
                </p>
              </div>
            )}

            {role === 'applicant' && (
              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-lg font-semibold text-base transition mt-2"
                style={{ background: 'var(--accent)', color: '#0f1117' }}>
                {loading ? 'Duke u regjistruar...' : 'Regjistrohu si aplikant'}
              </button>
            )}
            {role === 'org' && (
              <button type="button"
                className="w-full py-4 rounded-lg font-semibold text-base transition"
                style={{ background: 'var(--accent)', color: '#0f1117' }}
                onClick={() => navigate('/register/org')}>
                Vazhdo regjistrimin →
              </button>
            )}
          </form>

          <p className="text-center text-sm mt-4" style={{ color: 'var(--text-secondary)' }}>
            Ke llogari?{' '}
            <Link to="/login" className="font-semibold" style={{ color: 'var(--accent)' }}>Kyçu</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
