import { useEffect, useState, useCallback } from 'react'
import SuperAdminHeader from '../../components/layout/SuperAdminHeader'
import api from '../../api/axios'

const ROLE_ORDER  = ['SUPER_ADMIN', 'ORG_ADMIN', 'COMMISSIONER', 'APPLICANT']
const ROLE_LABELS = {
  SUPER_ADMIN:  'Super Admin',
  ORG_ADMIN:    'Org Admin',
  COMMISSIONER: 'Komisioner',
  APPLICANT:    'Aplikant',
}
const ROLE_COLOR = {
  SUPER_ADMIN:  '#f87171',
  ORG_ADMIN:    '#4ade80',
  COMMISSIONER: '#60a5fa',
  APPLICANT:    '#fbbf24',
}


const LOCKED = new Set([

  'SUPER_ADMIN::profile:read',   'SUPER_ADMIN::profile:update',
  'ORG_ADMIN::profile:read',     'ORG_ADMIN::profile:update',
  'COMMISSIONER::profile:read',  'COMMISSIONER::profile:update',
  'APPLICANT::profile:read',     'APPLICANT::profile:update',

  'SUPER_ADMIN::tenants:read',
  'SUPER_ADMIN::users:read',
  'SUPER_ADMIN::audit:read',

  'ORG_ADMIN::grants:read',
  'ORG_ADMIN::team:read',
  'ORG_ADMIN::applications:read_all',

  'APPLICANT::grants:read',
  'APPLICANT::applications:submit',
  'APPLICANT::applications:read_own',

  'COMMISSIONER::grants:read',
  'COMMISSIONER::applications:read_all',
])

const RESOURCE_LABELS = {
  tenants:      'Organizatat',
  users:        'Userat',
  grants:       'Grantet',
  applications: 'Aplikimet',
  invitations:  'Ftesat',
  audit:        'Audit logs',
  profile:      'Profili',
}

