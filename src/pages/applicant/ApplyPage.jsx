import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/axios'

export default function ApplyPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [grant, setGrant] = useState(null)
  const [motivation, setMotivation] = useState('')
  const [answers, setAnswers] = useState({})
  const [declaration, setDeclaration] = useState(false)
  const [docFile, setDocFile] = useState(null)
  const [docError, setDocError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/grants/${id}`)
      .then(res => {
        setGrant(res.data)
        const init = {}
        res.data.questions?.forEach(q => { init[q.id] = '' })
        setAnswers(init)
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleFileChange = (e) => {
    setDocError('')
    const file = e.target.files?.[0]
    if (!file) { setDocFile(null); return }

    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowed.includes(file.type)) {
      setDocError('Lejohen vetëm: PDF, JPG, PNG, DOC, DOCX')
      e.target.value = ''
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setDocError('Skedari nuk mund të jetë më i madh se 5 MB')
      e.target.value = ''
      return
    }
    setDocFile(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!docFile) {
      setError('Dokument mbështetës është i detyrueshëm. Ju lutemi ngarkoni një dokument identifikimi.')
      return
    }
    if (!declaration) {
      setError('Duhet të konfirmosh deklaratën para se të aplikosh.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const payload = {
        grant_id: id,
        motivation_letter: motivation,
        declaration_confirmed: true,
        answers: Object.entries(answers).map(([question_id, answer_text]) => ({
          question_id,
          answer_text,
        })),
      }

      const res = await api.post('/applications', payload)
      const applicationId = res.data.id

      // Ngarko dokumentin nëse është zgjedhur
      if (docFile && applicationId) {
        try {
          const formData = new FormData()
          formData.append('file', docFile)
          await api.post(`/applications/${applicationId}/attachments`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        } catch {
          // Dokumenti dështoi të ngarkohet, por aplikimi u krijua — vazhdo
        }
      }

      navigate('/my-applications')
    } catch (err) {
      const detail = err.response?.data?.detail || ''
      if (err.response?.status === 409) {
        navigate('/my-applications')
        return
      }
      if (detail === 'PROFILE_INCOMPLETE') {
        navigate('/profile')
        return
      }
      if (detail === 'PROFILE_MISSING_PERSONAL_ID') {
        setError('Numri personal mungon në profilin tënd. Shko te Profili dhe plotëso numrin personal para se të aplikosh.')
        return
      }
      if (detail?.startsWith('APPLICANT_TYPE_MISMATCH')) {
        navigate(-1)
        return
      }
      setError(detail || 'Gabim gjatë aplikimit')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Duke ngarkuar...</div>
    </div>
  )

  return (
    <div className="min-h-screen applicant-page" style={{ background: 'var(--bg-primary)' }}>
      <nav className="flex items-center px-6 py-3 sticky top-0 z-10"
        style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => navigate(-1)} className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          ← Kthehu
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-1">Apliko</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{grant?.title}</p>

        {error && (
          <div className="rounded-lg px-4 py-3 mb-4 text-sm"
            style={{ background: 'rgba(248,113,113,0.1)', color: 'var(--danger)', border: '1px solid rgba(248,113,113,0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Letër motivimi */}
          <div className="rounded-2xl p-5"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <label className="block text-sm font-semibold text-white mb-2">
              Letër motivimi
            </label>
            <textarea
              rows={5}
              value={motivation}
              onChange={e => setMotivation(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none transition"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', resize: 'vertical' }}
              placeholder="Përshkruaj pse aplikon për këtë grant..."
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Pyetjet */}
          {grant?.questions?.length > 0 && (
            <div className="rounded-2xl p-5 space-y-5"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <h2 className="font-semibold text-white">Pyetjet</h2>
              {grant.questions.map((q, i) => (
                <div key={q.id}>
                  <label className="block text-sm font-medium text-white mb-1">
                    {i + 1}. {q.question_text}
                    {q.is_required && <span className="ml-1" style={{ color: 'var(--danger)' }}>*</span>}
                  </label>
                  {q.question_type === 'LONG_TEXT' ? (
                    <textarea
                      rows={3}
                      required={q.is_required}
                      value={answers[q.id] || ''}
                      onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                      className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none transition"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', resize: 'vertical' }}
                      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />
                  ) : q.question_type === 'YES_NO' ? (
                    <select
                      required={q.is_required}
                      value={answers[q.id] || ''}
                      onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                      className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                      <option value="">Zgjedh...</option>
                      <option value="Po">Po</option>
                      <option value="Jo">Jo</option>
                    </select>
                  ) : (
                    <input
                      type={q.question_type === 'NUMBER' ? 'number' : 'text'}
                      required={q.is_required}
                      value={answers[q.id] || ''}
                      onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                      className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none transition"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Dokument mbështetës */}
          <div className="rounded-2xl p-5"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <div className="flex items-start justify-between mb-1">
              <label className="text-sm font-semibold text-white">
                Dokument identifikimi <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(248,113,113,0.1)', color: 'var(--danger)', border: '1px solid rgba(248,113,113,0.2)' }}>
                I detyrueshëm
              </span>
            </div>
            <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
              Ngarko dokument që vërteton identitetin tënd (p.sh. letërnjoftim, letër studentore, certifikatë biznesi, NIPT).
              Formatet e lejuara: PDF, JPG, PNG, DOC, DOCX — max 5 MB.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />

            {docFile ? (
              <div className="flex items-center justify-between rounded-lg px-3 py-2"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base" aria-hidden="true" />
                  <span className="text-sm text-white truncate">{docFile.name}</span>
                  <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                    ({(docFile.size / 1024).toFixed(0)} KB)
                  </span>
                </div>
                <button type="button"
                  onClick={() => { setDocFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                  className="text-xs ml-2 flex-shrink-0"
                  style={{ color: 'var(--danger)' }}>
                  Hiq ✕
                </button>
              </div>
            ) : (
              <button type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition"
                style={{ background: 'var(--bg-card)', border: '1px dashed var(--border)', color: 'var(--text-secondary)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                Zgjedh skedarin...
              </button>
            )}

            {docError && (
              <p className="text-xs mt-2" style={{ color: 'var(--danger)' }}>{docError}</p>
            )}
          </div>

          {/* Deklarata — e detyrueshme */}
          <div className="rounded-2xl p-5"
            style={{
              background: declaration ? 'rgba(74,222,128,0.05)' : 'var(--bg-secondary)',
              border: declaration ? '1px solid rgba(74,222,128,0.3)' : '1px solid var(--border)',
              transition: 'all 0.2s',
            }}>
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="relative flex-shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={declaration}
                  onChange={e => { setDeclaration(e.target.checked); if (e.target.checked) setError('') }}
                  className="sr-only"
                />
                <div className="w-5 h-5 rounded flex items-center justify-center transition"
                  style={{
                    background: declaration ? 'var(--accent)' : 'var(--bg-card)',
                    border: declaration ? '1px solid var(--accent)' : '1px solid var(--border)',
                  }}>
                  {declaration && <span className="text-xs font-bold" style={{ color: '#0f1117' }}>✓</span>}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: declaration ? 'var(--accent)' : 'var(--text-secondary)' }}>
                  Konfirmoj saktësinë e të dhënave <span style={{ color: 'var(--danger)' }}>*</span>
                </p>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  Konfirmoj se të gjitha të dhënat e profilit tim dhe përgjigjet në këtë aplikim janë
                  të sakta, të plota dhe të vërteta. Kuptoj se deklarata e rreme rezulton në
                  skualifikim dhe refuzim të aplikimit.
                </p>
              </div>
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting || !declaration || !docFile}
            className="w-full py-3 rounded-xl font-semibold text-sm transition"
            style={{
              background: (!declaration || !docFile || submitting) ? 'var(--bg-card)' : 'var(--accent)',
              color: (!declaration || !docFile || submitting) ? 'var(--text-muted)' : '#0f1117',
              border: (!declaration || !docFile || submitting) ? '1px solid var(--border)' : 'none',
              cursor: (!declaration || !docFile || submitting) ? 'not-allowed' : 'pointer',
            }}>
            {submitting ? 'Duke dërguar...' : !docFile ? 'Ngarko dokumentin për të vazhduar' : !declaration ? 'Konfirmo deklaratën për të vazhduar' : 'Dërgo aplikimin'}
          </button>
        </form>
      </div>
    </div>
  )
}
