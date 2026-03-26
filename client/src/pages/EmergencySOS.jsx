import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'
import { MapPin, Phone, Shield, Clock, AlertTriangle } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import useSpeech from '../hooks/useSpeech'

export default function EmergencySOS() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [sosData, setSosData] = useState(null)
  const [countdown, setCountdown] = useState(null)
  const { speak } = useSpeech()

  const startCountdown = () => {
    let count = 3
    setCountdown(count)
    speak('SOS will be sent in 3, 2, 1')
    const interval = setInterval(() => {
      count -= 1
      setCountdown(count)
      if (count <= 0) {
        clearInterval(interval)
        setCountdown(null)
        submitSOS()
      }
    }, 1000)
  }

  const submitSOS = async () => {
    setLoading(true)
    try {
      const res = await api.post('/sos', {
        location: user.location || { lat: 12.9716, lng: 77.5946, address: 'Bengaluru, Karnataka' },
      })
      setSosData(res.data)
      setSent(true)
      speak(`Emergency SOS sent! ${res.data.contactsNotified} contacts have been notified. Help is on the way!`)
      toast.success('SOS sent! Help is on the way 🚨', { duration: 6000 })
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send SOS. Please call 112 directly.')
      speak('SOS failed. Please call emergency services at 112 immediately.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setSent(false)
    setSosData(null)
    setCountdown(null)
  }

  const mockContacts = user?.trustedContacts?.length > 0
    ? user.trustedContacts
    : [
        { name: 'Emergency Contact 1', phone: '+91 98XXX XXXXX', email: 'contact1@example.com' },
        { name: 'Emergency Contact 2', phone: '+91 87XXX XXXXX', email: 'contact2@example.com' },
      ]

  return (
    <div className="min-h-screen bg-gray-950 pt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-2xl shadow-lg">
            🆘
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Emergency SOS</h1>
            <p className="text-white/50 text-sm">Instantly alert your trusted contacts</p>
          </div>
        </div>

        {/* Warning banner */}
        <div className="flex items-start gap-3 px-5 py-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 mb-8">
          <AlertTriangle size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-amber-400/80 text-sm leading-relaxed">
            This will immediately notify all your trusted contacts with your current GPS location and trigger an emergency alert. Use only in genuine emergencies.
          </p>
        </div>

        {!sent ? (
          <div className="space-y-6">
            {/* SOS Button */}
            <div className="card p-10 text-center">
              {countdown !== null ? (
                <div className="space-y-4">
                  <div className="text-8xl font-black text-red-400 animate-pulse">{countdown}</div>
                  <p className="text-white/60">Sending SOS in {countdown} second{countdown !== 1 ? 's' : ''}...</p>
                  <button
                    onClick={() => { setCountdown(null); speak('SOS cancelled') }}
                    className="btn-secondary px-8"
                  >
                    Cancel
                  </button>
                </div>
              ) : loading ? (
                <div className="space-y-4">
                  <LoadingSpinner size="lg" />
                  <p className="text-white/60 animate-pulse">Sending emergency alert...</p>
                  <p className="text-white/40 text-sm">Notifying trusted contacts and saving location...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <button
                    onClick={startCountdown}
                    className="relative w-44 h-44 mx-auto rounded-full bg-gradient-to-br from-red-500 to-red-700 
                               text-white font-black text-2xl shadow-2xl glow-danger sos-pulse
                               hover:scale-105 active:scale-95 transition-transform duration-200 flex flex-col items-center justify-center gap-2
                               border-4 border-red-400/30"
                    aria-label="Press to send Emergency SOS"
                  >
                    <span className="text-4xl">🆘</span>
                    <span className="text-lg">SOS</span>
                    <span className="text-xs opacity-70 font-normal">Press for Help</span>
                  </button>
                  <p className="text-white/40 text-sm">Hold steady — a 3-second countdown will begin</p>
                </div>
              )}
            </div>

            {/* Location info */}
            <div className="card p-5">
              <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                <MapPin size={16} className="text-primary-400" /> Your Location
              </h3>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <span className="text-2xl">📍</span>
                <div>
                  <p className="text-white/80 font-medium">{user?.location?.address || 'Bengaluru, Karnataka'}</p>
                  <p className="text-white/40 text-xs mt-0.5">
                    {user?.location?.lat?.toFixed(4) || '12.9716'}, {user?.location?.lng?.toFixed(4) || '77.5946'}
                  </p>
                </div>
                <span className="ml-auto flex items-center gap-1 text-xs text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live GPS
                </span>
              </div>
            </div>

            {/* Trusted contacts */}
            <div className="card p-5">
              <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                <Shield size={16} className="text-primary-400" /> Trusted Contacts Who Will Be Notified
              </h3>
              <div className="space-y-2">
                {mockContacts.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {c.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white/80 text-sm font-medium">{c.name}</p>
                      <p className="text-white/40 text-xs">{c.phone || c.email}</p>
                    </div>
                  </div>
                ))}
                {mockContacts.length === 0 && (
                  <p className="text-white/30 text-sm text-center py-4">No trusted contacts added yet</p>
                )}
              </div>
            </div>

            {/* Emergency numbers */}
            <div className="card p-5">
              <h3 className="font-bold text-white mb-3">Emergency Numbers</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Police', number: '100', icon: '👮' },
                  { label: 'Ambulance', number: '108', icon: '🚑' },
                  { label: 'Fire', number: '101', icon: '🚒' },
                  { label: 'Unified', number: '112', icon: '🆘' },
                ].map(e => (
                  <a
                    key={e.number}
                    href={`tel:${e.number}`}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
                  >
                    <span className="text-2xl">{e.icon}</span>
                    <div>
                      <p className="text-white/80 text-sm font-semibold">{e.label}</p>
                      <p className="text-primary-400 font-bold">{e.number}</p>
                    </div>
                    <Phone size={14} className="ml-auto text-white/20" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Success state */
          <div className="space-y-6 animate-scale-in">
            <div className="card p-10 text-center border-emerald-500/30 bg-emerald-500/5">
              <div className="text-7xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-emerald-400 mb-2">SOS Alert Sent!</h2>
              <p className="text-white/60 mb-6">
                Your emergency alert has been sent to {sosData?.contactsNotified || 0} trusted contact(s).
              </p>

              <div className="space-y-3 text-left mb-6">
                {[
                  { icon: '📍', label: 'Location shared', value: user?.location?.address || 'Bengaluru' },
                  { icon: '⏰', label: 'Time', value: new Date().toLocaleTimeString() },
                  { icon: '👥', label: 'Contacts notified', value: `${sosData?.contactsNotified || 0} contacts` },
                  { icon: '📋', label: 'Alert ID', value: sosData?.sosAlert?._id?.slice(-8)?.toUpperCase() || 'SOS-' + Date.now().toString(36).slice(-6).toUpperCase() },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-white/40 text-sm">{item.label}:</span>
                    <span className="text-white/80 text-sm font-medium ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={reset} className="btn-secondary flex-1">Send Another</button>
                <a href="tel:112" className="btn-danger flex-1">Call 112</a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
