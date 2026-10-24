// Takes the README screenshots in docs/ from a production build.
// Places are real: the build talks to a local ew-apps-api, which checks every one on OpenStreetMap
// (Nominatim), and guides, climate and photos come from Wikivoyage, NASA POWER and Unsplash the same way.
// The AI replies are real Gemini answers to the server's own prompts, recorded once in
// scripts/screenshot-fixtures.json and replayed here, so the pictures are repeatable and spend no quota.
// 1. Run ew-apps-api locally with http://localhost:4180 in ALLOWED_ORIGINS.
// 2. `VITE_API_URL=http://localhost:8788 npm run build && npx serve dist -c ../serve.json -l 4180`
// 3. `node scripts/screenshots.mjs`
// ANGLE on D3D11 uses the real GPU even headless, so the WebGL globe and the map render.
import { readFile } from 'node:fs/promises'
import { chromium, devices } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://localhost:4180'
const AI = 'http://ai.test/v1'
const docs = (name) =>
  new URL(`../docs/${name}.png`, import.meta.url).pathname.replace(/^\/(\w:)/, '$1')
const fixtures = JSON.parse(
  await readFile(new URL('./screenshot-fixtures.json', import.meta.url), 'utf8'),
)

function answer(prompt) {
  if (prompt.includes('packing list')) return fixtures.pack.output
  if (prompt.includes('daily spend')) return fixtures.budget.output
  if (prompt.includes('neighbourhoods')) return fixtures.stay.output
  if (prompt.includes('It will rain')) return fixtures.rainy.output
  return fixtures.plan.output
}

async function mockAi(page) {
  await page.route(`${AI}/**`, async (route) => {
    const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' }
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers })
    const content = answer(route.request().postDataJSON().messages.at(-1).content)
    const pieces = content.match(/[\s\S]{1,24}/g) ?? []
    const body = pieces
      .map((c) => `data: ${JSON.stringify({ choices: [{ delta: { content: c } }] })}\n\n`)
      .join('')
    return route.fulfill({
      headers: { ...headers, 'content-type': 'text/event-stream' },
      body: `${body}data: [DONE]\n\n`,
    })
  })
}

const browser = await chromium.launch({
  args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'],
})

async function open(options = {}, settings = {}) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: 'dark',
    ...options,
  })
  await ctx.addInitScript(
    ([ai, s]) => {
      if (localStorage.getItem('natour-settings')) return
      localStorage.setItem(
        'natour-settings',
        JSON.stringify({
          state: { provider: 'own', ownKey: 'demo', ownBaseUrl: ai, ownModel: 'gemini', ...s },
          version: 0,
        }),
      )
    },
    [AI, settings],
  )
  const p = await ctx.newPage()
  await mockAi(p)
  return { ctx, p }
}

const settle = async (p, ms = 1500) => {
  await p.waitForLoadState('networkidle')
  await p.waitForTimeout(ms)
}

