import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

const ROLE_LABELS = {
  APPLICANT: 'Aplikant',
  ORG_ADMIN: 'Admin Organizate',
  COMMISSIONER: 'Komisioner',
  SUPER_ADMIN: 'Super Admin',
}

const APPLICANT_TYPES = [
  { value: 'STUDENT', label: 'Student' },
  { value: 'BUSINESS', label: 'Biznes' },
  { value: 'ORGANIZATION', label: 'Organizatë (OJQ)' },
  { value: 'INDIVIDUAL', label: 'Individual' },
  { value: 'OTHER', label: 'Tjetër' },
]

const TYPE_LABEL = Object.fromEntries(APPLICANT_TYPES.map(t => [t.value, t.label]))

const EMPTY_FORM = {
  first_name: '', last_name: '', phone: '', address: '', applicant_type: '', description: '', personal_id: '',
  university: '', faculty: '', study_program: '', study_level: '', study_year: '',
  business_name: '', business_type: '', activity_field: '', num_employees: '', founded_year: '',
  org_name: '', org_type: '', org_field: '', num_staff: '', org_founded_year: '', reg_number: '',
  profession: '', experience_years: '', key_skills: '', portfolio_url: '',
  role_title: '', interest_field: '', relevant_link: '',
}

function fromApi(p = {}) {
  return {
    first_name: p.first_name || '',
    last_name: p.last_name || '',
    phone: p.phone || '',
    address: p.address || '',
    applicant_type: p.applicant_type || '',
    description: p.description || '',
    personal_id: p.personal_id || '',
    university: p.university || '',
    faculty: p.faculty || '',
    study_program: p.study_program || '',
    study_level: p.study_level || '',
    study_year: p.study_year ?? '',
    business_name: p.business_name || '',
    business_type: p.business_type || '',
    activity_field: p.activity_field || '',
    num_employees: p.num_employees || '',
    founded_year: p.founded_year ?? '',
    org_name: p.org_name || '',
    org_type: p.org_type || '',
    org_field: p.org_field || '',
    num_staff: p.num_staff || '',
    org_founded_year: p.org_founded_year ?? '',
    reg_number: p.reg_number || '',
    profession: p.profession || '',
    experience_years: p.experience_years || '',
    key_skills: p.key_skills || '',
    portfolio_url: p.portfolio_url || '',
    role_title: p.role_title || '',
    interest_field: p.interest_field || '',
    relevant_link: p.relevant_link || '',
  }
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs mb-2">{label}</label>
      {children}
    </div>
  )
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    api.get('/profile/me')
      .then(res => {
        setProfile(res.data)
        setForm(fromApi(res.data))
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
        first_name: form.first_name || undefined,
        last_name: form.last_name || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
        applicant_type: form.applicant_type || undefined,
        description: form.description || undefined,
        personal_id: form.personal_id || undefined,
      }

      if (form.applicant_type === 'STUDENT') {
        Object.assign(payload, {
          university: form.university || undefined,
          faculty: form.faculty || undefined,
          study_program: form.study_program || undefined,
          study_level: form.study_level || undefined,
          study_year: form.study_year ? Number(form.study_year) : undefined,
        })
      } else if (form.applicant_type === 'BUSINESS') {
        Object.assign(payload, {
          business_name: form.business_name || undefined,
          business_type: form.business_type || undefined,
          activity_field: form.activity_field || undefined,
          num_employees: form.num_employees || undefined,
          founded_year: form.founded_year ? Number(form.founded_year) : undefined,
        })
      } else if (form.applicant_type === 'ORGANIZATION') {
        Object.assign(payload, {
          org_name: form.org_name || undefined,
          org_type: form.org_type || undefined,
          org_field: form.org_field || undefined,
          num_staff: form.num_staff || undefined,
          org_founded_year: form.org_founded_year ? Number(form.org_founded_year) : undefined,
          reg_number: form.reg_number || undefined,
        })
      } else if (form.applicant_type === 'INDIVIDUAL') {
        Object.assign(payload, {
          profession: form.profession || undefined,
          experience_years: form.experience_years || undefined,
          key_skills: form.key_skills || undefined,
          portfolio_url: form.portfolio_url || undefined,
        })
      } else if (form.applicant_type === 'OTHER') {
        Object.assign(payload, {
          role_title: form.role_title || undefined,
          interest_field: form.interest_field || undefined,
          relevant_link: form.relevant_link || undefined,
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

  const initials = profile
    ? [profile.first_name, profile.last_name].filter(Boolean).map(n => n[0]).join('').toUpperCase()
    : (user?.role?.[0] || 'U')
  const displayName = profile ? [profile.first_name, profile.last_name].filter(Boolean).join(' ') : ''

  const rows = profile ? [
    { label: 'Kategoria', value: TYPE_LABEL[profile.applicant_type] },
    { label: 'Nr. Personal', value: profile.personal_id },
    { label: 'Telefoni', value: profile.phone },
    { label: 'Adresa', value: profile.address },
    ...(profile.applicant_type === 'STUDENT' ? [
      { label: 'Universiteti', value: profile.university },
      { label: 'Fakulteti', value: profile.faculty },
      { label: 'Programi', value: profile.study_program },
      { label: 'Niveli', value: profile.study_level },
      { label: 'Viti', value: profile.study_year ? String(profile.study_year) : null },
    ] : []),
    ...(profile.applicant_type === 'BUSINESS' ? [
      { label: 'Biznesi', value: profile.business_name },
      { label: 'Tipi', value: profile.business_type },
      { label: 'Fusha', value: profile.activity_field },
      { label: 'Punonjës', value: profile.num_employees },
      { label: 'Themeluar', value: profile.founded_year ? String(profile.founded_year) : null },
    ] : []),
    ...(profile.applicant_type === 'ORGANIZATION' ? [
      { label: 'Organizata', value: profile.org_name },
      { label: 'Tipi', value: profile.org_type },
      { label: 'Fusha', value: profile.org_field },
      { label: 'Stafi', value: profile.num_staff },
      { label: 'Nr. regj.', value: profile.reg_number },
    ] : []),
    ...(profile.applicant_type === 'INDIVIDUAL' ? [
      { label: 'Profesioni', value: profile.profession },
      { label: 'Eksperiencë', value: profile.experience_years },
      { label: 'Aftësitë', value: profile.key_skills },
      { label: 'Portfolio', value: profile.portfolio_url },
    ] : []),
    ...(profile.applicant_type === 'OTHER' ? [
      { label: 'Roli', value: profile.role_title },
      { label: 'Interesimi', value: profile.interest_field },
      { label: 'Link', value: profile.relevant_link },
    ] : []),
  ].filter(r => r.value) : []

  if (loading) return (
    <div className="min-h-screen applicant-shell flex items-center justify-center">
      <div className="text-sm" style={{ color: 'rgba(255,255,255,0.52)' }}>Duke ngarkuar...</div>
    </div>
  )

  return (
    <div className="min-h-screen applicant-shell" style={{ background: '#0a0d14' }}>
      <nav className="sticky top-0 z-20 flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-8">
          <div className="text-lg font-black tracking-wider">
            <span className="text-white">GRANT</span><span style={{ color: '#00e676' }}>FLOW</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/grants" data-active="false" className="px-4 py-1.5 rounded-lg text-sm font-semibold transition">Grante</Link>
            <Link to="/my-applications" data-active="false" className="px-4 py-1.5 rounded-lg text-sm font-semibold transition">Aplikimet e mia</Link>
            <span data-active="true" className="px-4 py-1.5 rounded-lg text-sm font-semibold transition">Profili</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/profile')} className="px-4 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.866 0-7 3.134-7 7h2c0-2.757 2.243-5 5-5s5 2.243 5 5h2c0-3.866-3.134-7-7-7z" />
            </svg>
          </button>
          <button onClick={() => { logout(); navigate('/login') }} className="rounded-xl font-black tracking-wide transition">Dil</button>
        </div>
      </nav>

      {!editing && profile && (
        <main className="profile-view-content px-8">
          <div className="profile-view-stack">
            <section className="profile-card-shell profile-top-card">
              <div className="profile-avatar">{initials || '?'}</div>
              <div className="profile-main-info">
                <h1>{displayName || '—'}</h1>
                <p>{profile.email}</p>
                <span>{ROLE_LABELS[user?.role] || user?.role}</span>
              </div>
              <button onClick={handleEdit} className="profile-outline-button">Ndrysho</button>
            </section>

            <section className="profile-card-shell profile-info-card">
              <h2>Informata</h2>
              <div>
                {rows.map((row, i) => (
                  <div key={row.label} className="profile-info-row" data-last={i === rows.length - 1 ? 'true' : 'false'}>
                    <span>{row.label}</span>
                    <strong>{row.value}</strong>
                  </div>
                ))}
                {rows.length === 0 && (
                  <p className="text-sm text-center py-4" style={{ color: 'rgba(148,163,184,0.58)' }}>
                    Asnjë e dhënë e shtuar ende.
                  </p>
                )}
              </div>
            </section>
          </div>
        </main>
      )}

      {editing && (
        <main className="profile-edit-content px-8 pb-14">
          <form onSubmit={handleSave} className="profile-edit-form">
            <div className="profile-edit-header">
              <h1>Ndrysho profilin</h1>
              {profile?.applicant_type && (
                <button type="button" onClick={handleCancel} className="profile-outline-button">Anulo</button>
              )}
            </div>

            <section className="profile-card-shell profile-edit-card">
              <h2>Informata personale</h2>
              <div className="profile-form-grid two">
                <Field label="Emri">
                  <input value={form.first_name} onChange={set('first_name')} placeholder="Emri" />
                </Field>
                <Field label="Mbiemri">
                  <input value={form.last_name} onChange={set('last_name')} placeholder="Mbiemri" />
                </Field>
              </div>
              <Field label="Numri personal *">
                <input
                  value={form.personal_id}
                  onChange={set('personal_id')}
                  placeholder="p.sh. 1234567890"
                  maxLength={20}
                />
                {!form.personal_id && (
                  <p style={{ color: 'rgba(248,113,113,0.75)', fontSize: '0.72rem', marginTop: '0.3rem' }}>
                    ⚠ I detyrueshëm për të aplikuar për grante
                  </p>
                )}
              </Field>
              <Field label="Telefoni">
                <input value={form.phone} onChange={set('phone')} placeholder="+383 44 000 000" />
              </Field>
              <Field label="Adresa">
                <input value={form.address} onChange={set('address')} placeholder="Qyteti, Shteti" />
              </Field>
            </section>

            <section className="profile-card-shell profile-edit-card">
              <h2>Kategoria <span>*</span></h2>
              <p>E nevojshme për aplikim. Mund ta ndryshosh kur të duash.</p>
              <div className="profile-type-grid">
                {APPLICANT_TYPES.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    data-active={form.applicant_type === t.value ? 'true' : 'false'}
                    onClick={() => setForm(prev => ({ ...prev, applicant_type: t.value }))}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </section>

            {form.applicant_type === 'STUDENT' && (
              <section className="profile-card-shell profile-edit-card">
                <h2>Informata akademike</h2>
                <Field label="Universiteti"><input value={form.university} onChange={set('university')} placeholder="Universiteti" /></Field>
                <div className="profile-form-grid two">
                  <Field label="Fakulteti"><input value={form.faculty} onChange={set('faculty')} placeholder="Fakulteti" /></Field>
                  <Field label="Programi"><input value={form.study_program} onChange={set('study_program')} placeholder="Programi" /></Field>
                </div>
                <div className="profile-form-grid two">
                  <Field label="Niveli">
                    <select value={form.study_level} onChange={set('study_level')}>
                      <option value="">Zgjedh...</option>
                      <option>Bachelor</option>
                      <option>Master</option>
                      <option>PhD</option>
                    </select>
                  </Field>
                  <Field label="Viti"><input type="number" min="1" max="6" value={form.study_year} onChange={set('study_year')} placeholder="1" /></Field>
                </div>
              </section>
            )}

            {form.applicant_type === 'BUSINESS' && (
              <section className="profile-card-shell profile-edit-card">
                <h2>Informata biznesi</h2>
                <Field label="Emri i biznesit"><input value={form.business_name} onChange={set('business_name')} placeholder="Emri i biznesit" /></Field>
                <div className="profile-form-grid two">
                  <Field label="Tipi"><input value={form.business_type} onChange={set('business_type')} placeholder="SH.P.K, SH.A..." /></Field>
                  <Field label="Fusha"><input value={form.activity_field} onChange={set('activity_field')} placeholder="Teknologji..." /></Field>
                </div>
                <div className="profile-form-grid two">
                  <Field label="Nr. punonjësve"><input value={form.num_employees} onChange={set('num_employees')} placeholder="10" /></Field>
                  <Field label="Viti themelimit"><input type="number" value={form.founded_year} onChange={set('founded_year')} placeholder="2020" /></Field>
                </div>
              </section>
            )}

            {form.applicant_type === 'ORGANIZATION' && (
              <section className="profile-card-shell profile-edit-card">
                <h2>Informata organizate</h2>
                <Field label="Emri i OJQ-së"><input value={form.org_name} onChange={set('org_name')} placeholder="Emri" /></Field>
                <div className="profile-form-grid two">
                  <Field label="Tipi"><input value={form.org_type} onChange={set('org_type')} placeholder="OJQ, Fondacion..." /></Field>
                  <Field label="Fusha"><input value={form.org_field} onChange={set('org_field')} placeholder="Arsim..." /></Field>
                </div>
                <div className="profile-form-grid two">
                  <Field label="Nr. stafi"><input value={form.num_staff} onChange={set('num_staff')} placeholder="5" /></Field>
                  <Field label="Nr. regjistrimit"><input value={form.reg_number} onChange={set('reg_number')} placeholder="Nr. OJQ" /></Field>
                </div>
              </section>
            )}

            {form.applicant_type === 'INDIVIDUAL' && (
              <section className="profile-card-shell profile-edit-card">
                <h2>Informata profesionale</h2>
                <div className="profile-form-grid two">
                  <Field label="Profesioni"><input value={form.profession} onChange={set('profession')} placeholder="Inxhinier..." /></Field>
                  <Field label="Vite eksperience"><input value={form.experience_years} onChange={set('experience_years')} placeholder="3" /></Field>
                </div>
                <Field label="Aftësitë kryesore"><input value={form.key_skills} onChange={set('key_skills')} placeholder="Python, Dizajn..." /></Field>
                <Field label="Portfolio"><input type="url" value={form.portfolio_url} onChange={set('portfolio_url')} placeholder="https://..." /></Field>
              </section>
            )}

            {form.applicant_type === 'OTHER' && (
              <section className="profile-card-shell profile-edit-card">
                <h2><span className="profile-blue-dot" /> Informata shtesë</h2>
                <Field label="Titulli / Roli"><input value={form.role_title} onChange={set('role_title')} placeholder="Kërkues" /></Field>
                <Field label="Fusha e interesimit"><input value={form.interest_field} onChange={set('interest_field')} placeholder="Inovacion" /></Field>
                <Field label="Link relevant"><input type="url" value={form.relevant_link} onChange={set('relevant_link')} placeholder="https://..." /></Field>
              </section>
            )}

            {error && <div className="profile-error">{error}</div>}

            <div className="profile-action-row">
              <button type="submit" disabled={saving} className="profile-save-button">
                {saving ? 'Duke ruajtur...' : 'Ruaj ndryshimet'}
              </button>
              {profile?.applicant_type && (
                <button type="button" onClick={handleCancel} className="profile-outline-button">Anulo</button>
              )}
            </div>
          </form>
        </main>
      )}
    </div>
  )
}
