import { useState } from 'react'
import { countAt, createItems, placeItem, undoPlacement } from '../learning'
import { Berry, GameActions, type GameProps } from './shared'

export function Matching({ target, maximum, variant = 0, onComplete }: GameProps) {
  const total = Math.min(maximum, Math.max(1, target + [0, 1, -1][variant % 3]))
  const [state, setState] = useState(() => createItems(total))
  const [selected, setSelected] = useState<string | null>(null)
  const [answer, setAnswer] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('')
  const [done, setDone] = useState(false)
  const paired = total - countAt(state, 'source')
  const comparison = total === target ? 'same' : total > target ? 'more' : 'fewer'
  return <div className="matching-game"><div className="quantity-request">每隻兔仔，一份點心</div>
    <div className="food-source">{state.items.map((item, index) => <button key={item.id} className={`food-button ${selected === item.id ? 'selected' : ''} ${item.place !== 'source' ? 'moved' : ''}`} disabled={done || item.place !== 'source'} aria-label={`揀第 ${index + 1} 粒點心`} aria-pressed={selected === item.id} onClick={() => setSelected(item.id)}><Berry /></button>)}</div>
    <div className="rabbit-row">{Array.from({ length: target }, (_, index) => <div className="rabbit-place" key={index}><img src="/images/rabbit.png" alt="兔仔" /><button className="little-plate" disabled={done} aria-label={`畀第 ${index + 1} 隻兔仔`} onClick={() => { if (selected) { setState(placeItem(state, selected, `seat-${index}`, true)); setSelected(null); setFeedback('') } else setFeedback('先揀一粒點心。') }}>{state.items.some(item => item.place === `seat-${index}`) ? <Berry /> : <span className="empty-dot" />}</button></div>)}</div>
    <div className="choice-row" aria-label="點心同兔仔比較">{[['fewer', '點心少啲'], ['same', '一樣多'], ['more', '點心多啲']].map(([value, label]) => <button className={answer === value ? 'choice active' : 'choice'} key={value} disabled={done} aria-pressed={answer === value} onClick={() => setAnswer(value)}>{label}</button>)}</div>
    <GameActions feedback={feedback} done={done} canUndo={Boolean(state.history.length)} onUndo={() => { setState(undoPlacement(state)); setDone(false); setAnswer(null); setFeedback('') }} onCheck={() => { if (paired < Math.min(total, target)) { setFeedback('逐隻配一配，睇吓邊度仲有空位。'); return false } else if (answer !== comparison) { setFeedback('望吓有冇剩低嘅點心，或者空碟。'); return false } else { setDone(true); setFeedback('你用配對搵到喇。'); onComplete() } }} />
  </div>
}