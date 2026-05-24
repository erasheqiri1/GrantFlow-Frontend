import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const COMMISSIONER_NAV = [
  { to: '/commissioner', label: 'Dashboard' },
  { to: '/commissioner/applications', label: 'Aplikimet' },
]

export default function CommissionerHeader() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  return (
    <nav className="org-header sticky top-0 z-20 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <div className="text-lg font-black tracking-wider">
          <span className="text-white">GRANT</span><span style={{ color: '#00e676' }}>FLOW</span>
        </div>
        <div className="flex items-center gap-3">
          {COMMISSIONER_NAV.map(item => {
            const active = item.to === '/commissioner'
              ? location.pathname === item.to
              : location.pathname === item.to || location.pathname.startsWith(item.to + '/')
            return (
              <Link
                key={item.to}
                to={item.to}
                className="px-4 py-1.5 rounded-lg text-sm font-semibold transition"
                data-active={active ? 'true' : 'false'}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>

      <button
        onClick={() => { logout(); navigate('/login') }}
        className="rounded-xl font-black tracking-wide transition"
      >
        Dil
      </button>
    </nav>
  )
}
