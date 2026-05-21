import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'

const APPLICANT_TYPES = ['STUDENT', 'BUSINESS', 'ORGANIZATION', 'INDIVIDUAL']

export default function GrantsPage() {
  const { logout, user } = useAuthStore()
  const navigate = useNavigate()
  const [grants, setGrants] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ title: '', applicant_type: '', deadline_to: '' })
  const [appliedGrantIds, setAppliedGrantIds] = useState(new Set())

  const fetchGrants = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.title) params.title = filters.title
      if (filters.applicant_type) params.applicant_type = filters.applicant_type
      if (filters.deadline_to) params.deadline_to = filters.deadline_to
      const res = await api.get('/grants', { params })
      setGrants(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGrants()
    api.get('/applications/my')
      .then(res => {
        const ids = new Set(
          res.data.map(app => String(app.grant_id || app.grant?.id)).filter(Boolean)
        )
        setAppliedGrantIds(ids)
      })
      .catch(() => {})
  }, [])

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'AR'

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
            <Link to="/grants" className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>Grante</Link>
            <Link to="/my-applications" className="text-sm" style={{ color: 'var(--text-secondary)' }}>Aplikimet e mia</Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative w-8 h-8 flex items-center justify-center rounded-lg"
            style={{ background: 'var(--bg-card)' }}>
            <span>🔔</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer"
              style={{ background: 'var(--accent)', color: '#0f1117' }}
              onClick={() => navigate('/profile')}>
              {initials}
            </div>
            <button className="text-sm" style={{ color: 'var(--text-secondary)' }}
              onClick={() => { logout(); navigate('/login') }}>
              Dil
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Gjej mundësinë tënde</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Eksploroni grante të hapura dhe apliko për mbështetje.
          </p>
        </div>

        {/* Filtrat */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-48">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>🔍</span>
            <input
              type="text" placeholder="Kërko grant..."
              value={filters.title}
              onChange={(e) => setFilters({ ...filters, title: e.target.value })}
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm text-white outline-none"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <select value={filters.applicant_type}
            onChange={(e) => setFilters({ ...filters, applicant_type: e.target.value })}
            className="px-4 py-2 rounded-lg text-sm text-white outline-none"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <option value="">📁 Kategoria</option>
            {APPLICANT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <input type="date" value={filters.deadline_to}
            onChange={(e) => setFilters({ ...filters, deadline_to: e.target.value })}
            className="px-4 py-2 rounded-lg text-sm text-white outline-none"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            title="Afati deri më" />

          <button onClick={fetchGrants}
            className="px-5 py-2 rounded-lg text-sm font-semibold transition"
            style={{ background: 'var(--accent)', color: '#0f1117' }}>
            Kërko
          </button>

          {(filters.title || filters.applicant_type || filters.deadline_to) && (
            <button onClick={() => { setFilters({ title: '', applicant_type: '', deadline_to: '' }); setTimeout(fetchGrants, 50) }}
              className="px-3 py-2 rounded-lg text-sm transition"
              style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              Pastro filtrat ✕
            </button>
          )}
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            {grants.length} grante të gjetura
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-56 rounded-2xl animate-pulse" style={{ background: 'var(--bg-secondary)' }} />
            ))}
          </div>
        ) : grants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg font-medium text-white mb-1">Nuk u gjetën grante</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Provoni të ndryshoni filtrat</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {grants.map((grant) => (
              <div key={grant.id} className="rounded-2xl p-5 flex flex-col transition hover:scale-[1.01]"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                    Hapur
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full"
                    style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }}>
                    {grant.applicant_type}
                  </span>
                </div>

                {/* Org */}
                {grant.org_name && (
                  <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{grant.org_name}</p>
                )}

                {/* Title */}
                <h3 className="font-bold text-white mb-2 line-clamp-2">{grant.title}</h3>

                {/* Description */}
                {grant.description && (
                  <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                    {grant.description}
                  </p>
                )}

                <div className="flex-1" />

                {/* Meta */}
                <div className="flex items-center gap-3 text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                  {grant.deadline && (
                    <span className="flex items-center gap-1">
                      🗓 {new Date(grant.deadline).toLocaleDateString('sq-AL')}
                    </span>
                  )}
                  {grant.grant_value && (
                    <span className="flex items-center gap-1" style={{ color: 'var(--accent)' }}>
                      💰 {grant.grant_value.toLocaleString()}€
                    </span>
                  )}
                </div>

                {appliedGrantIds.has(String(grant.id)) ? (
                  <Link to={`/grants/${grant.id}`}
                    className="w-full py-2 rounded-xl text-sm font-semibold text-center transition"
                    style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                    ✓ Ke aplikuar
                  </Link>
                ) : (
                  <Link to={`/grants/${grant.id}`}
                    className="w-full py-2 rounded-xl text-sm font-semibold text-center transition"
                    style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(74,222,128,0.2)' }}>
                    Apliko →
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
