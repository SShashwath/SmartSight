import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Menu, X, Eye, LogOut, User, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

const navLinks = [
  { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { path: '/object-recognition', label: 'Object AI', icon: '🔍' },
  { path: '/volunteer-help', label: 'Volunteer', icon: '🤝' },
  { path: '/indoor-navigation', label: 'Navigate', icon: '🗺️' },
  { path: '/emergency-sos', label: 'SOS', icon: '🆘' },
  { path: '/public-transport', label: 'Transport', icon: '🚌' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Signed out successfully')
    navigate('/login')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
              <Eye size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg gradient-text hidden sm:block">SmartSight</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.path
                    ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>

          {/* User menu (desktop) */}
          <div className="hidden lg:block relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 transition-all duration-200"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-xs font-bold">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <span className="text-sm font-medium text-white/80">{user?.name?.split(' ')[0]}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                user?.role === 'volunteer' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-primary-500/20 text-primary-400'
              }`}>
                {user?.role}
              </span>
              <ChevronDown size={14} className="text-white/50" />
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 top-12 w-48 glass-panel shadow-2xl animate-scale-in">
                <div className="p-2">
                  <div className="px-3 py-2 text-xs text-white/40 border-b border-white/10 mb-1">
                    {user?.email}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-gray-950/95 border-t border-white/10 animate-slide-up">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                  location.pathname === link.path
                    ? 'bg-primary-500/20 text-primary-300'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="text-xl">{link.icon}</span>
                {link.label}
              </Link>
            ))}
            <div className="border-t border-white/10 pt-3 mt-3">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
              >
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
