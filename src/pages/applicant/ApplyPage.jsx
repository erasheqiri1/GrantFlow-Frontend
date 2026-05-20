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
      .then((res) => {
        setGrant(res.data)
        const init = {}
        res.data.questions?.forEach((q) => { init[q.id] = '' })
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
      setError(err.response?.data?.detail || 'Gabim gjatë aplikimit')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Duke ngarkuar...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <button onClick={() => navigate(-1)} className="text-sm text-blue-600 hover:underline">← Kthehu</button>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Apliko</h1>
        <p className="text-gray-500 text-sm mb-6">{grant?.title}</p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Letër motivimi
            </label>
            <textarea
              rows={5}
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Përshkruaj pse aplikon për këtë grant..."
            />
          </div>

          {grant?.questions?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
              <h2 className="font-semibold text-gray-800">Pyetjet</h2>
              {grant.questions.map((q, i) => (
                <div key={q.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {i + 1}. {q.question_text}
                    {q.is_required && <span className="text-red-400 ml-1">*</span>}
                  </label>
                  {q.question_type === 'LONG_TEXT' ? (
                    <textarea
                      rows={3}
                      required={q.is_required}
                      value={answers[q.id] || ''}
                      onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : q.question_type === 'YES_NO' ? (
                    <select
                      required={q.is_required}
                      value={answers[q.id] || ''}
                      onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Zgjedh...</option>
                      <option value="Po">Po</option>
                      <option value="Jo">Jo</option>
                    </select>
                  ) : (
                    <input
                      type={q.question_type === 'NUMBER' ? 'number' : 'text'}
                      required={q.is_required}
                      value={answers[q.id] || ''}
                      onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
          >
            {submitting ? 'Duke dërguar...' : 'Dërgo aplikimin'}
          </button>
        </form>
      </div>
    </div>
  )
}
