import { useState } from 'react'
import { ArrowDownToLine, ArrowUpFromLine, Minus, Plus } from 'lucide-react'
import { PlaceValueBoard } from '../components/PlaceValueBoard'
import { bridges, createBlocks, getOperation, quantity, regroup, type BlockAction, type BlockState, type OperationMode } from '../regrouping'
import { GameActions, type GameProps } from './shared'

type Round = { blocks: BlockState; added: boolean; removedTens: number; removedOnes: number; reveal: boolean; done: boolean }
export type PackingMode = 'packing' | 'bridge' | Exclude<OperationMode, 'make-ten'>

export function PackingShop({ mode, variant = 0, bridgeIndex = 0, support = 'assisted', onComplete, onMove }: GameProps & { mode: PackingMode; bridgeIndex?: number }) {
  const bridge = bridges[bridgeIndex] || bridges[0]
  const task = mode === 'packing' || mode === 'bridge' ? null : getOperation(mode, variant)
  const goal = mode === 'packing' ? [10, 11, 19, 20, 14, 99][variant % 6] : mode === 'bridge' ? bridge.end : task!.result
  const initial = mode === 'packing' ? (variant === 0 ? 9 : 0) : mode === 'bridge' ? bridge.start : task!.first
  const [round, setRound] = useState<Round>(() => ({ blocks: createBlocks(initial), added: false, removedTens: 0, removedOnes: 0, reveal: true, done: false }))
  const [past, setPast] = useState<Round[]>([])
  const [feedback, setFeedback] = useState('')
  const [columns, setColumns] = useState(false)
  const total = quantity(round.blocks)
  const subtraction = task?.operator === '-'
  const remainingTens = task ? Math.floor(task.second / 10) - round.removedTens : 0
  const remainingOnes = task ? task.second % 10 - round.removedOnes : 0
  const pendingConfirmation = support === 'independent' && !round.reveal
  const arithmeticDone = task ? subtraction ? remainingTens === 0 && remainingOnes === 0 : round.added || task.second === 0 : false
  const ready = (task ? arithmeticDone : total === goal) && round.blocks.ones < 10

  function act(action: BlockAction, patch: Partial<Round> = {}) {
    if (round.done) return
    const blocks = regroup(round.blocks, action)
    if (blocks === round.blocks && !(task?.second === 0 && action.type === 'add')) return
    setPast([...past, round])
    setRound({ ...round, ...patch, blocks, reveal: action.type === 'pack' || action.type === 'unpack' ? round.reveal : support !== 'independent', done: false })
    setFeedback(action.type === 'pack' || action.type === 'unpack' ? '換咗個擺法，總數冇變。' : '')
    if (quantity(blocks) !== total) onMove?.(quantity(blocks))
  }

  return <div className="packing-game"><div className="quantity-request">{mode === 'packing' ? <>砌出 <strong className="quantity-number">{goal}</strong> 粒</> : mode === 'bridge' ? bridge.direction === 1 ? '每次加一粒，散件夠十就打包' : '每次拎走一粒；唔夠散件，先拆一包' : <>{task!.first} 粒，{subtraction ? '拎走' : '加入'} {task!.second} 粒</>}</div>
    <PlaceValueBoard blocks={round.blocks} reveal={round.reveal} />
    <div className="block-tools">
      {mode === 'packing' && <><button disabled={round.done || total >= 99 || round.blocks.ones >= 10} onClick={() => act({ type: 'add', amount: 1 })}><Plus />一粒</button><button disabled={round.done || total > 89 || round.blocks.ones >= 10} onClick={() => act({ type: 'add', amount: 10 })}><Plus />一包十粒</button><button disabled={round.done || !round.blocks.ones} onClick={() => act({ type: 'remove-ones', amount: 1 })}><Minus />一粒</button></>}
      {mode === 'bridge' && <button className="step-button" disabled={round.done || total === goal || pendingConfirmation || (bridge.direction === 1 ? round.blocks.ones >= 10 : !round.blocks.ones)} onClick={() => act(bridge.direction === 1 ? { type: 'add', amount: 1 } : { type: 'remove-ones', amount: 1 })}>{bridge.direction === 1 ? <Plus /> : <Minus />}{bridge.direction === 1 ? '加一粒' : '拎走一粒'}</button>}
      {task && !subtraction && <button disabled={round.added || round.done} onClick={() => act({ type: 'add', amount: task.second }, { added: true })}><Plus />加入 {task.second} 粒</button>}
      {subtraction && <><button disabled={round.done || remainingTens <= 0 || round.blocks.tens < 1} onClick={() => act({ type: 'remove-tens', amount: 1 }, { removedTens: round.removedTens + 1 })}><Minus />拎走一個十 <small>仲要 {remainingTens}</small></button><button disabled={round.done || remainingOnes <= 0 || round.blocks.ones < 1} onClick={() => act({ type: 'remove-ones', amount: 1 }, { removedOnes: round.removedOnes + 1 })}><Minus />拎走一粒 <small>仲要 {remainingOnes}</small></button></>}
    </div>
    <div className="exchange-tools"><button disabled={round.done || round.blocks.ones < 10} onClick={() => act({ type: 'pack' })}><ArrowDownToLine size={18} />十粒打包</button><button disabled={round.done || !round.blocks.tens || round.blocks.ones >= 10} onClick={() => act({ type: 'unpack' })}><ArrowUpFromLine size={18} />拆開一包</button></div>
    {task && round.done && <div className="equation">{task.first} {task.operator === '-' ? '−' : '+'} {task.second} = {total}<button className="text-button" onClick={() => setColumns(!columns)}>{columns ? '收起直式' : '睇吓直式'}</button>{columns && <div className="column-equation"><div className="column-labels"><span>十位</span><span>個位</span></div><div>{task.first}</div><div className="column-second"><span>{task.operator === '-' ? '−' : '+'}</span>{task.second}</div><div className="column-result">{total}</div><p>{mode === 'carrying' ? '十粒一換成一個十，進位嘅 1 代表一個十。' : mode === 'borrowing' || mode === 'unpack' ? '一個十換成十個一，拆包時總數冇變。' : '十同十對齊，一同一對齊。'}</p></div>}</div>}
    <GameActions feedback={feedback} done={round.done} canUndo={past.length > 0} onUndo={() => { setRound(past.at(-1)!); setPast(past.slice(0, -1)); setFeedback(''); setColumns(false) }} onCheck={() => {
      if (ready) { setRound({ ...round, reveal: true, done: true }); setFeedback(mode === 'bridge' ? '你一路加減，一路保留每一粒。' : '可以數一數，打包前後都對得上。'); onComplete() }
      else if (mode === 'bridge') { setRound({ ...round, reveal: true }); setFeedback(round.blocks.ones >= 10 ? '散件夠十粒，可以打包成一個十。' : '呢一步數好喇，再行一小步。') }
      else { setFeedback(round.blocks.ones >= 10 ? '散件夠十粒，可以換成一包。' : '望吓訂單，同枱面嘅物件對一對。'); return false }
    }} />
  </div>
}