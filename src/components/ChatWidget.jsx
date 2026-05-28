import { useState, useRef, useEffect } from 'react'
import api from '../api/axios'

const GREEN = '#00e676'
const BG    = '#0a0d14'
const CARD  = 'rgba(255,255,255,0.04)'
const BORDER = 'rgba(0,230,118,0.25)'

export default function ChatWidget() {
  const [open, setOpen]       = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Përshëndetje! Jam asistenti i GrantFlow. Si mund të të ndihmoj të gjesh grantin e duhur?' }
  ])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef             = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const send = async () => {
    const msg = input.trim()
    if (!msg || loading) return

    // Capture history BEFORE adding the new user message
    const historySnapshot = messages

    setMessages(prev => [...prev, { role: 'user', text: msg }])
    setInput('')
    setLoading(true)

    try {
      const res = await api.post('/chatbot', {
        message: msg,
        history: historySnapshot,
      })
      setMessages(prev => [...prev, { role: 'assistant', text: res.data.reply }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: 'Ndodhi një gabim. Provo përsëri.'
      }])
    } finally {
      setLoading(false)
    }
  }

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>

      {/* Chat window */}
      {open && (
        <div style={{
          width: 340, height: 480,
          background: BG,
          border: `1px solid ${BORDER}`,
          borderRadius: 16,
          display: 'flex', flexDirection: 'column',
          marginBottom: 12,
          boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
          overflow: 'hidden',
        }}>

          {/* Header */}
          <div style={{
            padding: '14px 16px',
            borderBottom: `1px solid ${BORDER}`,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(0,230,118,0.15)',
              border: `1px solid rgba(0,230,118,0.3)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16,
            }}>🤖</div>
            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>Grant Asistent</div>
              <div style={{ color: GREEN, fontSize: 11 }}>● Online</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '82%',
                  padding: '8px 12px',
                  borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  background: m.role === 'user' ? GREEN : CARD,
                  border: m.role === 'user' ? 'none' : `1px solid ${BORDER}`,
                  color: m.role === 'user' ? BG : 'rgba(255,255,255,0.85)',
                  fontSize: 13,
                  lineHeight: 1.5,
                  fontWeight: m.role === 'user' ? 600 : 400,
                }}>
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '8px 14px', borderRadius: '12px 12px 12px 2px',
                  background: CARD, border: `1px solid ${BORDER}`,
                  color: 'rgba(255,255,255,0.4)', fontSize: 13,
                }}>
                  Duke shkruar...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '10px 12px',
            borderTop: `1px solid ${BORDER}`,
            display: 'flex', gap: 8,
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Shkruaj këtu..."
              style={{
                flex: 1,
                background: CARD,
                border: `1px solid ${BORDER}`,
                borderRadius: 8,
                padding: '8px 12px',
                color: 'white',
                fontSize: 13,
                outline: 'none',
              }}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              style={{
                background: loading || !input.trim() ? 'rgba(0,230,118,0.3)' : GREEN,
                border: 'none', borderRadius: 8,
                width: 36, height: 36,
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                color: BG, fontWeight: 700, fontSize: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ↑
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: 52, height: 52,
          borderRadius: '50%',
          background: GREEN,
          border: 'none',
          cursor: 'pointer',
          fontSize: 22,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,230,118,0.4)',
          marginLeft: 'auto',
        }}
      >
        {open ? '✕' : '🤖'}
      </button>
    </div>
  )
}
