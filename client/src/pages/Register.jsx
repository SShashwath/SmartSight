import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Mail, Lock, User, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const user = await register(form)
      toast.success(`Welcome to SmartSight, ${user.name.split(' ')[0]}! 🎉`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen animated-bg flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary-600/20 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative animate-scale-in">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-4xl shadow-2xl glow-primary mb-4">
            👁️
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Join SmartSight</h1>
          <p className="text-white/50">Create your free account today</p>
        </div>

        <div className="glass-panel p-8 shadow-2xl">
          {/* Role selection */}
          <div className="mb-6">
            <label className="label">I am a...</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'user', label: 'Visually Impaired', icon: '👤' },
                { value: 'volunteer', label: 'Volunteer Helper', icon: '🤝' },
              ].map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setForm({ ...form, role: r.value })}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                    form.role === r.value
                      ? 'border-primary-500 bg-primary-500/20 text-primary-300'
                      : 'border-white/10 bg-white/5 text-white/50 hover:border-white/30'
                  }`}
                >
                  <span className="text-2xl">{r.icon}</span>
                  <span className="text-xs font-semibold">{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Your full name"
                  className="input-field pl-10"
                />
              </div>
            </div>

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
                  placeholder="Min. 6 characters"
                  className="input-field pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-base"
            >
              {loading ? <LoadingSpinner size="sm" /> : <><UserPlus size={18} /> Create Account</>}
            </button>
          </form>

          <p className="text-center text-sm text-white/50 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
