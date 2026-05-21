import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [role, setRole] = useState('applicant')
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', password: '', confirm_password: '',
    org_name: '', org_slug: '', nipt: '',  docFile: null,
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const validatePassword = (pwd) => {
    if (pwd.length < 8)               return 'Fjalëkalimi duhet të ketë të paktën 8 karaktere'
    if (!/[A-Z]/.test(pwd))           return 'Duhet të ketë të paktën 1 shkronjë të madhe'
    if (!/[0-9]/.test(pwd))           return 'Duhet të ketë të paktën 1 numër'
    if (!/[!@#$%^&*]/.test(pwd))      return 'Duhet të ketë të paktën 1 karakter special (!@#$%^&*)'
    return null
  }

  const parseError = (err) => {
    const detail = err.response?.data?.detail
    if (!detail) return 'Gabim gjatë regjistrimit'
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) return detail.map(d => d.msg || d.message || JSON.stringify(d)).join(', ')
    return 'Gabim gjatë regjistrimit'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (role === 'org') {
      if (!/^[a-z0-9-]+$/.test(form.org_slug)) {
        setError('Slug-u mund të përmbajë vetëm shkronja të vogla, numra dhe vizë (-)')
        return
      }
      if (form.org_slug.length < 3) {
        setError('Slug-u duhet të ketë të paktën 3 karaktere')
        return
      }
    }

    const pwdErr = validatePassword(form.password)
    if (pwdErr) { setError(pwdErr); return }

    if (form.password !== form.confirm_password) {
      setError('Fjalëkalimet nuk përputhen')
      return
    }

    setLoading(true)
    try {
      if (role === 'applicant') {
        const res = await api.post('/auth/register', {
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          password: form.password,
        })
        const { access_token, role: userRole } = res.data
        login(access_token, { role: userRole })
        navigate('/grants')
      } else {
        await api.post('/auth/register-org', {
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          password: form.password,
          org_name: form.org_name,
          org_slug: form.org_slug,
          nipt: form.nipt || null,
        })

        // Ngarko dokumentin nëse është zgjedhur
        if (form.docFile) {
          const fd = new FormData()
          fd.append('file', form.docFile)
          await api.post(`/auth/register-org/upload-doc?org_slug=${form.org_slug}`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        }

        setSuccess('Organizata u regjistrua me sukses! Super Admin do ta aprovojë llogarinë tuaj.')
      }
    } catch (err) {
      setError(parseError(err))
    } finally {
      setLoading(false)
    }
  }

  const inp = "w-full px-5 py-4 rounded-lg text-base text-white outline-none transition"
  const inpStyle = { background: 'var(--bg-card)', border: '1px solid var(--border)' }
  const focus = (e) => (e.target.style.borderColor = 'var(--accent)')
  const blur  = (e) => (e.target.style.borderColor = 'var(--border)')

  return (
    <div className="min-h-screen flex items-center justify-center py-12" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-lg px-6">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
            style={{ background: 'var(--accent-dim)', border: '2px solid var(--accent)' }}>
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
            {[
              { key: 'applicant', icon: 'A', label: 'Aplikant', sub: 'Apliko në grante' },
              { key: 'org',       icon: '🏛', label: 'Organizatë', sub: 'Publiko grante' },
            ].map(({ key, icon, label, sub }) => (
              <button key={key} type="button" onClick={() => { setRole(key); setError(''); setSuccess('') }}
                className="flex items-center gap-2 p-3 rounded-xl transition text-left"
                style={{
                  background: role === key ? 'var(--accent-dim)' : 'var(--bg-card)',
                  border: `1px solid ${role === key ? 'var(--accent)' : 'var(--border)'}`,
                }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: role === key ? 'var(--accent)' : 'var(--border)' }}>
                  <span className="text-sm font-semibold">{icon}</span>
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: role === key ? 'var(--accent)' : 'white' }}>{label}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</div>
                </div>
              </button>
            ))}
          </div>

          {error && (
            <div className="rounded-lg px-4 py-3 mb-4 text-sm"
              style={{ background: 'rgba(248,113,113,0.1)', color: 'var(--danger)', border: '1px solid rgba(248,113,113,0.2)' }}>
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg px-4 py-3 mb-4 text-sm"
              style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}>
              {success}
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Emri + Mbiemri — të dyja rolet */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Emri</label>
                  <input required value={form.first_name} onChange={set('first_name')}
                    placeholder="Emri" className={inp} style={inpStyle} onFocus={focus} onBlur={blur} />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Mbiemri</label>
                  <input required value={form.last_name} onChange={set('last_name')}
                    placeholder="Mbiemri" className={inp} style={inpStyle} onFocus={focus} onBlur={blur} />
                </div>
              </div>

              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Email</label>
                <input type="email" required value={form.email} onChange={set('email')}
                  placeholder="Shkruaj email-in" className={inp} style={inpStyle} onFocus={focus} onBlur={blur} />
              </div>

              {/* Fushat shtesë për organizatë */}
              {role === 'org' && (
                <>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Emri i organizatës</label>
                    <input required value={form.org_name} onChange={set('org_name')}
                      placeholder="p.sh. Universiteti i Prishtinës" className={inp} style={inpStyle} onFocus={focus} onBlur={blur} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Slug (ID unik)</label>
                    <input required value={form.org_slug}
                      onChange={e => setForm({ ...form, org_slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                      placeholder="p.sh. uni-prishtina" className={inp} style={inpStyle} onFocus={focus} onBlur={blur} />
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      Vetëm shkronja të vogla, numra dhe vizë (-)
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                      NIPT <span style={{ color: 'var(--text-muted)' }}>(Numri i Identifikimit për Personin Tatimor)</span>
                    </label>
                    <input value={form.nipt} onChange={set('nipt')}
                      placeholder="p.sh. K12345678A" className={inp} style={inpStyle} onFocus={focus} onBlur={blur} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Dokument verifikimi <span style={{ color: 'var(--text-muted)' }}>(opsional · PDF, JPG, PNG · max 5MB)</span>
                    </label>
                    <input
                      type="file" accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setForm({ ...form, docFile: e.target.files[0] || null })}
                      className="w-full px-4 py-3 rounded-lg text-sm text-white outline-none"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                    />
                    {form.docFile && (
                      <p className="text-xs mt-1" style={{ color: 'var(--accent)' }}>
                        ✓ {form.docFile.name}
                      </p>
                    )}
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Fjalëkalimi</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} required value={form.password}
                    onChange={set('password')} placeholder="Krijo fjalëkalimin"
                    className={`${inp} pr-10`} style={inpStyle} onFocus={focus} onBlur={blur} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {showPass ? '🙈' : '👁'}
                  </button>
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Min. 8 karaktere, 1 shkronjë e madhe, 1 numër, 1 karakter special (!@#$%^&*)
                </p>
              </div>

              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Konfirmo fjalëkalimin</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} required value={form.confirm_password}
                    onChange={set('confirm_password')} placeholder="Konfirmo fjalëkalimin"
                    className={`${inp} pr-10`} style={inpStyle} onFocus={focus} onBlur={blur} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {showPass ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-lg font-semibold text-base transition mt-2"
                style={{ background: 'var(--accent)', color: '#0f1117' }}>
                {loading ? 'Duke u regjistruar...' : role === 'applicant' ? 'Regjistrohu si aplikant' : 'Regjistro organizatën'}
              </button>
            </form>
          )}

          {success && (
            <button onClick={() => navigate('/login')}
              className="w-full py-4 rounded-lg font-semibold text-base transition mt-4"
              style={{ background: 'var(--accent)', color: '#0f1117' }}>
              Shko te login →
            </button>
          )}

          <p className="text-center text-sm mt-4" style={{ color: 'var(--text-secondary)' }}>
            Ke llogari?{' '}
            <Link to="/login" className="font-semibold" style={{ color: 'var(--accent)' }}>Kyçu</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
