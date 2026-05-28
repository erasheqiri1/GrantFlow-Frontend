import { useState, useEffect, useCallback, useRef } from 'react'
import OrgHeader from '../../components/layout/OrgHeader'
import Pagination from '../../components/Pagination'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

const STATUS_BADGE = {
  SUBMITTED:    { label: 'Dorëzuar',    bg: 'rgba(96,165,250,0.15)',  color: '#60a5fa' },
  UNDER_REVIEW: { label: 'Vlerësuar',   bg: 'rgba(168,85,247,0.15)', color: '#a855f7' },
  APPROVED:     { label: 'Aprovuar',    bg: 'rgba(74,222,128,0.15)',  color: '#4ade80' },
  REJECTED:     { label: 'Refuzuar',    bg: 'rgba(248,113,113,0.15)', color: '#f87171' },
}

const STATUS_LABELS = {
  '':             'Të gjitha',
  'SUBMITTED':    'Dorëzuar',
  'UNDER_REVIEW': 'Vlerësuar',
  'APPROVED':     'Aprovuar',
  'REJECTED':     'Refuzuar',
}

/* ──────────────────────────── Payment Modal ──────────────────────────── */
function PaymentModal({ app, payment, onClose, onSuccess }) {
  const [note,    setNote]    = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleConfirm = async () => {
    setLoading(true)
    setError('')
    try {
      await api.patch(`/payments/application/${app.id}/mark-paid`, {
        note: note.trim() || null,
      })
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.detail || 'Gabim gjatë shënimit të pagesës')
    } finally {
      setLoading(false)
    }
  }

  const fmt = (v) =>
    v != null ? `€${Number(v).toLocaleString('sq-AL', { minimumFractionDigits: 2 })}` : '—'

  return (
    <div
      className="application-modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="application-modal-card"
        style={{ maxWidth: 440, minHeight: 'unset' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div>
            <h2 className="text-base font-bold text-white">Konfirmo pagesën</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Transferi bankar u bë — shëno si të kryer
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-sm"
            style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >✕</button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-1">
          {[
            ['Marrësi',  app.user_name || app.user_email || '—'],
            ['Email',    app.user_email || '—'],
            ['IBAN',     payment?.applicant_iban || '—'],
            ['Granti',   app.grant_title || '—'],
            ['Shuma',    fmt(payment?.amount)],
          ].map(([lbl, val]) => (
            <div
              key={lbl}
              className="flex items-center justify-between py-2.5"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{lbl}</span>
              <span
                className="text-sm font-semibold"
                style={{
                color: lbl === 'Shuma' ? '#4ade80' : 'var(--text-secondary)',
                fontFamily: lbl === 'IBAN' ? 'monospace' : undefined,
                letterSpacing: lbl === 'IBAN' ? '0.05em' : undefined,
              }}
              >{val}</span>
            </div>
          ))}

          <div className="pt-4 space-y-3">
            <div>
              <label className="text-xs block mb-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>
                Shënim (opsional)
              </label>
              <input
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Shënim shtesë..."
                className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
          {error && (
            <p className="text-xs mb-3" style={{ color: 'var(--danger)' }}>{error}</p>
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold"
              style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            >
              Anulo
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold"
              style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.4)' }}
            >
              {loading ? 'Duke ruajtur...' : 'Konfirmo pagesën'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────── Application Modal ──────────────────────────── */
function AppModal({ app: initialApp, onClose, onDecision, onScored }) {
  const { user }                    = useAuth()
  const [app, setApp]               = useState(initialApp)
  const [acting, setActing]         = useState(false)
  const [actErr, setActErr]         = useState('')
  const [commissioners, setCommissioners] = useState([])
  const [assignMode, setAssignMode] = useState(false)
  const [assignId, setAssignId]     = useState('')
  const [assigning, setAssigning]   = useState(false)

  // AI Scoring
  const [aiScore, setAiScore]       = useState(null)
  const [aiLoading, setAiLoading]   = useState(false)
  const [aiError, setAiError]       = useState('')
  const [commScore, setCommScore]   = useState('')
  const [scoreSubmitted, setScoreSubmitted] = useState(false)
  const [reviewed, setReviewed]     = useState(initialApp.status === 'UNDER_REVIEW')
  const pollRef                     = useRef(null)

  const sb           = STATUS_BADGE[app.status] || STATUS_BADGE.SUBMITTED
  const isOrgAdmin   = user?.role === 'ORG_ADMIN'
  const aiUnavailable = aiScore?.model_used === 'unavailable' || (aiScore !== null && aiScore?.ai_score == null)
  const canScore      = user?.role === 'COMMISSIONER' && ['SUBMITTED', 'UNDER_REVIEW'].includes(app.status) && !aiUnavailable


  // Ngarko komisionerët kur org-admin hap modalin
  useEffect(() => {
    if (!isOrgAdmin) return
    api.get('/team').then(r => {
      const members = r.data?.items ?? (Array.isArray(r.data) ? r.data : [])
      setCommissioners(members.filter(m => m.role === 'COMMISSIONER'))
    }).catch(() => {})
  }, [isOrgAdmin])

  // Prefill nëse ka score ekzistues, nëse jo nis AI automatikisht
  useEffect(() => {
    const startPolling = async () => {
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
            } else if (sr.data?.model_used === 'unavailable') {
              setAiScore(sr.data)
              setAiLoading(false)
              setAiError('Shërbimi AI është i padisponueshëm. Ri-provo scoring-un kur shërbimi të jetë aktiv.')
              clearInterval(pollRef.current)
            }
          } catch { }
        }, 3000)
      } catch (err) {
        setAiError(err.response?.data?.detail || 'Gabim gjatë vlerësimit AI')
        setAiLoading(false)
      }
    }

    const run = async () => {
      try {
        const existing = await api.get(`/applications/${initialApp.id}/score`)

        // Nëse AI ishte i padisponueshëm herën e fundit — ritento tani
        if (existing.data?.model_used === 'unavailable') {
          setAiScore(null)
          setAiError('')
          await startPolling()
          return
        }

        setAiScore(existing.data)
        if (existing.data?.commissioner_score != null) {
          setCommScore(String(existing.data.commissioner_score))
          setScoreSubmitted(true)
        }
      } catch {
        // 404 — nuk ka score fare, nis herën e parë
        await startPolling()
      }
    }
    run()
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [initialApp.id])

  const handleCommissionerScore = async () => {
    const val = parseFloat(commScore)
    if (isNaN(val) || val < 0 || val > 100) { setActErr('Pikët duhet të jenë 0-100'); return }
    setActing(true); setActErr('')
    try {
      const res = await api.patch(`/applications/${app.id}/commissioner-score`, { score: val })
      setAiScore(res.data)
      setScoreSubmitted(true)
      setApp(prev => ({ ...prev, status: 'UNDER_REVIEW' }))
      setReviewed(true)
      if (onScored) onScored()
    } catch (err) {
      setActErr(err.response?.data?.detail || 'Gabim gjatë ruajtjes së pikëve')
    } finally { setActing(false) }
  }

  const handleAssign = async () => {
    if (!assignId) return
    setAssigning(true)
    try {
      const res = await api.patch(`/applications/${app.id}/assign`, { commissioner_id: assignId })
      setApp(res.data)
      setAssignMode(false)
      setAssignId('')
      if (onScored) onScored()   // refresh list pa e mbylle modalin
    } catch (err) {
      setActErr(err.response?.data?.detail || 'Gabim gjatë ricaktimit')
    } finally { setAssigning(false) }
  }

  return (
    <div className="application-modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="application-modal-card">

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

        {/* Body — scroll */}
        <div className="px-6 py-4 overflow-y-auto flex-1 space-y-1">

          {/* Info rreshta */}
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
                    <p className="text-xs mb-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>{a.question_text || `Pyetja ${i + 1}`}</p>
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

          {/* AI Scoring */}
          <div className="py-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-white">Vlerësimi AI</p>
              {aiLoading && (
                <span className="text-xs animate-pulse" style={{ color: '#60a5fa' }}>Duke vlerësuar...</span>
              )}
            </div>
            {aiError && <p className="text-xs mb-2" style={{ color: 'var(--danger)' }}>{aiError}</p>}
            {aiScore?.model_used === 'unavailable' ? (
              <div className="rounded-lg p-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <p className="text-xs font-semibold" style={{ color: '#f87171' }}>⚠ Shërbimi AI i padisponueshëm</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Vlerësimi i komisionerit është bllokuar deri sa AI të jetë aktiv. Provo sërish scoring-un nga Swagger ose kontakto administratorin.
                </p>
              </div>
            ) : aiScore ? (
              <div className="rounded-lg p-3 space-y-2" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold tabular-nums"
                    style={{ color: aiScore.ai_score >= 70 ? '#4ade80' : aiScore.ai_score >= 50 ? '#fbbf24' : '#f87171' }}>
                    {Math.round(aiScore.ai_score ?? 0)}
                  </span>
                  <div className="flex-1">
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div className="h-full rounded-full" style={{
                        width: `${aiScore.ai_score ?? 0}%`,
                        background: aiScore.ai_score >= 70 ? '#4ade80' : aiScore.ai_score >= 50 ? '#fbbf24' : '#f87171',
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      Score finale: <strong style={{ color: 'var(--text-secondary)' }}>{aiScore.final_score?.toFixed(1) ?? '—'}</strong>
                      {' · '}{aiScore.model_used ?? '—'}
                    </p>
                  </div>
                </div>
                {aiScore.justification && (
                  <p className="text-xs leading-relaxed pt-2" style={{ color: 'var(--text-secondary)', borderTop: '1px solid var(--border)' }}>
                    {aiScore.justification}
                  </p>
                )}
              </div>
            ) : !aiLoading && (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Duke ngarkuar vlerësimin AI...</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
          {actErr && <p className="text-xs mb-3" style={{ color: 'var(--danger)' }}>{actErr}</p>}

          {/* Kriteret e grantit — panel informues */}
          {app.criteria?.length > 0 && (
            <div className="mb-3 rounded-lg p-3"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-medium text-white mb-2">Kriteret e vlerësimit</p>
              <div className="flex flex-wrap gap-1.5">
                {app.criteria.map(c => (
                  <span key={c.id} className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }}>
                    {c.name} · {Math.round(c.weight * 100)}%
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Score input — vetëm COMMISSIONER */}
          {canScore && (
            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-white">Pikët e mia (0 – 100)</p>
                {reviewed && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7' }}>
                    ✓ Vlerësuar
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <input type="number" min={0} max={100} step={1}
                  value={commScore}
                  onChange={e => { setCommScore(e.target.value); setScoreSubmitted(false) }}
                  placeholder="p.sh. 75"
                  className="flex-1 px-3 py-2 rounded-lg text-sm text-white outline-none"
                  style={{ background: 'var(--bg-card)', border: `1px solid ${scoreSubmitted ? 'rgba(74,222,128,0.5)' : 'var(--border)'}` }}
                />
                <button onClick={handleCommissionerScore} disabled={acting || commScore === ''}
                  className="px-4 py-2 rounded-lg text-sm font-semibold"
                  style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)', opacity: commScore === '' ? 0.5 : 1 }}>
                  {acting ? '...' : scoreSubmitted ? '✓ Ruajtur' : 'Dorëzo vlerësimin'}
                </button>
              </div>
              {aiScore?.final_score != null && (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Score finale: <strong style={{ color: aiScore.final_score >= 60 ? '#4ade80' : '#fbbf24' }}>
                    {Number(aiScore.final_score).toFixed(1)}
                  </strong>
                </p>
              )}
            </div>
          )}

          {/* ORG_ADMIN — shiko score-t, pa mundësi ndryshimi */}
          {isOrgAdmin && aiScore && (
            <div className="mb-3 rounded-lg p-3 space-y-1"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--text-muted)' }}>Score AI</span>
                <strong style={{ color: 'var(--text-secondary)' }}>{aiScore.ai_score ?? '—'}</strong>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--text-muted)' }}>Score komisioner</span>
                <strong style={{ color: 'var(--text-secondary)' }}>{aiScore.commissioner_score ?? '—'}</strong>
              </div>
              <div className="flex justify-between text-xs pt-1" style={{ borderTop: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Score finale</span>
                <strong style={{ color: aiScore.final_score >= 60 ? '#4ade80' : aiScore.final_score >= 40 ? '#fbbf24' : '#f87171' }}>
                  {aiScore.final_score?.toFixed(1) ?? '—'}
                </strong>
              </div>
            </div>
          )}

          {!canScore && (
            <button onClick={onClose}
              className="w-full py-2.5 rounded-lg text-sm font-semibold"
              style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              Mbyll
            </button>
          )}

          {/* Ricakto komisioner — vetëm org-admin, vetëm për aplikime aktive */}
          {isOrgAdmin && app.status === 'SUBMITTED' && commissioners.length > 0 && (
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
              {/* Komisioner aktual */}
              {(() => {
                const current = commissioners.find(c => c.id === app.assigned_to)
                return current ? (
                  <div className="flex items-center justify-between mb-2 px-3 py-2 rounded-lg"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Komisioner aktual</span>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {[current.first_name, current.last_name].filter(Boolean).join(' ') || current.email}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mb-2 px-3 py-2 rounded-lg"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Komisioner aktual</span>
                    <span className="text-xs italic" style={{ color: 'var(--text-muted)' }}>Pa caktuar</span>
                  </div>
                )
              })()}
              {assignMode ? (
                <div className="flex gap-2">
                  <select value={assignId} onChange={e => setAssignId(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg text-sm text-white outline-none"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <option value="">— Zgjidh komisionerin —</option>
                    {commissioners.map(c => (
                      <option key={c.id} value={c.id}>
                        {[c.first_name, c.last_name].filter(Boolean).join(' ') || c.email}
                      </option>
                    ))}
                  </select>
                  <button onClick={handleAssign} disabled={assigning || !assignId}
                    className="px-4 py-2 rounded-lg text-xs font-semibold"
                    style={{ background: 'var(--accent)', color: '#0f1117' }}>
                    {assigning ? '...' : 'Cakto'}
                  </button>
                  <button onClick={() => setAssignMode(false)}
                    className="px-3 py-2 rounded-lg text-xs"
                    style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                    Anulo
                  </button>
                </div>
              ) : (
                <button onClick={() => setAssignMode(true)}
                  className="text-xs w-full py-2 rounded-lg"
                  style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                  ↺ Ricakto komisionerin
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────── Payment cell ──────────────────────────── */
function PaymentCell({ app, payment, onOpenModal }) {
  if (app.status !== 'APPROVED') return <span style={{ color: 'var(--text-muted)' }}>—</span>

  // payment=null  → pagesa nuk ekziston ende (grant jo i finalizuar)
  // payment=undefined → loading
  if (payment === undefined) {
    return <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Duke ngarkuar...</span>
  }
  if (payment === null) {
    return <span style={{ color: 'var(--text-muted)' }}>—</span>
  }

  if (payment.status === 'PAID') {
    const amount = payment.amount != null
      ? `€${Number(payment.amount).toLocaleString('sq-AL', { minimumFractionDigits: 2 })}`
      : ''
    return (
      <span
        className="text-xs font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1"
        style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.25)' }}
      >
        ✓ Paguar {amount}
      </span>
    )
  }

  // PENDING
  return (
    <button
      onClick={e => { e.stopPropagation(); onOpenModal() }}
      className="text-xs px-3 py-1.5 rounded-lg font-semibold transition"
      style={{
        background: 'rgba(251,191,36,0.12)',
        color: '#fbbf24',
        border: '1px solid rgba(251,191,36,0.3)',
      }}
    >
      Dërgo pagesën
    </button>
  )
}

const PAGE_SIZE = 10

export default function ApplicationsReviewPage() {
  const { user }    = useAuth()
  const isOrgAdmin  = user?.role === 'ORG_ADMIN'

  const [apps,    setApps]    = useState([])
  const [total,   setTotal]   = useState(0)
  const [page,    setPage]    = useState(1)
  const [loading, setLoading] = useState(true)
  const [status,  setStatus]  = useState('')
  const [selected, setSelected] = useState(null)

  // Payments: { [application_id]: payment | null }
  const [payments,      setPayments]      = useState({})
  const [paymentModal,  setPaymentModal]  = useState(null)  // app object

  const fetchApps = useCallback((p = page) => {
    setLoading(true)
    const searchParams = new URLSearchParams(window.location.search)
    const grantId = searchParams.get('grant_id')
    const params = { page: p, size: PAGE_SIZE }
    if (status) params.status = status
    if (grantId) params.grant_id = grantId
    api.get('/applications', { params })
      .then(r => {
        const items = r.data?.items ?? (Array.isArray(r.data) ? r.data : [])
        setApps(items)
        setTotal(r.data?.total ?? 0)
        // Fetch payments for all APPROVED apps (ORG_ADMIN only)
        if (isOrgAdmin) fetchPaymentsForApps(items)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [status, page, isOrgAdmin])

  const fetchPaymentsForApps = (items) => {
    const approved = items.filter(a => a.status === 'APPROVED')
    if (approved.length === 0) return
    // Bulk fetch — ORG_ADMIN ka grants:update, nuk ka applications:read_own
    api.get('/payments', { params: { size: 100 } })
      .then(r => {
        const list = r.data?.items ?? []
        const map = {}
        list.forEach(p => { map[p.application_id] = p })
        setPayments(map)
      })
      .catch(() => {})
  }

  useEffect(() => { setPage(1); fetchApps(1) }, [status])

  const handlePageChange = (newPage) => {
    setPage(newPage)
    fetchApps(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePaymentSuccess = (app) => {
    setPaymentModal(null)
    // Refetch this payment
    api.get(`/payments/application/${app.id}`)
      .then(r => setPayments(prev => ({ ...prev, [app.id]: r.data })))
      .catch(() => {})
  }

  return (
    <div className="org-admin-shell min-h-screen">
      <OrgHeader />
      <main className="org-page-content">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Aplikimet</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {total} aplikim{total !== 1 ? 'e' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {Object.entries(STATUS_LABELS).map(([s, label]) => (
              <button key={s} onClick={() => { setStatus(s); setPage(1) }}
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
                {['Aplikanti', 'Granti', 'Statusi', isOrgAdmin ? 'Pagesa' : null, 'Dorëzuar', '']
                  .filter(Boolean)
                  .map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))
                }
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    {[...Array(isOrgAdmin ? 6 : 5)].map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 rounded animate-pulse" style={{ background: 'var(--bg-card)' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : apps.length === 0 ? (
                <tr>
                  <td colSpan={isOrgAdmin ? 6 : 5} className="px-5 py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    Nuk ka aplikime.
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

                    {/* Payment column — only ORG_ADMIN */}
                    {isOrgAdmin && (
                      <td className="px-5 py-3.5">
                        <PaymentCell
                          app={app}
                          payment={payments[app.id]}
                          onOpenModal={() => setPaymentModal(app)}
                        />
                      </td>
                    )}

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

        <Pagination page={page} total={total} size={PAGE_SIZE}
          onChange={p => { setPage(p); fetchApps(p) }} />
      </main>

      {selected && (
        <AppModal
          app={selected}
          onClose={() => setSelected(null)}
          onDecision={() => { setSelected(null); fetchApps() }}
          onScored={fetchApps}
        />
      )}

      {paymentModal && (
        <PaymentModal
          app={paymentModal}
          payment={payments[paymentModal.id]}
          onClose={() => setPaymentModal(null)}
          onSuccess={() => handlePaymentSuccess(paymentModal)}
        />
      )}
    </div>
  )
}
