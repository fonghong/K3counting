export type Support = 'modeled' | 'assisted' | 'independent'
export type Item = { id: string; place: string }
export type PlacementState = { items: Item[]; history: Item[][] }

export function createItems(total: number): PlacementState {
  if (!Number.isInteger(total) || total < 0 || total > 20) throw new RangeError('Invalid item count')
  return { items: Array.from({ length: total }, (_, index) => ({ id: `item-${index}`, place: 'source' })), history: [] }
}

export function placeItem(state: PlacementState, id: string, place: string, exclusive = false): PlacementState {
  const item = state.items.find(candidate => candidate.id === id)
  if (!item || item.place === place || (exclusive && state.items.some(candidate => candidate.place === place))) return state
  return { items: state.items.map(candidate => candidate.id === id ? { ...candidate, place } : candidate), history: [...state.history, state.items] }
}

export function undoPlacement(state: PlacementState): PlacementState {
  const previous = state.history.at(-1)
  return previous ? { items: previous, history: state.history.slice(0, -1) } : state
}

export function countAt(state: PlacementState, place: string): number {
  return state.items.filter(item => item.place === place).length
}

export function boundedTarget(seed: number, maximum: number): number {
  return 1 + ((Math.abs(Math.trunc(seed)) * 7 + 3) % maximum)
}