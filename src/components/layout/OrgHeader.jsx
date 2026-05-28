import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ORG_NAV = [
  { to: '/org-admin', label: 'Overview' },
  { to: '/org-admin/grants', label: 'Grante' },
  { to: '/org-admin/applications', label: 'Aplikimet' },
  { to: '/org-admin/team', label: 'Ekipi' },
]

export default function OrgHeader() {
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
          {ORG_NAV.map(item => {
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

      <div className="flex items-center gap-3">
        <Link
          to="/org-admin/grants/new"
          className="rounded-xl font-black tracking-wide transition"
          data-active={location.pathname === '/org-admin/grants/new' ? 'true' : 'false'}
        >
          Grant i ri
        </Link>
        <button
          onClick={async () => { await logout(); navigate('/login') }}
          className="rounded-xl font-black tracking-wide transition"
        >
          Dil
        </button>
      </div>
    </nav>
  )
}
