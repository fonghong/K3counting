import { describe, expect, it } from 'vitest'
import { bridges, createBlocks, getOperation, operation, operationSets, quantity, regroup } from './regrouping'

describe('base-ten quantity ledger', () => {
  it('keeps addition distinct from exchange at every forward decade', () => {
    for (const start of [9, 19, 29, 39, 49, 59, 69, 79, 89]) {
      const initial = createBlocks(start)
      const added = regroup(initial, { type: 'add', amount: 1 })
      expect(added.ones).toBe(10)
      expect(added.tens).toBe(initial.tens)
      expect(quantity(added)).toBe(start + 1)
      const packed = regroup(added, { type: 'pack' })
      expect(quantity(packed)).toBe(start + 1)
      expect(packed.ones).toBe(0)
      expect(regroup(packed, { type: 'pack' })).toBe(packed)
      expect(regroup(packed, { type: 'undo' })).toEqual(added)
      expect(regroup(added, { type: 'undo' })).toEqual(initial)
    }
  })
  it('unpacks without removing a ten and cannot create negative amounts', () => {
    const unpacked = regroup(createBlocks(30), { type: 'unpack' })
    expect(unpacked).toMatchObject({ tens: 2, ones: 10 })
    expect(quantity(unpacked)).toBe(30)
    expect(quantity(regroup(unpacked, { type: 'remove-ones', amount: 1 }))).toBe(29)
    const zero = createBlocks(0)
    expect(regroup(zero, { type: 'remove-ones', amount: 1 })).toBe(zero)
    expect(regroup(zero, { type: 'unpack' })).toBe(zero)
    const ceiling = createBlocks(99)
    expect(regroup(ceiling, { type: 'add', amount: 1 })).toBe(ceiling)
  })
  it('exhaustively preserves all legal 0-99 addition and subtraction results', () => {
    for (let first = 0; first <= 99; first++) for (let second = 0; second <= 99; second++) {
      if (first + second <= 99) {
        let state = regroup(createBlocks(first), { type: 'add', amount: second })
        if (state.ones >= 10) state = regroup(state, { type: 'pack' })
        if (quantity(state) !== first + second || state.ones >= 10) throw Error(`Bad sum ${first}+${second}`)
      }
      if (first >= second) {
        let state = createBlocks(first)
        if (state.ones < second % 10) state = regroup(state, { type: 'unpack' })
        state = regroup(state, { type: 'remove-ones', amount: second % 10 })
        state = regroup(state, { type: 'remove-tens', amount: Math.floor(second / 10) })
        if (quantity(state) !== first - second) throw Error(`Bad difference ${first}-${second}`)
      }
    }
  })
  it('has bounded task families and separate reverse bridge', () => {
    for (const mode of Object.keys(operationSets) as (keyof typeof operationSets)[]) for (let seed = 0; seed < 30; seed++) {
      const task = getOperation(mode, seed)
      expect(task.result).toBeGreaterThanOrEqual(0)
      expect(task.result).toBeLessThan(100)
    }
    expect(bridges.at(-1)?.direction).toBe(-1)
    expect(() => operation(99, 1, '+')).toThrow()
    expect(() => operation(0, 1, '-')).toThrow()
    expect(() => createBlocks(1.5)).toThrow()
  })
})