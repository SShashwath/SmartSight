import { useState, useEffect } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Bus, Train, Clock, MapPin, Volume2, Wifi, RefreshCw, ChevronRight } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import VoiceButton from '../components/VoiceButton'
import useSpeech from '../hooks/useSpeech'

export default function PublicTransport() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all | bus | metro
  const { speak } = useSpeech()

  const fetchTransport = async () => {
    setLoading(true)
    try {
      const res = await api.get('/transport')
      setData(res.data)
    } catch {
      toast.error('Failed to load transport data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTransport() }, [])

  const filtered = filter === 'all'
    ? data?.buses
    : data?.buses?.filter(b => filter === 'metro' ? b.type === 'metro' : b.type !== 'metro')

  const speakTransport = () => {
    if (!data) return
    const text = `Here are the available transport options near you. ${
      filtered?.map(b => `${b.busNumber}: ${b.route}. Next arrival in ${b.nextArrival}. Platform ${b.platform}.`).join('. ')
    }`
    speak(text)
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-2xl shadow-lg">
              🚌
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Public Transport</h1>
              <p className="text-white/50 text-sm">Real-time buses & metro with voice info</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={speakTransport} disabled={!data} className="btn-secondary px-4 py-2.5 text-sm">
              <Volume2 size={16} /> Read All
            </button>
            <button onClick={fetchTransport} disabled={loading} className="btn-secondary px-3 py-2.5">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Location & time */}
        {data && (
          <div className="card px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <MapPin size={15} className="text-primary-400" />
              <span>{data.location}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs">Live</span>
            </div>
            <div className="flex items-center gap-2 text-white/40 text-xs">
              <Clock size={13} />
              Updated {new Date(data.timestamp).toLocaleTimeString()}
            </div>
          </div>
        )}

        {/* Announcements */}
        {data?.announcements && (
          <div className="card p-5 mb-6 border-amber-500/20 bg-amber-500/5">
            <h3 className="font-bold text-amber-400 text-sm mb-3 flex items-center gap-2">
              📢 Live Announcements
            </h3>
            <div className="space-y-2">
              {data.announcements.map((a, i) => (
                <p key={i} className="text-white/60 text-sm flex items-start gap-2">
                  <span className="mt-0.5">•</span> {a}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Accessibility stats */}
        {data?.accessibility_info && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-emerald-400">{data.accessibility_info.wheelchairAccessible}</div>
              <div className="text-xs text-white/40 mt-1">♿ Accessible</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-primary-400">{data.accessibility_info.totalRoutes}</div>
              <div className="text-xs text-white/40 mt-1">Total Routes</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-amber-400">Live</div>
              <div className="text-xs text-white/40 mt-1">Status</div>
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'all', label: 'All Routes', icon: '🚏' },
            { id: 'bus', label: 'Bus', icon: '🚌' },
            { id: 'metro', label: 'Metro', icon: '🚇' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                filter === f.id
                  ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                  : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-transparent'
              }`}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>

        {/* Routes list */}
        {loading ? (
          <div className="card p-16 flex items-center justify-center">
            <LoadingSpinner size="lg" text="Loading transport data..." />
          </div>
        ) : (
          <div className="space-y-3">
            {filtered?.map((bus, i) => (
              <div
                key={bus.id}
                className="card p-5 hover:bg-white/8 transition-all duration-200 animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0 ${
                      bus.type === 'metro'
                        ? 'bg-gradient-to-br from-violet-500/20 to-purple-500/20 text-violet-400'
                        : 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400'
                    }`}>
                      {bus.type === 'metro' ? '🚇' : '🚌'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          bus.type === 'metro'
                            ? 'bg-violet-500/20 text-violet-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {bus.busNumber}
                        </span>
                        {bus.accessible && (
                          <span className="badge bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            ♿ Accessible
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-white text-base">{bus.route}</h3>
                      <p className="text-white/40 text-xs mt-1 flex items-center gap-1">
                        <MapPin size={11} /> {bus.platform}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-emerald-400 font-bold text-lg">{bus.nextArrival}</div>
                    <div className="text-white/30 text-xs">Next arrival</div>
                  </div>
                </div>

                {/* Stops */}
                {bus.stops && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-xs text-white/30 mb-2">Stops:</p>
                    <div className="flex items-center gap-1 flex-wrap">
                      {bus.stops.map((stop, si) => (
                        <span key={si} className="flex items-center gap-1">
                          <span className="text-xs text-white/50 bg-white/5 px-2 py-0.5 rounded">{stop}</span>
                          {si < bus.stops.length - 1 && <ChevronRight size={10} className="text-white/20 flex-shrink-0" />}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-3 flex justify-end">
                  <VoiceButton
                    text={`Route ${bus.busNumber}: ${bus.route}. Next arrival in ${bus.nextArrival}. Departs from ${bus.platform}. Stops: ${bus.stops?.join(', ')}.`}
                    label="Speak Info"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
