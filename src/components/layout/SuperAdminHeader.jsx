import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const SUPER_NAV = [
  { to: '/super-admin', label: 'Overview' },
  { to: '/super-admin/pending', label: 'Aprovime' },
  { to: '/super-admin/users', label: 'Userat' },
  { to: '/super-admin/audit', label: 'Audit' },
  { to: '/super-admin/permissions', label: 'Lejet' },
  { to: '/super-admin/add-admin', label: 'Shto admin' },
]

export default function SuperAdminHeader() {
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
          {SUPER_NAV.map(item => {
            const active = location.pathname === item.to || location.pathname.startsWith(item.to + '/')
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
