import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../../api/axios'

export default function GrantFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({
    title: '', description: '', currency: 'EUR',
    grant_value: '', deadline: '', max_applicants: '',
    applicant_type: 'ANY', ai_weight: 0.60,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isEdit) {
      api.get(`/grants/${id}`).then((res) => {
        const g = res.data
        setForm({
          title: g.title || '',
          description: g.description || '',
          currency: g.currency || 'EUR',
          grant_value: g.grant_value || '',
          deadline: g.deadline ? g.deadline.split('T')[0] : '',
          max_applicants: g.max_applicants || '',
          applicant_type: g.applicant_type || 'ANY',
          ai_weight: g.ai_weight || 0.60,
        })
      })
    }
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        ...form,
        grant_value: form.grant_value ? parseFloat(form.grant_value) : null,
        max_applicants: form.max_applicants ? parseInt(form.max_applicants) : null,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
      }
      if (isEdit) {
        await api.patch(`/grants/${id}`, payload)
      } else {
        await api.post('/grants', payload)
      }
      navigate('/org-admin/grants')
    } catch (err) {
      setError(err.response?.data?.detail || 'Gabim')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <Link to="/org-admin/grants" className="text-sm text-blue-600 hover:underline">← Kthehu</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{isEdit ? 'Ndrysho grant' : 'Grant i ri'}</h2>

        {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titulli *</label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Përshkrimi</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vlera (€)</label>
              <input type="number" value={form.grant_value} onChange={(e) => setForm({ ...form, grant_value: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Afati</label>
              <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lloji i aplikantit</label>
              <select value={form.applicant_type} onChange={(e) => setForm({ ...form, applicant_type: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {['ANY','STUDENT','BUSINESS','ORGANIZATION','INDIVIDUAL'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Maks. aplikantë</label>
              <input type="number" value={form.max_applicants} onChange={(e) => setForm({ ...form, max_applicants: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50">
            {loading ? 'Duke ruajtur...' : isEdit ? 'Ruaj ndryshimet' : 'Krijo grant'}
          </button>
        </form>
      </div>
    </div>
  )
}
