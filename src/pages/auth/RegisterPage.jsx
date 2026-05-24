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
    org_name: '', org_slug: '', nipt: '', docFile: null,
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const validatePassword = (pwd) => {
    if (pwd.length < 8)          return 'Fjalëkalimi duhet të ketë të paktën 8 karaktere'
    if (!/[A-Z]/.test(pwd))      return 'Duhet të ketë të paktën 1 shkronjë të madhe'
    if (!/[0-9]/.test(pwd))      return 'Duhet të ketë të paktën 1 numër'
    if (!/[!@#$%^&*]/.test(pwd)) return 'Duhet të ketë të paktën 1 karakter special (!@#$%^&*)'
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
        await api.post('/auth/register', {
          first_name: form.first_name,
          last_name:  form.last_name,
          email:      form.email,
          password:   form.password,
        })
        setSuccess('Ju kemi dërguar email konfirmimi. Kontrollo emailin tënd dhe kliko linkun për të vazhduar.')
      } else {
        await api.post('/auth/register-org', {
          first_name: form.first_name,
          last_name:  form.last_name,
          email:      form.email,
          password:   form.password,
          org_name:   form.org_name,
          org_slug:   form.org_slug,
          nipt:       form.nipt || null,
        })

        if (form.docFile) {
          const fd = new FormData()
          fd.append('file', form.docFile)
          await api.post(`/auth/register-org/upload-doc?org_slug=${form.org_slug}`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        }

        setSuccess('Ju kemi dërguar email konfirmimi. Kontrollo emailin tënd dhe kliko linkun për të vazhduar.')
      }
    } catch (err) {
      setError(parseError(err))
    } finally {
      setLoading(false)
    }
  }

  /* ── Shared input helpers ── */
  const inputBase = "auth-input w-full pl-11 pr-4 py-3.5 rounded-xl text-sm text-white outline-none transition-all duration-200"
  const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }
  const onFocus = e => { e.target.style.borderColor = 'rgba(0,230,118,0.5)'; e.target.style.background = 'rgba(0,230,118,0.03)' }
  const onBlur  = e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.05)' }

  const FieldLabel = ({ children }) => (
    <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
      style={{ color: 'rgba(255,255,255,0.35)' }}>
      {children}
    </label>
  )

  const ShowHideBtn = ({ shown, toggle }) => (
    <button type="button" onClick={toggle}
      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase tracking-wider transition"
      style={{ color: 'rgba(255,255,255,0.3)' }}
      onMouseEnter={e => e.target.style.color = '#00e676'}
      onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.3)'}>
      {shown ? 'Fshih' : 'Shfaq'}
    </button>
  )

  return (
    <div className="auth-page min-h-screen flex items-center justify-center py-12 px-4" style={{ background: '#0a0d14' }}>
      <div className="auth-register-wrap w-full max-w-lg">

        {/* Logo */}
        <div className="auth-logo flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(0,230,118,0.15)', border: '1px solid rgba(0,230,118,0.3)' }}>
            <span className="text-lg font-black" style={{ color: '#00e676' }}>G</span>
          </div>
          <span className="text-xl font-black tracking-wider text-white">
            GRANT<span style={{ color: '#00e676' }}>FLOW</span>
          </span>
        </div>

        {/* Card */}
        <div className="auth-card rounded-2xl p-8"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>

          <div className="auth-card-heading mb-6 text-center">
            <h1 className="text-2xl font-black text-white mb-2">Krijo llogarinë</h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Zgjidhni llojin e llogarisë për të filluar
            </p>
          </div>

          {/* Role tabs */}
          <div className="auth-role-tabs grid grid-cols-2 gap-3 mb-6">
            {[
              { key: 'applicant', icon: '', label: 'Aplikant',   sub: 'Apliko në grante' },
              { key: 'org',       icon: '', label: 'Organizatë', sub: 'Publiko grante'   },
            ].map(({ key, icon, label, sub }) => (
              <button key={key} type="button"
                onClick={() => { setRole(key); setError(''); setSuccess('') }}
                className="auth-role-tab flex items-center gap-3 p-4 rounded-xl transition-all duration-200 text-left"
                data-active={role === key}
                style={{
                  background: role === key ? 'rgba(0,230,118,0.08)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${role === key ? 'rgba(0,230,118,0.4)' : 'rgba(255,255,255,0.08)'}`,
                }}>
                {icon && <span className="text-xl flex-shrink-0">{icon}</span>}
                <div>
                  <div className="text-sm font-bold"
                    style={{ color: role === key ? '#00e676' : 'white' }}>{label}</div>
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{sub}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Alerts */}
          {error && (
            <div className="flex items-start gap-3 rounded-xl px-4 py-3 mb-5 text-sm"
              style={{ background: 'rgba(248,113,113,0.08)', color: '#f87171', border: '1px solid rgba(248,113,113,0.15)' }}>
              <span className="mt-0.5 flex-shrink-0">⚠</span>
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-3 rounded-xl px-4 py-3 mb-5 text-sm"
              style={{ background: 'rgba(0,230,118,0.08)', color: '#00e676', border: '1px solid rgba(0,230,118,0.2)' }}>
              <span className="mt-0.5 flex-shrink-0">✓</span>
              <span>{success}</span>
            </div>
          )}

          {!success ? (
            <form onSubmit={handleSubmit} className="auth-form space-y-5">

              {/* Emri + Mbiemri */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Emri</FieldLabel>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold"
                      style={{ color: 'rgba(255,255,255,0.2)' }}>A</span>
                    <input required value={form.first_name} onChange={set('first_name')}
                      placeholder="Emri" className={inputBase} style={{ ...inputStyle }}
                      onFocus={onFocus} onBlur={onBlur} />
                  </div>
                </div>
                <div>
                  <FieldLabel>Mbiemri</FieldLabel>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold"
                      style={{ color: 'rgba(255,255,255,0.2)' }}>A</span>
                    <input required value={form.last_name} onChange={set('last_name')}
                      placeholder="Mbiemri" className={inputBase} style={{ ...inputStyle }}
                      onFocus={onFocus} onBlur={onBlur} />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <FieldLabel>Email</FieldLabel>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base"
                    style={{ color: 'rgba(255,255,255,0.2)' }}>✉</span>
                  <input type="email" required value={form.email} onChange={set('email')}
                    placeholder="emri@shembull.com" className={inputBase} style={{ ...inputStyle }}
                    onFocus={onFocus} onBlur={onBlur} />
                </div>
              </div>

              {/* Organizatë — fushat shtesë */}
              {role === 'org' && (
                <>
                  {/* Divider */}
                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    <span className="text-xs font-semibold uppercase tracking-widest"
                      style={{ color: 'rgba(255,255,255,0.2)' }}>Organizata</span>
                    <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  </div>

                  <div>
                    <FieldLabel>Emri i organizatës</FieldLabel>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base"
                        style={{ color: 'rgba(255,255,255,0.2)' }}>🏢</span>
                      <input required value={form.org_name} onChange={set('org_name')}
                        placeholder="p.sh. Universiteti i Prishtinës"
                        className={inputBase} style={{ ...inputStyle }}
                        onFocus={onFocus} onBlur={onBlur} />
                    </div>
                  </div>

                  <div>
                    <FieldLabel>Slug (ID unik)</FieldLabel>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-black"
                        style={{ color: 'rgba(255,255,255,0.2)' }}>#</span>
                      <input required value={form.org_slug}
                        onChange={e => setForm({ ...form, org_slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                        placeholder="uni-prishtina"
                        className={inputBase} style={{ ...inputStyle }}
                        onFocus={onFocus} onBlur={onBlur} />
                    </div>
                    <p className="text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
                      Vetëm shkronja të vogla, numra dhe vizë (-)
                    </p>
                  </div>

                  <div>
                    <FieldLabel>NIPT (opsional)</FieldLabel>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base"
                        style={{ color: 'rgba(255,255,255,0.2)' }}>🪪</span>
                      <input value={form.nipt} onChange={set('nipt')}
                        placeholder="p.sh. K12345678A"
                        className={inputBase} style={{ ...inputStyle }}
                        onFocus={onFocus} onBlur={onBlur} />
                    </div>
                  </div>

                  <div>
                    <FieldLabel>Dokument verifikimi (opsional)</FieldLabel>
                    <div className="rounded-xl px-4 py-3"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setForm({ ...form, docFile: e.target.files[0] || null })}
                        className="w-full text-sm" style={{ color: 'rgba(255,255,255,0.4)' }} />
                    </div>
                    {form.docFile && (
                      <p className="text-xs mt-1.5 flex items-center gap-1.5" style={{ color: '#00e676' }}>
                        <span>✓</span> {form.docFile.name}
                      </p>
                    )}
                    <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                      PDF, JPG, PNG · max 5 MB
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    <span className="text-xs font-semibold uppercase tracking-widest"
                      style={{ color: 'rgba(255,255,255,0.2)' }}>Siguria</span>
                    <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  </div>
                </>
              )}

              {/* Fjalëkalimi */}
              <div>
                <FieldLabel>Fjalëkalimi</FieldLabel>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base"
                    style={{ color: 'rgba(255,255,255,0.2)' }}>🔒</span>
                  <input type={showPass ? 'text' : 'password'} required value={form.password}
                    onChange={set('password')} placeholder="Krijo fjalëkalimin"
                    className={`${inputBase} pr-16`} style={{ ...inputStyle }}
                    onFocus={onFocus} onBlur={onBlur} />
                  <ShowHideBtn shown={showPass} toggle={() => setShowPass(v => !v)} />
                </div>
                <p className="text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  Min. 8 karaktere · 1 shkronjë e madhe · 1 numër · 1 karakter special
                </p>
              </div>

              {/* Konfirmo */}
              <div>
                <FieldLabel>Konfirmo fjalëkalimin</FieldLabel>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base"
                    style={{ color: 'rgba(255,255,255,0.2)' }}>🔒</span>
                  <input type={showConfirmPass ? 'text' : 'password'} required value={form.confirm_password}
                    onChange={set('confirm_password')} placeholder="Konfirmo fjalëkalimin"
                    className={`${inputBase} pr-16`} style={{ ...inputStyle }}
                    onFocus={onFocus} onBlur={onBlur} />
                  <ShowHideBtn shown={showConfirmPass} toggle={() => setShowConfirmPass(v => !v)} />
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="auth-submit w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 mt-2"
                style={{
                  background: loading ? 'rgba(0,230,118,0.4)' : '#00e676',
                  color: '#0a0d14',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 0 20px rgba(0,230,118,0.25)',
                }}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Duke u regjistruar...
                  </span>
                ) : role === 'applicant' ? 'Regjistrohu si aplikant →' : 'Regjistro organizatën →'}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-3">
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Pas konfirmimit të emailit, kërkesa shqyrtohet nga Super Admin.
              </p>
              <button onClick={() => navigate('/login')}
                className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wide"
                style={{ background: '#00e676', color: '#0a0d14', boxShadow: '0 0 20px rgba(0,230,118,0.25)' }}>
                Shko te kyçja →
              </button>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>ose</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>

          <p className="text-center text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Ke llogari?{' '}
            <Link to="/login" className="font-semibold transition-colors" style={{ color: '#00e676' }}>
              Kyçu tani
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
