import { describe, expect, it } from 'vitest'
import { boundedTarget, countAt, createItems, placeItem, undoPlacement } from './learning'

describe('quantity ledger', () => {
  it('ignores duplicate placement and restores exact items on undo', () => {
    const initial = createItems(5)
    const moved = placeItem(initial, 'item-0', 'plate')
    expect(placeItem(moved, 'item-0', 'plate')).toBe(moved)
    expect(countAt(moved, 'plate')).toBe(1)
    expect(undoPlacement(moved).items).toEqual(initial.items)
  })
  it('preserves IDs, quantity and exclusive occupancy for all supported sizes', () => {
    for (let total = 0; total <= 20; total++) {
      let state = createItems(total)
      for (const item of state.items) state = placeItem(state, item.id, 'basket')
      expect(countAt(state, 'basket')).toBe(total)
      expect(new Set(state.items.map(item => item.id)).size).toBe(total)
    }
    const state = placeItem(createItems(3), 'item-0', 'seat-0', true)
    expect(placeItem(state, 'item-1', 'seat-0', true)).toBe(state)
  })
  it('generates finite targets', () => {
    for (const maximum of [5, 10, 20]) for (let seed = 0; seed < 100; seed++) {
      expect(boundedTarget(seed, maximum)).toBeGreaterThanOrEqual(1)
      expect(boundedTarget(seed, maximum)).toBeLessThanOrEqual(maximum)
    }
  })
})