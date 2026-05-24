import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

// Shto token + no-cache automatikisht çdo request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token && !config.noAuth) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // Parandalon browser cache për GET requests
  if (!config.method || config.method === 'get') {
    config.params = { ...config.params, _t: Date.now() }
  }
  return config
})

// Nëse token skadoi → dërgoje në login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config?.skipAuthRedirect) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
