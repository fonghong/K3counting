export type Blocks = { tens: number; ones: number }
export type BlockState = Blocks & { history: Blocks[] }
export type BlockAction = { type: 'add'; amount: number } | { type: 'remove-ones' | 'remove-tens'; amount: number } | { type: 'pack' | 'unpack' | 'undo' }
export type Operation = { first: number; second: number; operator: '+' | '-'; result: number }

export function quantity(blocks: Blocks) { return blocks.tens * 10 + blocks.ones }

export function createBlocks(total: number): BlockState {
  if (!Number.isInteger(total) || total < 0 || total > 99) throw new RangeError('Quantity must be 0-99')
  return { tens: Math.floor(total / 10), ones: total % 10, history: [] }
}

export function regroup(state: BlockState, action: BlockAction): BlockState {
  if (action.type === 'undo') {
    const previous = state.history.at(-1)
    return previous ? { ...previous, history: state.history.slice(0, -1) } : state
  }
  let { tens, ones } = state
  if ('amount' in action && (!Number.isInteger(action.amount) || action.amount < 1 || action.amount > 99)) return state
  switch (action.type) {
    case 'add': tens += Math.floor(action.amount / 10); ones += action.amount % 10; break
    case 'remove-ones': if (ones < action.amount) return state; ones -= action.amount; break
    case 'remove-tens': if (tens < action.amount) return state; tens -= action.amount; break
    case 'pack': if (ones < 10) return state; ones -= 10; tens += 1; break
    case 'unpack': if (tens < 1 || ones >= 10) return state; tens -= 1; ones += 10; break
  }
  if (quantity({ tens, ones }) > 99 || quantity({ tens, ones }) < 0 || ones > 19 || tens > 9) return state
  return { tens, ones, history: [...state.history, { tens: state.tens, ones: state.ones }] }
}

export function operation(first: number, second: number, operator: '+' | '-'): Operation {
  createBlocks(first); createBlocks(second)
  const result = operator === '+' ? first + second : first - second
  createBlocks(result)
  return { first, second, operator, result }
}

export const operationSets = {
  'make-ten': [[8, 5, '+'], [7, 5, '+'], [9, 1, '+'], [10, 10, '+'], [6, 8, '+']],
  unpack: [[13, 5, '-'], [10, 1, '-'], [13, 3, '-'], [20, 5, '-']],
  orders: [[23, 14, '+'], [36, 12, '-'], [49, 50, '+'], [99, 99, '-'], [20, 0, '+']],
  carrying: [[27, 15, '+'], [25, 15, '+'], [38, 24, '+'], [46, 37, '+']],
  borrowing: [[32, 16, '-'], [30, 14, '-'], [10, 1, '-'], [43, 27, '-']],
} as const
export type OperationMode = keyof typeof operationSets
export function getOperation(mode: OperationMode, seed: number): Operation {
  const set = operationSets[mode]
  const [first, second, operator] = set[Math.abs(seed) % set.length]
  return operation(first, second, operator)
}

export const bridges = [
  { id: '29-30', start: 27, end: 32, direction: 1, label: '27 → 32' },
  { id: '9-10', start: 9, end: 11, direction: 1, label: '9 → 11' },
  { id: '19-20', start: 19, end: 21, direction: 1, label: '19 → 21' },
  { id: '39-40', start: 39, end: 41, direction: 1, label: '39 → 41' },
  { id: '89-90', start: 89, end: 91, direction: 1, label: '89 → 91' },
  { id: '30-29', start: 31, end: 29, direction: -1, label: '倒返轉：31 → 29' },
] as const