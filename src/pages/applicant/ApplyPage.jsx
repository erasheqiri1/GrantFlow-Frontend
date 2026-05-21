import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/axios'

export default function ApplyPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [grant, setGrant] = useState(null)
  const [motivation, setMotivation] = useState('')
  const [answers, setAnswers] = useState({})
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const payload = {
        grant_id: id,
        motivation_letter: motivation,
        answers: Object.entries(answers).map(([question_id, answer_text]) => ({
          question_id,
          answer_text,
        })),
      }

      await api.post('/applications', payload)
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
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
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

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl font-semibold text-sm transition"
            style={{ background: submitting ? 'var(--accent-dark)' : 'var(--accent)', color: '#0f1117' }}>
            {submitting ? 'Duke dërguar...' : 'Dërgo aplikimin'}
          </button>
        </form>
      </div>
    </div>
  )
}
