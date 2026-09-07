import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright'

const frag = readFileSync('scripts/out/north-single.html', 'utf8')
const doc = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0}</style></head><body>${frag}</body></html>`
const server = createServer((req, res) => {
  res.setHeader('content-type', 'text/html')
  res.end(doc)
})
await new Promise((r) => server.listen(4790, r))

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
await page.goto('http://localhost:4790/some/artifact/path', { waitUntil: 'networkidle' })
await page.waitForTimeout(2500)
await page.screenshot({ path: 'scripts/out/single-boot.png' })
// navigate via sidebar
try {
  await page.getByText('Today', { exact: true }).first().click()
  await page.waitForTimeout(900)
  await page.screenshot({ path: 'scripts/out/single-today.png' })
} catch (e) {
  errors.push('nav failed: ' + e)
}
console.log('page errors:', errors.length ? errors.slice(0, 3) : 'none')
await browser.close()
server.close()
