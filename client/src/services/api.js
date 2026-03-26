import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})


// Auto-inject token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('smartsight_token')
  if (token) config.headers['Authorization'] = `Bearer ${token}`
  return config
})

// Handle auth errors globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('smartsight_token')
    }
    return Promise.reject(err)
  }
)

export default api
