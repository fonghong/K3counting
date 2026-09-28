import { afterEach, expect, it, vi } from 'vitest'
import { clearProgress, emptyProgress, loadProgress, saveProgress } from './progress'
import { cantoneseNumber, cantoneseVoice, speak } from './audio'

afterEach(() => vi.unstubAllGlobals())

it('falls back on malformed, wrong-schema and blocked storage', () => {
  for (const value of ['oops', '{}', '{"version":8}', '{"version":1,"settings":{},"observations":[]}']) expect(loadProgress({ getItem: () => value })).toEqual(emptyProgress())
  expect(loadProgress({ getItem: () => { throw Error('blocked') } })).toEqual(emptyProgress())
  expect(saveProgress(emptyProgress(), { setItem: () => { throw Error('blocked') } })).toBe(false)
  expect(clearProgress({ removeItem: () => { throw Error('blocked') } })).toBe(false)
  const progress = emptyProgress()
  progress.settings.support = 'independent'
  progress.settings.tally = true
  expect(loadProgress({ getItem: () => JSON.stringify(progress) }).settings.tally).toBe(false)
})

it('chooses Cantonese only and cancels stale utterances before speaking', () => {
  expect(cantoneseVoice([{ lang: 'zh-CN' } as SpeechSynthesisVoice])).toBeUndefined()
  const voice = { lang: 'zh-HK' } as SpeechSynthesisVoice
  const cancel = vi.fn()
  const say = vi.fn()
  vi.stubGlobal('speechSynthesis', { getVoices: () => [voice], cancel, speak: say })
  vi.stubGlobal('SpeechSynthesisUtterance', class { text: string; constructor(text: string) { this.text = text } })
  expect(speak('三十')).toBe(true)
  expect(cancel).toHaveBeenCalledOnce()
  expect(say.mock.calls[0][0].voice).toBe(voice)
  expect(cancel.mock.invocationCallOrder[0]).toBeLessThan(say.mock.invocationCallOrder[0])
  expect([19, 20, 29, 30, 31, 99].map(cantoneseNumber)).toEqual(['十九', '二十', '二十九', '三十', '三十一', '九十九'])
})