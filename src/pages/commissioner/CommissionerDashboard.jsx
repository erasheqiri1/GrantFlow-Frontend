import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/layout/Sidebar'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { to: '/commissioner',              icon: '🏠', label: 'Dashboard' },
  { to: '/commissioner/applications', icon: '📋', label: 'Aplikimet' },
  { to: '/commissioner/profile',      icon: '👤', label: 'Profili' },
  { to: '/notifications',             icon: '🔔', label: 'Njoftimet' },
]

export default function CommissionerDashboard() {
  const { user } = useAuth()
  const [apps,      setApps]      = useState([])
  const [firstName, setFirstName] = useState('')
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    const params = user?.user_id ? { assigned_to: user.user_id } : {}
    // Nëse user_id nuk është gati, shfaq bosh — do ngarkohet pas login
    Promise.all([
      api.get('/applications', { params }).catch(() => ({ data: [] })),
      api.get('/profile/me').catch(() => ({ data: null })),
    ]).then(([aRes, pRes]) => {
      setApps(Array.isArray(aRes.data) ? aRes.data : aRes.data?.items ?? [])
      const p = pRes.data
      if (p) setFirstName(p.first_name || p.email?.split('@')[0] || '')
    }).finally(() => setLoading(false))
  }, [])

  const total       = apps.length
  const pending     = apps.filter(a => a.status === 'SUBMITTED').length
  const inReview    = apps.filter(a => a.status === 'UNDER_REVIEW').length
  const approved    = apps.filter(a => a.status === 'APPROVED').length
  const rejected    = apps.filter(a => a.status === 'REJECTED').length

  const stats = [
    { label: 'Totale',       value: total,    color: 'white' },
    { label: 'Dorëzuar',     value: pending,  color: '#60a5fa' },
    { label: 'Në shqyrtim',  value: inReview, color: '#fbbf24' },
    { label: 'Aprovuar',     value: approved, color: '#4ade80' },
    { label: 'Refuzuar',     value: rejected, color: '#f87171' },
  ]

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar items={NAV} />
      <main className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">
            Mirë se erdhe{firstName ? `, ${firstName}` : ''}
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {user?.tenant_slug?.toUpperCase()} · KOMISIONER
          </p>
        </div>

        <div className="grid grid-cols-5 gap-4 mb-8">
          {stats.map(s => (
            <div key={s.label} className="rounded-xl p-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              <p className="text-3xl font-bold" style={{ color: s.color }}>
                {loading ? '—' : s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Aplikimet që presin veprim */}
        {!loading && pending + inReview > 0 && (
          <div className="rounded-2xl p-5" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <p className="text-sm font-semibold text-white mb-1">
              {pending + inReview} aplikim presin vendim
            </p>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              {pending} të reja · {inReview} në shqyrtim
            </p>
            <Link to="/commissioner/applications"
              className="text-xs px-4 py-2 rounded-lg font-semibold inline-block"
              style={{ background: 'var(--accent)', color: '#0f1117' }}>
              Shiko aplikimet →
            </Link>
          </div>
        )}

        {!loading && total === 0 && (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Nuk ke aplikime të caktuara akoma.
          </p>
        )}
      </main>
    </div>
  )
}
