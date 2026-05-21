import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'

const STATUS_INFO = {
  DRAFT:        { label: 'Draft', bg: 'rgba(107,114,128,0.15)', color: '#9ca3af' },
  SUBMITTED:    { label: 'Dorëzuar', bg: 'rgba(59,130,246,0.15)', color: '#60a5fa' },
  UNDER_REVIEW: { label: 'Në shqyrtim', bg: 'rgba(234,179,8,0.15)', color: '#facc15' },
  APPROVED:     { label: 'Aprovuar', bg: 'rgba(34,197,94,0.15)', color: '#4ade80' },
  REJECTED:     { label: 'Refuzuar', bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
}

export default function ApplicationDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const [application, setApplication] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)

  useEffect(() => {
    api.get(`/applications/${id}`)
      .then(res => setApplication(res.data))
      .catch(() => setError('Aplikimi nuk u gjet.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      await api.post(`/applications/${id}/submit`)
      setApplication(prev => ({ ...prev, status: 'SUBMITTED' }))
      setSubmitSuccess(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Gabim gjatë dorëzimit. Provo sërish.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Duke ngarkuar...</div>
      </div>
    )
  }

  if (error && !application) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-sm" style={{ color: 'var(--danger)' }}>{error}</div>
      </div>
    )
  }

  const statusInfo = STATUS_INFO[application?.status] || STATUS_INFO.DRAFT
  const grantTitle = application?.grant_title
    || application?.grant?.title
    || (application?.grant_id ? `Grant #${application.grant_id}` : 'Aplikim')

  return (
    <div className="min-h-screen applicant-page" style={{ background: 'var(--bg-primary)' }}>
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-3 sticky top-0 z-10"
        style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-6">
          <div className="text-lg font-black">
            <span className="text-white">Grant</span><span style={{ color: 'var(--accent)' }}>Flow</span>
          </div>
          <button onClick={() => navigate('/my-applications')}
            className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            ← Aplikimet e mia
          </button>
        </div>
        <button onClick={() => { logout(); navigate('/login') }}
          className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Dil
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Status + grant header */}
        <div className="rounded-2xl p-6 mb-4"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{ background: statusInfo.bg, color: statusInfo.color }}>
              {statusInfo.label}
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mb-3">{grantTitle}</h1>
          <div className="space-y-1 text-xs application-detail-dates" style={{ color: 'var(--text-muted)' }}>
            {application?.submitted_at ? (
              <p>Dorëzuar: {new Date(application.submitted_at).toLocaleDateString('sq-AL')}</p>
            ) : (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>—</p>
            )}
          </div>

          {application?.decision_reason && (
            <div className="mt-4 rounded-lg px-4 py-3 text-sm"
              style={{ background: 'rgba(248,113,113,0.1)', color: 'var(--danger)', border: '1px solid rgba(248,113,113,0.2)' }}>
              <p className="font-semibold mb-1">Arsyeja e vendimit:</p>
              {application.decision_reason}
            </div>
          )}
        </div>

        {/* Motivation letter */}
        {application?.motivation_letter && (
          <div className="rounded-2xl p-6 mb-4"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <h2 className="font-semibold text-white mb-3">Letër motivimi</h2>
            <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
              {application.motivation_letter}
            </p>
          </div>
        )}

        {/* Answers */}
        {application?.answers?.length > 0 && (
          <div className="rounded-2xl p-6 mb-4"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <h2 className="font-semibold text-white mb-4">Përgjigjet</h2>
            <div className="space-y-5">
              {application.answers.map((ans, i) => (
                <div key={ans.id || i} className="pb-4"
                  style={{ borderBottom: i < application.answers.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <p className="text-sm font-medium text-white mb-1">
                    {i + 1}. {ans.question_text || ans.question?.question_text || `Pyetja ${i + 1}`}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {ans.answer_text || '—'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dokumentet mbështetëse */}
        {application?.attachments?.length > 0 && (
          <div className="rounded-2xl p-6 mb-4"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <h2 className="font-semibold text-white mb-3">Dokumentet mbështetëse</h2>
            <div className="space-y-2">
              {application.attachments.map(att => (
                <a
                  key={att.id}
                  href={att.file_path}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition hover:opacity-80"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <span className="text-lg">📄</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{att.file_name}</p>
                    {att.size_bytes && (
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {(att.size_bytes / 1024).toFixed(0)} KB
                      </p>
                    )}
                  </div>
                  <span className="text-xs flex-shrink-0" style={{ color: 'var(--accent)' }}>Hap →</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-lg px-4 py-3 mb-4 text-sm"
            style={{ background: 'rgba(248,113,113,0.1)', color: 'var(--danger)', border: '1px solid rgba(248,113,113,0.2)' }}>
            {error}
          </div>
        )}

        {/* Submit draft */}
        {application?.status === 'DRAFT' && !submitSuccess && (
          <button onClick={handleSubmit} disabled={submitting}
            className="w-full py-3 rounded-xl font-semibold text-sm transition"
            style={{ background: submitting ? 'var(--accent-dark)' : 'var(--accent)', color: '#0f1117' }}>
            {submitting ? 'Duke dorëzuar...' : 'Dorëzo aplikimin'}
          </button>
        )}

        {submitSuccess && (
          <div className="rounded-xl p-4 text-center"
            style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)' }}>
            <p className="font-semibold" style={{ color: 'var(--accent)' }}>
              Aplikimi u dorëzua me sukses!
            </p>
            <button onClick={() => navigate('/my-applications')}
              className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
              Shiko të gjitha aplikimet →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
