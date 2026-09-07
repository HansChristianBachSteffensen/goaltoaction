/* Packs the Expo static web export into one self-contained HTML fragment
   (title + styles + root + inline scripts) suitable for single-file hosting.
   Inlines the JS bundle and only the fonts the app actually loads. */
import { readFileSync, writeFileSync } from 'node:fs'

const dist = 'dist'
const html = readFileSync(`${dist}/index.html`, 'utf8')

const entryMatch = html.match(/src="(\/_expo\/static\/js\/web\/entry-[^"]+\.js)"/)
if (!entryMatch) throw new Error('entry bundle not found in index.html')
let bundle = readFileSync(`${dist}${entryMatch[1]}`, 'utf8')

/* Inline only the fonts the app loads at runtime. */
const usedFonts = [
  'Inter_400Regular.',
  'Inter_500Medium.',
  'Inter_600SemiBold.',
  'Inter_700Bold.',
  'Inter_800ExtraBold.',
  'Fraunces_400Regular_Italic.',
]
const fontRefs = [...bundle.matchAll(/"(\/assets\/[^"]+\.ttf)"/g)].map((m) => m[1])
let inlined = 0
for (const ref of new Set(fontRefs)) {
  const file = ref.split('/').pop()
  if (!usedFonts.some((f) => file.startsWith(f))) continue
  const data = readFileSync(`${dist}${ref}`)
  bundle = bundle.split(`"${ref}"`).join(`"data:font/ttf;base64,${data.toString('base64')}"`)
  inlined++
}

/* Keep inline <script> content from terminating the tag early. */
bundle = bundle.replaceAll('</script', '<\\/script')

/* Head styles from the export. */
const styles = [...html.matchAll(/<style[^>]*>[\s\S]*?<\/style>/g)].map((m) => m[0]).join('\n')

const out = `<title>North</title>
${styles}
<style>html, body { height: 100%; } #root { display: flex; height: 100%; }</style>
<div id="root"></div>
<script>
  // The router expects a clean path; single-file hosting serves from an arbitrary one.
  try { history.replaceState(null, '', '/') } catch (e) {}
</script>
<script>${bundle}</script>
`
writeFileSync('scripts/out/north-single.html', out)
console.log(`fonts inlined: ${inlined}, size: ${(out.length / 1024 / 1024).toFixed(1)} MB`)
