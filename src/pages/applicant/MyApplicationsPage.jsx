import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'

const STATUS_COLORS = {
  DRAFT:        'bg-gray-100 text-gray-600',
  SUBMITTED:    'bg-blue-50 text-blue-600',
  UNDER_REVIEW: 'bg-yellow-50 text-yellow-600',
  APPROVED:     'bg-green-50 text-green-600',
  REJECTED:     'bg-red-50 text-red-600',
}

const STATUS_LABELS = {
  DRAFT:        'Draft',
  SUBMITTED:    'Dorëzuar',
  UNDER_REVIEW: 'Në shqyrtim',
  APPROVED:     'Aprovuar',
  REJECTED:     'Refuzuar',
}

export default function MyApplicationsPage() {
  const { logout } = useAuthStore()
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/applications/my')
      .then((res) => setApplications(res.data))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (appId) => {
    try {
      await api.post(`/applications/${appId}/submit`)
      setApplications((prev) =>
        prev.map((a) => a.id === appId ? { ...a, status: 'SUBMITTED' } : a)
      )
    } catch (err) {
      alert(err.response?.data?.detail || 'Gabim')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">GrantFlow</h1>
        <div className="flex items-center gap-4">
          <Link to="/grants" className="text-sm text-gray-600 hover:text-blue-600 font-medium">
            Grante
          </Link>
          <button onClick={() => { logout(); navigate('/login') }} className="text-sm text-red-500 hover:text-red-700">
            Dil
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Aplikimet e mia</h2>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Duke ngarkuar...</div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">Nuk ke asnjë aplikim ende.</p>
            <Link to="/grants" className="text-blue-600 hover:underline font-medium">
              Shfleto grantet →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[app.status]}`}>
                        {STATUS_LABELS[app.status]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Krijuar: {new Date(app.created_at).toLocaleDateString('sq-AL')}
                    </p>
                    {app.submitted_at && (
                      <p className="text-sm text-gray-500">
                        Dorëzuar: {new Date(app.submitted_at).toLocaleDateString('sq-AL')}
                      </p>
                    )}
                    {app.decision_reason && (
                      <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded p-2">
                        {app.decision_reason}
                      </p>
                    )}
                  </div>
                  {app.status === 'DRAFT' && (
                    <button
                      onClick={() => handleSubmit(app.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                    >
                      Dorëzo
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
