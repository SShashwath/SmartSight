import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name.split(' ')[0]}! 👋`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (role) => {
    if (role === 'user') setForm({ email: 'demo@smartsight.com', password: 'demo123' })
    else setForm({ email: 'volunteer@smartsight.com', password: 'demo123' })
  }

  return (
    <div className="min-h-screen animated-bg flex items-center justify-center p-4">
      {/* Decorative blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-violet-600/20 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative animate-scale-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-4xl shadow-2xl glow-primary mb-4">
            👁️
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Welcome Back</h1>
          <p className="text-white/50">Sign in to SmartSight</p>
        </div>

        <div className="glass-panel p-8 shadow-2xl">
          {/* Demo buttons */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => fillDemo('user')}
              type="button"
              className="flex-1 py-2 text-xs font-semibold rounded-lg bg-primary-500/20 text-primary-300 border border-primary-500/30 hover:bg-primary-500/30 transition-all"
            >
              Demo User
            </button>
            <button
              onClick={() => fillDemo('volunteer')}
              type="button"
              className="flex-1 py-2 text-xs font-semibold rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all"
            >
              Demo Volunteer
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="input-field pl-10"
                  aria-label="Email address"
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                  className="input-field pl-10 pr-10"
                  aria-label="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-base"
              aria-label="Sign in"
            >
              {loading ? <LoadingSpinner size="sm" /> : <><LogIn size={18} /> Sign In</>}
            </button>
          </form>

          <p className="text-center text-sm text-white/50 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
              Create one
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-white/30 mt-6">
          ♿ Designed with accessibility in mind
        </p>
      </div>
    </div>
  )
}
