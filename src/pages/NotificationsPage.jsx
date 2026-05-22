import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const TYPE_INFO = {
  INFO:    { icon: 'ℹ️', accent: '#60a5fa' },
  SUCCESS: { icon: '✅', accent: '#4ade80' },
  WARNING: { icon: '⚠️', accent: '#facc15' },
  ERROR:   { icon: '❌', accent: '#f87171' },
}

function homeRoute(role) {
  switch (role) {
    case 'SUPER_ADMIN':  return '/super-admin'
    case 'ORG_ADMIN':    return '/org-admin'
    case 'COMMISSIONER': return '/commissioner'
    default:             return '/grants'
  }
}

export default function NotificationsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/notifications')
      .then(res => setNotifications(res.data))
      .finally(() => setLoading(false))
  }, [])

  const markAsRead = (id) => {
    api.patch(`/notifications/${id}/read`).then(() => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    })
  }

  const markAllAsRead = () => {
    api.patch('/notifications/read-all').then(() => {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    })
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-3 sticky top-0 z-10"
        style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(homeRoute(user?.role))}
            className="text-sm flex items-center gap-1"
            style={{ color: 'var(--text-secondary)' }}>
            ← Kthehu
          </button>
          <div className="text-lg font-black">
            <span className="text-white">Grant</span>
            <span style={{ color: 'var(--accent)' }}>Flow</span>
          </div>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead}
            className="text-sm px-3 py-1.5 rounded-lg font-medium"
            style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent)' }}>
            Shëno të gjitha si të lexuara ({unreadCount})
          </button>
        )}
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-white mb-6">Njoftimet</h2>

        {loading ? (
          <div className="text-center py-16" style={{ color: 'var(--text-secondary)' }}>
            Duke ngarkuar...
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🔔</div>
            <p style={{ color: 'var(--text-secondary)' }}>Nuk ke asnjë njoftim.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(notif => {
              const t = TYPE_INFO[notif.type] || TYPE_INFO.INFO
              return (
                <div key={notif.id}
                  className="rounded-2xl p-4"
                  style={{
                    background: notif.is_read ? 'var(--bg-secondary)' : 'var(--bg-card)',
                    border: `1px solid ${notif.is_read ? 'var(--border)' : 'rgba(74,222,128,0.25)'}`,
                    opacity: notif.is_read ? 0.65 : 1,
                  }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="text-lg mt-0.5 flex-shrink-0">{t.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white text-sm">{notif.title}</h3>
                          {!notif.is_read && (
                            <span className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ background: 'var(--accent)' }} />
                          )}
                        </div>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {notif.message}
                        </p>
                        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                          {new Date(notif.created_at).toLocaleString('sq-AL')}
                        </p>
                      </div>
                    </div>
                    {!notif.is_read && (
                      <button onClick={() => markAsRead(notif.id)}
                        className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium"
                        style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                        Lexo
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
