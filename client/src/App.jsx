import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ObjectRecognition from './pages/ObjectRecognition'
import VolunteerHelp from './pages/VolunteerHelp'
import IndoorNavigation from './pages/IndoorNavigation'
import EmergencySOS from './pages/EmergencySOS'
import PublicTransport from './pages/PublicTransport'
import Navbar from './components/Navbar'
import VoiceAssistant from './components/VoiceAssistant'


const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-3xl shadow-lg glow-primary">
          👁️
        </div>
        <div className="text-white/60 text-sm">Loading SmartSight<span className="loading-dots"></span></div>
      </div>
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return null
  return !user ? children : <Navigate to="/dashboard" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Navbar /><Dashboard /></ProtectedRoute>} />
      <Route path="/object-recognition" element={<ProtectedRoute><Navbar /><ObjectRecognition /></ProtectedRoute>} />
      <Route path="/volunteer-help" element={<ProtectedRoute><Navbar /><VolunteerHelp /></ProtectedRoute>} />
      <Route path="/indoor-navigation" element={<ProtectedRoute><Navbar /><IndoorNavigation /></ProtectedRoute>} />
      <Route path="/emergency-sos" element={<ProtectedRoute><Navbar /><EmergencySOS /></ProtectedRoute>} />
      <Route path="/public-transport" element={<ProtectedRoute><Navbar /><PublicTransport /></ProtectedRoute>} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <VoiceAssistant />
      </AuthProvider>
    </BrowserRouter>

  )
}

export default App
