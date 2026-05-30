import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import Pagination from '../../components/Pagination'
import ChatWidget from '../../components/ChatWidget'

const EMPTY_FILTERS = {
  title: '',
  applicant_type: '',
  deadline_from: '',
  deadline_to: '',
  sort: '',
}
const PAGE_SIZE = 12

export default function GrantsPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [grants, setGrants] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [appliedGrantIds, setAppliedGrantIds] = useState(new Set())

  const filtersRef  = useRef(filters)
  const pageRef     = useRef(1)
  const latestFetchId = useRef(0)

  const fetchGrants = async (overrideFilters, overridePage) => {
    const myId = ++latestFetchId.current
    setLoading(true)
    const f = overrideFilters ?? filtersRef.current
    const p = overridePage ?? pageRef.current
    try {
      const params = { page: p, size: PAGE_SIZE }
      if (f.title) params.title = f.title
      if (f.applicant_type) params.applicant_type = f.applicant_type
      if (f.deadline_from) params.deadline_from = f.deadline_from
      if (f.deadline_to) params.deadline_to = f.deadline_to
      if (f.sort) {
        const parts = f.sort.split('_')
        const dir = parts[parts.length - 1]
        const by  = parts.slice(0, -1).join('_')
        params.sortBy  = by === 'created' ? 'created_at' : by
        params.sortDir = dir
      }
      const res = await api.get('/grants', { params })
      if (myId === latestFetchId.current) {
        setGrants(res.data?.items ?? (Array.isArray(res.data) ? res.data : []))
        setTotal(res.data?.total ?? 0)
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
        const items = res.data?.items ?? res.data ?? []
        const ids = new Set(items.map(app => String(app.grant_id || app.grant?.id)).filter(Boolean))
        setAppliedGrantIds(ids)
      })
      .catch(() => {})
  }, [])

  const updateFilters = (patch) => {
    const nextFilters = { ...filtersRef.current, ...patch }
    setFilters(nextFilters)
    filtersRef.current = nextFilters
  }

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS)
    filtersRef.current = EMPTY_FILTERS
    setPage(1)
    pageRef.current = 1
    fetchGrants(EMPTY_FILTERS, 1)
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
    pageRef.current = newPage
    fetchGrants(filtersRef.current, newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen applicant-shell" style={{ background: '#0a0d14' }}>
      <nav className="sticky top-0 z-20 flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-8">
          <div className="text-lg font-black tracking-wider">
            <span className="text-white">GRANT</span><span style={{ color: '#00e676' }}>FLOW</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/grants" data-active="true" className="px-4 py-1.5 rounded-lg text-sm font-semibold transition">
              Grante
            </Link>
            <Link to="/my-applications" data-active="false" className="px-4 py-1.5 rounded-lg text-sm font-semibold transition">
              Aplikimet e mia
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/profile')}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.866 0-7 3.134-7 7h2c0-2.757 2.243-5 5-5s5 2.243 5 5h2c0-3.866-3.134-7-7-7z" />
            </svg>
            Profili
          </button>
          <button onClick={async () => { await logout(); navigate('/login') }}
            className="rounded-xl font-black tracking-wide transition">
            Dil
          </button>
        </div>
      </nav>

      <div className="relative z-10 px-8 pb-14 grants-content">
        <div className="mb-11">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-7 grant-active-pill">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#00e676' }} />
            <span>Grante aktive</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-7 grant-hero-title">
            Gjej mundësinë <span style={{ color: '#00e676' }}>tënde</span>
          </h1>
          <p className="text-base max-w-2xl" style={{ color: 'rgba(255,255,255,0.52)' }}>
            Eksploroni grante të hapura dhe apliko për mbështetje.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1" style={{ minWidth: 220, maxWidth: 360 }}>
            <input
              type="text"
              placeholder="Kërko grant..."
              value={filters.title}
              onChange={e => updateFilters({ title: e.target.value })}
              onKeyDown={e => { if (e.key === 'Enter') { setPage(1); pageRef.current = 1; fetchGrants(filtersRef.current, 1) } }}
              className="w-full pl-5 pr-14 py-3 text-sm text-white outline-none rounded-2xl grant-search-input"
              style={{ background: 'rgba(5,14,22,0.78)', border: '2px solid rgba(0,230,118,0.34)' }}
            />
            <button
              onClick={() => { setPage(1); pageRef.current = 1; fetchGrants(filtersRef.current, 1) }}
              title="Kërko"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-xl transition grant-search-button">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <select
            value={filters.applicant_type}
            onChange={e => updateFilters({ applicant_type: e.target.value })}
            className="grant-search-input grant-inline-filter">
            <option value="">Të gjitha</option>
            <option value="STUDENT">Student</option>
            <option value="BUSINESS">Biznes</option>
            <option value="ORGANIZATION">Organizatë</option>
            <option value="INDIVIDUAL">Individual</option>
          </select>

          <select
            value={filters.sort}
            onChange={e => updateFilters({ sort: e.target.value })}
            className="grant-search-input grant-inline-filter">
            <option value="">Rendit: Default</option>
            <option value="deadline_asc">Afati më i afërt</option>
            <option value="deadline_desc">Afati më i largët</option>
            <option value="budget_desc">Buxheti më i madh</option>
            <option value="budget_asc">Buxheti më i vogël</option>
            <option value="title_asc">Titulli A-Z</option>
          </select>

          <input
            type="date"
            value={filters.deadline_to}
            onChange={e => updateFilters({ deadline_to: e.target.value })}
            className="grant-search-input grant-inline-filter"
          />

          <button
            onClick={() => { setPage(1); pageRef.current = 1; fetchGrants(filtersRef.current, 1) }}
            className="grant-filter-submit grant-inline-btn">
            Kërko
          </button>

          <button
            onClick={clearFilters}
            className="grant-filter-clear grant-inline-btn">
            Pastro
          </button>
        </div>

        {!loading && (
          <p className="text-xs mb-7 font-semibold uppercase tracking-widest" style={{ color: 'rgba(0,230,118,0.58)' }}>
            {total} grante të gjetura
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 rounded-2xl animate-pulse"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,230,118,0.1)' }} />
            ))}
          </div>
        ) : grants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <p className="text-lg font-bold text-white mb-2">Nuk u gjetën grante</p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>Provoni të ndryshoni kërkimin</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {grants.map(grant => (
              <div key={grant.id}
                className="rounded-2xl flex flex-col transition-all duration-200 hover:scale-[1.02] grant-card"
                style={{
                  padding: '28px 24px',
                  minHeight: 260,
                  background: 'rgba(13,27,39,0.95)',
                  border: '1px solid rgba(0,230,118,0.15)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                }}>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(0,230,118,0.1)', color: '#00e676', border: '1px solid rgba(0,230,118,0.2)' }}>
                    Hapur
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}>
                    {grant.applicant_type}
                  </span>
                </div>

                {grant.org_name && (
                  <p className="text-xs mb-3 font-semibold uppercase tracking-wider" style={{ color: 'rgba(0,230,118,0.6)' }}>
                    {grant.org_name}
                  </p>
                )}

                <h3 className="font-black text-white mb-4 line-clamp-2 text-base">{grant.title}</h3>

                {grant.description && (
                  <p className="text-sm mb-6 line-clamp-2" style={{ color: 'rgba(255,255,255,0.44)' }}>
                    {grant.description}
                  </p>
                )}

                <div className="flex-1" />

                <div className="flex items-center gap-4 text-xs mb-5 pt-5"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
                  {grant.deadline && (
                    <span>{new Date(grant.deadline).toLocaleDateString('sq-AL', { timeZone: 'UTC' })}</span>
                  )}
                  {grant.grant_value && (
                    <span className="font-bold" style={{ color: '#00e676' }}>
                      {grant.grant_value.toLocaleString()}€
                    </span>
                  )}
                </div>

                {appliedGrantIds.has(String(grant.id)) ? (
                  <Link to={`/grants/${grant.id}`}
                    className="w-full py-2.5 rounded-xl text-sm font-bold text-center transition"
                    style={{ border: '1px solid rgba(0,230,118,0.3)', color: 'rgba(0,230,118,0.6)', background: 'transparent' }}>
                    Ke aplikuar
                  </Link>
                ) : (
                  <Link to={`/grants/${grant.id}`}
                    className="w-full py-2.5 rounded-xl text-sm font-bold text-center transition"
                    style={{ background: '#00e676', color: '#0a0d14', boxShadow: '0 0 16px rgba(0,230,118,0.25)' }}>
                    Apliko
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}

        <Pagination page={page} total={total} size={PAGE_SIZE} onChange={handlePageChange} />
      </div>

      <ChatWidget />
    </div>
  )
}
