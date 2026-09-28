import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MakeTen } from './MakeTen'
import { Story } from './Story'
import { PackingShop } from './PackingShop'

afterEach(cleanup)

it('moves two from five to complete eight without changing thirteen objects', () => {
  const complete = vi.fn()
  render(<MakeTen target={0} maximum={20} onComplete={complete} />)
  expect(screen.getAllByRole('button', { name: /個十格，第/ })).toHaveLength(20)
  expect(screen.getAllByRole('img', { name: '一粒士多啤梨' })).toHaveLength(13)
  fireEvent.click(screen.getByRole('button', { name: '第二個十格，第 1 格，有一粒' }))
  fireEvent.click(screen.getByRole('button', { name: '第一個十格，第 9 格，空格' }))
  fireEvent.click(screen.getByRole('button', { name: '第二個十格，第 2 格，有一粒' }))
  fireEvent.click(screen.getByRole('button', { name: '第一個十格，第 10 格，空格' }))
  fireEvent.click(screen.getByRole('button', { name: '擺好喇' }))
  expect(complete).toHaveBeenCalledOnce()
  expect(screen.getByText('8 + 5 = 10 + 3 = 13')).toBeTruthy()
  expect(screen.getAllByRole('img', { name: '一粒士多啤梨' })).toHaveLength(13)
})

it.each([0, 1, 2])('handles story family %i using individual objects', variant => {
  const complete = vi.fn()
  render(<Story variant={variant} target={0} maximum={5} onComplete={complete} />)
  const objects = screen.getAllByRole('button', { name: variant === 1 ? /食一粒/ : /送一粒/ })
  for (const object of objects.slice(0, variant === 2 ? 3 : 2)) fireEvent.click(object)
  fireEvent.click(screen.getByRole('button', { name: '擺好喇' }))
  expect(complete).toHaveBeenCalledOnce()
})

it('unpacks thirty before removing fourteen, and undo restores every stage', () => {
  const complete = vi.fn()
  render(<PackingShop mode="borrowing" variant={1} target={0} maximum={99} onComplete={complete} />)
  fireEvent.click(screen.getByRole('button', { name: '拆開一包' }))
  expect(screen.getByTestId('quantity-value').textContent).toBe('30')
  fireEvent.click(screen.getByRole('button', { name: /拎走一個十/ }))
  for (let index = 0; index < 4; index++) fireEvent.click(screen.getByRole('button', { name: /拎走一粒 仲要/ }))
  fireEvent.click(screen.getByRole('button', { name: '擺好喇' }))
  expect(screen.getByTestId('quantity-value').textContent).toBe('16')
  expect(complete).toHaveBeenCalledOnce()
  fireEvent.click(screen.getByRole('button', { name: '撤銷' }))
  expect(screen.getByTestId('quantity-value').textContent).toBe('17')
})