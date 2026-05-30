import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'

const STATUS_INFO = {
  DRAFT:        { label: 'Draft', color: '#9ca3af' },
  SUBMITTED:    { label: 'Dorëzuar', color: '#60a5fa' },
  UNDER_REVIEW: { label: 'Në shqyrtim', color: '#facc15' },
  APPROVED:     { label: 'Aprovuar', color: '#4ade80' },
  REJECTED:     { label: 'Refuzuar', color: '#f87171' },
}

export default function GrantDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [grant, setGrant] = useState(null)
  const [existingApplication, setExistingApplication] = useState(null)
  const [profileComplete, setProfileComplete] = useState(true)
  const [typeAllowed, setTypeAllowed] = useState(true)
  const [userType, setUserType] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const TYPE_LABELS = {
    STUDENT: 'Student', BUSINESS: 'Biznes', ORGANIZATION: 'Organizatë (OJQ)',
    INDIVIDUAL: 'Individual', OTHER: 'Tjetër', ANY: 'Të gjithë',
  }

  useEffect(() => {
    const fetchGrant   = api.get(`/grants/${id}`)
    const fetchApps    = api.get('/applications/my').catch(() => ({ data: [] }))
    const fetchProfile = api.get('/profile/me').catch(() => ({ data: null }))

    Promise.all([fetchGrant, fetchApps, fetchProfile])
      .then(([grantRes, appsRes, profileRes]) => {
        const g = grantRes.data
        setGrant(g)

        const applied = (appsRes.data?.items || appsRes.data || []).find(
          app => String(app.grant_id || app.grant?.id) === String(id)
        )
        setExistingApplication(applied || null)

        const p = profileRes.data
        const hasType = !!(p && p.applicant_type)
        setProfileComplete(hasType)
        setUserType(p?.applicant_type || '')

        if (hasType && g.applicant_type !== 'ANY') {
          setTypeAllowed(p.applicant_type === g.applicant_type)
        }
      })
      .catch(() => setError('Granti nuk u gjet.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Duke ngarkuar...</div>
    </div>
  )
  if (error) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="text-sm" style={{ color: 'var(--danger)' }}>{error}</div>
    </div>
  )

  const appStatus = existingApplication ? STATUS_INFO[existingApplication.status] : null

  return (
    <div className="min-h-screen applicant-page" style={{ background: 'var(--bg-primary)' }}>
      <nav className="flex items-center px-6 py-3 sticky top-0 z-10"
        style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <Link to="/grants" className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          ← Kthehu te grante
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {existingApplication && (
          <div className="rounded-xl p-4 mb-4 flex items-center justify-between"
            style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)' }}>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                Keni aplikuar tashmë për këtë grant
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Statusi:{' '}
                <span style={{ color: appStatus?.color }}>
                  {appStatus?.label}
                </span>
              </p>
            </div>
            <button onClick={() => navigate('/my-applications')}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
              Shiko aplikimin →
            </button>
          </div>
        )}

        <div className="rounded-2xl p-6 mb-4"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
              {grant.applicant_type}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80' }}>
              {grant.status}
            </span>
            {grant.org_name && (
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{grant.org_name}</span>
            )}
          </div>

          <h1 className="text-2xl font-bold text-white mb-3">{grant.title}</h1>

          {grant.description && (
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{grant.description}</p>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            {grant.grant_value && (
              <div className="rounded-xl p-3" style={{ background: 'var(--bg-card)' }}>
                <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Vlera e grantit</div>
                <div className="font-semibold text-white">
                  {grant.grant_value.toLocaleString()} {grant.currency}
                </div>
              </div>
            )}
            {grant.deadline && (
              <div className="rounded-xl p-3" style={{ background: 'var(--bg-card)' }}>
                <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Afati</div>
                <div className="font-semibold text-white">
                  {new Date(grant.deadline).toLocaleDateString('sq-AL', { timeZone: 'UTC' })}
                </div>
              </div>
            )}
            {grant.max_applicants && (
              <div className="rounded-xl p-3" style={{ background: 'var(--bg-card)' }}>
                <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Maks. aplikantë</div>
                <div className="font-semibold text-white">{grant.max_applicants}</div>
              </div>
            )}
          </div>
        </div>

        {grant.questions?.length > 0 && (
          <div className="rounded-2xl p-6 mb-4"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <h2 className="font-semibold text-white mb-4">Pyetjet e aplikimit</h2>
            <div className="space-y-3">
              {grant.questions.map((q, i) => (
                <div key={q.id} className="flex gap-3">
                  <span className="font-bold text-sm mt-0.5" style={{ color: 'var(--accent)' }}>{i + 1}.</span>
                  <div>
                    <p className="text-sm text-white">{q.question_text}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{q.question_type}</span>
                      {q.is_required && (
                        <span className="text-xs" style={{ color: 'var(--danger)' }}>* i detyrueshëm</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {grant.criteria?.length > 0 && (
          <div className="rounded-2xl p-6 mb-4"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <h2 className="font-semibold text-white mb-1">Kriteret e vlerësimit</h2>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              Aplikimi juaj do të vlerësohet bazuar në këto kritere
            </p>
            <div className="space-y-2.5">
              {grant.criteria.map(c => (
                <div key={c.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white">{c.name}</span>
                    <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
                      {c.weight}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-card)' }}>
                    <div className="h-full rounded-full"
                      style={{ width: `${c.weight}%`, background: 'var(--accent)', opacity: 0.6 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {existingApplication ? (
          <button
            onClick={() => navigate('/my-applications')}
            className="w-full py-3 rounded-xl font-semibold text-sm transition"
            style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
            Shiko aplikimin tuaj →
          </button>
        ) : !profileComplete ? (
          <div>
            <div className="rounded-xl p-4 mb-3 flex items-start gap-3"
              style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)' }}>
              <span className="text-lg flex-shrink-0 font-bold">!</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#facc15' }}>Profili i pa plotë</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  Duhet të plotësosh kategorinë e profilit para se të aplikosh.
                </p>
              </div>
            </div>
            <button onClick={() => navigate('/profile')}
              className="w-full py-3 rounded-xl font-semibold text-sm transition"
              style={{ background: 'rgba(234,179,8,0.15)', color: '#facc15', border: '1px solid rgba(234,179,8,0.3)' }}>
              Plotëso profilin →
            </button>
          </div>
        ) : !typeAllowed ? (
          <div className="rounded-xl p-4 flex items-start gap-3"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <span className="text-lg flex-shrink-0 font-bold">!</span>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#f87171' }}>
                Ky grant nuk është për kategorinë tënde
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Granti kërkon: <span className="font-semibold text-white">{TYPE_LABELS[grant?.applicant_type]}</span>
                {' · '}Kategoria jote: <span className="font-semibold text-white">{TYPE_LABELS[userType] || '—'}</span>
              </p>
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate(`/grants/${id}/apply`)}
            className="w-full py-3 rounded-xl font-semibold text-sm transition"
            style={{ background: 'var(--accent)', color: '#0f1117' }}>
            Apliko tani
          </button>
        )}
      </div>
    </div>
  )
}
