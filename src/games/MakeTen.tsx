import { useState } from 'react'
import { createItems, placeItem, undoPlacement } from '../learning'
import { getOperation } from '../regrouping'
import { Berry, GameActions, type GameProps } from './shared'

export function MakeTen({ variant = 0, onComplete }: GameProps) {
  const task = getOperation('make-ten', variant)
  const [state, setState] = useState(() => ({ ...createItems(task.result), items: createItems(task.result).items.map((item, index) => ({ ...item, place: index < task.first ? `left-${index}` : `right-${index - task.first}` })) }))
  const [selected, setSelected] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [feedback, setFeedback] = useState('')
  const firstCount = state.items.filter(item => item.place.startsWith('left-')).length
  const frames = ['left', 'right'] as const
  return <div className="make-ten-game"><div className="quantity-request">{task.first} 粒同 {task.second} 粒，砌好一個十</div><div className="double-frames">{frames.map(side => <div key={side} className="frame-group"><div className="ten-frame" aria-label={side === 'left' ? '第一個十格' : '第二個十格'}>{Array.from({ length: 10 }, (_, index) => { const item = state.items.find(candidate => candidate.place === `${side}-${index}`); return <button key={index} className={`frame-cell ${item?.id === selected ? 'selected' : ''}`} aria-label={`${side === 'left' ? '第一' : '第二'}個十格，第 ${index + 1} 格${item ? '，有一粒' : '，空格'}`} aria-pressed={Boolean(item && item.id === selected)} disabled={done || (side === 'left' && Boolean(item)) || (side === 'right' && !item)} onClick={() => { if (item && side === 'right') setSelected(item.id); else if (side === 'left' && !item && selected) { setState(placeItem(state, selected, `${side}-${index}`, true)); setSelected(null); setFeedback('') } }} >{item && <Berry />}</button> })}</div></div>)}</div>{done && <div className="equation">{task.first} + {task.second} = 10 + {task.result - 10} = {task.result}</div>}<GameActions feedback={feedback} done={done} canUndo={state.history.length > 0} onUndo={() => { setState(undoPlacement(state)); setSelected(null); setDone(false); setFeedback('') }} onCheck={() => { if (firstCount === 10) { setDone(true); setFeedback('移咗位，總數冇變。先睇一個十，再睇剩低幾粒。'); onComplete() } else { setFeedback('望吓第一個十格仲差幾粒，從另一邊逐粒搬過嚟。'); return false } }} /></div>
}