import { useAuth } from '../context/AuthContext'
import FeatureCard from '../components/FeatureCard'
import { Bell, MapPin, Clock } from 'lucide-react'

const features = [
  {
    icon: '🔍',
    title: 'Object Recognition',
    description: 'Identify objects around you using AI-powered camera analysis and get spoken descriptions.',
    path: '/object-recognition',
    gradient: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20',
    badge: 'AI Powered',
  },
  {
    icon: '🤝',
    title: 'Volunteer Help',
    description: 'Connect with nearby volunteers in real-time who can assist you through live chat.',
    path: '/volunteer-help',
    gradient: 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20',
    badge: 'Live',
  },
  {
    icon: '🗺️',
    title: 'Indoor Navigation',
    description: 'Get step-by-step voice-guided navigation indoors to reach your destination safely.',
    path: '/indoor-navigation',
    gradient: 'bg-gradient-to-br from-violet-500/20 to-purple-500/20',
  },
  {
    icon: '🆘',
    title: 'Emergency SOS',
    description: 'Instantly alert your trusted contacts and emergency services with your location.',
    path: '/emergency-sos',
    gradient: 'bg-gradient-to-br from-red-500/20 to-orange-500/20',
    badge: 'Critical',
  },
  {
    icon: '🚌',
    title: 'Public Transport',
    description: 'Get real-time bus and metro schedules with voice announcements and accessibility info.',
    path: '/public-transport',
    gradient: 'bg-gradient-to-br from-amber-500/20 to-orange-500/20',
  },
]

const announcements = [
  { id: 1, text: 'New volunteer Priya joined in Bengaluru. 3 volunteers now available near you.', time: '5 min ago', icon: '👋' },
  { id: 2, text: 'Whitefield Metro Station now fully wheelchair-accessible with tactile pathways.', time: '2 hrs ago', icon: '♿' },
  { id: 3, text: 'SmartSight AI updated: Improved object detection accuracy by 15%.', time: '1 day ago', icon: '🤖' },
  { id: 4, text: 'Emergency helpline 112 now integrated for faster SOS response times.', time: '2 days ago', icon: '🆘' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="min-h-screen bg-gray-950 pt-16">
      {/* Hero section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-primary-950/30 to-gray-950 px-4 py-12 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full bg-primary-600/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-violet-600/10 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-primary-400 text-sm font-semibold mb-1">👋 {greeting}</p>
              <h1 className="text-4xl font-bold text-white mb-2">
                {user?.name?.split(' ')[0]} <span className="gradient-text">SmartSight</span>
              </h1>
              <p className="text-white/50 flex items-center gap-2 text-sm">
                <MapPin size={14} />
                {user?.location?.address || 'Bengaluru, Karnataka'}
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400">Live</span>
              </p>
            </div>
            <div className={`glass-panel px-5 py-4 text-center ${user?.role === 'volunteer' ? 'border-emerald-500/30' : 'border-primary-500/30'}`}>
              <div className={`text-3xl mb-1 ${user?.role === 'volunteer' ? 'text-emerald-400' : 'text-primary-400'}`}>
                {user?.role === 'volunteer' ? '🤝' : '👤'}
              </div>
              <div className={`text-xs font-bold uppercase tracking-wider ${user?.role === 'volunteer' ? 'text-emerald-400' : 'text-primary-400'}`}>
                {user?.role}
              </div>
              <div className="text-xs text-white/40 mt-0.5">Account Type</div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 mt-8">
            {[
              { label: 'Features', value: '5', icon: '⚡' },
              { label: 'Volunteers Online', value: '3', icon: '🟢' },
              { label: 'Response Time', value: '<2 min', icon: '⏱️' },
            ].map((stat, i) => (
              <div key={i} className="glass-panel px-4 py-3 text-center">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-lg font-bold text-white">{stat.value}</div>
                <div className="text-xs text-white/40">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Features grid */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-1 h-6 rounded-full bg-gradient-to-b from-primary-400 to-violet-500" />
            Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div key={f.path} style={{ animationDelay: `${i * 80}ms` }}>
                <FeatureCard {...f} />
              </div>
            ))}
          </div>
        </div>

        {/* Announcements */}
        <div>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-1 h-6 rounded-full bg-gradient-to-b from-amber-400 to-orange-500" />
            Announcements
            <span className="badge bg-amber-500/20 text-amber-400 border border-amber-500/30 ml-1">
              {announcements.length} new
            </span>
          </h2>
          <div className="space-y-3">
            {announcements.map((a, i) => (
              <div
                key={a.id}
                className="card px-5 py-4 flex items-start gap-4 hover:bg-white/8 transition-all duration-200 animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <span className="text-2xl mt-0.5 flex-shrink-0">{a.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-sm leading-relaxed">{a.text}</p>
                  <div className="flex items-center gap-1 mt-1.5 text-xs text-white/30">
                    <Clock size={12} />
                    {a.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
