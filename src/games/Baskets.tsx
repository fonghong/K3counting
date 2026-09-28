import { useState } from 'react'
import { countAt, createItems, placeItem, undoPlacement } from '../learning'
import { Berry, GameActions, Quantity, type GameProps } from './shared'

export function Baskets({ target, numerals, onComplete }: GameProps) {
  const [state, setState] = useState(() => createItems(target))
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('')
  const [done, setDone] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [answer, setAnswer] = useState<number | null>(null)
  const left = countAt(state, 'left')
  function token(id: string, index: number) { return <button key={id} className={`food-button ${selected === id ? 'selected' : ''}`} aria-label={`揀第 ${index + 1} 粒點心`} aria-pressed={selected === id} onClick={() => { setSelected(id); setDone(false) }}><Berry /></button> }
  return <div className="baskets-game"><div className="quantity-request">一共有 <Quantity value={target} numerals={numerals} /> 粒點心</div>
    <div className="food-source">{state.items.map((item, index) => item.place === 'source' ? token(item.id, index) : null)}</div>
    <div className="basket-row">{(['left', 'right'] as const).map((side, index) => <div className={`basket basket-${side}`} key={side}><button className="basket-destination" aria-label={`放入${index ? '右' : '左'}籃`} onClick={() => { if (selected) { setState(placeItem(state, selected, side)); setSelected(null); setDone(false); setHidden(false); setFeedback('') } else setFeedback('揀一粒點心，再揀個籃。') }}>{index ? '右邊小籃' : '左邊小籃'}</button><div className="basket-items">{hidden && side === 'left' ? <span className="covered">?</span> : state.items.map((item, itemIndex) => item.place === side ? token(item.id, itemIndex) : null)}</div>{done && !hidden && <span className="basket-total">{countAt(state, side)}</span>}</div>)}</div>
    {done && !hidden && <div className="equation">{left} + {target - left} = {target}</div>}
    {done && <div className="explore-controls"><button className="text-button" onClick={() => { setHidden(!hidden); setAnswer(null); setFeedback('') }}>{hidden ? '打開小籃' : '遮住左籃，搵另一部分'}</button>{hidden && <div className="choice-row">{Array.from({ length: target + 1 }, (_, value) => <button key={value} className={`choice ${answer === value ? 'active' : ''}`} aria-label={`左籃有 ${value} 粒`} onClick={() => { setAnswer(value); setFeedback(value === left ? '打開個籃，一齊驗證。' : '可以打開個籃，再望一望。') }}>{value}</button>)}</div>}</div>}
    <GameActions feedback={feedback} done={done} canUndo={Boolean(state.history.length)} onUndo={() => { setState(undoPlacement(state)); setDone(false); setHidden(false); setFeedback('') }} onCheck={() => { if (countAt(state, 'source')) { setFeedback('仲有點心未入籃，可以放晒同一邊。'); return false } else { setDone(true); setFeedback('分開咗，總數都冇變。'); onComplete() } }} />
  </div>
}