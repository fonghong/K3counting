import { expect, test, type Page } from '@playwright/test'

const activities = ['兔仔野餐', '一兔一份', '兩個小籃', '十格花園', '數字小火車', '點心小故事', '兩個好朋友', '兔仔打包店', '跨十小橋', '湊十花園', '拆包分點心', '十位小訂單', '打包再出發', '拆包再分配']

async function choose(page: Page, title: string) {
  await page.getByRole('button', { name: '兔仔數數小天地，揀活動' }).click()
  await page.getByRole('dialog').getByRole('button', { name: new RegExp(title) }).click()
  await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible()
}

for (const [width, height] of [[1440, 900], [1024, 768], [768, 1024], [390, 844]]) {
  test(`all activities fit ${width}x${height}`, async ({ page }, testInfo) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.setViewportSize({ width, height })
    await page.goto('/')
    for (const title of activities) {
      await choose(page, title)
      await expect(page.getByRole('button', { name: '擺好喇' })).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      expect(await page.locator('img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true)
      const undersized = await page.locator('.game-mount button').evaluateAll(buttons => buttons.filter(button => {
        const bounds = button.getBoundingClientRect()
        return bounds.width > 0 && bounds.height > 0 && (bounds.width < 47 || bounds.height < 47)
      }).map(button => button.getAttribute('aria-label') || button.textContent))
      expect(undersized).toEqual([])
      for (const frame of await page.locator('.ten-frame').all()) {
        const grid = await frame.evaluate(element => ({ columns: getComputedStyle(element).gridTemplateColumns.split(' ').length, rows: getComputedStyle(element).gridTemplateRows.split(' ').length }))
        expect(grid).toEqual({ columns: 5, rows: 2 })
      }
      if (['兔仔野餐', '跨十小橋', '湊十花園'].includes(title)) {
        await page.screenshot({ path: testInfo.outputPath(`${title}-${width}.png`), fullPage: true })
      }
    }
    expect(errors).toEqual([])
  })
}

test('picnic prevents repeat movement, pauses in place, records and clears locally', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: '放第 1 粒士多啤梨' }).click()
  await expect(page.getByLabel('兔仔個碟').getByRole('img')).toHaveCount(1)
  await page.getByRole('button', { name: '休息一陣' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: '繼續玩' }).click()
  await expect(page.getByLabel('兔仔個碟').getByRole('img')).toHaveCount(1)
  await page.getByRole('button', { name: '放第 2 粒士多啤梨' }).click()
  await page.getByRole('button', { name: '放第 3 粒士多啤梨' }).click()
  await page.getByRole('button', { name: '擺好喇' }).click()
  await expect(page.getByRole('button', { name: '擺好喇' })).toBeDisabled()
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('rabbit-number-garden:v1')!).observations.length)).toBe(1)
  await page.getByRole('button', { name: '家長小天地' }).click()
  await page.getByRole('button', { name: '清除本機資料' }).click()
  await page.getByRole('button', { name: '確認清除紀錄及設定' }).click()
  expect(await page.evaluate(() => localStorage.getItem('rabbit-number-garden:v1'))).toBeNull()
})

test('independent bridge hides next number and records prompts separately', async ({ page }) => {
  await page.goto('/')
  await choose(page, '跨十小橋')
  await page.getByRole('button', { name: '家長小天地' }).click()
  await page.getByRole('button', { name: '自己試', exact: true }).click()
  await page.getByRole('button', { name: '關閉', exact: true }).click()
  for (const expected of ['28', '29', '30']) {
    await page.getByRole('button', { name: '加一粒', exact: true }).click()
    await expect(page.getByTestId('quantity-value')).toHaveText('?')
    await expect(page.getByRole('button', { name: '加一粒', exact: true })).toBeDisabled()
    await page.getByRole('button', { name: '擺好喇' }).click()
    await expect(page.getByTestId('quantity-value')).toHaveText(expected)
  }
  await page.getByRole('button', { name: '十粒打包' }).click()
  await expect(page.getByTestId('quantity-value')).toHaveText('30')
  await expect(page.getByRole('button', { name: /包，十粒/ })).toHaveCount(3)
  await page.getByRole('button', { name: '一齊諗吓' }).click()
  await expect(page.locator('.session-label')).toHaveText('一齊試')
  await page.getByRole('button', { name: '加一粒', exact: true }).click()
  await page.getByRole('button', { name: '加一粒', exact: true }).click()
  await page.getByRole('button', { name: '擺好喇' }).click()
  const observation = await page.evaluate(() => JSON.parse(localStorage.getItem('rabbit-number-garden:v1')!).observations[0])
  expect(observation).toMatchObject({ taskId: '29-30', support: 'assisted', hints: 1, kind: 'quantity' })
})

