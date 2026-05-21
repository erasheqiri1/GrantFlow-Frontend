import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

const ROLE_LABELS = {
  APPLICANT:    'Aplikant',
  ORG_ADMIN:    'Admin Organizate',
  COMMISSIONER: 'Komisioner',
  SUPER_ADMIN:  'Super Admin',
}

const APPLICANT_TYPES = [
  { value: 'STUDENT',      label: 'Student',         icon: '' },
  { value: 'BUSINESS',     label: 'Biznes',           icon: '' },
  { value: 'ORGANIZATION', label: 'Organizatë (OJQ)', icon: '' },
  { value: 'INDIVIDUAL',   label: 'Individual',       icon: '' },
  { value: 'OTHER',        label: 'Tjetër',           icon: '' },
]

const TYPE_LABEL = Object.fromEntries(APPLICANT_TYPES.map(t => [t.value, `${t.icon ? t.icon + ' ' : ''}${t.label}`]))

const EMPTY_FORM = {
  first_name: '', last_name: '', phone: '', address: '', applicant_type: '', description: '',
  university: '', faculty: '', study_program: '', study_level: '', study_year: '',
  business_name: '', business_type: '', activity_field: '', num_employees: '', founded_year: '',
  org_name: '', org_type: '', org_field: '', num_staff: '', org_founded_year: '', reg_number: '',
  profession: '', experience_years: '', key_skills: '', portfolio_url: '',
  role_title: '', interest_field: '', relevant_link: '',
}

