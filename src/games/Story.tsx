import { useState } from 'react'
import { createItems, placeItem, undoPlacement } from '../learning'
import { Berry, GameActions, type GameProps } from './shared'

export function Story({ maximum, variant = 0, onComplete }: GameProps) {
  const kind = variant % 3
  const first = maximum === 5 ? [3, 4, 2][kind] : [6, 9, 6][kind]
  const second = maximum === 5 ? [2, 2, 3][kind] : [3, 4, 4][kind]
  const goal = kind === 1 ? first - second : first + second
  const total = kind === 1 ? first : kind === 2 ? maximum : first + second
  const [state, setState] = useState(() => ({ ...createItems(total), items: createItems(total).items.map((item, index) => ({ ...item, place: index < first ? 'plate' : 'source' })) }))
  const [feedback, setFeedback] = useState('')
  const [done, setDone] = useState(false)
  const count = state.items.filter(item => item.place === 'plate').length
  return <div className="story-game"><div className="quantity-request">{kind === 1 ? <>有 {first} 粒，兔仔食咗 {second} 粒</> : kind === 2 ? <>本來 {first} 粒，要幾多先夠 {goal} 粒？</> : <>本來 {first} 粒，朋友再送 {second} 粒</>}</div><div className="story-sources"><span>{kind === 1 ? '兔仔食咗' : '朋友帶嚟'}</span><div className="food-source">{state.items.filter(item => item.place !== 'plate').map(item => <button className="food-button" key={item.id} aria-label={`送一粒 ${item.id}`} disabled={done || kind === 1} onClick={() => { setState(placeItem(state, item.id, 'plate')); setFeedback('') }}><Berry /></button>)}</div></div><div className="picnic-table"><div className="plate" aria-label="故事點心碟">{state.items.filter(item => item.place === 'plate').map(item => <button className="food-button" key={item.id} disabled={done || kind !== 1} aria-label={`食一粒 ${item.id}`} onClick={() => { setState(placeItem(state, item.id, 'eaten')); setFeedback('') }}><Berry /></button>)}</div></div>{done && <div className="equation">{kind === 1 ? `${first} − ${second} = ${goal}` : `${first} + ${second} = ${goal}`}</div>}<GameActions done={done} feedback={feedback} canUndo={state.history.length > 0} onUndo={() => { setState(undoPlacement(state)); setDone(false); setFeedback('') }} onCheck={() => { if (count === goal) { setDone(true); setFeedback(kind === 1 ? '拎走嘅同剩低嘅，加埋就係原本嗰堆。' : '兩份合埋，成為一個總數。'); onComplete() } else { setFeedback('再望吓故事，邊啲要加入，邊啲要拎走？'); return false } }} /></div>
}