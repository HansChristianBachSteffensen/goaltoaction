/* Visual QA: screenshots the Expo web dev server.
   Usage: node scripts/shot.mjs <name> [--mobile] [--dark] [--path /week] [--click "text=Foo;;text=Bar"] */
import { chromium } from 'playwright'

const args = process.argv.slice(2)
const name = args[0] ?? 'shot'
const mobile = args.includes('--mobile')
const dark = args.includes('--dark')
const pathIdx = args.indexOf('--path')
const path = pathIdx >= 0 ? args[pathIdx + 1] : '/'
const clickIdx = args.indexOf('--click')
const clicks = clickIdx >= 0 ? args[clickIdx + 1].split(';;') : []

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const page = await browser.newPage({
  viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
  colorScheme: dark ? 'dark' : 'light',
  deviceScaleFactor: 2,
})
await page.goto(`http://localhost:8081${path}`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)

for (const sel of clicks) {
  if (sel.startsWith('text=')) {
    await page.getByText(sel.slice(5), { exact: false }).first().click()
  } else {
    await page.locator(sel).first().click()
  }
  await page.waitForTimeout(800)
}

await page.screenshot({ path: `scripts/out/${name}.png` })
await browser.close()
console.log(`saved scripts/out/${name}.png`)
