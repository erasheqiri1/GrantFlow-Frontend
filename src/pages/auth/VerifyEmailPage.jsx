import { useEffect, useRef, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import api from '../../api/axios'

export default function VerifyEmailPage() {
  const [params]  = useSearchParams()
  const token     = params.get('token')

  const [status, setStatus] = useState('loading') // loading | success | error
  const [message, setMessage] = useState('')
  const called = useRef(false)   // React 18 Strict Mode thirr useEffect dy herë — ky guard e ndalon

  useEffect(() => {
    if (called.current) return   // mos dërgo kërkesën dy herë
    called.current = true

    if (!token) {
      setStatus('error')
      setMessage('Link i pavlefshëm ose i munguar.')
      return
    }
    api.get(`/auth/verify-email?token=${token}`)
      .then(res => {
        setMessage(res.data.message)
        setStatus('success')
      })
      .catch(err => {
        setMessage(err.response?.data?.detail || 'Gabim gjatë konfirmimit të emailit.')
        setStatus('error')
      })
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#0a0d14' }}>
      <div className="w-full max-w-md text-center">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(0,230,118,0.15)', border: '1px solid rgba(0,230,118,0.3)' }}>
            <span className="text-lg font-black" style={{ color: '#00e676' }}>G</span>
          </div>
          <span className="text-xl font-black tracking-wider text-white">
            GRANT<span style={{ color: '#00e676' }}>FLOW</span>
          </span>
        </div>

        {/* Loading */}
        {status === 'loading' && (
          <div className="rounded-2xl p-10"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="w-12 h-12 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
              style={{ borderColor: '#00e676', borderTopColor: 'transparent' }} />
            <p className="text-white font-semibold">Duke konfirmuar emailin...</p>
          </div>
        )}

        {/* Success */}
        {status === 'success' && (
          <div className="rounded-2xl p-10"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.3)' }}>
              <span className="text-4xl">✅</span>
            </div>
            <h2 className="text-2xl font-black text-white mb-3">Email u konfirmua!</h2>
            <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {message}
            </p>
            <Link to="/login"
              className="inline-block py-3.5 px-8 rounded-xl font-bold text-sm tracking-wide"
              style={{ background: '#00e676', color: '#0a0d14', boxShadow: '0 0 20px rgba(0,230,118,0.25)' }}>
              Kthehu te kyçja →
            </Link>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="rounded-2xl p-10"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)' }}>
              <span className="text-4xl">❌</span>
            </div>
            <h2 className="text-2xl font-black text-white mb-3">Konfirmimi dështoi</h2>
            <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {message}
            </p>
            <Link to="/register/org"
              className="inline-block py-3.5 px-8 rounded-xl font-bold text-sm tracking-wide"
              style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}>
              Regjistrohu përsëri →
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}
