import { useState } from 'react'
import { countAt, createItems, placeItem, undoPlacement } from '../learning'
import { Berry, GameActions, Quantity } from './shared'

export function Picnic({ target = 3, maximum = 5, numerals = true, onComplete = () => {}, onMove = () => {} }: { target?: number; maximum?: number; numerals?: boolean; onComplete?: () => void; onMove?: (total: number) => void }) {
  const [state, setState] = useState(() => createItems(maximum))
  const [feedback, setFeedback] = useState('')
  const [complete, setComplete] = useState(false)
  const total = countAt(state, 'plate')

  function move(id: string) {
    if (complete) return
    const next = placeItem(state, id, 'plate')
    if (next === state) return
    setState(next)
    setFeedback('')
    onMove(countAt(next, 'plate'))
  }

  return <div className="picnic-game">
    <div className="quantity-request"><span>兔仔想食</span><Quantity value={target} numerals={numerals} /><span>粒士多啤梨</span></div>
    <div className="food-source" aria-label="未放上碟嘅食物">
      {state.items.map((item, index) => <button className={`food-button ${item.place !== 'source' ? 'moved' : ''}`} key={item.id} aria-label={`放第 ${index + 1} 粒士多啤梨`} disabled={complete || item.place !== 'source'} onClick={() => move(item.id)}><Berry /></button>)}
    </div>
    <div className="picnic-table"><div className="plate" aria-label="兔仔個碟" data-testid="plate">
      {state.items.filter(item => item.place === 'plate').map(item => <Berry key={item.id} />)}
    </div></div>
    <GameActions feedback={feedback} done={complete} canUndo={Boolean(state.history.length)} onUndo={() => { setState(undoPlacement(state)); setFeedback(''); setComplete(false) }} onCheck={() => { if (total === target) { setComplete(true); setFeedback('你逐粒放好喇！'); onComplete() } else { setFeedback('一齊望吓個碟，再數一數。'); return false } }} />
  </div>
}