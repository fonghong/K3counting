import { Check, Undo2 } from 'lucide-react'
import { useContext } from 'react'
import { AssistanceContext } from '../assistance'
import type { Support } from '../learning'

export type GameProps = { target: number; maximum: number; variant?: number; numerals?: boolean; support?: Support; onComplete: () => void; onMove?: (value: number) => void }

export function Berry({ label = '一粒士多啤梨' }: { label?: string }) {
  return <span className="berry" role="img" aria-label={label} />
}

export function Quantity({ value, numerals = true }: { value: number; numerals?: boolean }) {
  return numerals ? <strong className="quantity-number">{value}</strong> : <span className="target-dots" aria-label={`${value} 點`}>{Array.from({ length: value }, (_, index) => <i key={index} />)}</span>
}

export function GameActions({ feedback, done, canUndo, onUndo, onCheck }: { feedback: string; done: boolean; canUndo: boolean; onUndo: () => void; onCheck: () => void | false }) {
  const reportAssistance = useContext(AssistanceContext)
  return <><div className="game-feedback" role="status">{feedback || '\u00a0'}</div><div className="game-actions"><button className="icon-button" aria-label="撤銷" title="撤銷" disabled={!canUndo} onClick={onUndo}><Undo2 size={20} /></button><button className="primary" disabled={done} onClick={() => { if (onCheck() === false) reportAssistance() }}><Check size={20} />擺好喇</button></div></>
}