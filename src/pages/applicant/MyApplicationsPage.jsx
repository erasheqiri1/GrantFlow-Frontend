import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'

const STATUS_INFO = {
  DRAFT:        { label: 'Draft', bg: 'rgba(107,114,128,0.15)', color: '#9ca3af' },
  SUBMITTED:    { label: 'Dorëzuar', bg: 'rgba(59,130,246,0.15)', color: '#60a5fa' },
  UNDER_REVIEW: { label: 'Në shqyrtim', bg: 'rgba(234,179,8,0.15)', color: '#facc15' },
  APPROVED:     { label: 'Aprovuar', bg: 'rgba(34,197,94,0.15)', color: '#4ade80' },
  REJECTED:     { label: 'Refuzuar', bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
}

function grantName(app) {
  return app.grant_title || app.grant?.title || (app.grant_id ? `Grant #${app.grant_id}` : 'Aplikim')
}

export default function MyApplicationsPage() {
  const { logout, user } = useAuthStore()
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/applications/my')
      .then(res => setApplications(res.data))
      .finally(() => setLoading(false))
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
            <Link to="/grants" className="text-sm" style={{ color: 'var(--text-secondary)' }}>Grante</Link>
            <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>Aplikimet e mia</span>
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

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-white mb-6">Aplikimet e mia</h2>

        {loading ? (
          <div className="text-center py-16" style={{ color: 'var(--text-secondary)' }}>
            Duke ngarkuar...
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">📋</div>
            <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Nuk ke asnjë aplikim ende.</p>
            <Link to="/grants" className="font-semibold" style={{ color: 'var(--accent)' }}>
              Shfleto grantet →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map(app => {
              const si = STATUS_INFO[app.status] || STATUS_INFO.DRAFT
              return (
                <div key={app.id} className="rounded-2xl p-5 transition hover:scale-[1.005]"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                          style={{ background: si.bg, color: si.color }}>
                          {si.label}
                        </span>
                      </div>
                      <h3 className="font-semibold text-white truncate">{grantName(app)}</h3>
                      <div className="text-xs mt-1 space-y-0.5" style={{ color: 'var(--text-muted)' }}>
                        <p>Krijuar: {new Date(app.created_at).toLocaleDateString('sq-AL')}</p>
                        {app.submitted_at && (
                          <p>Dorëzuar: {new Date(app.submitted_at).toLocaleDateString('sq-AL')}</p>
                        )}
                      </div>
                      {app.decision_reason && (
                        <p className="text-xs mt-2 px-3 py-2 rounded-lg"
                          style={{ background: 'rgba(248,113,113,0.08)', color: 'var(--danger)' }}>
                          {app.decision_reason}
                        </p>
                      )}
                    </div>
                    <Link to={`/my-applications/${app.id}`}
                      className="flex-shrink-0 text-xs font-semibold px-4 py-2 rounded-lg transition"
                      style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                      {app.status === 'DRAFT' ? 'Dorëzo →' : 'Shiko →'}
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