/** Plans the recorded Lisbon trip and waits until every place has been checked on OpenStreetMap. */
async function plan(p) {
  await p.goto(`${BASE}/app?describe=${encodeURIComponent(fixtures.plan.input.description)}`)
  await p.getByRole('combobox', { name: 'Days' }).selectOption('3')
  await p.getByRole('combobox', { name: 'Month' }).selectOption('5')
  await p.getByRole('button', { name: /Plan my trip/ }).click()
  await p.waitForURL(/\/app\/trip\//)
  await p.getByText(/Checking places in|Writing your plan/).waitFor({ timeout: 30_000 })
  await p.getByText(/Each place is checked/).waitFor({ state: 'detached', timeout: 180_000 })
  await settle(p, 2500)
  return p.url()
}

// Wheel, not scrollTo: Lenis owns the scroll position, and the landing's story follows Lenis.
async function wheelTo(p, target) {
  await p.mouse.move(700, 450)
  while ((await p.evaluate(() => window.scrollY)) < target) {
    await p.mouse.wheel(0, 240)
    await p.waitForTimeout(90)
  }
  await p.waitForTimeout(2500)
}

// The landing on map paper: the cover, the stamp window, the postcards being stamped, the landscape.
{
  const { ctx, p } = await open({ colorScheme: 'light' }, { theme: 'light' })
  await p.goto(`${BASE}/`)
  await settle(p, 3500)
  await p.screenshot({ path: docs('landing') })
  const at = (sel, k) =>
    p.evaluate(([s, f]) => document.querySelector(s).offsetTop + window.innerHeight * f, [sel, k])
  await wheelTo(p, await at('#how', 0.62))
  await p.screenshot({ path: docs('landing-stamp') })
  await wheelTo(p, await at('#plan', 0.75))
  await p.screenshot({ path: docs('story') })
  await wheelTo(p, await at('#go', 0.95))
  await p.screenshot({ path: docs('landing-go') })
  await ctx.close()
}

// Developer and 404: desktop, dark.
{
  const { ctx, p } = await open()
  await p.goto(`${BASE}/developer`)
  await settle(p, 2500)
  await p.screenshot({ path: docs('developer') })
  await p.goto(`${BASE}/nowhere`)
  await settle(p)
  await p.screenshot({ path: docs('not-found') })
  await ctx.close()
}

// One trip through every tab, in the paper (light) theme the app opens in by default.
{
  const { ctx, p } = await open({ colorScheme: 'light' }, { theme: 'light' })
  const trip = await plan(p)
  await p.screenshot({ path: docs('planner') })
  await p.getByRole('button', { name: 'List', exact: true }).click()
  await settle(p, 500)
  await p.screenshot({ path: docs('list') })
  await p.getByRole('button', { name: 'Days', exact: true }).click()
  await p
    .getByRole('listitem', { name: 'Day 02' })
    .getByRole('button', { name: 'Rainy day' })
    .click()
  // Done when the day shows its Sunny / Rainy switch.
  await p.getByRole('button', { name: 'Rainy plan' }).waitFor({ timeout: 120_000 })
  await p.evaluate(() => window.scrollTo(0, 0))
  await settle(p, 2000)
  await p.screenshot({ path: docs('rainy') })

  await p.goto(`${trip}/stay`)
  await p.getByRole('button', { name: 'Compare 3 neighbourhoods' }).click()
  await p.getByText(/Each place is checked/).waitFor({ state: 'detached', timeout: 120_000 })
  await settle(p, 2500)
  await p.screenshot({ path: docs('stay') })

  await p.goto(`${trip}/pack`)
  await p.getByRole('button', { name: 'Write my packing list' }).click()
  await p.getByRole('checkbox').first().waitFor({ timeout: 60_000 })
  for (const name of [/Passport/, /Walking shoes/, /Sunscreen/, /T-shirts/])
    await p.getByRole('checkbox', { name }).click()
  await settle(p, 800)
  await p.screenshot({ path: docs('pack') })

  await p.goto(`${trip}/budget`)
  await p.getByRole('combobox', { name: 'Currency' }).selectOption('EUR')
  await p.getByRole('spinbutton', { name: 'Travellers' }).fill('2')
  await p.getByRole('button', { name: 'Rough estimate' }).click()
  await p
    .getByText(/Each place is checked|Estimating/)
    .waitFor({ state: 'detached', timeout: 60_000 })
  await settle(p, 800)
  await p.screenshot({ path: docs('budget') })

  await p.goto(`${BASE}/app/journal`)
  await p
    .getByRole('textbox', { name: 'Notes' })
    .first()
    .fill(
      'Took the 28 tram up to the castle before the crowds. Custard tarts still warm at the bottom of the hill; the view from Santa Luzia at five was worth the climb.',
    )
  await p.getByRole('textbox', { name: 'Notes' }).first().blur()
  await p.getByRole('button', { name: 'Mark as visited' }).first().click()
  await settle(p, 1200)
  await p.screenshot({ path: docs('journal') })

  await p.goto(`${BASE}/app`)
  await settle(p, 1200)
  await p.screenshot({ path: docs('trips') })
  await ctx.close()
}

// The planner at night, explore and a destination guide.
{
  const { ctx, p } = await open()
  await plan(p)
  await p.screenshot({ path: docs('planner-dark') })
  await p.goto(`${BASE}/app/explore`)
  await settle(p, 1500)
  await p.screenshot({ path: docs('explore') })
  await p.goto(`${BASE}/app/explore/lisbon`)
  await p.getByText('The short guide').waitFor()
  await settle(p, 3000)
  await p.screenshot({ path: docs('destination') })
  await ctx.close()
}

// Phone.
{
  const { ctx, p } = await open({ ...devices['Pixel 7'] }, { theme: 'light' })
  await p.goto(`${BASE}/`)
  await settle(p, 2500)
  await p.screenshot({ path: docs('mobile-landing') })
  await plan(p)
  await p.screenshot({ path: docs('mobile-planner') })
  await ctx.close()
}

await browser.close()
