import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

export function Dialog({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const opener = useRef<HTMLElement | null>(null)
  useEffect(() => {
    opener.current ??= document.activeElement as HTMLElement | null
    ref.current?.showModal()
    return () => { opener.current?.focus() }
  }, [])
  return <dialog ref={ref} className="dialog" aria-labelledby="dialog-title" onKeyDown={event => {
    if (event.key !== 'Tab') return
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]')).filter(control => control.getClientRects().length > 0)
    const first = controls[0]
    const last = controls.at(-1)
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
  }} onCancel={event => { event.preventDefault(); onClose() }}><div className="dialog-heading"><h2 id="dialog-title">{title}</h2><button className="icon-button" onClick={onClose} title="關閉" aria-label="關閉"><X /></button></div>{children}</dialog>
}