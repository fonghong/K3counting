import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { Picnic } from './Picnic'
import { Matching } from './Matching'
import { Baskets } from './Baskets'
import { TenFrame } from './TenFrame'
import { PackingShop } from './PackingShop'
import { Pairing } from './Pairing'
import { NumberTrain } from './NumberTrain'

afterEach(cleanup)

it('completes picnic with taps and cannot count an already moved item twice', () => {
  const complete = vi.fn()
  render(<Picnic target={2} onComplete={complete} />)
  const first = screen.getByRole('button', { name: '放第 1 粒士多啤梨' })
  fireEvent.click(first)
  fireEvent.click(first)
  expect(within(screen.getByTestId('plate')).getAllByLabelText('一粒士多啤梨')).toHaveLength(1)
  fireEvent.click(screen.getByRole('button', { name: '撤銷' }))
  expect(screen.getByTestId('plate').children).toHaveLength(0)
  fireEvent.click(first)
  fireEvent.click(screen.getByRole('button', { name: '放第 2 粒士多啤梨' }))
  fireEvent.click(screen.getByRole('button', { name: '擺好喇' }))
  fireEvent.click(screen.getByRole('button', { name: '擺好喇' }))
  expect(complete).toHaveBeenCalledTimes(1)
})

it('pairs items into exclusive seats and compares the groups', () => {
  const complete = vi.fn()
  render(<Matching target={2} maximum={5} onComplete={complete} />)
  for (let index = 1; index <= 2; index++) {
    fireEvent.click(screen.getByRole('button', { name: `揀第 ${index} 粒點心` }))
    fireEvent.click(screen.getByRole('button', { name: `畀第 ${index} 隻兔仔` }))
  }
  fireEvent.click(screen.getByRole('button', { name: '一樣多' }))
  fireEvent.click(screen.getByRole('button', { name: '擺好喇' }))
  expect(complete).toHaveBeenCalledOnce()
})

it('accepts a zero part and preserves quantities when moving between baskets', () => {
  const complete = vi.fn()
  render(<Baskets target={3} maximum={5} onComplete={complete} />)
  for (let index = 1; index <= 3; index++) {
    fireEvent.click(screen.getByRole('button', { name: `揀第 ${index} 粒點心` }))
    fireEvent.click(screen.getByRole('button', { name: '放入右籃' }))
  }
  fireEvent.click(screen.getByRole('button', { name: '擺好喇' }))
  expect(screen.getByText('0 + 3 = 3')).toBeTruthy()
  expect(complete).toHaveBeenCalledOnce()
  fireEvent.click(screen.getByRole('button', { name: '撤銷' }))
  expect(screen.getAllByLabelText('一粒士多啤梨')).toHaveLength(3)
})

it.each([1, 5, 6, 7, 9, 10])('fills ten-frame quantity %i with exactly ten exclusive cells', target => {
  const complete = vi.fn()
  render(<TenFrame target={target} maximum={10} onComplete={complete} />)
  expect(within(screen.getByLabelText('兩行五格花園')).getAllByRole('button')).toHaveLength(10)
  for (let index = 1; index <= target; index++) fireEvent.click(screen.getByRole('button', { name: `第 ${index} 格，空格` }))
  fireEvent.click(screen.getByRole('button', { name: '擺好喇' }))
  expect(complete).toHaveBeenCalledOnce()
  expect(screen.getByText(`仲有 ${10 - target} 個空位`)).toBeTruthy()
})

it('walks 27 to 32, preserves the intermediate ten and restores grouping on undo', () => {
  const complete = vi.fn()
  render(<PackingShop mode="bridge" target={0} maximum={99} onComplete={complete} />)
  for (let step = 0; step < 3; step++) fireEvent.click(screen.getByRole('button', { name: '加一粒' }))
  expect(screen.getByTestId('quantity-value').textContent).toBe('30')
  expect(screen.getAllByLabelText('一粒積木')).toHaveLength(10)
  expect(screen.getAllByRole('button', { name: /包，十粒/ })).toHaveLength(2)
  fireEvent.click(screen.getByRole('button', { name: '十粒打包' }))
  fireEvent.click(screen.getByRole('button', { name: '十粒打包' }))
  expect(screen.getByTestId('quantity-value').textContent).toBe('30')
  expect(screen.getAllByRole('button', { name: /包，十粒/ })).toHaveLength(3)
  fireEvent.click(screen.getByRole('button', { name: '撤銷' }))
  expect(screen.getAllByLabelText('一粒積木')).toHaveLength(10)
  fireEvent.click(screen.getByRole('button', { name: '十粒打包' }))
  fireEvent.click(screen.getByRole('button', { name: '加一粒' }))
  fireEvent.click(screen.getByRole('button', { name: '加一粒' }))
  fireEvent.click(screen.getByRole('button', { name: '擺好喇' }))
  expect(complete).toHaveBeenCalledOnce()
})

it('does not reveal the next bridge numeral on an independent trial', () => {
  render(<PackingShop mode="bridge" target={0} maximum={99} support="independent" onComplete={() => {}} />)
  fireEvent.click(screen.getByRole('button', { name: '加一粒' }))
  expect(screen.getByTestId('quantity-value').textContent).toBe('?')
  fireEvent.click(screen.getByRole('button', { name: '擺好喇' }))
  expect(screen.getByTestId('quantity-value').textContent).toBe('28')
})

it.each(Array.from({ length: 21 }, (_, total) => total))('pairs %i items with correct odd/even remainder', total => {
  const complete = vi.fn()
  render(<Pairing target={total} maximum={20} onComplete={complete} />)
  for (let index = 0; index < total; index++) fireEvent.click(screen.getByRole('button', { name: `配對點心 item-${index}` }))
  fireEvent.click(screen.getByRole('button', { name: total % 2 ? '有一粒單丁・單數' : '全部有伴・雙數' }))
  fireEvent.click(screen.getByRole('button', { name: '擺好喇' }))
  expect(complete).toHaveBeenCalledOnce()
})

it('starts a one-more task at four, not one', () => {
  const complete = vi.fn()
  render(<NumberTrain target={0} maximum={10} onComplete={complete} />)
  expect(screen.getAllByAltText('一位兔仔乘客')).toHaveLength(4)
  fireEvent.click(screen.getByRole('button', { name: '一位上車' }))
  fireEvent.click(screen.getByRole('button', { name: '擺好喇' }))
  expect(screen.getAllByAltText('一位兔仔乘客')).toHaveLength(5)
  expect(complete).toHaveBeenCalledOnce()
})