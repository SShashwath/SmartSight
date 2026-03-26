import { useState, useRef, useCallback } from 'react'
import { Camera, Upload, X, Zap, AlertTriangle, CheckCircle } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'
import VoiceButton from '../components/VoiceButton'

export default function ObjectRecognition() {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('upload') // 'upload' | 'camera'
  const fileRef = useRef()
  const videoRef = useRef()
  const canvasRef = useRef()
  const streamRef = useRef()

  const handleFile = (file) => {
    if (!file?.type?.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }
    setImage(file)
    setResult(null)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(file)
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [])

  const startCamera = async () => {
    setMode('camera')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch {
      toast.error('Camera access denied. Please allow camera permission.')
      setMode('upload')
    }
  }

  const captureFrame = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
    setPreview(dataUrl)
    setImage(dataUrl)
    stopCamera()
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    setMode('upload')
  }

  const analyzeImage = async () => {
    if (!image) { toast.error('Please select or capture an image first'); return }
    setLoading(true)
    setResult(null)
    try {
      let imageBase64
      if (typeof image === 'string' && image.startsWith('data:')) {
        imageBase64 = image.split(',')[1]
      } else {
        const reader = new FileReader()
        imageBase64 = await new Promise(resolve => {
          reader.onload = e => resolve(e.target.result.split(',')[1])
          reader.readAsDataURL(image)
        })
      }
      const res = await api.post('/ai/analyze', { imageBase64 })
      setResult(res.data)
      toast.success('Analysis complete! 🎉')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fullDescription = result
    ? `${result.description}. ${result.accessibility_summary || ''}`
    : ''

  return (
    <div className="min-h-screen bg-gray-950 pt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-2xl shadow-lg">
              🔍
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Object Recognition</h1>
              <p className="text-white/50 text-sm">AI-powered image analysis with voice descriptions</p>
            </div>
          </div>
          {result?.mock && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm">
              <AlertTriangle size={15} />
              Demo mode: Add your OpenAI API key in server/.env for real analysis
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Image input */}
          <div className="space-y-4">
            {/* Mode toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => { setMode('upload'); stopCamera() }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  mode === 'upload' ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30' : 'btn-secondary py-2.5'
                }`}
              >
                <Upload size={16} /> Upload Image
              </button>
              <button
                onClick={startCamera}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  mode === 'camera' ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30' : 'btn-secondary py-2.5'
                }`}
              >
                <Camera size={16} /> Use Camera
              </button>
            </div>

            {/* Camera view */}
            {mode === 'camera' && (
              <div className="card overflow-hidden">
                <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-xl" />
                <div className="p-4 flex gap-2">
                  <button onClick={captureFrame} className="btn-primary flex-1">
                    📸 Capture
                  </button>
                  <button onClick={stopCamera} className="btn-secondary px-4">
                    <X size={18} />
                  </button>
                </div>
                <canvas ref={canvasRef} className="hidden" />
              </div>
            )}

            {/* Upload dropzone */}
            {mode === 'upload' && (
              <div
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => fileRef.current?.click()}
                className={`card border-dashed border-2 rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 hover:bg-white/8 hover:border-primary-500/50 ${
                  preview ? 'border-primary-500/40' : 'border-white/20'
                }`}
                role="button"
                aria-label="Click or drag image to upload"
              >
                {preview ? (
                  <div className="relative">
                    <img src={preview} alt="Uploaded" className="w-full max-h-64 object-contain rounded-xl" />
                    <button
                      onClick={e => { e.stopPropagation(); setPreview(null); setImage(null); setResult(null) }}
                      className="absolute top-2 right-2 w-8 h-8 bg-gray-900/80 rounded-full flex items-center justify-center hover:bg-red-500/80 transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="text-5xl mb-3">🖼️</div>
                    <p className="text-white/60 font-medium">Drop image here or click to browse</p>
                    <p className="text-white/30 text-sm mt-1">Supports JPG, PNG, WEBP</p>
                  </>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => handleFile(e.target.files[0])}
                />
              </div>
            )}

            <button
              onClick={analyzeImage}
              disabled={!image || loading}
              className="btn-primary w-full py-4 text-base"
              aria-label="Analyze image with AI"
            >
              {loading ? (
                <><LoadingSpinner size="sm" /><span>Analyzing with AI...</span></>
              ) : (
                <><Zap size={20} />Analyze Image</>
              )}
            </button>
          </div>

          {/* Right: Results */}
          <div className="space-y-4">
            {loading && (
              <div className="card p-12 flex items-center justify-center">
                <LoadingSpinner size="lg" text="AI is analyzing your image..." />
              </div>
            )}

            {result && !loading && (
              <div className="space-y-4 animate-slide-up">
                {/* Description */}
                <div className="card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-white flex items-center gap-2">
                      <CheckCircle size={18} className="text-emerald-400" />
                      Scene Description
                    </h3>
                    <VoiceButton text={result.description} label="Speak" />
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed">{result.description}</p>
                </div>

                {/* Accessibility summary */}
                {result.accessibility_summary && (
                  <div className="card p-5 border-emerald-500/20 bg-emerald-500/5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-emerald-400 text-sm flex items-center gap-2">
                        ♿ Accessibility Summary
                      </h3>
                      <VoiceButton text={result.accessibility_summary} label="Speak" />
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed">{result.accessibility_summary}</p>
                  </div>
                )}

                {/* Detected objects */}
                {result.objects?.length > 0 && (
                  <div className="card p-5">
                    <h3 className="font-bold text-white mb-3">Detected Objects ({result.objects.length})</h3>
                    <div className="space-y-2">
                      {result.objects.map((obj, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-sm text-white/70 flex-1 font-medium">{obj.label}</span>
                          <span className="text-xs text-white/30">{obj.position}</span>
                          <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary-500 to-violet-500 rounded-full"
                              style={{ width: `${(obj.confidence * 100).toFixed(0)}%` }}
                            />
                          </div>
                          <span className="text-xs text-primary-400 w-10 text-right">
                            {(obj.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hazards */}
                {result.hazards?.length > 0 && (
                  <div className="card p-5 border-red-500/20 bg-red-500/5">
                    <h3 className="font-bold text-red-400 mb-2 flex items-center gap-2">
                      <AlertTriangle size={16} /> Potential Hazards
                    </h3>
                    <ul className="space-y-1">
                      {result.hazards.map((h, i) => (
                        <li key={i} className="text-white/60 text-sm flex items-start gap-2">
                          <span className="text-red-400 mt-0.5">•</span> {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Speak all */}
                <VoiceButton
                  text={fullDescription}
                  label="🔊 Speak Full Description"
                  className="w-full justify-center py-3"
                />
              </div>
            )}

            {!result && !loading && (
              <div className="card p-12 text-center">
                <div className="text-5xl mb-3 opacity-30">🤖</div>
                <p className="text-white/30 text-sm">Upload an image and click Analyze to see AI results here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
