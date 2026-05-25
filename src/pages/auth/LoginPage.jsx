import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

function CountUp({ end, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0)
  const frameRef = useRef(null)

  useEffect(() => {
    const startTime = performance.now()
    const animate = (now) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * end))
      if (progress < 1) frameRef.current = requestAnimationFrame(animate)
      else setCount(end)
    }
    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [end, duration])

  return <>{count}{suffix}</>
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '', tenant_slug: '' })
  const [platformStats, setPlatformStats] = useState({
    total_tenants: 0,
    total_applications: 0,
    total_grants: 0,
  })
  const [showPass, setShowPass] = useState(false)
  const [showStaffLogin, setShowStaffLogin] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const isPending = searchParams.get('pending') === '1'

  useEffect(() => {
    api.get('/tenants/public-stats', { noAuth: true, skipAuthRedirect: true })
      .then(res => {
        setPlatformStats({
          total_tenants: Number(res.data?.total_tenants || 0),
          total_applications: Number(res.data?.total_applications || 0),
          total_grants: Number(res.data?.total_grants || 0),
        })
      })
      .catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = { email: form.email, password: form.password }
      if (form.tenant_slug) payload.tenant_slug = form.tenant_slug
      const res = await api.post('/auth/login', payload, { skipAuthRedirect: true })
      const { access_token, role, user_id, tenant_slug } = res.data
      login(access_token, { role, user_id, tenant_slug })
      navigate('/')
    } catch (err) {
      const detail = err.response?.data?.detail || 'Email ose fjalëkalim i gabuar'
      setError(detail)
      if (err.response?.status === 400 && detail.includes('organizata')) {
        setShowStaffLogin(true)
      }
    } finally {
      setLoading(false)
    }
  }

  const lineStyle = {
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 0,
    color: 'white',
    width: '100%',
    padding: '10px 0',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  }

  const stats = [
    { end: platformStats.total_tenants, label: 'Organizata' },
    { end: platformStats.total_applications, label: 'Aplikime' },
    { end: platformStats.total_grants, label: 'Grante' },
  ]

  return (
    <div className="min-h-screen flex relative overflow-hidden" style={{ background: '#0a0d14' }}>

      {/* ── BACKGROUND KREJT FAQEN ── */}

      {/* Grid mbi krejt faqen */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'linear-gradient(rgba(0,230,118,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(0,230,118,0.12) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* Glow i majtë */}
      <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,230,118,0.08) 0%, transparent 70%)', filter: 'blur(40px)' }} />

      {/* Glow i djathtë lart */}
      <div className="absolute -top-20 right-[30%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,230,118,0.05) 0%, transparent 70%)', filter: 'blur(60px)' }} />

      {/* Gradient overlay majtas — jep thellësi panelin të majtë */}
      <div className="absolute inset-0 hidden lg:block pointer-events-none" style={{
        background: 'linear-gradient(90deg, rgba(10,13,20,0.5) 0%, rgba(15,32,39,0.3) 50%, transparent 100%)',
      }} />

      {/* ── Paneli i majtë — Branding ── */}
      <div className="hidden lg:flex flex-col w-[62%] relative z-10 px-16 pt-20 pb-12">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(0,230,118,0.15)', border: '1px solid rgba(0,230,118,0.3)' }}>
            <span className="text-lg font-black" style={{ color: '#00e676' }}>G</span>
          </div>
          <span className="text-xl font-black tracking-wider text-white">
            GRANT<span style={{ color: '#00e676' }}>FLOW</span>
          </span>
        </div>

        {/* Teksti kryesor */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-7 w-fit"
            style={{ background: 'rgba(0,230,118,0.08)', border: '1px solid rgba(0,230,118,0.2)' }}>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#00e676' }} />
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#00e676' }}>
              Platforma #1 e Granteve
            </span>
          </div>

          <h2 className="font-black text-white leading-tight mb-5" style={{ fontSize: '2.75rem' }}>
            Menaxho grantet<br />
            <span style={{ color: '#00e676' }}>me lehtësi.</span>
          </h2>

          <p className="text-base mb-10" style={{ color: 'rgba(255,255,255,0.45)', lineHeight: '1.8' }}>
            Platforma all-in-one për organizata dhe aplikantë. Publiko grante, menaxho aplikime dhe merr vendime me besim.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {stats.map(s => (
              <div key={s.label} className="rounded-xl p-4"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(8px)',
                }}>
                <div className="text-2xl font-black" style={{ color: '#00e676' }}>
                  <CountUp end={s.end} duration={1800} />
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
          © 2026 GrantFlow. Të gjitha të drejtat e rezervuara.
        </div>
      </div>

      {/* ── Paneli i djathtë — Forma ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">

        {/* Logo për mobile */}
        <div className="lg:hidden absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(0,230,118,0.15)', border: '1px solid rgba(0,230,118,0.3)' }}>
            <span className="text-base font-black" style={{ color: '#00e676' }}>G</span>
          </div>
          <span className="text-xl font-black text-white tracking-wider">
            GRANT<span style={{ color: '#00e676' }}>FLOW</span>
          </span>
        </div>

        {/* ── CARD GLASSMORPHISM ── */}
        <div className="w-full max-w-sm rounded-2xl flex flex-col"
          style={{
            minHeight: '560px',
            padding: '48px 40px',
            background: 'transparent',
            border: '1px solid rgba(0,230,118,0.5)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
          }}>

          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-black text-white mb-2">Mirë se vini</h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Hyni për të vazhduar</p>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Alert: organizata pret aprovim */}
          {isPending && !error && (
            <div className="flex items-start gap-2 rounded-lg px-3 py-2.5 mb-6 text-xs"
              style={{ background: 'rgba(234,179,8,0.1)', color: '#facc15', border: '1px solid rgba(234,179,8,0.25)' }}>
              <span className="flex-shrink-0 mt-0.5">⏳</span>
              <span>Email u konfirmua! Organizata juaj pret aprovimin nga Super Admin. Do të njoftoheni me email kur të aprovohet.</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg px-3 py-2.5 mb-6 text-xs"
              style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
              <span className="flex-shrink-0 mt-0.5">⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Forma */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-4"
                style={{ color: 'rgba(255,255,255,0.35)' }}>Email</label>
              <input
                type="email" required value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="emri@shembull.com"
                style={lineStyle}
                onFocus={e => e.target.style.borderBottomColor = '#00e676'}
                onBlur={e => e.target.style.borderBottomColor = 'rgba(255,255,255,0.15)'}
              />
            </div>

            {/* Fjalëkalimi */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: 'rgba(255,255,255,0.35)' }}>Fjalëkalimi</label>
                <Link to="/forgot-password" className="text-xs font-semibold transition-opacity"
                  style={{ color: '#00e676' }}
                  onMouseEnter={e => e.target.style.opacity = '0.65'}
                  onMouseLeave={e => e.target.style.opacity = '1'}>
                  Keni harruar?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} required value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  style={{ ...lineStyle, paddingRight: '52px' }}
                  onFocus={e => e.target.style.borderBottomColor = '#00e676'}
                  onBlur={e => e.target.style.borderBottomColor = 'rgba(255,255,255,0.15)'}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase tracking-wider transition"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                  onMouseEnter={e => e.target.style.color = '#00e676'}
                  onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.3)'}>
                  {showPass ? 'Fshih' : 'Shfaq'}
                </button>
              </div>
            </div>

            {/* Tenant slug */}
            {showStaffLogin && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-4"
                  style={{ color: 'rgba(255,255,255,0.35)' }}>Organizata</label>
                <input
                  type="text" value={form.tenant_slug}
                  onChange={e => setForm({ ...form, tenant_slug: e.target.value })}
                  placeholder="p.sh. uni-prishtina"
                  style={lineStyle}
                  onFocus={e => e.target.style.borderBottomColor = '#00e676'}
                  onBlur={e => e.target.style.borderBottomColor = 'rgba(255,255,255,0.15)'}
                />
              </div>
            )}

            {/* Butoni */}
            <button type="submit" disabled={loading}
              className="w-full rounded-xl font-bold text-sm tracking-widest uppercase transition-all duration-200"
              style={{
                height: '52px',
                background: loading ? 'rgba(0,230,118,0.35)' : '#00e676',
                color: '#0a0d14',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 0 28px rgba(0,230,118,0.3)',
              }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Duke u kyçur...
                </span>
              ) : 'Hyr tani →'}
            </button>
          </form>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Footer */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.18)' }}>ose</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            </div>
            <p className="text-center text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Nuk keni llogari?{' '}
              <Link to="/register" className="font-bold" style={{ color: '#00e676' }}>
                Regjistrohu
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
