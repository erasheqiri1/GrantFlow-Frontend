import { createContext, useContext, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null') }
    catch { localStorage.removeItem('user'); return null }
  })

  const login = (newToken, newRefreshToken, newUser) => {
    localStorage.setItem('token', newToken)
    localStorage.setItem('refresh_token', newRefreshToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token')
    try {
      await api.post('/auth/logout', { refresh_token: refreshToken || undefined })
    } catch { }
    localStorage.removeItem('token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
