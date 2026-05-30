import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}`
    : '/api',
})


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token && !config.noAuth) {
    config.headers.Authorization = `Bearer ${token}`
  }

  if (!config.method || config.method === 'get') {
    config.params = { ...config.params, _t: Date.now() }
  }
  return config
})


let isRefreshing = false
let failedQueue = []

function processQueue(error, token = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token)
  })
  failedQueue = []
}


api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config


    if (
      err.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.skipAuthRedirect
    ) {
      return Promise.reject(err)
    }


    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    const refreshToken = localStorage.getItem('refresh_token')

    if (!refreshToken) {
      isRefreshing = false
      localStorage.removeItem('token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      return Promise.reject(err)
    }

    try {
      const response = await api.post(
        '/auth/refresh',
        { refresh_token: refreshToken },
        { skipAuthRedirect: true }
      )
      const { access_token, refresh_token: new_refresh_token } = response.data

      localStorage.setItem('token', access_token)
      if (new_refresh_token) localStorage.setItem('refresh_token', new_refresh_token)
      originalRequest.headers.Authorization = `Bearer ${access_token}`
      processQueue(null, access_token)
      return api(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      localStorage.removeItem('token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default api
