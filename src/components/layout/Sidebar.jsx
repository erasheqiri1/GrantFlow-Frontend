import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

export default function Sidebar({ items }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuthStore()

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || 'U'

  return (
    <aside className="w-52 flex-shrink-0 flex flex-col min-h-screen sticky top-0"
      style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>
      {/* Logo */}
      <div className="px-5 py-5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: 'var(--accent-dim)', border: '1.5px solid var(--accent)' }}>
            <span className="text-xs font-black" style={{ color: 'var(--accent)' }}>G</span>
          </div>
          <span className="font-black text-sm">
            <span className="text-white">GRANT</span>
            <span style={{ color: 'var(--accent)' }}>FLOW</span>
          </span>
        </div>
        {user?.tenant_slug && (
          <p className="text-xs mt-1 ml-9" style={{ color: 'var(--text-muted)' }}>
            {user.tenant_slug.toUpperCase()}
          </p>
        )}
        <p className="text-xs ml-9" style={{ color: 'var(--text-muted)' }}>{user?.role}</p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-1">
        {items.map((item) => {
          const active = location.pathname === item.to || location.pathname.startsWith(item.to + '/')
          return (
            <Link key={item.to} to={item.to}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition"
              style={{
                background: active ? 'var(--accent-dim)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--text-secondary)',
              }}>
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5">
        <button onClick={() => { logout(); navigate('/login') }}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition"
          style={{ color: 'var(--text-muted)' }}>
          <span>🚪</span> Dil
        </button>
      </div>
    </aside>
  )
}
