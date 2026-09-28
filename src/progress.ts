import type { Support } from './learning'

export type Settings = { maximum: 5 | 10; support: Support; tally: boolean; numerals: boolean }
export type Observation = { id: string; at: string; level: string; taskId?: string; support: Support; kind: 'quantity' | 'naming' | 'recognition' | 'physical' | 'comfort'; result: string; hints: number; range: number; representation: 'objects' | 'linked' | 'symbols' }
export type Progress = { version: 1; settings: Settings; observations: Observation[] }
export const STORAGE_KEY = 'rabbit-number-garden:v1'
export const defaults: Settings = { maximum: 5, support: 'assisted', tally: false, numerals: true }

export function emptyProgress(): Progress { return { version: 1, settings: { ...defaults }, observations: [] } }

export function loadProgress(storage?: Pick<Storage, 'getItem'>): Progress {
  try {
    const parsed: unknown = JSON.parse((storage ?? window.localStorage).getItem(STORAGE_KEY) || 'null')
    if (!parsed || typeof parsed !== 'object') return emptyProgress()
    const data = parsed as Partial<Progress>
    if (data.version !== 1 || !data.settings || !Array.isArray(data.observations)) return emptyProgress()
    const { maximum, support, tally, numerals } = data.settings
    if (![5, 10].includes(maximum) || !['modeled', 'assisted', 'independent'].includes(support) || typeof tally !== 'boolean' || typeof numerals !== 'boolean') return emptyProgress()
    return { version: 1, settings: { maximum, support, tally: support === 'independent' ? false : tally, numerals }, observations: data.observations.filter(record => record && typeof record.id === 'string' && typeof record.at === 'string' && !Number.isNaN(Date.parse(record.at)) && typeof record.level === 'string' && ['modeled', 'assisted', 'independent'].includes(record.support) && ['quantity', 'naming', 'recognition', 'physical', 'comfort'].includes(record.kind) && typeof record.result === 'string' && Number.isInteger(record.hints) && record.hints >= 0 && Number.isInteger(record.range) && record.range >= 0 && record.range <= 99 && ['objects', 'linked', 'symbols'].includes(record.representation)).slice(-60) }
  } catch { return emptyProgress() }
}

export function saveProgress(progress: Progress, storage?: Pick<Storage, 'setItem'>): boolean {
  try { (storage ?? window.localStorage).setItem(STORAGE_KEY, JSON.stringify(progress)); return true } catch { return false }
}

export function clearProgress(storage?: Pick<Storage, 'removeItem'>): boolean {
  try { (storage ?? window.localStorage).removeItem(STORAGE_KEY); return true } catch { return false }
}