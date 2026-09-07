/* Visual QA helper: screenshots the running dev server.
   Usage: node scripts/shot.mjs <name> [--mobile] [--dark] [--route today|week|...] [--full]
   Routes are reached by clicking nav elements identified by data or text. */
import { chromium } from 'playwright'

const args = process.argv.slice(2)
const name = args[0] ?? 'shot'
const mobile = args.includes('--mobile')
const dark = args.includes('--dark')
const full = args.includes('--full')
const routeIdx = args.indexOf('--route')
const route = routeIdx >= 0 ? args[routeIdx + 1] : null
const clickIdx = args.indexOf('--click')
const clicks = clickIdx >= 0 ? args[clickIdx + 1].split(';;') : []
const keyIdx = args.indexOf('--key')
const keys = keyIdx >= 0 ? args[keyIdx + 1].split(',') : []

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const page = await browser.newPage({
  viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
  colorScheme: dark ? 'dark' : 'light',
  deviceScaleFactor: 2,
})
await page.goto('http://localhost:5173/')
await page.waitForTimeout(1200)

if (route) {
  const routeLabels = {
    today: 'Today',
    week: 'This week',
    inbox: 'Inbox',
  }
  const label = routeLabels[route] ?? route
  await page.getByRole('button', { name: label, exact: false }).first().click()
  await page.waitForTimeout(700)
}

for (const sel of clicks) {
  if (sel.startsWith('text=')) {
    await page.getByText(sel.slice(5), { exact: false }).first().click()
  } else {
    await page.locator(sel).first().click()
  }
  await page.waitForTimeout(700)
}

for (const k of keys) {
  await page.keyboard.press(k)
  await page.waitForTimeout(500)
}

await page.screenshot({ path: `scripts/out/${name}.png`, fullPage: full })
await browser.close()
console.log(`saved scripts/out/${name}.png`)
