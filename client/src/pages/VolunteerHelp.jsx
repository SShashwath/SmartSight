import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { connectSocket, disconnectSocket } from '../services/socket'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Send, UserCheck, Clock, MessageSquare, Wifi, WifiOff } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

export default function VolunteerHelp() {
  const { user } = useAuth()
  const [connected, setConnected] = useState(false)
  const [status, setStatus] = useState('idle') // idle | requesting | waiting | connected
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [volunteer, setVolunteer] = useState(null)
  const [helpRequests, setHelpRequests] = useState([]) // for volunteers
  const [loading, setLoading] = useState(false)
  const socketRef = useRef(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const socket = connectSocket()
    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      // Register based on role
      const payload = { name: user.name, userId: user._id, role: user.role }
      if (user.role === 'volunteer') {
        socket.emit('register-volunteer', payload)
      } else {
        socket.emit('register-user', payload)
      }
    })

    socket.on('disconnect', () => setConnected(false))

    socket.on('help-requested', (data) => {
      setStatus('waiting')
      toast.success(`Help request sent! ${data.volunteersNotified} volunteer(s) notified.`)
    })

    socket.on('no-volunteers', (data) => {
      setStatus('idle')
      toast.error(data.message)
    })

    socket.on('help-accepted', (data) => {
      setStatus('connected')
      setVolunteer({ name: data.volunteerName, socketId: data.volunteerSocketId })
      setMessages(prev => [...prev, {
        id: Date.now(), from: 'system',
        text: `✅ ${data.volunteerName} has accepted your request! You can now chat.`,
      }])
      toast.success(`${data.volunteerName} is here to help!`)
    })

    socket.on('help-request', (data) => {
      setHelpRequests(prev => [data, ...prev.slice(0, 4)])
      toast(`🆘 ${data.userName} needs help!`, { icon: '🤝' })
    })

    socket.on('receive-message', (data) => {
      setMessages(prev => [...prev, { id: Date.now(), from: 'them', text: data.message, name: data.from }])
    })

    socket.on('session-ended', () => {
      setStatus('idle')
      setVolunteer(null)
      setMessages(prev => [...prev, { id: Date.now(), from: 'system', text: 'Session ended.' }])
    })

    return () => {
      disconnectSocket()
    }
  }, [user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const requestHelp = async () => {
    if (!connected) { toast.error('Not connected to server'); return }
    setLoading(true)
    setStatus('requesting')
    try {
      await api.post('/help/request', {
        message: 'I need assistance',
        location: user.location,
      })
      socketRef.current?.emit('request-help', {
        userId: user._id,
        userName: user.name,
        location: user.location,
        message: 'I need assistance',
      })
    } catch (err) {
      toast.error('Failed to send request')
      setStatus('idle')
    } finally {
      setLoading(false)
    }
  }

  const acceptRequest = (request) => {
    socketRef.current?.emit('accept-help', { userSocketId: request.userSocketId })
    setStatus('connected')
    setVolunteer({ name: request.userName, socketId: request.userSocketId })
    setMessages([{ id: Date.now(), from: 'system', text: `You are now helping ${request.userName}. Say hello!` }])
    setHelpRequests([])
    toast.success(`Now helping ${request.userName}`)
  }

  const sendMessage = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    const toSocketId = status === 'connected' ? volunteer?.socketId : null
    if (!toSocketId) return
    socketRef.current?.emit('send-message', { to: toSocketId, toSocketId, from: user.name, message: input })
    setMessages(prev => [...prev, { id: Date.now(), from: 'me', text: input }])
    setInput('')
  }

  const endSession = () => {
    socketRef.current?.emit('end-session', { toSocketId: volunteer?.socketId })
    setStatus('idle')
    setVolunteer(null)
    setMessages([])
    toast('Session ended', { icon: '👋' })
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-2xl shadow-lg">
              🤝
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Volunteer Help</h1>
              <p className="text-white/50 text-sm">Real-time assistance from nearby volunteers</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
            connected ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
            {connected ? 'Live' : 'Offline'}
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* Status card */}
            <div className={`card p-6 text-center border ${
              status === 'connected' ? 'border-emerald-500/40 bg-emerald-500/5' :
              status === 'waiting' ? 'border-amber-500/40 bg-amber-500/5' : 'border-white/10'
            }`}>
              <div className="text-5xl mb-3">
                {status === 'idle' ? '🤝' : status === 'requesting' || status === 'waiting' ? '⏳' : '✅'}
              </div>
              <h3 className="font-bold text-white text-lg mb-1">
                {status === 'idle' && 'Ready to Help'}
                {status === 'requesting' && 'Sending Request...'}
                {status === 'waiting' && 'Waiting for Volunteer'}
                {status === 'connected' && `Connected with ${volunteer?.name}`}
              </h3>
              <p className="text-white/40 text-sm mb-4">
                {status === 'idle' && user.role === 'user' && 'Click below to request a volunteer'}
                {status === 'idle' && user.role === 'volunteer' && 'You will be notified of incoming requests'}
                {status === 'waiting' && 'A volunteer will respond shortly...'}
                {status === 'connected' && 'Use the chat to communicate'}
              </p>

              {user.role === 'user' && (
                <>
                  {status === 'idle' && (
                    <button onClick={requestHelp} disabled={loading || !connected} className="btn-primary w-full py-4">
                      {loading ? <LoadingSpinner size="sm" /> : '🆘 Request Help Now'}
                    </button>
                  )}
                  {status === 'waiting' && (
                    <div className="flex items-center justify-center gap-2 text-amber-400">
                      <LoadingSpinner size="sm" />
                      <span className="text-sm">Finding a volunteer...</span>
                    </div>
                  )}
                  {status === 'connected' && (
                    <button onClick={endSession} className="btn-danger w-full">End Session</button>
                  )}
                </>
              )}

              {user.role === 'volunteer' && status === 'connected' && (
                <button onClick={endSession} className="btn-danger w-full">End Session</button>
              )}
            </div>

            {/* Incoming requests (for volunteers) */}
            {user.role === 'volunteer' && helpRequests.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-white/70 text-sm">Incoming Requests</h3>
                {helpRequests.map((req, i) => (
                  <div key={i} className="card p-4 border-amber-500/20 bg-amber-500/5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-white">{req.userName}</p>
                        <p className="text-xs text-white/40 flex items-center gap-1 mt-0.5">
                          <Clock size={11} /> Just now
                        </p>
                      </div>
                      <span className="badge bg-red-500/20 text-red-400 border border-red-500/30">Urgent</span>
                    </div>
                    <p className="text-white/60 text-sm mb-3">{req.message || 'Needs assistance'}</p>
                    <button
                      onClick={() => acceptRequest(req)}
                      className="btn-primary w-full py-2 text-sm"
                    >
                      <UserCheck size={15} /> Accept Request
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chat panel */}
          <div className="lg:col-span-3 card flex flex-col" style={{ minHeight: '450px' }}>
            <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
              <MessageSquare size={18} className="text-primary-400" />
              <h3 className="font-semibold text-white">
                {status === 'connected' ? `Chat with ${volunteer?.name}` : 'Chat'}
              </h3>
              {status === 'connected' && (
                <span className="ml-auto flex items-center gap-1 text-xs text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-white/20 text-sm text-center">
                    {status === 'connected' ? 'Say hello to start the conversation!' : 'Messages will appear here once connected.'}
                  </p>
                </div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.from === 'me' ? 'justify-end' : msg.from === 'system' ? 'justify-center' : 'justify-start'}`}>
                    {msg.from === 'system' ? (
                      <span className="text-xs text-white/30 bg-white/5 px-3 py-1.5 rounded-full">{msg.text}</span>
                    ) : (
                      <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${
                        msg.from === 'me'
                          ? 'bg-primary-500/30 text-white rounded-br-sm'
                          : 'bg-white/10 text-white/80 rounded-bl-sm'
                      }`}>
                        {msg.from !== 'me' && <p className="text-xs text-primary-400 mb-0.5 font-semibold">{msg.name}</p>}
                        {msg.text}
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-4 border-t border-white/10 flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={status === 'connected' ? 'Type a message...' : 'Connect with a volunteer to chat'}
                disabled={status !== 'connected'}
                className="input-field flex-1 py-2.5"
              />
              <button
                type="submit"
                disabled={status !== 'connected' || !input.trim()}
                className="btn-primary px-4 py-2.5"
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
