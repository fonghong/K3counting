import { useState } from 'react'
import { countAt, createItems, placeItem, undoPlacement } from '../learning'
import { Berry, GameActions, Quantity, type GameProps } from './shared'

export function TenFrame({ target, numerals, onComplete, onMove }: GameProps) {
  const [state, setState] = useState(() => createItems(target))
  const [feedback, setFeedback] = useState('')
  const [done, setDone] = useState(false)
  const placed = target - countAt(state, 'source')
  const topRow = state.items.filter(item => /^cell-[0-4]$/.test(item.place)).length
  return <div className="frame-game"><div className="quantity-request">花園種 <Quantity value={target} numerals={numerals} /> 粒士多啤梨</div>
    <div className="frame-stock">{state.items.filter(item => item.place === 'source').map(item => <Berry key={item.id} />)}</div>
    <div className="ten-frame" aria-label="兩行五格花園">{Array.from({ length: 10 }, (_, index) => {
      const occupied = state.items.find(item => item.place === `cell-${index}`)
      return <button className={`frame-cell ${occupied ? 'occupied' : ''}`} key={index} aria-label={`第 ${index + 1} 格${occupied ? '，有一粒' : '，空格'}`} disabled={done} onClick={() => { const item = occupied || state.items.find(candidate => candidate.place === 'source'); if (!item) return; const next = placeItem(state, item.id, occupied ? 'source' : `cell-${index}`, !occupied); setState(next); setFeedback(''); onMove?.(target - countAt(next, 'source')) }}>{occupied ? <Berry /> : <span className="empty-dot" />}</button>
    })}</div>
    {done && <div className="equation">{placed > 5 ? `${topRow} + ${placed - topRow} = ${placed}` : `種咗 ${placed} 粒`}<span>仲有 {10 - placed} 個空位</span></div>}
    <GameActions feedback={feedback} done={done} canUndo={Boolean(state.history.length)} onUndo={() => { setState(undoPlacement(state)); setDone(false); setFeedback('') }} onCheck={() => { if (placed === target) { setDone(true); setFeedback('每格一粒，望到成個數。'); onComplete() } else { setFeedback('仲有點心未放入花園。'); return false } }} />
  </div>
}