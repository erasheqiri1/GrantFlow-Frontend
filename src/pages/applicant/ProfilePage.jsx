import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'

const ROLE_LABELS = {
  APPLICANT:    'Aplikant',
  ORG_ADMIN:    'Admin Organizate',
  COMMISSIONER: 'Komisioner',
  SUPER_ADMIN:  'Super Admin',
}

const APPLICANT_TYPES = [
  { value: 'STUDENT',      label: 'Student',          icon: '🎓' },
  { value: 'BUSINESS',     label: 'Biznes',            icon: '🏢' },
  { value: 'ORGANIZATION', label: 'Organizatë (OJQ)',  icon: '🤝' },
  { value: 'INDIVIDUAL',   label: 'Individual',        icon: '👤' },
  { value: 'OTHER',        label: 'Tjetër',            icon: '🔹' },
]

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [error, setError]       = useState('')
  const [form, setForm] = useState({
    first_name: '', last_name: '', phone: '', address: '',
    applicant_type: '',
    description: '',
    // STUDENT
    university: '', faculty: '', study_program: '', study_level: '', study_year: '',
    // BUSINESS
    business_name: '', business_type: '', activity_field: '', num_employees: '', founded_year: '',
    // ORGANIZATION
    org_name: '', org_type: '', org_field: '', num_staff: '', org_founded_year: '', reg_number: '',
    // INDIVIDUAL
    profession: '', experience_years: '', key_skills: '', portfolio_url: '',
    // OTHER
    role_title: '', interest_field: '', relevant_link: '',
  })

  useEffect(() => {
    api.get('/profile/me')
      .then(res => {
        const p = res.data
        setForm(prev => ({
          ...prev,
          first_name:      p.first_name      || '',
          last_name:       p.last_name       || '',
          phone:           p.phone           || '',
          address:         p.address         || '',
          applicant_type:  p.applicant_type  || '',
        }))
        // nëse ka fusha shtesë nga ApplicantProfile
        if (p.applicant_profile) {
          setForm(prev => ({ ...prev, ...p.applicant_profile }))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const f = (field) => ({
    value: form[field],
    onChange: e => { setForm(prev => ({ ...prev, [field]: e.target.value })); setSaved(false) },
  })

  const inp  = 'w-full px-4 py-2.5 rounded-lg text-sm text-white outline-none transition'
  const inpS = { background: 'var(--bg-card)', border: '1px solid var(--border)' }
  const focus = e => (e.target.style.borderColor = 'var(--accent)')
  const blur  = e => (e.target.style.borderColor = 'var(--border)')

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    setSaved(false)
    try {
      const payload = {
        first_name:     form.first_name     || undefined,
        last_name:      form.last_name      || undefined,
        phone:          form.phone          || undefined,
        address:        form.address        || undefined,
        applicant_type: form.applicant_type || undefined,
        description:    form.description    || undefined,
      }
      if (form.applicant_type === 'STUDENT') {
        Object.assign(payload, {
          university:    form.university    || undefined,
          faculty:       form.faculty       || undefined,
          study_program: form.study_program || undefined,
          study_level:   form.study_level   || undefined,
          study_year:    form.study_year ? Number(form.study_year) : undefined,
        })
      } else if (form.applicant_type === 'BUSINESS') {
        Object.assign(payload, {
          business_name:  form.business_name  || undefined,
          business_type:  form.business_type  || undefined,
          activity_field: form.activity_field || undefined,
          num_employees:  form.num_employees  || undefined,
          founded_year:   form.founded_year ? Number(form.founded_year) : undefined,
        })
      } else if (form.applicant_type === 'ORGANIZATION') {
        Object.assign(payload, {
          org_name:        form.org_name        || undefined,
          org_type:        form.org_type        || undefined,
          org_field:       form.org_field       || undefined,
          num_staff:       form.num_staff       || undefined,
          org_founded_year: form.org_founded_year ? Number(form.org_founded_year) : undefined,
          reg_number:      form.reg_number      || undefined,
        })
      } else if (form.applicant_type === 'INDIVIDUAL') {
        Object.assign(payload, {
          profession:       form.profession       || undefined,
          experience_years: form.experience_years || undefined,
          key_skills:       form.key_skills       || undefined,
          portfolio_url:    form.portfolio_url    || undefined,
        })
      } else if (form.applicant_type === 'OTHER') {
        Object.assign(payload, {
          role_title:    form.role_title    || undefined,
          interest_field: form.interest_field || undefined,
          relevant_link: form.relevant_link || undefined,
        })
      }
      await api.patch('/profile/me', payload)
      setSaved(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Gabim gjatë ruajtjes')
    } finally {
      setSaving(false)
    }
  }

  const initials = [form.first_name, form.last_name]
    .filter(Boolean).map(n => n[0]).join('').toUpperCase() || (user?.role?.[0] || 'U')

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Duke ngarkuar...</div>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-3 sticky top-0 z-10"
        style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-6">
          <div className="text-lg font-black">
            <span className="text-white">Grant</span><span style={{ color: 'var(--accent)' }}>Flow</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/grants" className="text-sm" style={{ color: 'var(--text-secondary)' }}>Grante</Link>
            <Link to="/my-applications" className="text-sm" style={{ color: 'var(--text-secondary)' }}>Aplikimet e mia</Link>
            <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>Profili</span>
          </div>
        </div>
        <button onClick={() => { logout(); navigate('/login') }}
          className="text-sm px-3 py-1.5 rounded-lg"
          style={{ color: 'var(--danger)', border: '1px solid rgba(248,113,113,0.25)' }}>
          Dil
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Avatar header */}
        <div className="rounded-2xl p-6 mb-4 flex items-center gap-5"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
            style={{ background: 'var(--accent)', color: '#0f1117' }}>
            {initials}
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">
              {[form.first_name, form.last_name].filter(Boolean).join(' ') || 'Profili im'}
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full mt-1 inline-block"
              style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
              {ROLE_LABELS[user?.role] || user?.role}
            </span>
            {!form.applicant_type && (
              <p className="text-xs mt-1" style={{ color: '#facc15' }}>
                ⚠️ Plotëso kategorinë për të aplikuar në grante
              </p>
            )}
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Informata bazë */}
          <div className="rounded-2xl p-6"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <h2 className="font-semibold text-white mb-4">Informata personale</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Emri</label>
                  <input {...f('first_name')} className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="Emri" />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Mbiemri</label>
                  <input {...f('last_name')} className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="Mbiemri" />
                </div>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Telefoni</label>
                <input {...f('phone')} className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="+383 44 000 000" />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Adresa</label>
                <input {...f('address')} className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="Qyteti, Shteti" />
              </div>
            </div>
          </div>

          {/* Kategoria — e detyrueshme */}
          <div className="rounded-2xl p-6"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <h2 className="font-semibold text-white mb-1">
              Kategoria e aplikantit
              <span className="ml-1" style={{ color: 'var(--danger)' }}>*</span>
            </h2>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              E nevojshme për të aplikuar në grante
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {APPLICANT_TYPES.map(t => (
                <button key={t.value} type="button"
                  onClick={() => { setForm(prev => ({ ...prev, applicant_type: t.value })); setSaved(false) }}
                  className="flex items-center gap-2 p-3 rounded-xl text-left transition"
                  style={{
                    background: form.applicant_type === t.value ? 'var(--accent-dim)' : 'var(--bg-card)',
                    border: `1px solid ${form.applicant_type === t.value ? 'var(--accent)' : 'var(--border)'}`,
                  }}>
                  <span>{t.icon}</span>
                  <span className="text-xs font-medium"
                    style={{ color: form.applicant_type === t.value ? 'var(--accent)' : 'var(--text-secondary)' }}>
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Fusha specifike sipas kategorisë */}
          {form.applicant_type === 'STUDENT' && (
            <div className="rounded-2xl p-6"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <h2 className="font-semibold text-white mb-4">🎓 Të dhënat akademike</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Universiteti</label>
                  <input {...f('university')} className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="p.sh. Universiteti i Prishtinës" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Fakulteti</label>
                    <input {...f('faculty')} className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="Fakulteti" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Programi</label>
                    <input {...f('study_program')} className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="Programi studimor" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Niveli</label>
                    <select {...f('study_level')} className={inp} style={inpS}>
                      <option value="">Zgjedh...</option>
                      <option value="Bachelor">Bachelor</option>
                      <option value="Master">Master</option>
                      <option value="PhD">PhD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Viti i studimeve</label>
                    <input type="number" min="1" max="6" {...f('study_year')} className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="1" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {form.applicant_type === 'BUSINESS' && (
            <div className="rounded-2xl p-6"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <h2 className="font-semibold text-white mb-4">🏢 Të dhënat e biznesit</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Emri i biznesit</label>
                  <input {...f('business_name')} className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="Emri i biznesit" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Tipi</label>
                    <input {...f('business_type')} className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="SH.P.K, SH.A..." />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Fusha e aktivitetit</label>
                    <input {...f('activity_field')} className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="Teknologji, Bujqësi..." />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Nr. punonjësve</label>
                    <input {...f('num_employees')} className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="p.sh. 10" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Viti i themelimit</label>
                    <input type="number" {...f('founded_year')} className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="2020" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {form.applicant_type === 'ORGANIZATION' && (
            <div className="rounded-2xl p-6"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <h2 className="font-semibold text-white mb-4">🤝 Të dhënat e organizatës</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Emri i organizatës</label>
                  <input {...f('org_name')} className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="Emri i OJQ-së" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Tipi</label>
                    <input {...f('org_type')} className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="OJQ, Fondacion..." />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Fusha</label>
                    <input {...f('org_field')} className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="Arsim, Shëndetësi..." />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Nr. stafit</label>
                    <input {...f('num_staff')} className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="p.sh. 5" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Nr. regjistrimit</label>
                    <input {...f('reg_number')} className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="Nr. i OJQ-së" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {form.applicant_type === 'INDIVIDUAL' && (
            <div className="rounded-2xl p-6"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <h2 className="font-semibold text-white mb-4">👤 Të dhënat profesionale</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Profesioni</label>
                    <input {...f('profession')} className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="Inxhinier, Mjek..." />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Vite eksperience</label>
                    <input {...f('experience_years')} className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="p.sh. 3" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Aftësitë kryesore</label>
                  <input {...f('key_skills')} className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="Python, Menaxhim, Dizajn..." />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Portfolio (URL)</label>
                  <input type="url" {...f('portfolio_url')} className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="https://..." />
                </div>
              </div>
            </div>
          )}

          {form.applicant_type === 'OTHER' && (
            <div className="rounded-2xl p-6"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <h2 className="font-semibold text-white mb-4">🔹 Informata shtesë</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Titulli / Roli</label>
                  <input {...f('role_title')} className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="p.sh. Kërkues" />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Fusha e interesimit</label>
                  <input {...f('interest_field')} className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="p.sh. Inovacion" />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Link relevant</label>
                  <input type="url" {...f('relevant_link')} className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="https://..." />
                </div>
              </div>
            </div>
          )}

          {/* Feedback */}
          {error && (
            <div className="rounded-lg px-4 py-3 text-sm"
              style={{ background: 'rgba(248,113,113,0.1)', color: 'var(--danger)', border: '1px solid rgba(248,113,113,0.2)' }}>
              {error}
            </div>
          )}
          {saved && (
            <div className="rounded-lg px-4 py-3 text-sm"
              style={{ background: 'rgba(74,222,128,0.1)', color: 'var(--accent)', border: '1px solid rgba(74,222,128,0.2)' }}>
              ✓ Profili u ruajt me sukses!
            </div>
          )}

          <button type="submit" disabled={saving}
            className="w-full py-3 rounded-xl font-semibold text-sm transition"
            style={{ background: saving ? 'var(--accent-dark)' : 'var(--accent)', color: '#0f1117' }}>
            {saving ? 'Duke ruajtur...' : 'Ruaj ndryshimet'}
          </button>
        </form>
      </div>
    </div>
  )
}
