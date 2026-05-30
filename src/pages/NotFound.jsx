import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function NotFound() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const homeLink = () => {
    if (!user) return '/login'
    switch (user.role) {
      case 'SUPER_ADMIN':  return '/super-admin'
      case 'ORG_ADMIN':    return '/org-admin'
      case 'COMMISSIONER': return '/commissioner'
      case 'APPLICANT':    return '/grants'
      default:             return '/login'
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'var(--bg-primary)' }}>

      <p className="text-8xl font-black mb-2" style={{ color: 'var(--accent)' }}>
        404
      </p>

      <h1 className="text-2xl font-bold text-white mb-2">
        Faqja nuk u gjet
      </h1>
      <p className="text-sm mb-8 text-center" style={{ color: 'var(--text-muted)', maxWidth: 360 }}>
        URL-ja që kërkove nuk ekziston ose është zhvendosur.
      </p>

      <div className="flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold transition"
          style={{ background: 'var(--bg-card)', color: 'white', border: '1px solid var(--border)' }}>
          ← Kthehu mbrapa
        </button>
        <Link
          to={homeLink()}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold transition"
          style={{ background: 'var(--accent)', color: '#0f1117' }}>
          Shko te faqja kryesore
        </Link>
      </div>
    </div>
  )
}
