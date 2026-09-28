import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { GameActions, type GameProps } from './shared'

export function NumberTrain({ variant = 0, maximum, support, onComplete, onMove }: GameProps) {
  const ceiling = maximum === 5 ? 10 : 20
  const cases = [[4, 1], [7, -1], [0, 1], [9, 1], [ceiling, -1]]
  const [start, direction] = cases[variant % cases.length]
  const [passengers, setPassengers] = useState(start)
  const [past, setPast] = useState<number[]>([])
  const [feedback, setFeedback] = useState('')
  const [done, setDone] = useState(false)
  function change(amount: number) { setPast([...past, passengers]); setPassengers(passengers + amount); setFeedback(''); onMove?.(passengers + amount) }
  return <div className="train-game"><div className="quantity-request">本來 {start} 位，{direction === 1 ? '加一位乘客' : '一位乘客落車'}</div><div className="number-train">{Array.from({ length: Math.max(1, Math.ceil(passengers / 5)) }, (_, carriage) => <div className="train-carriage" key={carriage}><div className="passengers">{Array.from({ length: Math.min(5, passengers - carriage * 5) }, (_, index) => <img key={index} src="/images/rabbit.png" alt="一位兔仔乘客" />)}</div><span className="train-wheel" /><span className="train-wheel rear" /></div>)}</div><div className="quantity-ledger">依家有 <strong>{support === 'independent' && !done && past.length ? '?' : passengers}</strong> 位</div><div className="block-tools"><button disabled={done || passengers <= 0} onClick={() => change(-1)}><Minus />一位落車</button><button disabled={done || passengers >= ceiling} onClick={() => change(1)}><Plus />一位上車</button></div><GameActions feedback={feedback} done={done} canUndo={past.length > 0} onUndo={() => { setPassengers(past.at(-1)!); setPast(past.slice(0, -1)); setDone(false); setFeedback('') }} onCheck={() => { if (passengers === start + direction) { setDone(true); setFeedback('一個動作，數量就變一。'); onComplete() } else { setFeedback('睇吓係上車，定係落車，再同原本比一比。'); return false } }} /></div>
}