import Sidebar from '../../components/layout/Sidebar'

const NAV = [
  { to: '/commissioner', icon: '🏠', label: 'Dashboard' },
  { to: '/commissioner/applications', icon: '📋', label: 'Aplikimet' },
  { to: '/commissioner/profile', icon: '👤', label: 'Profili' },
]

export default function CommissionerDashboard() {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar items={NAV} />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Totale', value: '12', color: 'white' },
            { label: 'Aprovuar', value: '8', color: '#4ade80' },
            { label: 'Refuzuar', value: '5', color: '#f87171' },
            { label: 'Në pritje', value: '3', color: '#fbbf24' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Aplikimet e caktuara do të shfaqen këtu.</p>
      </main>
    </div>
  )
}
