import { useState, useEffect, useCallback, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Mic, MicOff, Volume2, X } from 'lucide-react'
import useSpeech from '../hooks/useSpeech'
import toast from 'react-hot-toast'
import api from '../services/api'



const navLinks = [
  { path: '/dashboard', label: 'Dashboard', keywords: ['home', 'dashboard', 'main'] },
  { path: '/object-recognition', label: 'Object Recognition', keywords: ['object', 'vision', 'camera', 'recognition'] },
  { path: '/volunteer-help', label: 'Volunteer Help', keywords: ['volunteer', 'help', 'support', 'human'] },
  { path: '/indoor-navigation', label: 'Indoor Navigation', keywords: ['navigate', 'indoor', 'map', 'direction'] },
  { path: '/emergency-sos', label: 'Emergency SOS', keywords: ['sos', 'emergency', 'alert', 'danger', 'help'] },
  { path: '/public-transport', label: 'Public Transport', keywords: ['bus', 'metro', 'transport', 'train'] },
]

export default function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const { speak, stop, isSpeaking } = useSpeech()
  const isOpenRef = useRef(false)


  // Voice Recording state
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const [isRecording, setIsRecording] = useState(false)
  const [processing, setProcessing] = useState(false)

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      // Tracks in standard MediaRecorder are usually stopped via the stream
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }
  }, [isRecording])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioChunksRef.current = []
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : 'audio/mp4'
      
      const recorder = new MediaRecorder(stream, { mimeType })

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        if (audioBlob.size < 1000) return // Too small

        setProcessing(true)
        setTranscript('Transcribing...')
        
        try {
          const extension = mimeType.includes('webm') ? 'webm' : 'm4a'
          const formData = new FormData()
          formData.append('audio', audioBlob, `voice_command.${extension}`)

          const res = await api.post('/ai/transcribe', formData)
          if (res.data.success) {
            const text = res.data.text.toLowerCase()
            setTranscript(text)
            handleVoiceCommand(text)
          }
        } catch (err) {
          toast.error('Voice transcription failed')
          setTranscript('Error processing voice')
        } finally {
          setProcessing(false)
        }
      }

      mediaRecorderRef.current = recorder
      recorder.start()
      setIsRecording(true)
      setTranscript('Listening...')

      // Auto-stop after 4 seconds of silence/recording
      setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop()
      }, 4000)

    } catch (err) {
      toast.error('Microphone access denied or error')
      console.error(err)
    }
  }, [])



  const handleVoiceCommand = (command) => {
    console.log('Voice command received:', command)
    
    // Find matching link
    const matchedLink = navLinks.find(link => 
      link.label.toLowerCase().includes(command) || 
      link.keywords.some(k => command.includes(k))
    )

    if (matchedLink) {
      speak(`Opening ${matchedLink.label}`)
      navigate(matchedLink.path)
      setIsOpen(false)
    } else if (command.includes('cancel') || command.includes('close') || command.includes('stop')) {
      speak('Closing voice assistant')
      setIsOpen(false)
    } else {
      speak("I didn't quite get that. Could you please repeat?")
      // Restart listening after a short delay
      setTimeout(() => startListening(), 2000)
    }
  }

  const startListening = () => {
    if (isOpenRef.current && !isSpeaking()) {
      startRecording()
    }
  }


  const toggleAssistant = () => {
    if (isOpen) {
      stop()
      stopRecording()
      setIsOpen(false)
      isOpenRef.current = false
    } else {
      setIsOpen(true)
      isOpenRef.current = true
      const pageTitle = navLinks.find(l => l.path === location.pathname)?.label || 'Current Page'
      const options = navLinks.map(l => l.label).join(', ')
      
      const textToSpeak = `Hello! You are on the ${pageTitle}. Which option would you like to open? You can say: ${options}.`
      
      const utt = speak(textToSpeak)
      if (utt) {
        utt.onend = () => {
          if (isOpenRef.current) startListening()
        }
      }
    }
  }




  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-72 glass-panel p-5 shadow-2xl animate-scale-in border-primary-500/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
              Voice Assistant
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-white/60 leading-relaxed">
              {isSpeaking() ? 'Talking to you...' : isListening ? 'Listening for your choice...' : 'Click the mic to speak'}
            </p>
            
            {transcript && (
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <p className="text-xs text-white/40 mb-1">You said:</p>
                <p className="text-sm font-medium text-primary-400">"{transcript}"</p>
              </div>
            )}

            <div className="flex justify-center py-4">
              <button
                onClick={isRecording ? stopRecording : startListening}
                disabled={isSpeaking() || processing}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isRecording 
                    ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] scale-110' 
                    : processing
                    ? 'bg-amber-500 text-white animate-pulse'
                    : 'bg-primary-500 text-white hover:bg-primary-600'
                }`}
              >
                {isRecording ? (
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-6 bg-white rounded-full animate-voice-1" />
                    <span className="w-1.5 h-10 bg-white rounded-full animate-voice-2" />
                    <span className="w-1.5 h-6 bg-white rounded-full animate-voice-3" />
                  </div>
                ) : processing ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Mic size={24} />
                )}
              </button>
            </div>


            <p className="text-[10px] text-center text-white/30 italic">
              Say the name of any feature to open it
            </p>
          </div>
        </div>
      )}

      <button
        onClick={toggleAssistant}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${
          isOpen 
            ? 'bg-red-500 text-white rotate-90' 
            : 'bg-gradient-to-br from-primary-500 to-violet-600 text-white glow-primary'
        }`}
        aria-label="Voice Assistant"
      >
        {isOpen ? <X size={24} /> : <Volume2 size={24} />}
      </button>
    </div>
  )
}
