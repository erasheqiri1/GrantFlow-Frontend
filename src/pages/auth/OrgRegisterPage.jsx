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
  const [docFile, setDocFile] = useState(null)
  const [logoFile, setLogoFile] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const inp = 'w-full px-4 py-2.5 rounded-lg text-sm text-white outline-none transition'
  const inpStyle = { background: 'var(--bg-card)', border: '1px solid var(--border)' }
  const focusAccent = (e) => (e.target.style.borderColor = 'var(--accent)')
  const blurBorder = (e) => (e.target.style.borderColor = 'var(--border)')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm_password) {
      setError('Fjalëkalimet nuk përputhen')
      return
    }
    if (docFile && docFile.size > 10 * 1024 * 1024) {
      setError('Dokumenti nuk mund të jetë më i madh se 10MB')
      return
    }
    if (logoFile && logoFile.size > 2 * 1024 * 1024) {
      setError('Logoja nuk mund të jetë më e madhe se 2MB')
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
        nipt:       form.nipt || undefined,
      })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Gabim gjatë regjistrimit')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center max-w-md px-4">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-white mb-2">Kërkesa u dërgua!</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            Organizata juaj është regjistruar dhe pret aprovimin nga Super Admin.
            Do të njoftoheni me email kur llogaria të aktivizohet.
          </p>
          <Link to="/login" className="font-semibold" style={{ color: 'var(--accent)' }}>
            Kthehu te kyçja →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-10" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-lg px-4">
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
          <h1 className="text-xl font-bold text-white text-center mb-1">Regjistro organizatën</h1>
          <p className="text-center text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            Pas regjistrimit, Super Admin do ta aprovojë llogarinë tuaj
          </p>

          {error && (
            <div className="rounded-lg px-4 py-3 mb-4 text-sm"
              style={{ background: 'rgba(248,113,113,0.1)', color: 'var(--danger)', border: '1px solid rgba(248,113,113,0.2)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Organizata */}
            <p className="text-xs font-semibold flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
              🏛 Informata e organizatës
            </p>

            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Emri i institucionit *</label>
              <input required value={form.institution_name}
                onChange={e => setForm({ ...form, institution_name: e.target.value })}
                placeholder="p.sh. Universiteti i Prishtinës"
                className={inp} style={inpStyle}
                onFocus={focusAccent} onBlur={blurBorder} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Email institucional *</label>
                <input type="email" required value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@uni-pr.edu"
                  className={inp} style={inpStyle}
                  onFocus={focusAccent} onBlur={blurBorder} />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>NIPT *</label>
                <input required value={form.nipt}
                  onChange={e => setForm({ ...form, nipt: e.target.value })}
                  placeholder="K12345678A"
                  className={inp} style={inpStyle}
                  onFocus={focusAccent} onBlur={blurBorder} />
              </div>
            </div>

            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                Identifikuesi URL (slug) *
              </label>
              <div className="flex items-center rounded-lg overflow-hidden"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <span className="px-3 py-2.5 text-xs whitespace-nowrap"
                  style={{ color: 'var(--text-muted)', borderRight: '1px solid var(--border)' }}>
                  grantflow.com/
                </span>
                <input required value={form.slug}
                  onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  placeholder="uni-prishtina"
                  className="flex-1 px-3 py-2.5 text-sm text-white outline-none bg-transparent" />
              </div>
            </div>

            {/* Administratori */}
            <p className="text-xs font-semibold flex items-center gap-2 pt-2" style={{ color: 'var(--text-muted)' }}>
              👤 Administratori kryesor
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Emri *</label>
                <input required value={form.admin_first_name}
                  onChange={e => setForm({ ...form, admin_first_name: e.target.value })}
                  placeholder="Emri" className={inp} style={inpStyle}
                  onFocus={focusAccent} onBlur={blurBorder} />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Mbiemri *</label>
                <input required value={form.admin_last_name}
                  onChange={e => setForm({ ...form, admin_last_name: e.target.value })}
                  placeholder="Mbiemri" className={inp} style={inpStyle}
                  onFocus={focusAccent} onBlur={blurBorder} />
              </div>
            </div>

            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Fjalëkalimi *</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} required value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Krijo fjalëkalimin"
                  className={`${inp} pr-10`} style={inpStyle}
                  onFocus={focusAccent} onBlur={blurBorder} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                  style={{ color: 'var(--text-muted)' }}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Konfirmo fjalëkalimin *</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} required value={form.confirm_password}
                  onChange={e => setForm({ ...form, confirm_password: e.target.value })}
                  placeholder="Konfirmo fjalëkalimin"
                  className={`${inp} pr-10`} style={inpStyle}
                  onFocus={focusAccent} onBlur={blurBorder} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                  style={{ color: 'var(--text-muted)' }}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Dokumentet */}
            <p className="text-xs font-semibold flex items-center gap-2 pt-2" style={{ color: 'var(--text-muted)' }}>
              📄 Dokumentet
            </p>

            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                Dokument regjistrimi (PDF, maks. 10MB)
              </label>
              <div className="rounded-lg px-3 py-2" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <input type="file" accept=".pdf"
                  onChange={e => setDocFile(e.target.files[0] || null)}
                  className="w-full text-sm"
                  style={{ color: 'var(--text-secondary)' }} />
              </div>
            </div>

            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                Logo e organizatës (PNG/JPG, maks. 2MB)
              </label>
              <div className="rounded-lg px-3 py-2" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <input type="file" accept=".png,.jpg,.jpeg"
                  onChange={e => setLogoFile(e.target.files[0] || null)}
                  className="w-full text-sm"
                  style={{ color: 'var(--text-secondary)' }} />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-sm transition mt-2"
              style={{ background: loading ? 'var(--accent-dark)' : 'var(--accent)', color: '#0f1117' }}>
              {loading ? 'Duke dërguar...' : 'Dërgo kërkesën →'}
            </button>
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
