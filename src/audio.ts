import { useEffect, useState } from 'react'

export function cantoneseVoice(voices: SpeechSynthesisVoice[]) {
  return voices.find(voice => voice.lang.toLowerCase().replace('_', '-') === 'zh-hk')
}

export function cancelSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel()
}

export function speak(text: string): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false
  const voice = cantoneseVoice(window.speechSynthesis.getVoices())
  cancelSpeech()
  if (!voice) return false
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.voice = voice
  utterance.lang = 'zh-HK'
  utterance.rate = 0.82
  window.speechSynthesis.speak(utterance)
  return true
}

export function useCantoneseAudio() {
  const [available, setAvailable] = useState(false)
  useEffect(() => {
    if (!('speechSynthesis' in window)) return
    const synth = window.speechSynthesis
    const update = () => setAvailable(Boolean(cantoneseVoice(synth.getVoices())))
    update()
    synth.addEventListener('voiceschanged', update)
    return () => { synth.removeEventListener('voiceschanged', update); cancelSpeech() }
  }, [])
  return available
}

export function cantoneseNumber(value: number): string {
  const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
  if (value < 10) return digits[value]
  const tens = Math.floor(value / 10)
  return `${tens === 1 ? '' : digits[tens]}十${value % 10 ? digits[value % 10] : ''}`
}