import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'

export default function GrantDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [grant, setGrant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/grants/${id}`)
      .then((res) => setGrant(res.data))
      .catch(() => setError('Granti nuk u gjet.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Duke ngarkuar...</div>
  if (error)   return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <Link to="/grants" className="text-sm text-blue-600 hover:underline">← Kthehu te grante</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs bg-blue-50 text-blue-600 font-medium px-2 py-0.5 rounded-full">
              {grant.applicant_type}
            </span>
            <span className="text-xs bg-green-50 text-green-600 font-medium px-2 py-0.5 rounded-full">
              {grant.status}
            </span>
            {grant.org_name && <span className="text-xs text-gray-400">{grant.org_name}</span>}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">{grant.title}</h1>

          {grant.description && (
            <p className="text-gray-600 mb-4">{grant.description}</p>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            {grant.grant_value && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-gray-400 text-xs mb-1">Vlera e grantit</div>
                <div className="font-semibold">{grant.grant_value.toLocaleString()} {grant.currency}</div>
              </div>
            )}
            {grant.deadline && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-gray-400 text-xs mb-1">Afati</div>
                <div className="font-semibold">{new Date(grant.deadline).toLocaleDateString('sq-AL')}</div>
              </div>
            )}
            {grant.max_applicants && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-gray-400 text-xs mb-1">Maks. aplikantë</div>
                <div className="font-semibold">{grant.max_applicants}</div>
              </div>
            )}
          </div>
        </div>

        {/* Pyetjet */}
        {grant.questions?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pyetjet e aplikimit</h2>
            <div className="space-y-3">
              {grant.questions.map((q, i) => (
                <div key={q.id} className="flex gap-3">
                  <span className="text-blue-500 font-bold text-sm mt-0.5">{i + 1}.</span>
                  <div>
                    <p className="text-sm text-gray-800">{q.question_text}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs text-gray-400">{q.question_type}</span>
                      {q.is_required && <span className="text-xs text-red-400">* i detyrueshëm</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => navigate(`/grants/${id}/apply`)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition"
        >
          Apliko tani
        </button>
      </div>
    </div>
  )
}
