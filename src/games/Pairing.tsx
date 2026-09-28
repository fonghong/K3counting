import { useState } from 'react'
import { Shuffle } from 'lucide-react'
import { createItems, placeItem, undoPlacement } from '../learning'
import { Berry, GameActions, type GameProps } from './shared'

export function Pairing({ target, onComplete }: GameProps) {
  const [state, setState] = useState(() => createItems(target))
  const [answer, setAnswer] = useState<'odd' | 'even' | null>(null)
  const [done, setDone] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [reversed, setReversed] = useState(false)
  const sources = state.items.filter(item => item.place === 'source')
  const placed = target - sources.length
  return <div className="pairing-game">
    <div className="quantity-request">兩個一對，有冇單丁？</div>
    <div className="food-source">{(reversed ? [...sources].reverse() : sources).map(item => <button className="food-button" key={item.id} aria-label={`配對點心 ${item.id}`} disabled={done} onClick={() => setState(placeItem(state, item.id, `seat-${placed}`, true))}><Berry /></button>)}</div>
    <div className="pairing-seats">{Array.from({ length: Math.ceil(target / 2) }, (_, pair) => <div className="seat-pair" key={pair}>{[0, 1].map(offset => <div key={offset} className="pair-seat" aria-label={`第 ${pair * 2 + offset + 1} 個座位`}>{state.items.some(item => item.place === `seat-${pair * 2 + offset}`) ? <Berry /> : <span className="empty-dot" />}</div>)}</div>)}</div>
    {target === 0 && <div className="zero-pairs">冇點心，亦冇落單嘅一粒。</div>}
    <div className="choice-row">
      <button className={`choice ${answer === 'even' ? 'active' : ''}`} disabled={done} aria-pressed={answer === 'even'} onClick={() => setAnswer('even')}>全部有伴・雙數</button>
      <button className={`choice ${answer === 'odd' ? 'active' : ''}`} disabled={done} aria-pressed={answer === 'odd'} onClick={() => setAnswer('odd')}>有一粒單丁・單數</button>
      <button className="icon-button" title="改變點心排列" aria-label="改變點心排列" disabled={done} onClick={() => setReversed(!reversed)}><Shuffle size={19} /></button>
    </div>
    <GameActions feedback={feedback} done={done} canUndo={Boolean(state.history.length)} onUndo={() => { setState(undoPlacement(state)); setDone(false); setAnswer(null); setFeedback('') }} onCheck={() => {
      if (sources.length) { setFeedback('逐粒搵個位，兩個坐埋一齊。'); return false }
      if (answer !== (target % 2 ? 'odd' : 'even')) { setFeedback('望吓最後一對，有冇一粒未有伴？'); return false }
      setDone(true)
      setFeedback(target % 2 ? '成對之外，仲有一粒單丁。' : '每一粒都有伴。')
      onComplete()
    }} />
  </div>
}