import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../../api/axios'
import OrgHeader from '../../components/layout/OrgHeader'

const APPLICANT_TYPE_LABELS = {
  ANY:          'Të gjithë',
  STUDENT:      'Student',
  BUSINESS:     'Biznes',
  ORGANIZATION: 'Organizatë',
  INDIVIDUAL:   'Individual',
}

const QUESTION_TYPES = [
  { value: 'LONG_TEXT', label: 'Tekst i gjatë' },
  { value: 'TEXT',      label: 'Tekst i shkurtër' },
  { value: 'YES_NO',    label: 'Po / Jo' },
  { value: 'NUMBER',    label: 'Numër' },
]

export default function GrantFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({
    title: '', description: '', grant_value: '', budget: '',
    deadline: '', max_applicants: '', applicant_type: 'ANY', ai_weight: 60,
  })
  const [grantStatus, setGrantStatus] = useState('DRAFT')
  const [questions, setQuestions]     = useState([])
  const [criteria,  setCriteria]      = useState([])
  const [newQ, setNewQ]               = useState({ question_text: '', question_type: 'LONG_TEXT', is_required: true })
  const [newC, setNewC]               = useState({ name: '', weight: 30, is_required: true })
  const [showQForm, setShowQForm]     = useState(false)
  const [showCForm, setShowCForm]     = useState(false)
  const [loading,   setLoading]       = useState(false)
  const [fetchingQ, setFetchingQ]     = useState(false)
  const [error,     setError]         = useState('')
  const [success,   setSuccess]       = useState('')

  // Mund të editorohet vetëm granti DRAFT
  const canEdit = !isEdit || grantStatus === 'DRAFT'

  // Pesha totale e kritereve (0 nëse nuk ka kriter) — duhet 100 para publikimit
  const totalCriteriaWeight = criteria.reduce((sum, c) => {
    return sum + (String(c.id).startsWith('local-') ? c.weight : Math.round(c.weight * 100))
  }, 0)
  const criteriaWeightOk = criteria.length === 0 || totalCriteriaWeight === 100

  const inp  = 'w-full px-4 py-2.5 rounded-lg text-sm text-white outline-none transition'
  const inpS = { background: 'var(--bg-card)', border: '1px solid var(--border)' }
  const focus = e => (e.target.style.borderColor = 'var(--accent)')
  const blur  = e => (e.target.style.borderColor = 'var(--border)')
  const set   = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

  // Ngarko të dhënat kur në edit mode
  useEffect(() => {
    if (!isEdit) return
    api.get(`/grants/${id}`).then(res => {
      const g = res.data
      setGrantStatus(g.status || 'DRAFT')
      setForm({
        title:          g.title          || '',
        description:    g.description    || '',
        grant_value:    g.grant_value    ?? '',
        budget:         g.budget         ?? '',
        deadline:       g.deadline ? g.deadline.split('T')[0] : '',
        max_applicants: g.max_applicants ?? '',
        applicant_type: g.applicant_type || 'ANY',
        ai_weight:      Math.round((g.ai_weight || 0.6) * 100),
      })
    }).catch(() => {})

    setFetchingQ(true)
    Promise.all([
      api.get(`/grants/${id}/questions`).catch(() => ({ data: [] })),
      api.get(`/grants/${id}/criteria`).catch(() =>  ({ data: [] })),
    ]).then(([qRes, cRes]) => {
      setQuestions(qRes.data || [])
      setCriteria(cRes.data || [])
    }).finally(() => setFetchingQ(false))
  }, [id])

  const handleSave = async e => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const payload = {
        title:          form.title,
        description:    form.description || undefined,
        grant_value:    form.grant_value    ? parseFloat(form.grant_value)    : null,
        budget:         form.budget         ? parseFloat(form.budget)         : null,
        deadline:       form.deadline       ? new Date(form.deadline).toISOString() : null,
        max_applicants: form.max_applicants ? parseInt(form.max_applicants)   : null,
        applicant_type: form.applicant_type,
        ai_weight:      parseFloat(form.ai_weight) / 100,
      }
      if (isEdit) {
        await api.patch(`/grants/${id}`, payload)
        setSuccess('Granti u ruajt.')
      } else {
        const res = await api.post('/grants', payload)
        navigate(`/org-admin/grants/${res.data.id}/edit`)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Gabim gjatë ruajtjes')
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async () => {
    if (!confirm('A jeni i sigurt që doni të publikoni këtë grant?')) return
    try {
      await api.patch(`/grants/${id}/publish`)
      navigate('/org-admin/grants')
    } catch (err) {
      setError(err.response?.data?.detail || 'Gabim gjatë publikimit')
    }
  }

  // ── Questions ──────────────────────────────────────
  const addQuestion = async () => {
    if (!newQ.question_text.trim()) return
    if (isEdit) {
      // Edit mode → ruaj direkt në API
      try {
        const res = await api.post(`/grants/${id}/questions`, [newQ])
        setQuestions(q => [...q, ...res.data])
      } catch (err) {
        alert(err.response?.data?.detail || 'Gabim')
        return
      }
    } else {
      // Create mode → ruaj lokalisht me ID të përkohshëm
      setQuestions(q => [...q, { ...newQ, id: `local-${Date.now()}` }])
    }
    setNewQ({ question_text: '', question_type: 'LONG_TEXT', is_required: true })
    setShowQForm(false)
  }

  const deleteQuestion = async (qid) => {
    if (isEdit && !String(qid).startsWith('local-')) {
      try { await api.delete(`/grants/${id}/questions/${qid}`) } catch {}
    }
    setQuestions(q => q.filter(x => x.id !== qid))
  }

  // ── Criteria ───────────────────────────────────────
  const addCriteria = async () => {
    if (!newC.name.trim()) return
    if (isEdit) {
      try {
        const payload = { ...newC, weight: parseFloat(newC.weight) / 100 }
        const res = await api.post(`/grants/${id}/criteria`, [payload])
        setCriteria(c => [...c, ...res.data])
      } catch (err) {
        alert(err.response?.data?.detail || 'Gabim')
        return
      }
    } else {
      // Create mode — ruaj lokalisht, weight si % (do konvertohet para POST)
      setCriteria(c => [...c, { ...newC, id: `local-${Date.now()}` }])
    }
    setNewC({ name: '', weight: 30, is_required: true })
    setShowCForm(false)
  }

  const deleteCriteria = async (cid) => {
    if (isEdit && !String(cid).startsWith('local-')) {
      try { await api.delete(`/grants/${id}/criteria/${cid}`) } catch {}
    }
    setCriteria(c => c.filter(x => x.id !== cid))
  }

  return (
    <div className="org-admin-shell min-h-screen">
      <OrgHeader />
      <main className="org-page-content">
        {/* Header */}
        <div className="org-form-hero flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isEdit ? 'Ndrysho grant' : 'Grant i ri'}
            </h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {isEdit ? 'Ndrysho detajet, shto pyetje dhe kritere' : 'Plotëso informacionin bazë dhe shto pyetje — do të ruhet si Draft'}
            </p>
          </div>
          <Link to="/org-admin/grants" className="text-sm px-4 py-2 rounded-lg"
            style={{ color: 'var(--text-muted)', border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
            ← Kthehu
          </Link>
        </div>

        <div className="max-w-3xl space-y-5">

          {/* ── Informata bazë ─────────────────────────── */}
          <form onSubmit={handleSave}>
            <div className="rounded-2xl p-6" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <h2 className="font-semibold text-white mb-4">Informata bazë</h2>
              <div className="space-y-4">

                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Titulli *</label>
                  <input required value={form.title} onChange={set('title')}
                    placeholder="p.sh. Grant për studentë të shkëlqyer"
                    className={inp} style={inpS} onFocus={focus} onBlur={blur} />
                </div>

                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Përshkrimi</label>
                  <textarea rows={3} value={form.description} onChange={set('description')}
                    placeholder="Përshkruaj qëllimin e grantit..."
                    className={`${inp} resize-none`} style={inpS} onFocus={focus} onBlur={blur} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Shuma e çmimit (€)</label>
                    <input type="number" min="0" value={form.grant_value} onChange={set('grant_value')}
                      placeholder="p.sh. 1000"
                      className={inp} style={inpS} onFocus={focus} onBlur={blur} />
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Çmimi për çdo fitues</p>
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Buxheti total (€)</label>
                    <input type="number" min="0" value={form.budget} onChange={set('budget')}
                      placeholder="p.sh. 10000"
                      className={inp} style={inpS} onFocus={focus} onBlur={blur} />
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Fondi i përgjithshëm</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Afati i fundit</label>
                    <input type="date" value={form.deadline} onChange={set('deadline')}
                      className={inp} style={inpS} onFocus={focus} onBlur={blur} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Nr. max fituesve</label>
                    <input type="number" min="1" value={form.max_applicants} onChange={set('max_applicants')}
                      placeholder="p.sh. 5"
                      className={inp} style={inpS} onFocus={focus} onBlur={blur} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Lloji i aplikantit</label>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {Object.entries(APPLICANT_TYPE_LABELS).map(([val, label]) => (
                      <button key={val} type="button"
                        onClick={() => setForm(p => ({ ...p, applicant_type: val }))}
                        className="py-2 px-3 rounded-xl text-xs font-medium transition text-center"
                        style={{
                          background: form.applicant_type === val ? 'var(--accent-dim)' : 'var(--bg-card)',
                          border: `1px solid ${form.applicant_type === val ? 'var(--accent)' : 'var(--border)'}`,
                          color: form.applicant_type === val ? 'var(--accent)' : 'var(--text-secondary)',
                        }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Pesha e vlerësimit AI —{' '}
                    <span className="font-semibold" style={{ color: 'var(--accent)' }}>{form.ai_weight}%</span>
                    <span style={{ color: 'var(--text-muted)' }}> (kriteri manual: {100 - form.ai_weight}%)</span>
                  </label>
                  <input type="range" min="0" max="100" step="5"
                    value={form.ai_weight}
                    onChange={e => setForm(p => ({ ...p, ai_weight: parseInt(e.target.value) }))}
                    className="w-full" />
                  <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    <span>0% AI — vetëm kritere</span>
                    <span>100% AI — vetëm AI</span>
                  </div>
                </div>

              </div>

              {error && (
                <div className="mt-4 rounded-lg px-4 py-3 text-sm"
                  style={{ background: 'rgba(248,113,113,0.1)', color: 'var(--danger)', border: '1px solid rgba(248,113,113,0.2)' }}>
                  {error}
                </div>
              )}
              {success && (
                <div className="mt-4 rounded-lg px-4 py-3 text-sm"
                  style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}>
                  {success}
                </div>
              )}

              {isEdit && !criteriaWeightOk && (
                <div className="mt-4 rounded-lg px-4 py-3 flex items-start gap-2.5"
                  style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)' }}>
                  <span className="font-bold flex-shrink-0" style={{ color: '#fbbf24' }}>!</span>
                  <p className="text-xs leading-relaxed" style={{ color: '#fbbf24' }}>
                    Nuk mund të publikohet — pesha totale e kritereve është{' '}
                    <strong>{totalCriteriaWeight}%</strong>, duhet të jetë <strong>100%</strong>.
                    Shto ose ndrysho kriteret në seksionin më poshtë.
                  </p>
                </div>
              )}

              <div className="flex gap-3 mt-3">
                {canEdit ? (
                  <>
                    <button type="submit" disabled={loading}
                      className="flex-1 py-3 rounded-xl font-semibold text-sm transition"
                      style={{ background: 'var(--accent)', color: '#0f1117' }}>
                      {loading ? 'Duke ruajtur...' : isEdit ? 'Ruaj ndryshimet' : 'Krijo si Draft →'}
                    </button>
                    {isEdit && (
                      <button type="button" onClick={handlePublish}
                        disabled={!criteriaWeightOk}
                        title={!criteriaWeightOk ? `Pesha e kritereve duhet të jetë 100% (tani: ${totalCriteriaWeight}%)` : ''}
                        className="px-6 py-3 rounded-xl font-semibold text-sm transition"
                        style={{
                          background: criteriaWeightOk ? 'rgba(74,222,128,0.15)' : 'var(--bg-card)',
                          color: criteriaWeightOk ? '#4ade80' : 'var(--text-muted)',
                          border: `1px solid ${criteriaWeightOk ? 'rgba(74,222,128,0.3)' : 'var(--border)'}`,
                          cursor: criteriaWeightOk ? 'pointer' : 'not-allowed',
                          opacity: criteriaWeightOk ? 1 : 0.5,
                        }}>
                        Publiko
                      </button>
                    )}
                  </>
                ) : (
                  <div className="flex-1 py-3 rounded-xl text-sm text-center"
                    style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                    Granti është <strong>{grantStatus}</strong> — nuk mund të ndryshohet
                  </div>
                )}
              </div>
            </div>
          </form>

          {/* ── Pyetjet — vetëm edit mode ─────────── */}
          {isEdit && (
          <div className="rounded-2xl p-6" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-semibold text-white">Pyetjet për aplikantët</h2>
              {canEdit && (
                <button onClick={() => setShowQForm(v => !v)}
                  className="text-xs px-3 py-1.5 rounded-lg font-semibold transition"
                  style={{
                    background: showQForm ? 'var(--bg-card)' : 'var(--accent-dim)',
                    color: showQForm ? 'var(--text-muted)' : 'var(--accent)',
                    border: `1px solid ${showQForm ? 'var(--border)' : 'rgba(74,222,128,0.3)'}`,
                  }}>
                  {showQForm ? '✕ Mbyll' : '+ Shto pyetje'}
                </button>
              )}
            </div>
            <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>
              {canEdit
                ? 'Aplikantët do t\'i përgjigjen kur aplikojnë'
                : 'Pyetjet nuk mund të ndryshohen pasi granti është publikuar'}
            </p>

            {showQForm && (
              <div className="rounded-xl p-4 mb-4 space-y-4"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div>
                  <label className="block text-xs mb-1.5 font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Teksti i pyetjes
                  </label>
                  <input value={newQ.question_text}
                    onChange={e => setNewQ(p => ({ ...p, question_text: e.target.value }))}
                    placeholder="p.sh. Pse meritoni këtë grant?"
                    className={inp} style={inpS} onFocus={focus} onBlur={blur} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1.5 font-medium" style={{ color: 'var(--text-secondary)' }}>Tipi</label>
                    <select value={newQ.question_type}
                      onChange={e => setNewQ(p => ({ ...p, question_type: e.target.value }))}
                      className={inp} style={inpS}>
                      {QUESTION_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={newQ.is_required}
                        onChange={e => setNewQ(p => ({ ...p, is_required: e.target.checked }))} />
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>E detyrueshme</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={addQuestion} disabled={!newQ.question_text.trim()}
                    className="text-xs px-5 py-2 rounded-lg font-semibold transition"
                    style={{ background: 'var(--accent)', color: '#0f1117', opacity: newQ.question_text.trim() ? 1 : 0.4 }}>
                    Shto pyetje
                  </button>
                  <button onClick={() => setShowQForm(false)}
                    className="text-xs px-4 py-2 rounded-lg transition"
                    style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                    Anulo
                  </button>
                </div>
              </div>
            )}

            {fetchingQ ? (
              <div className="space-y-2">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-14 rounded-lg animate-pulse" style={{ background: 'var(--bg-card)' }} />
                ))}
              </div>
            ) : questions.length === 0 ? (
              <div className="py-8 text-center rounded-xl" style={{ border: '1px dashed var(--border)' }}>
                <p className="text-sm font-medium text-white mb-1">Nuk ka pyetje</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Shtoni pyetjet me butonin sipër
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {questions.map((q, i) => (
                  <div key={q.id} className="flex items-start justify-between gap-3 px-4 py-3 rounded-lg"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="text-xs w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 font-bold mt-0.5"
                        style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-white leading-snug">{q.question_text}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs px-1.5 py-0.5 rounded"
                            style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                            {QUESTION_TYPES.find(t => t.value === q.question_type)?.label || q.question_type}
                          </span>
                          {q.is_required && (
                            <span className="text-xs px-1.5 py-0.5 rounded"
                              style={{ background: 'rgba(248,113,113,0.12)', color: '#f87171' }}>
                              e detyrueshme
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {canEdit && (
                      <button onClick={() => deleteQuestion(q.id)}
                        className="w-6 h-6 flex items-center justify-center rounded text-xs transition flex-shrink-0"
                        style={{ color: 'var(--text-muted)', background: 'var(--bg-secondary)' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          )}

          {/* ── Kriteret e vlerësimit — vetëm edit mode ── */}
          {isEdit && (() => {
            const totalWeight = criteria.reduce((sum, c) => {
              return sum + (String(c.id).startsWith('local-') ? c.weight : Math.round(c.weight * 100))
            }, 0)
            const used = totalWeight
            const weightOk    = totalWeight === 100
            const weightColor = totalWeight > 100 ? '#f87171' : totalWeight === 100 ? '#4ade80' : '#fbbf24'
            const wouldExceed = used + newC.weight > 100
            const canAdd      = !wouldExceed && newC.name.trim().length > 0

            return (
            <div className="rounded-2xl p-6" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>

              {/* Header */}
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-semibold text-white">Kriteret e vlerësimit</h2>
                {canEdit && (
                  <button onClick={() => setShowCForm(v => !v)}
                    className="text-xs px-3 py-1.5 rounded-lg font-semibold transition"
                    style={{
                      background: showCForm ? 'var(--bg-card)' : 'var(--accent-dim)',
                      color: showCForm ? 'var(--text-muted)' : 'var(--accent)',
                      border: `1px solid ${showCForm ? 'var(--border)' : 'rgba(74,222,128,0.3)'}`,
                    }}>
                    {showCForm ? '✕ Mbyll' : '+ Shto kriter'}
                  </button>
                )}
              </div>

              {/* Progress bar */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Pesha totale e kritereve</p>
                  <span className="text-xs font-semibold" style={{ color: weightColor }}>
                    {totalWeight}%{' '}
                    <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>
                      {weightOk ? '✓ komplet' : totalWeight > 100 ? '↑ tejkalon' : `— mbetur ${100 - totalWeight}%`}
                    </span>
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-card)' }}>
                  <div className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(totalWeight, 100)}%`, background: weightColor }} />
                </div>
              </div>

              {/* Form shto kriter */}
              {showCForm && (
                <div className="rounded-xl p-4 mb-4 space-y-4"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>

                  <div>
                    <label className="block text-xs mb-1.5 font-medium" style={{ color: 'var(--text-secondary)' }}>
                      Emri i kriterit
                    </label>
                    <input value={newC.name}
                      onChange={e => setNewC(p => ({ ...p, name: e.target.value }))}
                      placeholder="p.sh. Nota mesatare, Motivimi, Plani i biznesit..."
                      className={inp} style={inpS} onFocus={focus} onBlur={blur} />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Pesha</label>
                      <span className="text-xs font-bold" style={{ color: wouldExceed ? '#f87171' : 'var(--accent)' }}>
                        {newC.weight}%
                        {criteria.length > 0 && (
                          <span className="font-normal ml-1" style={{ color: 'var(--text-muted)' }}>
                            / mbetur {Math.max(0, 100 - used)}%
                          </span>
                        )}
                      </span>
                    </div>
                    <input type="range" min="5" max="100" step="5"
                      value={newC.weight}
                      onChange={e => setNewC(p => ({ ...p, weight: parseInt(e.target.value) }))}
                      className="w-full" />
                    {wouldExceed && (
                      <p className="text-xs mt-2 px-3 py-2 rounded-lg"
                        style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
                        ⚠ Do të kalojë 100% — mbeten vetëm {Math.max(0, 100 - used)}%
                      </p>
                    )}
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={newC.is_required}
                      onChange={e => setNewC(p => ({ ...p, is_required: e.target.checked }))} />
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Kriter i detyrueshëm</span>
                  </label>

                  <div className="flex gap-2 pt-1">
                    <button onClick={addCriteria} disabled={!canAdd}
                      className="text-xs px-5 py-2 rounded-lg font-semibold transition"
                      style={{ background: 'var(--accent)', color: '#0f1117', opacity: canAdd ? 1 : 0.4 }}>
                      Shto kriter
                    </button>
                    <button onClick={() => setShowCForm(false)}
                      className="text-xs px-4 py-2 rounded-lg transition"
                      style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                      Anulo
                    </button>
                  </div>
                </div>
              )}

              {/* Lista kritereve */}
              {fetchingQ ? (
                <div className="space-y-2">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-14 rounded-lg animate-pulse" style={{ background: 'var(--bg-card)' }} />
                  ))}
                </div>
              ) : criteria.length === 0 ? (
                <div className="py-8 text-center rounded-xl" style={{ border: '1px dashed var(--border)' }}>
                  <p className="text-sm font-medium text-white mb-1">Nuk ka kritere</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Shtoni kriteret me butonin sipër
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {criteria.map(c => {
                    const w = String(c.id).startsWith('local-') ? c.weight : Math.round(c.weight * 100)
                    return (
                    <div key={c.id} className="rounded-lg overflow-hidden"
                      style={{ border: '1px solid var(--border)' }}>
                      <div className="h-0.5" style={{ background: 'var(--bg-card)' }}>
                        <div className="h-full transition-all duration-300"
                          style={{ width: `${w}%`, background: weightColor }} />
                      </div>
                      <div className="flex items-center justify-between px-4 py-3"
                        style={{ background: 'var(--bg-card)' }}>
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <span className="text-sm font-medium text-white truncate">{c.name}</span>
                        </div>
                        <div className="flex items-center gap-3 ml-3">
                          <span className="text-sm font-bold flex-shrink-0" style={{ color: weightColor }}>{w}%</span>
                          {canEdit && (
                            <button onClick={() => deleteCriteria(c.id)}
                              className="w-6 h-6 flex items-center justify-center rounded text-xs transition flex-shrink-0"
                              style={{ color: 'var(--text-muted)', background: 'var(--bg-secondary)' }}
                              onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )})}
                </div>
              )}
            </div>
            )
          })()}

          {/* ── Hint në create mode ── */}
          {!isEdit && (
            <div className="rounded-2xl px-6 py-4 flex items-center gap-3"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <span className="text-lg">💡</span>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Pasi të krijohet granti si Draft, do të mundesh të shtosh <strong style={{ color: 'var(--text-secondary)' }}>pyetje</strong> dhe <strong style={{ color: 'var(--text-secondary)' }}>kritere vlerësimi</strong>.
              </p>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
