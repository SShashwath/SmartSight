import { useCallback } from 'react'

const useSpeech = () => {
  const speak = useCallback((text, options = {}) => {
    if (!('speechSynthesis' in window)) {
      console.warn('TTS not supported in this browser')
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = options.rate || 0.9
    utterance.pitch = options.pitch || 1.0
    utterance.volume = options.volume || 1.0
    utterance.lang = options.lang || 'en-US'

    // Try to use a natural sounding voice
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(v => v.name.includes('Samantha') || v.name.includes('Google') || v.lang === 'en-US')
    if (preferred) utterance.voice = preferred

    window.speechSynthesis.speak(utterance)
    return utterance
  }, [])

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
  }, [])

  const isSpeaking = () => 'speechSynthesis' in window && window.speechSynthesis.speaking

  return { speak, stop, isSpeaking }
}

export default useSpeech
