import { useState } from 'react'
import { Volume2, VolumeX, Loader } from 'lucide-react'
import useSpeech from '../hooks/useSpeech'

export default function VoiceButton({ text, label = 'Speak', className = '' }) {
  const [speaking, setSpeaking] = useState(false)
  const { speak, stop } = useSpeech()

  const handleToggle = () => {
    if (speaking) {
      stop()
      setSpeaking(false)
    } else {
      setSpeaking(true)
      const utt = speak(text)
      if (utt) {
        utt.onend = () => setSpeaking(false)
        utt.onerror = () => setSpeaking(false)
      } else {
        setSpeaking(false)
      }
    }
  }

  return (
    <button
      onClick={handleToggle}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200
        ${speaking
          ? 'bg-violet-500/30 text-violet-300 border border-violet-500/50 hover:bg-violet-500/40'
          : 'bg-white/10 text-white/70 border border-white/20 hover:bg-white/20 hover:text-white'
        } ${className}`}
      aria-label={speaking ? 'Stop speaking' : `Speak: ${text?.slice(0, 50)}`}
    >
      {speaking ? (
        <>
          <div className="voice-wave">
            <span /><span /><span /><span /><span />
          </div>
          <span>Stop</span>
        </>
      ) : (
        <>
          <Volume2 size={16} />
          <span>{label}</span>
        </>
      )}
    </button>
  )
}
