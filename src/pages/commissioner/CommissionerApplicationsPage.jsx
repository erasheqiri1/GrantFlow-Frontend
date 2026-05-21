import { useState, useEffect, useCallback } from 'react'
import Sidebar from '../../components/layout/Sidebar'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { to: '/commissioner',              icon: '🏠', label: 'Dashboard' },
  { to: '/commissioner/applications', icon: '📋', label: 'Aplikimet' },
  { to: '/commissioner/profile',      icon: '👤', label: 'Profili' },
]

const STATUS_BADGE = {
  SUBMITTED:    { label: 'Dorëzuar',    bg: 'rgba(96,165,250,0.15)',  color: '#60a5fa' },
  UNDER_REVIEW: { label: 'Në shqyrtim', bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24' },
  APPROVED:     { label: 'Aprovuar',    bg: 'rgba(74,222,128,0.15)',  color: '#4ade80' },
  REJECTED:     { label: 'Refuzuar',    bg: 'rgba(248,113,113,0.15)', color: '#f87171' },
}

const STATUS_LABELS = {
  '':             'Të gjitha',
  'SUBMITTED':    'Dorëzuar',
  'UNDER_REVIEW': 'Në shqyrtim',
  'APPROVED':     'Aprovuar',
  'REJECTED':     'Refuzuar',
}

function AppModal({ app: initialApp, onClose, onDecision }) {
  const { user }                    = useAuth()
  const [app, setApp]               = useState(initialApp)
  const [rejectMode, setRejectMode] = useState(false)
  const [reason, setReason]         = useState('')
  const [acting, setActing]         = useState(false)
  const [actErr, setActErr]         = useState('')

  const sb = STATUS_BADGE[app.status] || STATUS_BADGE.SUBMITTED
  // Vetëm COMMISSIONER mund të aprovojë/refuzojë
  const isCommissioner = user?.role === 'COMMISSIONER'
  const canDecide      = isCommissioner && ['SUBMITTED', 'UNDER_REVIEW'].includes(app.status)

  const handleApprove = async () => {
    setActing(true); setActErr('')
    try {
      const res = await api.patch(`/applications/${app.id}/approve`)
      setApp(res.data)
      onDecision()
    } catch (err) {
      setActErr(err.response?.data?.detail || 'Gabim gjatë aprovimit')
    } finally { setActing(false) }
  }

  const handleReject = async () => {
    setActing(true); setActErr('')
    try {
      const res = await api.patch(`/applications/${app.id}/reject`, { reason })
      setApp(res.data)
      setRejectMode(false)
      onDecision()
    } catch (err) {
      setActErr(err.response?.data?.detail || 'Gabim gjatë refuzimit')
    } finally { setActing(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.65)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-xl rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 className="text-base font-bold text-white">Detajet e aplikimit</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{app.grant_title || '—'}</p>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-sm"
            style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 overflow-y-auto flex-1 space-y-1">
          {[
            ['Aplikanti', app.user_name || app.user_email || '—'],
            ['Email',     app.user_email || '—'],
            ['Dorëzuar',  app.submitted_at ? new Date(app.submitted_at).toLocaleString('sq-AL', {
              day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
            }) : '—'],
          ].map(([lbl, val]) => (
            <div key={lbl} className="flex items-center justify-between py-2"
              style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="text-xs w-28 flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{lbl}</span>
              <span className="text-sm text-right" style={{ color: 'var(--text-secondary)' }}>{val}</span>
            </div>
          ))}

          {/* Statusi */}
          <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="text-xs w-28 flex-shrink-0" style={{ color: 'var(--text-muted)' }}>Statusi</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: sb.bg, color: sb.color }}>{sb.label}</span>
          </div>

          {/* Arsyeja e refuzimit */}
          {app.decision_reason && (
            <div className="py-2" style={{ borderBottom: '1px solid var(--border)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Arsyeja e refuzimit</p>
              <p className="text-sm" style={{ color: '#f87171' }}>{app.decision_reason}</p>
            </div>
          )}

          {/* Letra motivuese */}
          {app.motivation_letter && (
            <div className="py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <p className="text-xs mb-2 font-medium text-white">Letra motivuese</p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                {app.motivation_letter}
              </p>
            </div>
          )}

          {/* Përgjigjet */}
          {app.answers?.length > 0 && (
            <div className="py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <p className="text-xs mb-3 font-medium text-white">Përgjigjet ({app.answers.length})</p>
              <div className="space-y-4">
                {app.answers.map((a, i) => (
                  <div key={a.id} className="rounded-lg p-3"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <p className="text-xs mb-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>Pyetja {i + 1}</p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{a.answer_text || '—'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          {app.attachments?.length > 0 && (
            <div className="py-3">
              <p className="text-xs mb-2 font-medium text-white">Dokumentet ({app.attachments.length})</p>
              <div className="space-y-2">
                {app.attachments.map(att => (
                  <a key={att.id} href={att.file_path} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition"
                    style={{ background: 'var(--bg-card)', color: 'var(--accent)', border: '1px solid var(--border)' }}>
                    📎 {att.file_name}
                    <span className="ml-auto" style={{ color: 'var(--text-muted)' }}>
                      {att.size_bytes ? `${(att.size_bytes / 1024).toFixed(0)} KB` : ''}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
          {actErr && (
            <p className="text-xs mb-3" style={{ color: 'var(--danger)' }}>{actErr}</p>
          )}

          {rejectMode ? (
            <div className="space-y-3">
              <textarea rows={2} value={reason} onChange={e => setReason(e.target.value)}
                placeholder="Arsyeja e refuzimit (opsionale)..."
                className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none resize-none"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }} />
              <div className="flex gap-2">
                <button onClick={handleReject} disabled={acting}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold"
                  style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}>
                  {acting ? '...' : '✕ Konfirmo refuzimin'}
                </button>
                <button onClick={() => setRejectMode(false)}
                  className="px-4 py-2.5 rounded-lg text-sm"
                  style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                  Anulo
                </button>
              </div>
            </div>
          ) : canDecide ? (
            <div className="flex gap-3">
              <button onClick={handleApprove} disabled={acting}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold"
                style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' }}>
                {acting ? '...' : '✓ Aprovo'}
              </button>
              <button onClick={() => setRejectMode(true)} disabled={acting}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold"
                style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
                ✕ Refuzo
              </button>
            </div>
          ) : (
            <button onClick={onClose}
              className="w-full py-2.5 rounded-lg text-sm font-semibold"
              style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              Mbyll
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CommissionerApplicationsPage() {
  const { user }                = useAuth()
  const [apps, setApps]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [status, setStatus]     = useState('')
  const [selected, setSelected] = useState(null)

  const fetchApps = useCallback(() => {
    setLoading(true)
    const params = {}
    if (user?.user_id) params.assigned_to = user.user_id
    if (status) params.status = status
    api.get('/applications', { params })
      .then(r => setApps(Array.isArray(r.data) ? r.data : r.data.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [status])

  useEffect(() => { fetchApps() }, [fetchApps])

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar items={NAV} />
      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Aplikimet</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {apps.length} aplikim{apps.length !== 1 ? 'e' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {Object.entries(STATUS_LABELS).map(([s, label]) => (
              <button key={s} onClick={() => setStatus(s)}
                className="text-xs px-3 py-1.5 rounded-lg font-medium transition"
                style={{
                  background: status === s ? 'var(--accent-dim)' : 'var(--bg-card)',
                  color:      status === s ? 'var(--accent)'     : 'var(--text-muted)',
                  border: `1px solid ${status === s ? 'rgba(74,222,128,0.3)' : 'var(--border)'}`,
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Aplikanti', 'Granti', 'Statusi', 'Dorëzuar', ''].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 rounded animate-pulse" style={{ background: 'var(--bg-card)' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : apps.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    Nuk ka aplikime të caktuara.
                  </td>
                </tr>
              ) : apps.map(app => {
                const sb = STATUS_BADGE[app.status] || STATUS_BADGE.SUBMITTED
                return (
                  <tr key={app.id} style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-white">
                        {app.user_name || app.user_email || `${app.user_id?.slice(0, 8)}...`}
                      </p>
                      {app.user_name && app.user_email && (
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{app.user_email}</p>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {app.grant_title || '—'}
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: sb.bg, color: sb.color }}>
                        {sb.label}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString('sq-AL') : '—'}
                    </td>

                    <td className="px-5 py-3.5">
                      <button onClick={async () => {
                        let current = app
                        if (app.status === 'SUBMITTED') {
                          try {
                            const res = await api.patch(`/applications/${app.id}/start-review`)
                            current = res.data
                            setApps(prev => prev.map(a => a.id === app.id ? res.data : a))
                          } catch {}
                        }
                        setSelected(current)
                      }}
                        className="text-xs px-3 py-1.5 rounded-lg"
                        style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                        Shiko →
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </main>

      {selected && (
        <AppModal
          app={selected}
          onClose={() => setSelected(null)}
          onDecision={() => { setSelected(null); fetchApps() }}
        />
      )}
    </div>
  )
}
