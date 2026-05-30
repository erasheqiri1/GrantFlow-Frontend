import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'

export default function OrgRegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    institution_name: '',
    email: '',
    nipt: '',
    slug: '',
    admin_first_name: '',
    admin_last_name: '',
    password: '',
    confirm_password: '',
  })
  const [docFile,  setDocFile]  = useState(null)
  const [logoFile, setLogoFile] = useState(null)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.nipt.trim()) {
      setError('NIPT është i detyrueshëm.')
      return
    }
    if (!docFile) {
      setError('Dokumenti i regjistrimit është i detyrueshëm.')
      return
    }
    if (form.password !== form.confirm_password) {
      setError('Fjalëkalimet nuk përputhen')
      return
    }
    if (docFile.size > 10 * 1024 * 1024) {
      setError('Dokumenti nuk mund të jetë më i madh se 10 MB')
      return
    }
    if (logoFile && logoFile.size > 2 * 1024 * 1024) {
      setError('Logoja nuk mund të jetë më e madhe se 2 MB')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/register-org', {
        org_name:   form.institution_name,
        org_slug:   form.slug,
        email:      form.email,
        password:   form.password,
        first_name: form.admin_first_name,
        last_name:  form.admin_last_name,
        nipt:       form.nipt,
      })


      const fd = new FormData()
      fd.append('file', docFile)
      await api.post(`/auth/register-org/upload-doc?org_slug=${form.slug}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Gabim gjatë regjistrimit')
    } finally {
      setLoading(false)
    }
  }


  const inputBase  = "w-full pl-11 pr-4 py-3.5 rounded-xl text-sm text-white outline-none transition-all duration-200"
  const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }
  const onFocus    = e => { e.target.style.borderColor = 'rgba(0,230,118,0.5)'; e.target.style.background = 'rgba(0,230,118,0.03)' }
  const onBlur     = e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.05)' }

  const FieldLabel = ({ children }) => (
    <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
      style={{ color: 'rgba(255,255,255,0.35)' }}>
      {children}
    </label>
  )

  const SectionDivider = ({ label }) => (
    <div className="flex items-center gap-3 pt-1">
      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
      <span className="text-xs font-semibold uppercase tracking-widest"
        style={{ color: 'rgba(255,255,255,0.2)' }}>{label}</span>
      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
    </div>
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


  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0a0d14' }}>
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.3)' }}>
            <span className="text-4xl">✅</span>
          </div>
          <h2 className="text-2xl font-black text-white mb-3">Konfirmo emailin tënd!</h2>
          <p className="text-sm leading-relaxed mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Ju kemi dërguar një email konfirmimi. Hape emailin dhe kliko linkun për të vazhduar.
          </p>
          <p className="text-xs leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Pas konfirmimit, kërkesa do të shqyrtohet nga Super Admin dhe do të njoftoheni me email.
          </p>
          <Link to="/login"
            className="inline-block py-3.5 px-8 rounded-xl font-bold text-sm tracking-wide"
            style={{ background: '#00e676', color: '#0a0d14', boxShadow: '0 0 20px rgba(0,230,118,0.25)' }}>
            Kthehu te kyçja →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4" style={{ background: '#0a0d14' }}>
      <div className="w-full max-w-lg">

        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(0,230,118,0.15)', border: '1px solid rgba(0,230,118,0.3)' }}>
            <span className="text-lg font-black" style={{ color: '#00e676' }}>G</span>
          </div>
          <span className="text-xl font-black tracking-wider text-white">
            GRANT<span style={{ color: '#00e676' }}>FLOW</span>
          </span>
        </div>

        <div className="rounded-2xl p-8"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.2)' }}>
              <span className="text-xl">🏛</span>
            </div>
            <div>
              <h1 className="text-xl font-black text-white">Regjistro organizatën</h1>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Pas aprovimit nga Super Admin do të keni akses të plotë
              </p>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-xl px-4 py-3 mb-5 text-sm"
              style={{ background: 'rgba(248,113,113,0.08)', color: '#f87171', border: '1px solid rgba(248,113,113,0.15)' }}>
              <span className="mt-0.5 flex-shrink-0">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <SectionDivider label="Informata e organizatës" />

            <div>
              <FieldLabel>Emri i institucionit</FieldLabel>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base"
                  style={{ color: 'rgba(255,255,255,0.2)' }}>🏢</span>
                <input required value={form.institution_name}
                  onChange={e => setForm({ ...form, institution_name: e.target.value })}
                  placeholder="p.sh. Universiteti i Prishtinës"
                  className={inputBase} style={{ ...inputStyle }}
                  onFocus={onFocus} onBlur={onBlur} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Email institucional</FieldLabel>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base"
                    style={{ color: 'rgba(255,255,255,0.2)' }}>✉</span>
                  <input type="email" required value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="admin@uni-pr.edu"
                    className={inputBase} style={{ ...inputStyle }}
                    onFocus={onFocus} onBlur={onBlur} />
                </div>
              </div>
              <div>
                <FieldLabel>NIPT *</FieldLabel>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base"
                    style={{ color: 'rgba(255,255,255,0.2)' }}>🪪</span>
                  <input required value={form.nipt}
                    onChange={e => setForm({ ...form, nipt: e.target.value })}
                    placeholder="K12345678A"
                    className={inputBase} style={{ ...inputStyle }}
                    onFocus={onFocus} onBlur={onBlur} />
                </div>
              </div>
            </div>

            <div>
              <FieldLabel>Identifikuesi URL (slug)</FieldLabel>
              <div className="flex rounded-xl overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                onFocusCapture={e => { e.currentTarget.style.borderColor = 'rgba(0,230,118,0.5)'; e.currentTarget.style.background = 'rgba(0,230,118,0.03)' }}
                onBlurCapture={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}>
                <span className="px-3 flex items-center text-xs whitespace-nowrap"
                  style={{ color: 'rgba(255,255,255,0.25)', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
                  grantflow.com/
                </span>
                <input required value={form.slug}
                  onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  placeholder="uni-prishtina"
                  className="flex-1 px-4 py-3.5 text-sm text-white outline-none bg-transparent" />
              </div>
            </div>

            <SectionDivider label="Administratori kryesor" />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Emri</FieldLabel>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold"
                    style={{ color: 'rgba(255,255,255,0.2)' }}>A</span>
                  <input required value={form.admin_first_name}
                    onChange={e => setForm({ ...form, admin_first_name: e.target.value })}
                    placeholder="Emri" className={inputBase} style={{ ...inputStyle }}
                    onFocus={onFocus} onBlur={onBlur} />
                </div>
              </div>
              <div>
                <FieldLabel>Mbiemri</FieldLabel>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold"
                    style={{ color: 'rgba(255,255,255,0.2)' }}>A</span>
                  <input required value={form.admin_last_name}
                    onChange={e => setForm({ ...form, admin_last_name: e.target.value })}
                    placeholder="Mbiemri" className={inputBase} style={{ ...inputStyle }}
                    onFocus={onFocus} onBlur={onBlur} />
                </div>
              </div>
            </div>

            <SectionDivider label="Siguria" />

            <div>
              <FieldLabel>Fjalëkalimi</FieldLabel>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base"
                  style={{ color: 'rgba(255,255,255,0.2)' }}>🔒</span>
                <input type={showPass ? 'text' : 'password'} required value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Krijo fjalëkalimin"
                  className={`${inputBase} pr-16`} style={{ ...inputStyle }}
                  onFocus={onFocus} onBlur={onBlur} />
                <ShowHideBtn shown={showPass} toggle={() => setShowPass(v => !v)} />
              </div>
            </div>

            <div>
              <FieldLabel>Konfirmo fjalëkalimin</FieldLabel>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base"
                  style={{ color: 'rgba(255,255,255,0.2)' }}>🔒</span>
                <input type={showConfirmPass ? 'text' : 'password'} required value={form.confirm_password}
                  onChange={e => setForm({ ...form, confirm_password: e.target.value })}
                  placeholder="Konfirmo fjalëkalimin"
                  className={`${inputBase} pr-16`} style={{ ...inputStyle }}
                  onFocus={onFocus} onBlur={onBlur} />
                <ShowHideBtn shown={showConfirmPass} toggle={() => setShowConfirmPass(v => !v)} />
              </div>
            </div>

            <SectionDivider label="Dokumentet" />

            <div>
              <FieldLabel>Dokument verifikimi * <span style={{ color: 'rgba(255,100,100,0.8)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(certifikatë biznesi, ekstrakt, etj.)</span></FieldLabel>
              <div className="rounded-xl px-4 py-3"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: docFile ? '1px solid rgba(0,230,118,0.4)' : '1px solid rgba(248,113,113,0.3)',
                }}>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png"
                  onChange={e => setDocFile(e.target.files[0] || null)}
                  className="w-full text-sm" style={{ color: 'rgba(255,255,255,0.4)' }} />
              </div>
              {docFile ? (
                <p className="text-xs mt-1.5 flex items-center gap-1.5" style={{ color: '#00e676' }}>
                  <span>✓</span> {docFile.name} ({(docFile.size / 1024).toFixed(0)} KB)
                </p>
              ) : (
                <p className="text-xs mt-1" style={{ color: 'rgba(248,113,113,0.7)' }}>
                  ⚠ I detyrueshëm — PDF, JPG, PNG · max 10 MB
                </p>
              )}
            </div>

            <div>
              <FieldLabel>Logo e organizatës (opsional)</FieldLabel>
              <div className="rounded-xl px-4 py-3"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <input type="file" accept=".png,.jpg,.jpeg"
                  onChange={e => setLogoFile(e.target.files[0] || null)}
                  className="w-full text-sm" style={{ color: 'rgba(255,255,255,0.4)' }} />
              </div>
              {logoFile && (
                <p className="text-xs mt-1.5 flex items-center gap-1.5" style={{ color: '#00e676' }}>
                  <span>✓</span> {logoFile.name}
                </p>
              )}
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>PNG, JPG · max 2 MB</p>
            </div>

            <button type="submit" disabled={loading || !docFile}
              className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 mt-2"
              style={{
                background: (loading || !docFile) ? 'rgba(255,255,255,0.07)' : '#00e676',
                color: (loading || !docFile) ? 'rgba(255,255,255,0.3)' : '#0a0d14',
                cursor: (loading || !docFile) ? 'not-allowed' : 'pointer',
                boxShadow: (loading || !docFile) ? 'none' : '0 0 20px rgba(0,230,118,0.25)',
              }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Duke dërguar...
                </span>
              ) : !docFile ? 'Ngarko dokumentin për të vazhduar' : 'Dërgo kërkesën →'}
            </button>
          </form>

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
