import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import Pagination from '../../components/layout/Pagination'

const STATUS_INFO = {
  DRAFT:        { label: 'Draft', bg: 'rgba(107,114,128,0.15)', color: '#9ca3af' },
  SUBMITTED:    { label: 'Dorëzuar', bg: 'rgba(59,130,246,0.15)', color: '#60a5fa' },
  UNDER_REVIEW: { label: 'Në shqyrtim', bg: 'rgba(234,179,8,0.15)', color: '#facc15' },
  APPROVED:     { label: 'Aprovuar', bg: 'rgba(0,230,118,0.12)', color: '#00e676' },
  REJECTED:     { label: 'Refuzuar', bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
}

const FILTERS = ['', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED']
const FILTER_LABELS = {
  '': 'Të gjitha',
  SUBMITTED: 'Dorëzuar',
  UNDER_REVIEW: 'Në shqyrtim',
  APPROVED: 'Aprovuar',
  REJECTED: 'Refuzuar',
}

function grantName(app) {
  return app.grant_title || app.grant?.title || (app.grant_id ? `Grant #${app.grant_id}` : 'Aplikim')
}

const PAGE_SIZE = 8

export default function MyApplicationsPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    api.get('/applications/my')
      .then(res => setApplications(res.data?.items ?? (Array.isArray(res.data) ? res.data : [])))
      .finally(() => setLoading(false))
  }, [])

  const filtered = applications
    .filter(app => !status || app.status === status)
    .filter(app => !search || grantName(app).toLowerCase().includes(search.toLowerCase()))

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const visible    = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleFilterChange = (newStatus) => {
    setStatus(newStatus)
    setPage(1)
  }

  const handleSearch = (val) => {
    setSearch(val)
    setPage(1)
  }

  return (
    <div className="min-h-screen applicant-shell" style={{ background: '#0a0d14' }}>
      <nav className="sticky top-0 z-20 flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-8">
          <div className="text-lg font-black tracking-wider">
            <span className="text-white">GRANT</span><span style={{ color: '#00e676' }}>FLOW</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/grants" data-active="false" className="px-4 py-1.5 rounded-lg text-sm font-semibold transition">
              Grante
            </Link>
            <Link to="/my-applications" data-active="true" className="px-4 py-1.5 rounded-lg text-sm font-semibold transition">
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
          <button onClick={() => { logout(); navigate('/login') }}
            className="rounded-xl font-black tracking-wide transition">
            Dil
          </button>
        </div>
      </nav>

      <div className="relative z-10 px-8 pb-14 my-applications-content">
        <div className="mb-9">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-7 grant-active-pill">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#00e676' }} />
            <span>Historia</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-7 grant-hero-title">
            Aplikimet <span style={{ color: '#00e676' }}>e mia</span>
          </h1>
          <p className="text-base max-w-2xl" style={{ color: 'rgba(255,255,255,0.52)' }}>
            Gjurmo statusin e aplikimeve tuaja.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative grant-search-wrap" style={{ width: 520, maxWidth: '100%' }}>
            <div className="relative">
              <input
                type="text"
                placeholder="Kërko sipas grantit..."
                value={search}
                onChange={e => handleSearch(e.target.value)}
                className="w-full pl-5 pr-5 py-3 text-sm text-white outline-none rounded-2xl grant-search-input"
                style={{ background: 'rgba(5,14,22,0.78)', border: '2px solid rgba(0,230,118,0.34)' }}
              />
            </div>
          </div>

          {FILTERS.map(key => (
            <button
              key={key}
              onClick={() => handleFilterChange(key)}
              className="application-status-button text-xs rounded-lg font-semibold transition"
              data-active={status === key ? 'true' : 'false'}
            >
              {FILTER_LABELS[key]}
            </button>
          ))}
        </div>

        {!loading && (
          <p className="text-xs mb-7 font-semibold uppercase tracking-widest" style={{ color: 'rgba(0,230,118,0.58)' }}>
            {filtered.length} aplikime të gjetura
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 rounded-2xl animate-pulse"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,230,118,0.1)' }} />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <p className="text-lg font-bold text-white mb-2">
              {applications.length === 0 ? 'Nuk ke asnjë aplikim ende.' : 'Nuk u gjet asnjë aplikim.'}
            </p>
            {applications.length === 0 && (
              <Link to="/grants" className="text-sm font-semibold" style={{ color: '#00e676' }}>
                Shfleto grantet
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {visible.map(app => {
              const si = STATUS_INFO[app.status] || STATUS_INFO.DRAFT
              return (
                <div key={app.id}
                  className="rounded-2xl flex flex-col transition-all duration-200 hover:scale-[1.02] grant-card"
                  style={{
                    padding: '28px 24px',
                    minHeight: 260,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(0,230,118,0.15)',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                  }}>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ background: si.bg, color: si.color, border: `1px solid ${si.color}30` }}>
                      {si.label}
                    </span>
                  </div>

                  <p className="text-xs mb-3 font-semibold uppercase tracking-wider" style={{ color: 'rgba(0,230,118,0.6)' }}>
                    Aplikim
                  </p>
                  <h3 className="font-black text-white mb-4 line-clamp-2 text-base">{grantName(app)}</h3>

                  {app.decision_reason && (
                    <p className="text-xs mb-5 px-3 py-2 rounded-lg line-clamp-2"
                      style={{ background: 'rgba(248,113,113,0.08)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
                      {app.decision_reason}
                    </p>
                  )}

                  <div className="flex-1" />

                  <div className="text-xs mb-5 pt-5"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
                    {app.submitted_at
                      ? `Dorëzuar: ${new Date(app.submitted_at).toLocaleDateString('sq-AL')}`
                      : 'Draft'}
                  </div>

                  <Link to={`/my-applications/${app.id}`}
                    className="w-full py-2.5 rounded-xl text-sm font-bold text-center transition"
                    style={{ background: '#00e676', color: '#0a0d14', boxShadow: '0 0 16px rgba(0,230,118,0.25)' }}>
                    {app.status === 'DRAFT' ? 'Dorëzo' : 'Shiko'}
                  </Link>
                </div>
              )
            })}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  )
}