export default function ManagePermissionsPage() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(new Set())
  const [toast,   setToast]   = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/permissions/matrix')
      setData(res.data)
    } catch {
      setToast({ ok: false, msg: 'Gabim gjatë ngarkimit' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const showToast = (ok, msg) => {
    setToast({ ok, msg })
    setTimeout(() => setToast(null), 2500)
  }

  const toggle = async (roleName, codename) => {
    const key = `${roleName}::${codename}`
    if (LOCKED.has(key)) return
    if (toggling.has(key)) return

    setToggling(prev => new Set(prev).add(key))
    try {
      await api.patch(`/permissions/roles/${roleName}`, {
        permission_codename: codename,
      })

      setData(prev => {
        const cur = prev.mappings[roleName] || []
        const has = cur.includes(codename)
        return {
          ...prev,
          mappings: {
            ...prev.mappings,
            [roleName]: has
              ? cur.filter(c => c !== codename)
              : [...cur, codename],
          },
        }
      })
      showToast(true, 'Leja u përditësua')
    } catch (err) {
      showToast(false, err.response?.data?.detail || 'Gabim')
    } finally {
      setToggling(prev => { const s = new Set(prev); s.delete(key); return s })
    }
  }


  const grouped = data
    ? data.permissions.reduce((acc, p) => {
        if (!acc[p.resource]) acc[p.resource] = []
        acc[p.resource].push(p)
        return acc
      }, {})
    : {}

  const sortedRoles = data
    ? ROLE_ORDER.filter(r => data.roles.find(x => x.name === r))
    : []

  return (
    <div className="org-admin-shell min-h-screen">
      <SuperAdminHeader />
      <main className="org-page-content">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Lejet & Rolet</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Menaxho çfarë mund të bëjë secili rol — ndryshimet hyjnë në fuqi menjëherë
            </p>
          </div>
          <button
            onClick={load}
            className="text-xs px-3 py-1.5 rounded-lg transition"
            style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            ↺ Rifresko
          </button>
        </div>

        <div className="flex items-center gap-4 mb-5">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Rolet:</span>
          {ROLE_ORDER.map(r => (
            <span key={r} className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: `${ROLE_COLOR[r]}18`, color: ROLE_COLOR[r], border: `1px solid ${ROLE_COLOR[r]}30` }}>
              {ROLE_LABELS[r]}
            </span>
          ))}
          <span className="text-xs ml-4" style={{ color: 'var(--text-muted)' }}>
            🔒 = e bllokuar (minimum i sistemit)
          </span>
        </div>

        {loading ? (
          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="h-4 w-40 rounded animate-pulse" style={{ background: 'var(--bg-card)' }} />
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-4 w-10 rounded animate-pulse ml-auto" style={{ background: 'var(--bg-card)' }} />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <div className="flex items-center px-5 py-3" style={{ borderBottom: '2px solid var(--border)', background: 'var(--bg-card)' }}>
              <div className="flex-1 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                Leja / Resursi
              </div>
              {sortedRoles.map(r => (
                <div key={r} className="w-28 text-center text-xs font-bold"
                  style={{ color: ROLE_COLOR[r] }}>
                  {ROLE_LABELS[r]}
                </div>
              ))}
            </div>

            {Object.entries(grouped).map(([resource, perms]) => (
              <div key={resource}>
                <div className="px-5 py-2 flex items-center gap-2"
                  style={{ background: 'rgba(0,230,118,0.04)', borderBottom: '1px solid var(--border)' }}>
                  <span className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: 'rgba(0,230,118,0.6)' }}>
                    {RESOURCE_LABELS[resource] || resource}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    ({perms.length} {perms.length === 1 ? 'leje' : 'leje'})
                  </span>
                </div>

                {perms.map((perm, idx) => (
                  <div
                    key={perm.id}
                    className="flex items-center px-5 py-3 transition"
                    style={{
                      borderBottom: idx < perms.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div className="flex-1">
                      <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                        {perm.action}
                      </span>
                    </div>

                    {sortedRoles.map(roleName => {
                      const key      = `${roleName}::${perm.codename}`
                      const locked   = LOCKED.has(key)
                      const active   = (data.mappings[roleName] || []).includes(perm.codename)
                      const spinning = toggling.has(key)

                      return (
                        <div key={roleName} className="w-28 flex justify-center">
                          <button
                            onClick={() => toggle(roleName, perm.codename)}
                            disabled={locked || spinning}
                            title={locked ? 'E bllokuar — minimum i sistemit' : active ? 'Klik për të hequr' : 'Klik për të shtuar'}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                            style={{
                              background: active
                                ? `${ROLE_COLOR[roleName]}20`
                                : 'var(--bg-card)',
                              border: active
                                ? `1.5px solid ${ROLE_COLOR[roleName]}60`
                                : '1.5px solid var(--border)',
                              cursor: locked ? 'not-allowed' : 'pointer',
                              opacity: spinning ? 0.5 : 1,
                            }}>
                            {spinning ? (
                              <span className="inline-block w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"
                                style={{ color: ROLE_COLOR[roleName] }} />
                            ) : locked ? (
                              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>🔒</span>
                            ) : active ? (
                              <span className="text-xs font-bold" style={{ color: ROLE_COLOR[roleName] }}>✓</span>
                            ) : (
                              <span className="text-xs" style={{ color: 'var(--border)' }}>—</span>
                            )}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                ))}

                <div style={{ height: 1, background: '2px solid var(--border)' }} />
              </div>
            ))}
          </div>
        )}

      </main>

      {toast && (
        <div
          className="fixed bottom-6 right-6 px-4 py-3 rounded-xl text-sm font-semibold z-50 transition"
          style={{
            background: toast.ok ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)',
            color:      toast.ok ? '#4ade80' : '#f87171',
            border:     toast.ok ? '1px solid rgba(74,222,128,0.3)' : '1px solid rgba(248,113,113,0.3)',
            boxShadow:  '0 4px 20px rgba(0,0,0,0.4)',
          }}>
          {toast.ok ? '✓' : '⚠'} {toast.msg}
        </div>
      )}
    </div>
  )
}