test('reverse bridge is a separate parent-selected activity', async ({ page }) => {
  await page.goto('/')
  await choose(page, '跨十小橋')
  await page.getByRole('button', { name: '家長小天地' }).click()
  await page.getByLabel('跨十路線').selectOption('5')
  await page.getByRole('button', { name: '關閉', exact: true }).click()
  await expect(page.getByTestId('quantity-value')).toHaveText('31')
  await page.getByRole('button', { name: '拎走一粒', exact: true }).click()
  await expect(page.getByTestId('quantity-value')).toHaveText('30')
  await page.getByRole('button', { name: '拆開一包' }).click()
  await expect(page.getByTestId('quantity-value')).toHaveText('30')
  await page.getByRole('button', { name: '拎走一粒', exact: true }).click()
  await page.getByRole('button', { name: '擺好喇' }).click()
  await expect(page.getByTestId('quantity-value')).toHaveText('29')
})

test('dialog traps focus, closes on Escape and restores trigger focus', async ({ page }) => {
  await page.goto('/')
  const trigger = page.getByRole('button', { name: '家長小天地' })
  await trigger.click()
  for (let index = 0; index < 28; index++) {
    await page.keyboard.press('Tab')
    expect(await page.evaluate(() => document.activeElement?.closest('dialog') !== null)).toBe(true)
  }
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(trigger).toBeFocused()
})

test('blocked storage and insecure-context UUID still allow completing a game', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Blocked', 'SecurityError') } })
    Object.defineProperty(crypto, 'randomUUID', { value: undefined })
  })
  await page.goto('/')
  for (let index = 1; index <= 3; index++) await page.getByRole('button', { name: `放第 ${index} 粒士多啤梨` }).click()
  await page.getByRole('button', { name: '擺好喇' }).click()
  await page.getByRole('button', { name: '家長小天地' }).click()
  await expect(page.getByText(/目前無法儲存，仍可繼續玩/)).toBeVisible()
})

test('touch selection places into a ten-frame without dragging', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 768, height: 1024 }, hasTouch: true, isMobile: true })
  const page = await context.newPage()
  await page.goto('http://localhost:5173')
  await choose(page, '湊十花園')
  await page.getByRole('button', { name: '第二個十格，第 1 格，有一粒' }).tap()
  await page.getByRole('button', { name: '第一個十格，第 9 格，空格' }).tap()
  await expect(page.getByRole('button', { name: '第一個十格，第 9 格，有一粒' })).toBeVisible()
  await context.close()
})

test('an unsuccessful independent check is recorded as assisted after feedback', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: '家長小天地' }).click()
  await page.getByRole('button', { name: '自己試', exact: true }).click()
  await page.getByRole('button', { name: '關閉', exact: true }).click()
  await page.getByRole('button', { name: '擺好喇' }).click()
  await expect(page.locator('.session-label')).toHaveText('一齊試')
  for (let index = 1; index <= 3; index++) await page.getByRole('button', { name: `放第 ${index} 粒士多啤梨` }).click()
  await page.getByRole('button', { name: '擺好喇' }).click()
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('rabbit-number-garden:v1')!).observations[0])).toMatchObject({ hints: 1, support: 'assisted' })
})