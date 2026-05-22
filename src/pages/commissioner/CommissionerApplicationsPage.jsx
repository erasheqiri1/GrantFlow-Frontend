import { useState, useEffect, useCallback, useRef } from 'react'
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
  UNDER_REVIEW: { label: 'Vlerësuar', bg: 'rgba(168,85,247,0.15)', color: '#a855f7' },
  APPROVED:     { label: 'Aprovuar',    bg: 'rgba(74,222,128,0.15)',  color: '#4ade80' },
  REJECTED:     { label: 'Refuzuar',    bg: 'rgba(248,113,113,0.15)', color: '#f87171' },
}

const STATUS_LABELS = {
  '':             'Të gjitha',
  'SUBMITTED':    'Dorëzuar',
  'UNDER_REVIEW': 'Në shqyrtim',
}

function AppModal({ app: initialApp, onClose, onDecision, onScored }) {
  const { user }                    = useAuth()
  const [app, setApp]               = useState(initialApp)
  const [acting, setActing]         = useState(false)
  const [actErr, setActErr]         = useState('')
  const [commScore, setCommScore]   = useState('')
  const [scoreSubmitted, setScoreSubmitted] = useState(false)
  const [reviewed, setReviewed]     = useState(initialApp.status === 'UNDER_REVIEW')

  // AI Scoring
  const [aiScore, setAiScore]       = useState(null)
  const [aiLoading, setAiLoading]   = useState(false)
  const [aiError, setAiError]       = useState('')
  const pollRef                     = useRef(null)

  // Nëse ka commissioner_score ekzistues, mbushi inputin
  useEffect(() => {
    if (aiScore?.commissioner_score != null) {
      setCommScore(String(aiScore.commissioner_score))
      setScoreSubmitted(true)
    }
  }, [aiScore])

  const handleCommissionerScore = async () => {
    const val = parseFloat(commScore)
    if (isNaN(val) || val < 0 || val > 100) {
      setActErr('Pikët duhet të jenë 0-100')
      return
    }
    setActing(true); setActErr('')
    try {
      const res = await api.patch(`/applications/${app.id}/commissioner-score`, { score: val })
      setAiScore(res.data)
      setScoreSubmitted(true)
      // Aplikimi kaloi në UNDER_REVIEW — pasqyro në modal
      setApp(prev => ({ ...prev, status: 'UNDER_REVIEW' }))
      setReviewed(true)
      onScored()   // rifresko tabelën pa e mbyllur modalin
    } catch (err) {
      setActErr(err.response?.data?.detail || 'Gabim gjatë ruajtjes së pikëve')
    } finally { setActing(false) }
  }

  // Kur hapet modali: nëse ka score ekzistues → shfaqe, nëse jo → nis automatikisht
  useEffect(() => {
    const run = async () => {
      try {
        const existing = await api.get(`/applications/${initialApp.id}/score`)
        setAiScore(existing.data)
      } catch {
        // 404 — nuk ka score, nis automatikisht
        setAiLoading(true)
        try {
          await api.post(`/applications/${initialApp.id}/score`)
          pollRef.current = setInterval(async () => {
            try {
              const sr = await api.get(`/applications/${initialApp.id}/score`)
              if (sr.data?.ai_score != null) {
                setAiScore(sr.data)
                setAiLoading(false)
                clearInterval(pollRef.current)
              }
            } catch { /* ende 404 — vazhdo polling */ }
          }, 3000)
        } catch (err) {
          setAiError(err.response?.data?.detail || 'Gabim gjatë vlerësimit AI')
          setAiLoading(false)
        }
      }
    }
    run()
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [initialApp.id])

  const handleScore = async () => {
    setAiLoading(true); setAiError('')
    try {
      const res = await api.post(`/applications/${app.id}/score`)
      if (res.data.status === 'cached') {
        const sr = await api.get(`/applications/${app.id}/score`)
        setAiScore(sr.data)
        setAiLoading(false)
        return
      }
      // status === 'processing' — poll every 3 s until score is ready
      pollRef.current = setInterval(async () => {
        try {
          const sr = await api.get(`/applications/${app.id}/score`)
          if (sr.data?.ai_score != null) {
            setAiScore(sr.data)
            setAiLoading(false)
            clearInterval(pollRef.current)
          }
        } catch { /* 404 still — keep polling */ }
      }, 3000)
    } catch (err) {
      setAiError(err.response?.data?.detail || 'Gabim gjatë vlerësimit AI')
      setAiLoading(false)
    }
  }

  const sb        = STATUS_BADGE[app.status] || STATUS_BADGE.SUBMITTED
  const isReviewer = ['COMMISSIONER', 'ORG_ADMIN'].includes(user?.role)
  const canScore   = isReviewer && ['SUBMITTED', 'UNDER_REVIEW'].includes(app.status)

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
            <div className="py-3" style={{ borderBottom: '1px solid var(--border)' }}>
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

          {/* ── AI Scoring ── */}
          <div className="py-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-white">🤖 Vlerësimi AI</p>
              {aiLoading ? (
                <span className="text-xs animate-pulse" style={{ color: '#60a5fa' }}>⏳ Duke vlerësuar...</span>
              ) : aiScore ? (
                <button onClick={handleScore}
                  className="text-xs px-2 py-1 rounded-lg"
                  style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                  🔄 Rivlerëso
                </button>
              ) : (
                <button onClick={handleScore}
                  className="text-xs px-3 py-1 rounded-lg font-medium"
                  style={{ background: 'rgba(96,165,250,0.15)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)' }}>
                  Vlerëso me AI
                </button>
              )}
            </div>

            {aiError && (
              <p className="text-xs mb-2" style={{ color: 'var(--danger)' }}>{aiError}</p>
            )}

            {aiScore ? (
              <div className="rounded-lg p-3 space-y-2"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                {/* Score number + progress bar */}
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold tabular-nums"
                    style={{ color: aiScore.ai_score >= 70 ? '#4ade80' : aiScore.ai_score >= 50 ? '#fbbf24' : '#f87171' }}>
                    {Math.round(aiScore.ai_score ?? 0)}
                  </span>
                  <div className="flex-1">
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div className="h-full rounded-full"
                        style={{
                          width: `${aiScore.ai_score ?? 0}%`,
                          background: aiScore.ai_score >= 70 ? '#4ade80' : aiScore.ai_score >= 50 ? '#fbbf24' : '#f87171',
                          transition: 'width 0.6s ease',
                        }} />
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      Score finale:{' '}
                      <strong style={{ color: 'var(--text-secondary)' }}>
                        {aiScore.final_score?.toFixed(1) ?? '—'}
                      </strong>
                      {' · '}{aiScore.model_used ?? '—'}
                      {aiScore.is_cached && (
                        <span style={{ color: '#60a5fa' }}> · cache</span>
                      )}
                    </p>
                  </div>
                </div>
                {/* Justification */}
                {aiScore.justification && (
                  <p className="text-xs leading-relaxed pt-2"
                    style={{ color: 'var(--text-secondary)', borderTop: '1px solid var(--border)' }}>
                    {aiScore.justification}
                  </p>
                )}
              </div>
            ) : !aiLoading && (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Kliko "Vlerëso me AI" për analizë automatike të aplikimit.
              </p>
            )}
          </div>
        </div>

        {/* Footer — Komisioner jep pikët e tij */}
        <div className="px-6 py-4 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
          {actErr && <p className="text-xs mb-3" style={{ color: 'var(--danger)' }}>{actErr}</p>}

          {canScore ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-white">✍️ Pikët e mia (0 – 100)</p>
                {reviewed && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7' }}>
                    ✓ Vlerësuar
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="number" min={0} max={100} step={1}
                  value={commScore}
                  onChange={e => { setCommScore(e.target.value); setScoreSubmitted(false) }}
                  placeholder="p.sh. 75"
                  className="flex-1 px-3 py-2 rounded-lg text-sm text-white outline-none"
                  style={{ background: 'var(--bg-card)', border: `1px solid ${scoreSubmitted ? 'rgba(74,222,128,0.5)' : 'var(--border)'}` }}
                />
                <button onClick={handleCommissionerScore} disabled={acting || commScore === ''}
                  className="px-5 py-2 rounded-lg text-sm font-semibold"
                  style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)', opacity: commScore === '' ? 0.5 : 1 }}>
                  {acting ? '...' : scoreSubmitted ? '✓ Ruajtur' : 'Dorëzo vlerësimin'}
                </button>
              </div>
              {aiScore?.final_score != null && (
                <p className="text-xs pt-1" style={{ color: 'var(--text-muted)' }}>
                  Score finale:{' '}
                  <strong style={{ color: aiScore.final_score >= 60 ? '#4ade80' : aiScore.final_score >= 40 ? '#fbbf24' : '#f87171' }}>
                    {Number(aiScore.final_score).toFixed(1)}
                  </strong>
                  {(() => {
                    if (aiScore.ai_score == null || aiScore.commissioner_score == null) return null
                    const w = aiScore.ai_score !== aiScore.commissioner_score
                      ? Math.round(((aiScore.final_score - aiScore.commissioner_score) / (aiScore.ai_score - aiScore.commissioner_score)) * 100)
                      : 60
                    return <span> (AI × {w}% + Komisioner × {100 - w}%)</span>
                  })()}
                </p>
              )}
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
                      <button onClick={() => setSelected(app)}
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
          onScored={fetchApps}
        />
      )}
    </div>
  )
}
