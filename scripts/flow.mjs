import { chromium } from 'playwright'
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })

// 1. Capture via keyboard
await page.goto('http://localhost:8081/week', { waitUntil: 'networkidle' })
await page.waitForTimeout(1200)
await page.keyboard.press('c')
await page.waitForTimeout(600)
await page.keyboard.type('Book physio for my knee')
await page.waitForTimeout(600)
await page.screenshot({ path: 'scripts/out/flow-capture.png' })
await page.keyboard.press('Enter')
await page.waitForTimeout(1400)

// 2. Accept the living-room suggestion on the week
await page.getByText('Place it', { exact: false }).first().click()
await page.waitForTimeout(800)
await page.screenshot({ path: 'scripts/out/flow-week-accepted.png' })

// 3. Goal assist
await page.goto('http://localhost:8081/goal-new', { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)
await page.getByPlaceholder('What do you want to change?').fill('lose weight')
await page.waitForTimeout(700)
await page.screenshot({ path: 'scripts/out/flow-assist.png' })

// 4. Inbox count check (should be 6 after capture)
await page.goto('http://localhost:8081/inbox', { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)
const txt = await page.textContent('body')
console.log('inbox mentions 6:', txt.includes('6 captured'))
await browser.close()
