import { useState, useEffect } from 'react'
import Sidebar from '../../components/layout/Sidebar'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { to: '/org-admin',              icon: '🏠', label: 'Overview' },
  { to: '/org-admin/grants',       icon: '📋', label: 'Grante' },
  { to: '/org-admin/applications', icon: '📬', label: 'Aplikimet' },
  { to: '/org-admin/team',         icon: '👥', label: 'Ekipi' },
]

const ROLE_LABELS = {
  ORG_ADMIN:    { label: 'Org Admin',   bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24' },
  COMMISSIONER: { label: 'Komisioner', bg: 'rgba(96,165,250,0.15)',  color: '#60a5fa' },
  APPLICANT:    { label: 'Aplikant',   bg: 'rgba(74,222,128,0.15)',  color: '#4ade80' },
}

const INVITE_ROLES = [
  { value: 'COMMISSIONER', label: 'Komisioner — shqyrton aplikimet' },
  { value: 'ORG_ADMIN',    label: 'Org Admin — menaxhon organizatën' },
]

export default function TeamPage() {
  const { user: currentUser } = useAuth()
  const [members, setMembers]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [invite, setInvite]     = useState({ email: '', role: 'COMMISSIONER' })
  const [inviting, setInviting]       = useState(false)
  const [inviteLink, setInviteLink]   = useState('')   // linku i plotë i ftesës
  const [inviteEmailSent, setInviteEmailSent] = useState(false)
  const [inviteErr, setInviteErr]     = useState('')
  const [removingId, setRemovingId]   = useState(null)

  const loadTeam = () => {
    setLoading(true)
    api.get('/team')
      .then(r => setMembers(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadTeam() }, [])

  const handleInvite = async e => {
    e.preventDefault()
    setInviteErr('')
    setInviteLink('')
    setInviteEmailSent(false)
    setInviting(true)
    try {
      const res = await api.post('/invitations', invite)
      setInviteLink(res.data.invite_link || '')
      setInviteEmailSent(res.data.message?.includes('email') || false)
      setInvite({ email: '', role: 'COMMISSIONER' })
      loadTeam()
    } catch (err) {
      const detail = err.response?.data?.detail
      setInviteErr(
        typeof detail === 'string'
          ? detail
          : 'Gabim gjatë gjenerimit të ftesës'
      )
    } finally {
      setInviting(false)
    }
  }

  const handleRemove = async (memberId) => {
    if (!confirm('A jeni i sigurt që doni ta largoni këtë anëtar?')) return
    setRemovingId(memberId)
    try {
      await api.delete(`/team/${memberId}`)
      loadTeam()
    } catch (err) {
      alert(err.response?.data?.detail || 'Gabim')
    } finally {
      setRemovingId(null)
    }
  }

  const copyLink = () => {
    if (inviteLink) navigator.clipboard.writeText(inviteLink)
  }

  const inp  = 'w-full px-4 py-2.5 rounded-lg text-sm text-white outline-none transition'
  const inpS = { background: 'var(--bg-card)', border: '1px solid var(--border)' }
  const focus = e => (e.target.style.borderColor = 'var(--accent)')
  const blur  = e => (e.target.style.borderColor = 'var(--border)')

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar items={NAV} />
      <main className="flex-1 p-6">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Ekipi</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Menaxho anëtarët dhe dërgo ftesa
          </p>
        </div>

        <div className="max-w-3xl space-y-5">

          {/* ── Forma e ftesës — gjithmonë e dukshme ── */}
          <div className="rounded-2xl p-6" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <h2 className="font-semibold text-white mb-1">Fto anëtar të ri</h2>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              Shto komisioner ose admin tjetër në organizatën tuaj
            </p>

            <form onSubmit={handleInvite} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Email-i i anëtarit *</label>
                  <input
                    required type="email"
                    value={invite.email}
                    onChange={e => setInvite(p => ({ ...p, email: e.target.value }))}
                    placeholder="anetar@shembull.com"
                    className={inp} style={inpS} onFocus={focus} onBlur={blur}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Roli</label>
                  <div className="space-y-2">
                    {INVITE_ROLES.map(r => (
                      <label key={r.value}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition"
                        style={{
                          background: invite.role === r.value ? 'var(--accent-dim)' : 'var(--bg-card)',
                          border: `1px solid ${invite.role === r.value ? 'var(--accent)' : 'var(--border)'}`,
                        }}>
                        <input type="radio" name="role" value={r.value}
                          checked={invite.role === r.value}
                          onChange={() => setInvite(p => ({ ...p, role: r.value }))}
                          className="accent-green-400" />
                        <div>
                          <p className="text-xs font-semibold"
                            style={{ color: invite.role === r.value ? 'var(--accent)' : 'white' }}>
                            {r.value === 'COMMISSIONER' ? 'Komisioner' : 'Org Admin'}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {r.value === 'COMMISSIONER' ? 'Shqyrton aplikimet' : 'Menaxhon organizatën'}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {inviteErr && (
                <div className="rounded-lg px-4 py-3 text-sm"
                  style={{ background: 'rgba(248,113,113,0.1)', color: 'var(--danger)', border: '1px solid rgba(248,113,113,0.2)' }}>
                  {inviteErr}
                </div>
              )}

              <button type="submit" disabled={inviting}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold transition"
                style={{ background: 'var(--accent)', color: '#0f1117' }}>
                {inviting ? 'Duke gjeneruar...' : '✉ Gjenero ftesë'}
              </button>
            </form>

            {/* Link-u i ftesës pas gjenerimit */}
            {inviteLink && (
              <div className="mt-4 rounded-xl p-4"
                style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)' }}>
                <p className="text-xs font-semibold mb-2" style={{ color: '#4ade80' }}>
                  {inviteEmailSent
                    ? '✓ Ftesa u dërgua me email — mund ta ndani edhe link-un manualisht:'
                    : '✓ Ftesa u gjenerua — ndajeni link-un me anëtarin (email nuk u dërgua):'}
                </p>
                <div className="flex items-center gap-2">
                  <code className="text-xs flex-1 break-all px-3 py-2 rounded-lg"
                    style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}>
                    {inviteLink}
                  </code>
                  <button onClick={copyLink}
                    className="text-xs px-3 py-2 rounded-lg flex-shrink-0 font-semibold"
                    style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(74,222,128,0.3)' }}>
                    Kopjo
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Lista e anëtarëve ── */}
          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="font-semibold text-white">
                {members.length} anëtar{members.length !== 1 ? 'ë' : ''}
              </span>
            </div>

            {loading ? (
              <div className="px-5 py-16 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                Duke ngarkuar...
              </div>
            ) : members.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <p className="text-3xl mb-3">👥</p>
                <p className="text-sm font-medium text-white">Nuk ka anëtarë ende</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Dërgo ftesën e parë me formularin sipër
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Emri', 'Email', 'Roli', ''].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-medium"
                        style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {members.map(m => {
                    const rs = ROLE_LABELS[m.role] || { label: m.role, bg: 'var(--bg-card)', color: 'var(--text-muted)' }
                    const isMe = m.id === currentUser?.user_id
                    return (
                      <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td className="px-5 py-3.5">
                          <p className="text-sm font-medium text-white">
                            {[m.first_name, m.last_name].filter(Boolean).join(' ') || '—'}
                            {isMe && (
                              <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>(ju)</span>
                            )}
                          </p>
                        </td>
                        <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {m.email}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={{ background: rs.bg, color: rs.color }}>
                            {rs.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {!isMe && (
                            <button
                              disabled={removingId === m.id}
                              onClick={() => handleRemove(m.id)}
                              className="text-xs px-3 py-1.5 rounded-lg transition"
                              style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
                              {removingId === m.id ? '...' : 'Largo'}
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}