function fromApi(p) {
  return {
    first_name:      p.first_name       || '',
    last_name:       p.last_name        || '',
    phone:           p.phone            || '',
    address:         p.address          || '',
    applicant_type:  p.applicant_type   || '',
    description:     p.description      || '',
    university:      p.university       || '',
    faculty:         p.faculty          || '',
    study_program:   p.study_program    || '',
    study_level:     p.study_level      || '',
    study_year:      p.study_year       ?? '',
    business_name:   p.business_name    || '',
    business_type:   p.business_type    || '',
    activity_field:  p.activity_field   || '',
    num_employees:   p.num_employees    || '',
    founded_year:    p.founded_year     ?? '',
    org_name:        p.org_name         || '',
    org_type:        p.org_type         || '',
    org_field:       p.org_field        || '',
    num_staff:       p.num_staff        || '',
    org_founded_year: p.org_founded_year ?? '',
    reg_number:      p.reg_number       || '',
    profession:      p.profession       || '',
    experience_years: p.experience_years || '',
    key_skills:      p.key_skills       || '',
    portfolio_url:   p.portfolio_url    || '',
    role_title:      p.role_title       || '',
    interest_field:  p.interest_field   || '',
    relevant_link:   p.relevant_link    || '',
  }
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')
  const [profile, setProfile] = useState(null)   // të dhënat e saved
  const [form,    setForm]    = useState(EMPTY_FORM) // forma e editimit

  useEffect(() => {
    api.get('/profile/me')
      .then(res => {
        setProfile(res.data)
        setForm(fromApi(res.data))
        // nëse profili është i pa plotë, hap direkt editimin
        if (!res.data.applicant_type) setEditing(true)
      })
      .catch(() => setEditing(true))
      .finally(() => setLoading(false))
  }, [])

  const set = field => e => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleEdit = () => {
    setForm(fromApi(profile))
    setError('')
    setEditing(true)
  }

  const handleCancel = () => {
    setForm(fromApi(profile))
    setError('')
    setEditing(false)
  }

  const handleSave = async e => {
    e.preventDefault()
    setError('')
    setSaving(true)
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
          study_year:    form.study_year    ? Number(form.study_year) : undefined,
        })
      } else if (form.applicant_type === 'BUSINESS') {
        Object.assign(payload, {
          business_name:  form.business_name  || undefined,
          business_type:  form.business_type  || undefined,
          activity_field: form.activity_field || undefined,
          num_employees:  form.num_employees  || undefined,
          founded_year:   form.founded_year   ? Number(form.founded_year) : undefined,
        })
      } else if (form.applicant_type === 'ORGANIZATION') {
        Object.assign(payload, {
          org_name:         form.org_name         || undefined,
          org_type:         form.org_type         || undefined,
          org_field:        form.org_field         || undefined,
          num_staff:        form.num_staff         || undefined,
          org_founded_year: form.org_founded_year  ? Number(form.org_founded_year) : undefined,
          reg_number:       form.reg_number        || undefined,
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
          role_title:     form.role_title     || undefined,
          interest_field: form.interest_field || undefined,
          relevant_link:  form.relevant_link  || undefined,
        })
      }

      const res = await api.patch('/profile/me', payload)
      setProfile(res.data)
      setForm(fromApi(res.data))
      setEditing(false)
    } catch (err) {
      setError(err.response?.data?.detail || 'Gabim gjatë ruajtjes')
    } finally {
      setSaving(false)
    }
  }

  const inp  = 'w-full px-4 py-2.5 rounded-lg text-sm text-white outline-none transition'
  const inpS = { background: 'var(--bg-card)', border: '1px solid var(--border)' }
  const focus = e => (e.target.style.borderColor = 'var(--accent)')
  const blur  = e => (e.target.style.borderColor = 'var(--border)')

  const initials = profile
    ? [profile.first_name, profile.last_name].filter(Boolean).map(n => n[0]).join('').toUpperCase()
    : (user?.role?.[0] || 'U')

  const displayName = profile
    ? [profile.first_name, profile.last_name].filter(Boolean).join(' ')
    : ''

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Duke ngarkuar...</div>
    </div>
  )

  return (
    <div className="min-h-screen applicant-page" style={{ background: 'var(--bg-primary)' }}>
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
        <div className="flex items-center gap-4">
          <button className="relative w-10 h-10 flex items-center justify-center rounded-lg"
            style={{ background: 'var(--bg-card)' }} aria-label="Notifications">
            <span aria-hidden="true">🔔</span>
          </button>

          <button onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'var(--accent)', color: '#0f1117' }} aria-label="Profile">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.866 0-7 3.134-7 7h2c0-2.757 2.243-5 5-5s5 2.243 5 5h2c0-3.866-3.134-7-7-7z" fill="currentColor"/>
            </svg>
          </button>

          <button className="px-3 py-2 rounded-lg text-sm font-semibold"
            style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            onClick={() => { logout(); navigate('/login') }}>
            Dil
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8 flex items-center justify-center" style={{ minHeight: 'calc(100vh - 112px)' }}>

        {/* ── VIEW MODE ─────────────────────────────── */}
        {!editing && profile && (
          <>
            {/* Avatar centered and larger + edit button below */}
            <div className="rounded-2xl p-6 mb-4 profile-center"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <div className="avatar flex-shrink-0" aria-hidden>
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black"
                  style={{ background: 'var(--accent)', color: '#0f1117' }}>
                  {initials || '?'}
                </div>
              </div>
              <div className="info mt-3 text-center">
                <h1 className="text-2xl font-bold text-white">{displayName || '—'}</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{profile.email}</p>
                <div className="mt-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full inline-block"
                    style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                    {ROLE_LABELS[user?.role] || user?.role}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <button onClick={handleEdit}
                  className="text-sm font-semibold px-4 py-2 rounded-lg transition"
                  style={{ background: 'var(--bg-card)', color: 'var(--accent)', border: '1px solid var(--accent)' }}>
                  Ndrysho
                </button>
              </div>
            </div>

            {/* Nëse profili është i pa plotë */}
            {!profile.applicant_type && (
              <div className="rounded-xl p-4 mb-4 flex items-start gap-3"
                style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)' }}>
                <span className="text-lg font-bold">!</span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#facc15' }}>Profili i pa plotë</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    Zgjidh kategorinë tënde për të mundësuar aplikimin në grante.
                  </p>
                </div>
              </div>
            )}

            {/* Informata */}
            <div className="rounded-2xl p-6"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <h2 className="font-semibold text-white mb-4">Informata</h2>
              <div className="space-y-0">
                {[
                  { label: 'Kategoria', value: TYPE_LABEL[profile.applicant_type] },
                  { label: 'Telefoni',  value: profile.phone },
                  { label: 'Adresa',    value: profile.address },
                  // STUDENT
                  ...(profile.applicant_type === 'STUDENT' ? [
                    { label: 'Universiteti', value: profile.university },
                    { label: 'Fakulteti',    value: profile.faculty },
                    { label: 'Programi',     value: profile.study_program },
                    { label: 'Niveli',       value: profile.study_level },
                    { label: 'Viti',         value: profile.study_year ? String(profile.study_year) : null },
                  ] : []),
                  // BUSINESS
                  ...(profile.applicant_type === 'BUSINESS' ? [
                    { label: 'Biznesi',       value: profile.business_name },
                    { label: 'Tipi',          value: profile.business_type },
                    { label: 'Fusha',         value: profile.activity_field },
                    { label: 'Punonjës',      value: profile.num_employees },
                    { label: 'Themeluar',     value: profile.founded_year ? String(profile.founded_year) : null },
                  ] : []),
                  // ORGANIZATION
                  ...(profile.applicant_type === 'ORGANIZATION' ? [
                    { label: 'Organizata',   value: profile.org_name },
                    { label: 'Tipi',         value: profile.org_type },
                    { label: 'Fusha',        value: profile.org_field },
                    { label: 'Stafi',        value: profile.num_staff },
                    { label: 'Nr. regj.',    value: profile.reg_number },
                  ] : []),
                  // INDIVIDUAL
                  ...(profile.applicant_type === 'INDIVIDUAL' ? [
                    { label: 'Profesioni',   value: profile.profession },
                    { label: 'Eksperience',  value: profile.experience_years },
                    { label: 'Aftësitë',     value: profile.key_skills },
                    { label: 'Portfolio',    value: profile.portfolio_url },
                  ] : []),
                  // OTHER
                  ...(profile.applicant_type === 'OTHER' ? [
                    { label: 'Roli',         value: profile.role_title },
                    { label: 'Interesimi',   value: profile.interest_field },
                    { label: 'Link',         value: profile.relevant_link },
                  ] : []),
                ].filter(r => r.value).map((row, i, arr) => (
                  <div key={row.label}
                    className="flex items-center justify-between py-3"
                    style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                    <span className="text-sm text-white text-right max-w-xs truncate">{row.value}</span>
                  </div>
                ))}
                {[
                  profile.applicant_type, profile.phone, profile.address,
                  profile.university, profile.business_name, profile.org_name,
                  profile.profession, profile.key_skills
                ].every(v => !v) && (
                  <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
                    Asnjë e dhënë e shtuar ende. Kliko "Ndrysho" për të plotësuar.
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── EDIT MODE ─────────────────────────────── */}
        {editing && (
          <form onSubmit={handleSave} className="space-y-4">
            {/* Header edit */}
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-white">Ndrysho profilin</h2>
              {profile?.applicant_type && (
                <button type="button" onClick={handleCancel}
                  className="text-sm px-3 py-1.5 rounded-lg"
                  style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                  Anulo
                </button>
              )}
            </div>

            {/* Informata bazë */}
            <div className="rounded-2xl p-6"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <h3 className="font-semibold text-white mb-4">Informata personale</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Emri</label>
                    <input value={form.first_name} onChange={set('first_name')}
                      className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="Emri" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Mbiemri</label>
                    <input value={form.last_name} onChange={set('last_name')}
                      className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="Mbiemri" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Telefoni</label>
                  <input value={form.phone} onChange={set('phone')}
                    className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="+383 44 000 000" />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Adresa</label>
                  <input value={form.address} onChange={set('address')}
                    className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="Qyteti, Shteti" />
                </div>
              </div>
            </div>

            {/* Kategoria */}
            <div className="rounded-2xl p-6"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <h3 className="font-semibold text-white mb-1">
                Kategoria <span style={{ color: 'var(--danger)' }}>*</span>
              </h3>
              <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                E nevojshme për aplikim. Mund ta ndryshosh kur të duash.
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {APPLICANT_TYPES.map(t => (
                  <button key={t.value} type="button"
                    onClick={() => setForm(prev => ({ ...prev, applicant_type: t.value }))}
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

            {/* Fusha specifike */}
            {form.applicant_type === 'STUDENT' && (
              <div className="rounded-2xl p-6"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <h3 className="font-semibold text-white mb-4">🎓 Të dhënat akademike</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Universiteti</label>
                    <input value={form.university} onChange={set('university')}
                      className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="Universiteti i Prishtinës" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Fakulteti</label>
                      <input value={form.faculty} onChange={set('faculty')}
                        className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="Fakulteti" />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Programi</label>
                      <input value={form.study_program} onChange={set('study_program')}
                        className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="Programi" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Niveli</label>
                      <select value={form.study_level} onChange={set('study_level')} className={inp} style={inpS}>
                        <option value="">Zgjedh...</option>
                        <option>Bachelor</option>
                        <option>Master</option>
                        <option>PhD</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Viti</label>
                      <input type="number" min="1" max="6" value={form.study_year} onChange={set('study_year')}
                        className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="1" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {form.applicant_type === 'BUSINESS' && (
              <div className="rounded-2xl p-6"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <h3 className="font-semibold text-white mb-4">🏢 Të dhënat e biznesit</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Emri i biznesit</label>
                    <input value={form.business_name} onChange={set('business_name')}
                      className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="Emri i biznesit" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Tipi</label>
                      <input value={form.business_type} onChange={set('business_type')}
                        className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="SH.P.K, SH.A..." />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Fusha</label>
                      <input value={form.activity_field} onChange={set('activity_field')}
                        className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="Teknologji..." />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Nr. punonjësve</label>
                      <input value={form.num_employees} onChange={set('num_employees')}
                        className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="10" />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Viti themelimit</label>
                      <input type="number" value={form.founded_year} onChange={set('founded_year')}
                        className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="2020" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {form.applicant_type === 'ORGANIZATION' && (
              <div className="rounded-2xl p-6"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <h3 className="font-semibold text-white mb-4">🤝 Të dhënat e organizatës</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Emri i OJQ-së</label>
                    <input value={form.org_name} onChange={set('org_name')}
                      className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="Emri" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Tipi</label>
                      <input value={form.org_type} onChange={set('org_type')}
                        className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="OJQ, Fondacion..." />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Fusha</label>
                      <input value={form.org_field} onChange={set('org_field')}
                        className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="Arsim..." />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Nr. stafi</label>
                      <input value={form.num_staff} onChange={set('num_staff')}
                        className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="5" />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Nr. regjistrimit</label>
                      <input value={form.reg_number} onChange={set('reg_number')}
                        className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="Nr. OJQ" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {form.applicant_type === 'INDIVIDUAL' && (
              <div className="rounded-2xl p-6"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <h3 className="font-semibold text-white mb-4">👤 Të dhënat profesionale</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Profesioni</label>
                      <input value={form.profession} onChange={set('profession')}
                        className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="Inxhinier..." />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Vite eksperience</label>
                      <input value={form.experience_years} onChange={set('experience_years')}
                        className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="3" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Aftësitë kryesore</label>
                    <input value={form.key_skills} onChange={set('key_skills')}
                      className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="Python, Dizajn..." />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Portfolio (URL)</label>
                    <input type="url" value={form.portfolio_url} onChange={set('portfolio_url')}
                      className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="https://..." />
                  </div>
                </div>
              </div>
            )}

            {form.applicant_type === 'OTHER' && (
              <div className="rounded-2xl p-6"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <h3 className="font-semibold text-white mb-4">🔹 Informata shtesë</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Titulli / Roli</label>
                    <input value={form.role_title} onChange={set('role_title')}
                      className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="Kërkues..." />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Fusha e interesimit</label>
                    <input value={form.interest_field} onChange={set('interest_field')}
                      className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="Inovacion..." />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Link relevant</label>
                    <input type="url" value={form.relevant_link} onChange={set('relevant_link')}
                      className={inp} style={inpS} onFocus={focus} onBlur={blur} placeholder="https://..." />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-lg px-4 py-3 text-sm"
                style={{ background: 'rgba(248,113,113,0.1)', color: 'var(--danger)', border: '1px solid rgba(248,113,113,0.2)' }}>
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="flex-1 py-3 rounded-xl font-semibold text-sm transition"
                style={{ background: saving ? 'var(--accent-dark)' : 'var(--accent)', color: '#0f1117' }}>
                {saving ? 'Duke ruajtur...' : 'Ruaj ndryshimet'}
              </button>
              {profile?.applicant_type && (
                <button type="button" onClick={handleCancel}
                  className="px-6 py-3 rounded-xl font-semibold text-sm transition"
                  style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                  Anulo
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
