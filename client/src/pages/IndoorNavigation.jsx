import { useState } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { MapPin, Navigation, Volume2, CheckCircle, ChevronRight } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import VoiceButton from '../components/VoiceButton'
import useSpeech from '../hooks/useSpeech'

const DESTINATIONS = [
  'Cafeteria', 'Restrooms', 'Exit / Main Gate', 'Elevator',
  'Reception / Help Desk', 'Library', 'Medical Room', 'Conference Hall',
]

export default function IndoorNavigation() {
  const [from, setFrom] = useState('Main Entrance')
  const [to, setTo] = useState('')
  const [navData, setNavData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const { speak } = useSpeech()

  const getNavigation = async () => {
    if (!to) { toast.error('Please select a destination'); return }
    setLoading(true)
    setNavData(null)
    setActiveStep(0)
    try {
      const res = await api.get(`/transport/navigate?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
      setNavData(res.data)
      toast.success('Navigation ready! 🗺️')
      speak(`Navigation started from ${from} to ${to}. Total distance: ${res.data.totalDistance}. Estimated time: ${res.data.totalDuration}.`)
    } catch {
      toast.error('Failed to get navigation. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const speakStep = (step) => {
    speak(`Step ${step.step}: ${step.instruction}. Distance: ${step.distance}. Estimated time: ${step.duration}.`)
    setActiveStep(step.step)
  }

  const speakAll = () => {
    if (!navData) return
    const text = navData.steps.map(s => `Step ${s.step}: ${s.instruction}`).join('. Next step: ')
    speak(text)
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg">
            🗺️
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Indoor Navigation</h1>
            <p className="text-white/50 text-sm">AI-guided step-by-step voice navigation</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Input panel */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card p-6 space-y-4">
              <div>
                <label className="label flex items-center gap-1.5">
                  <MapPin size={14} className="text-primary-400" /> From
                </label>
                <input
                  value={from}
                  onChange={e => setFrom(e.target.value)}
                  placeholder="Current location"
                  className="input-field"
                />
              </div>

              <div>
                <label className="label flex items-center gap-1.5">
                  <Navigation size={14} className="text-violet-400" /> Destination
                </label>
                <select
                  value={to}
                  onChange={e => setTo(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select destination…</option>
                  {DESTINATIONS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={getNavigation}
                disabled={loading || !to}
                className="btn-primary w-full py-4"
              >
                {loading ? <LoadingSpinner size="sm" /> : <><Navigation size={18} /> Start Navigation</>}
              </button>
            </div>

            {navData && (
              <div className="card p-5 space-y-3">
                <h3 className="font-bold text-white text-sm">Trip Summary</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="glass-panel p-3 text-center">
                    <div className="text-xl font-bold text-primary-400">{navData.totalDistance}</div>
                    <div className="text-xs text-white/40 mt-0.5">Distance</div>
                  </div>
                  <div className="glass-panel p-3 text-center">
                    <div className="text-xl font-bold text-violet-400">{navData.totalDuration}</div>
                    <div className="text-xs text-white/40 mt-0.5">Duration</div>
                  </div>
                </div>
                <button onClick={speakAll} className="btn-secondary w-full text-sm py-2.5">
                  <Volume2 size={16} /> 🔊 Speak All Steps
                </button>
              </div>
            )}

            {/* Tips */}
            {navData?.tips && (
              <div className="card p-5 border-violet-500/20 bg-violet-500/5">
                <h3 className="font-bold text-violet-400 text-sm mb-2">Navigation Tips</h3>
                <ul className="space-y-1.5">
                  {navData.tips.map((tip, i) => (
                    <li key={i} className="text-white/50 text-xs flex items-start gap-2">
                      <span className="text-violet-400 mt-0.5">💡</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Steps panel */}
          <div className="lg:col-span-3">
            {loading && (
              <div className="card p-16 flex items-center justify-center">
                <LoadingSpinner size="lg" text="Calculating route..." />
              </div>
            )}

            {!loading && !navData && (
              <div className="card p-16 text-center">
                <div className="text-6xl mb-4 opacity-20">🗺️</div>
                <p className="text-white/30">Select your destination and click Start Navigation.</p>
              </div>
            )}

            {navData && !loading && (
              <div className="card overflow-hidden animate-slide-up">
                <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white">Navigation Steps</h3>
                    <p className="text-xs text-white/40">{from} → {to}</p>
                  </div>
                  <span className="badge bg-violet-500/20 text-violet-400 border border-violet-500/30">
                    {navData.steps.length} steps
                  </span>
                </div>
                <div className="divide-y divide-white/5">
                  {navData.steps.map((step) => (
                    <div
                      key={step.step}
                      className={`px-5 py-4 flex items-start gap-4 cursor-pointer transition-all duration-200 ${
                        activeStep === step.step ? 'bg-violet-500/10 border-l-2 border-violet-500' : 'hover:bg-white/5'
                      }`}
                      onClick={() => speakStep(step)}
                      role="button"
                      aria-label={`Step ${step.step}: ${step.instruction}`}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        step.step === navData.steps.length
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : activeStep === step.step
                          ? 'bg-violet-500/30 text-violet-300 border border-violet-500/40'
                          : 'bg-white/10 text-white/60'
                      }`}>
                        {step.step === navData.steps.length ? <CheckCircle size={16} /> : step.step}
                      </div>
                      <div className="flex-1">
                        <p className="text-white/80 text-sm leading-relaxed">{step.instruction}</p>
                        {step.distance !== '0 m' && (
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-white/30">
                            <span>📏 {step.distance}</span>
                            <span>⏱️ {step.duration}</span>
                          </div>
                        )}
                      </div>
                      <Volume2 size={15} className={`flex-shrink-0 mt-0.5 ${activeStep === step.step ? 'text-violet-400' : 'text-white/20'}`} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
