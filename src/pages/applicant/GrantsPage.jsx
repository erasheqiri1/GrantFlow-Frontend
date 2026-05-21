import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

const APPLICANT_TYPES = ['STUDENT', 'BUSINESS', 'ORGANIZATION', 'INDIVIDUAL']

export default function GrantsPage() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [grants, setGrants] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ title: '', applicant_type: '', deadline_from: '' })
  const [appliedGrantIds, setAppliedGrantIds] = useState(new Set())


  const fetchGrants = async (overrideFilters) => {
    // incrementing id to ignore stale responses (handles out-of-order network responses)
    const myId = ++latestFetchId.current
    setLoading(true)
    const f = overrideFilters ?? filtersRef.current
    try {
      const params = {}
      if (f.title) params.title = f.title
      if (f.applicant_type) params.applicant_type = f.applicant_type
      if (f.deadline_from) params.deadline_from = f.deadline_from
      const res = await api.get('/grants', { params })
      if (myId === latestFetchId.current) {
        setGrants(res.data)
      } else {
        console.warn('[GrantsPage] Ignored stale response', myId)
      }
    } catch (err) {
      console.error(err)
    } finally {
      if (myId === latestFetchId.current) setLoading(false)
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

  // keep a ref to filters so updates are synchronous for fetch calls
  const filtersRef = useRef(filters)
  const latestFetchId = useRef(0)
  const updateFilters = (nextFilters, autoFetch = false) => {
    setFilters(nextFilters)
    filtersRef.current = nextFilters
    if (autoFetch) fetchGrants(nextFilters)
  }

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'AR'

  return (
    <div className="min-h-screen applicant-page" style={{ background: 'var(--bg-primary)' }}>
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 sticky top-0 z-10 app-nav"
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

      <div className="max-w-full px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Gjej mundësinë tënde</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Eksploroni grante të hapura dhe apliko për mbështetje.
          </p>
        </div>

        {/* Filtrat */}
        <div className="flex flex-wrap items-center gap-4 mb-6 filters">
          <div className="relative flex-1 min-w-48">
            <input
              type="text" placeholder="Kërko grant..."
              value={filters.title}
              onChange={(e) => updateFilters({ ...filtersRef.current, title: e.target.value })}
              className="w-full pl-4 pr-4 py-3 rounded-lg text-base text-white outline-none search-input"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <div style={{ minWidth: 160 }}>
            <select value={filters.applicant_type}
              onChange={(e) => updateFilters({ ...filtersRef.current, applicant_type: e.target.value })}
              className="w-full px-4 py-3 rounded-lg text-base text-white outline-none"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <option value="">Kategoria</option>
              {APPLICANT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2" style={{ minWidth: 210 }}>
            <label className="text-xs" style={{ color: 'var(--text-muted)', marginRight: 6 }}>Afati</label>
            <input type="date" value={filters.deadline_from}
              onChange={(e) => updateFilters({ ...filtersRef.current, deadline_from: e.target.value })}
              className="px-4 py-3 rounded-lg text-base text-white outline-none"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button onClick={() => fetchGrants(filtersRef.current)}
              className="px-5 py-3 rounded-lg text-base font-semibold transition btn-primary"
              style={{ background: 'var(--accent)', color: '#0f1117' }}>
              Kërko
            </button>
          </div>

          {(filters.title || filters.applicant_type || filters.deadline_from) && (
            <button onClick={() => {
              const empty = { title: '', applicant_type: '', deadline_from: '' }
              updateFilters(empty)
              fetchGrants(empty)
            }}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 grant-grid">
            {grants.map((grant) => (
              <div key={grant.id} className="rounded-2xl p-5 flex flex-col transition hover:scale-[1.01] grant-card"
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
                      🗓 {new Date(grant.deadline).toLocaleDateString('sq-AL', { timeZone: 'UTC' })}
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
                    className="w-full py-3 rounded-xl text-sm font-semibold text-center transition grant-btn applied"
                    style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                    ✓ Ke aplikuar
                  </Link>
                ) : (
                  <Link to={`/grants/${grant.id}`}
                    className="w-full py-3 rounded-xl text-sm font-semibold text-center transition grant-btn apply"
                    style={{ background: 'var(--accent)', color: '#0f1117', border: '1px solid rgba(74,222,128,0.08)' }}>
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
