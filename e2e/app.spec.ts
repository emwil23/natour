import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

// The app is built with VITE_API_URL=http://api.test (playwright.config.ts). Every place lookup, guide,
// climate, photo, map tile and AI request is answered here, so the tests need no keys and no network.

const LISBON_BOX = [38.69, 38.8, -9.23, -9.09]
const place = (name: string, lat: number, lon: number, type = 'attraction') => ({
  name,
  address: `${name}, Lisboa, Portugal`,
  lat,
  lon,
  category: 'tourism',
  type,
  osm: `node/${String(Math.round(lat * 1e4))}`,
  bbox: [lat - 0.001, lat + 0.001, lon - 0.001, lon + 0.001],
})

// What "OpenStreetMap" knows. Anything else the AI suggests doesn't exist.
const OSM: Partial<Record<string, ReturnType<typeof place>>> = {
  'lisbon, portugal': { ...place('Lisbon', 38.7077, -9.1366, 'administrative'), bbox: LISBON_BOX },
  'castelo de são jorge': place('Castelo de São Jorge', 38.7139, -9.1335),
  'miradouro da senhora do monte': place(
    'Miradouro da Senhora do Monte',
    38.719,
    -9.1329,
    'viewpoint',
  ),
  'time out market': place('Time Out Market Lisboa', 38.7071, -9.1459, 'food_court'),
  'praça do comércio': place('Praça do Comércio', 38.7075, -9.1364),
  'museu nacional do azulejo': place('Museu Nacional do Azulejo', 38.7247, -9.1136, 'museum'),
  alfama: place('Alfama', 38.7116, -9.1301, 'suburb'),
  'bairro alto': place('Bairro Alto', 38.7125, -9.1446, 'suburb'),
  'príncipe real': place('Príncipe Real', 38.7166, -9.1497, 'suburb'),
}

const PLAN = [
  {
    destination: 'Lisbon',
    country: 'Portugal',
    title: 'Lisbon, slowly',
    summary: 'Hills and food.',
  },
  { day: 1, name: 'Castelo de São Jorge', kind: 'sight', minutes: 90, why: 'Views over the river' },
  { day: 1, name: 'Golden Sunset Rooftop Alfama', kind: 'view', minutes: 60, why: 'Made up' },
  {
    day: 1,
    name: 'Miradouro da Senhora do Monte',
    kind: 'view',
    minutes: 30,
    why: 'The best view',
  },
  { day: 1, name: 'Praça do Comércio', kind: 'sight', minutes: 45, why: 'The grand square' },
  { day: 2, name: 'Time Out Market', kind: 'food', minutes: 75, why: 'Lunch with choice' },
  { day: 2, name: 'Museu Nacional do Azulejo', kind: 'museum', minutes: 120, why: 'Tiles' },
]
const PACK = [
  { group: 'clothes', item: 'Light rain jacket', qty: 1, why: 'Spring showers' },
  { group: 'clothes', item: 'Comfortable walking shoes', qty: 1, why: 'Steep cobbles' },
  { group: 'documents', item: 'Passport', qty: 1, why: '' },
  { group: 'health', item: 'Sunscreen', qty: 1, why: 'Highs of 25°' },
  { group: 'gear', item: 'Day bag', qty: 1, why: '' },
]
const BUDGET = [
  { category: 'stay', perDay: 70, note: 'A mid-range guesthouse room' },
  { category: 'food', perDay: 40, note: 'Cafés and one sit-down meal' },
  { category: 'transport', perDay: 8, note: 'Trams and metro' },
  { category: 'activities', perDay: 15, note: 'One museum a day' },
  { category: 'extras', perDay: 7, note: 'Coffee and treats' },
]
const STAY = ['Alfama', 'Bairro Alto', 'Príncipe Real'].map((name) => ({
  name,
  vibe: `${name} in a line`,
  pros: ['Central', 'Characterful', 'Walkable'],
  cons: ['Hilly', 'Busy at night'],
  goodFor: 'First visits',
}))

const json = (body: unknown) => ({ json: body, headers: { 'access-control-allow-origin': '*' } })

async function mockServices(page: Page) {
  await page.route('http://api.test/api/places/search*', (route) => {
    const q = (new URL(route.request().url()).searchParams.get('q') ?? '').toLowerCase()
    const hit = OSM[q] ?? Object.entries(OSM).find(([k]) => q.includes(k))?.[1]
    return route.fulfill(json({ result: hit ? [hit] : [] }))
  })
  await page.route('http://api.test/api/places/guide*', (route) =>
    route.fulfill(
      json({
        result: {
          title: 'Lisbon',
          extract: 'Lisbon is the capital of Portugal.',
          url: 'https://en.wikivoyage.org/wiki/Lisbon',
        },
      }),
    ),
  )
  await page.route('http://api.test/api/places/climate*', (route) =>
    route.fulfill(
      json({
        result: [16, 17, 19, 21, 25, 26, 27, 27, 26, 24, 20, 17].map((high, i) => ({
          high,
          low: high - 9,
          rainMm: [2, 1.8, 1.9, 1.8, 1, 0.4, 0.1, 0.2, 0.8, 2.6, 3, 2][i],
        })),
      }),
    ),
  )
  await page.route('http://api.test/api/photos/**', (route) =>
    route.fulfill(json({ photos: [], hasMore: false })),
  )
  // A blank map style, so MapLibre runs without fetching OpenFreeMap's tiles.
  await page.route('https://tiles.openfreemap.org/**', (route) =>
    route.fulfill(
      json({
        version: 8,
        sources: {},
        layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#ebe4d6' } }],
      }),
    ),
  )
}

/** "Your own key" pointed at a fake OpenAI-compatible endpoint; it answers by which action's prompt it got. */
async function mockAi(page: Page) {
  await page.addInitScript(() => {
    if (localStorage.getItem('natour-settings')) return
    localStorage.setItem(
      'natour-settings',
      JSON.stringify({
        state: { provider: 'own', ownKey: 'test', ownBaseUrl: 'https://ai.test/v1', ownModel: 'm' },
        version: 0,
      }),
    )
  })
  await page.route('https://ai.test/v1/chat/completions', (route) => {
    const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' }
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers })
    const body = JSON.parse(route.request().postData() ?? '{}') as {
      messages: { content: string }[]
    }
    const prompt = body.messages.at(-1)?.content ?? ''
    const out = prompt.startsWith('Plan the trip')
      ? PLAN
      : prompt.includes('packing list')
        ? PACK
        : prompt.includes('daily spend')
          ? BUDGET
          : prompt.includes('neighbourhoods')
            ? STAY
            : []
    const sse = out
      .map(
        (l) =>
          `data: ${JSON.stringify({ choices: [{ delta: { content: `${JSON.stringify(l)}\n` } }] })}\n\n`,
      )
      .join('')
    return route.fulfill({
      body: `${sse}data: [DONE]\n\n`,
      contentType: 'text/event-stream',
      headers,
    })
  })
}

test.beforeEach(async ({ page }) => {
  await mockServices(page)
  await mockAi(page)
})

/** Describes a 2-day Lisbon trip and waits until every place has been checked. */
async function planLisbon(page: Page) {
  await page.goto('/app')
  await page
    .getByRole('textbox', { name: 'Describe your trip' })
    .fill('2 days in Lisbon in May: food and viewpoints')
  await page.getByRole('combobox', { name: 'Days' }).selectOption('2')
  await page.getByRole('button', { name: /Plan my trip/ }).click()
  await expect(page).toHaveURL(/\/app\/trip\//)
  await expect(page.getByRole('heading', { level: 1, name: 'Lisbon, slowly' })).toBeVisible()
  await expect(page.getByText(/1 suggestion didn't exist on OpenStreetMap/)).toBeVisible()
}

test('landing: the cover postcard hands the description to the planner @mobile', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Natour')
  await expect(page.getByText('Made with')).toContainText('EWSTUDIOS')
  // The cover's postcard is the first of two on the page.
  await page.getByRole('textbox', { name: 'Describe your trip' }).first().fill('3 days in Porto')
  await page.getByRole('button', { name: 'Plan it' }).first().click()
  await expect(page).toHaveURL(/\/app\?describe=3/)
  await expect(page.getByRole('textbox', { name: 'Describe your trip' })).toHaveValue(
    '3 days in Porto',
  )
})

test('landing: the trip in four chapters, readable without motion @mobile', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const chapters = page.getByRole('heading', { level: 2 })
  await expect(chapters.filter({ hasText: 'Every trip starts as a daydream.' })).toBeVisible()
  await expect(chapters.filter({ hasText: 'Postcards from places that exist.' })).toBeVisible()
  await expect(chapters.filter({ hasText: 'Walk it, one stop at a time.' })).toBeVisible()
  await expect(chapters.filter({ hasText: 'Keep the days you walked.' })).toBeVisible()
  // Five real places are stamped with their coordinates; the made-up one is dropped.
  const places = page.getByRole('list', { name: 'Suggested places' }).getByRole('listitem')
  await expect(places).toHaveCount(6)
  await expect(places.getByText(/Checked on OpenStreetMap at/)).toHaveCount(5)
  await expect(places.filter({ hasText: 'Golden Sunset Rooftop' })).toContainText(
    "Doesn't exist · dropped",
  )
  await expect(page.getByText('Day 1 marked as visited')).toBeAttached()
  // The issue's contents jump to their chapters.
  await page.getByRole('navigation', { name: 'In this issue' }).getByRole('link').nth(2).click()
  await expect(page).toHaveURL(/#go$/)
  await expect(page.getByRole('contentinfo')).toContainText('OpenStreetMap')
})

test('describe → plan: only real places reach the plan, with their stamps', async ({ page }) => {
  await planLisbon(page)
  const day1 = page.getByRole('list', { name: 'Day 1 stops' })
  const day2 = page.getByRole('list', { name: 'Day 2 stops' })
  await expect(day1.getByRole('article')).toHaveCount(3)
  await expect(day2.getByRole('article')).toHaveCount(2)
  await expect(page.getByText('Golden Sunset Rooftop')).toHaveCount(0)
  // OSM's spelling replaces the AI's, and each stop carries its coordinates for screen readers.
  await expect(day2).toContainText('Time Out Market Lisboa')
  await expect(day1).toContainText('Checked on OpenStreetMap at 38.71°N 9.13°W')
  // Walking times between stops are estimates.
  await expect(day1).toContainText(/~\d+ min walk/)
})

test('reorder: move a stop to another day, lock one, read it back in the list view', async ({
  page,
}) => {
  await planLisbon(page)
  await page
    .getByRole('combobox', { name: 'Move Praça do Comércio to' })
    .selectOption({ label: 'Move to day 2' })
  const day2 = page.getByRole('list', { name: 'Day 2 stops' })
  await expect(day2.getByRole('article')).toHaveCount(3)
  await expect(day2.getByRole('article').last()).toContainText('Praça do Comércio')

  const lock = page
    .getByRole('article')
    .filter({ hasText: 'Castelo de São Jorge' })
    .getByRole('button', { name: 'Lock' })
  await lock.click()
  await expect(lock).toHaveAttribute('aria-pressed', 'true')

  // Drag by keyboard: pick up the first stop of day 2, move it down one, drop it.
  await day2.getByRole('button', { name: 'Drag Time Out Market Lisboa' }).focus()
  await page.keyboard.press('Space')
  await page.waitForTimeout(250)
  await page.keyboard.press('ArrowDown')
  await page.waitForTimeout(250)
  await page.keyboard.press('Space')
  await expect(day2.getByRole('article').first()).toContainText('Museu Nacional do Azulejo')

  await page.getByRole('button', { name: 'List' }).click()
  await expect(page.getByRole('heading', { name: 'Day 2' })).toBeVisible()
  await expect(page.getByText(/Then walk ~/).first()).toBeVisible()
  // Survives a reload: it's all in IndexedDB.
  await page.reload()
  await expect(page.getByRole('list', { name: 'Day 2 stops' }).getByRole('article')).toHaveCount(3)
})

test('packing list from the climate, then budget and stays for the same trip', async ({ page }) => {
  await planLisbon(page)
  await page.getByRole('navigation', { name: 'Trip' }).getByRole('link', { name: 'Pack' }).click()
  await expect(page.getByText(/on average/i)).toBeVisible()
  await page.getByRole('button', { name: 'Write my packing list' }).click()
  await expect(page.getByRole('checkbox')).toHaveCount(5)
  // Ticks are saved to IndexedDB, then shown, so wait for the state rather than check() at once.
  await page.getByRole('checkbox', { name: /Light rain jacket/ }).click()
  await expect(page.getByRole('checkbox', { name: /Light rain jacket/ })).toBeChecked()
  await expect(page.getByRole('progressbar', { name: 'Packed' })).toHaveAttribute(
    'aria-valuenow',
    '1',
  )

  await page.getByRole('navigation', { name: 'Trip' }).getByRole('link', { name: 'Budget' }).click()
  await page.getByRole('combobox', { name: 'Currency' }).selectOption('EUR')
  await page.getByRole('button', { name: 'Rough estimate' }).click()
  await expect(page.getByRole('spinbutton', { name: /Stay/ })).toHaveValue('70')
  // 140 a day × 2 days, one traveller; then two travellers double it.
  await expect(page.getByText('€280', { exact: true })).toBeVisible()
  await page.getByRole('spinbutton', { name: 'Travellers' }).fill('2')
  await expect(page.getByText('€560', { exact: true })).toBeVisible()

  await page.getByRole('navigation', { name: 'Trip' }).getByRole('link', { name: 'Stay' }).click()
  await page.getByRole('button', { name: 'Compare 3 neighbourhoods' }).click()
  await expect(page.getByRole('heading', { level: 2, name: 'Príncipe Real' })).toBeVisible()
  await expect(
    page.getByRole('link', { name: /Search stays in Alfama on Booking.com/ }),
  ).toHaveAttribute('href', /booking\.com\/searchresults\.html\?ss=Alfama/)
  await expect(page.getByText(/Average ~/).first()).toBeVisible()
})

test('journal: notes and a visited stamp stay on the device', async ({ page }) => {
  await planLisbon(page)
  await page
    .getByRole('navigation', { name: 'Trip' })
    .getByRole('link', { name: 'Journal' })
    .click()
  await expect(page.getByText(/never uploaded/)).toBeVisible()
  const notes = page.getByRole('textbox', { name: 'Notes' }).first()
  await notes.fill('Custard tarts at the castle gate.')
  await notes.blur()
  await page.getByRole('button', { name: 'Mark as visited' }).first().click()
  await page.reload()
  await expect(page.getByRole('textbox', { name: 'Notes' }).first()).toHaveValue(
    'Custard tarts at the castle gate.',
  )
  await expect(page.getByRole('button', { name: 'Visited' }).first()).toHaveAttribute(
    'aria-pressed',
    'true',
  )
})

test('explore → a destination guide with credit and best months', async ({ page }) => {
  await page.goto('/app/explore')
  await page.getByRole('link', { name: 'Lisbon' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Lisbon' })).toBeVisible()
  await expect(page.getByRole('link', { name: /on Wikivoyage/ })).toHaveAttribute(
    'href',
    'https://en.wikivoyage.org/wiki/Lisbon',
  )
  await expect(page.getByRole('heading', { name: 'Best months to walk about' })).toBeVisible()
  await page.getByRole('link', { name: /Plan a trip here/ }).click()
  await expect(page.getByRole('textbox', { name: 'Describe your trip' })).toHaveValue(/Lisbon/)
})

test('without an AI provider the planner says how to set one up', async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem('natour-settings', JSON.stringify({ state: {}, version: 0 })),
  )
  await page.goto('/app')
  await page.getByRole('textbox', { name: 'Describe your trip' }).fill('A weekend in Lisbon')
  await page.getByRole('button', { name: /Plan my trip/ }).click()
  await expect(page.getByRole('link', { name: 'Open AI settings' })).toBeVisible()
})

test('unknown pages get the designed 404', async ({ page }) => {
  await page.goto('/nowhere')
  await expect(page.getByRole('heading', { name: "This road isn't on the map." })).toBeVisible()
})

async function axe(page: Page) {
  await page.waitForLoadState('networkidle')
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    // MapLibre's canvas and its own controls are a third-party widget; the list view is the accessible map.
    .exclude('.maplibregl-map')
    .analyze()
  return results.violations.map(
    (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`,
  )
}

const setTheme = (page: Page, theme: 'dark' | 'light') =>
  page.addInitScript((t) => {
    const s = JSON.parse(localStorage.getItem('natour-settings') ?? '{"state":{},"version":0}') as {
      state: Record<string, unknown>
    }
    s.state.theme = t
    localStorage.setItem('natour-settings', JSON.stringify(s))
  }, theme)

const PAGES = [
  '/',
  '/developer',
  '/pro',
  '/privacy',
  '/terms',
  '/app',
  '/app/explore',
  '/app/explore/lisbon',
  '/app/journal',
  '/settings',
  '/nowhere',
]

for (const theme of ['dark', 'light'] as const) {
  for (const path of PAGES) {
    test(`axe: ${path} (${theme}) has no violations`, async ({ page }) => {
      await setTheme(page, theme)
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.goto(path)
      expect(await axe(page)).toEqual([])
    })
  }

  test(`axe: trip pages (${theme}) have no violations`, async ({ page }) => {
    await setTheme(page, theme)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await planLisbon(page)
    const base = page.url()
    for (const path of ['', '/stay', '/pack', '/budget']) {
      await page.goto(base + path)
      expect(await axe(page), path || 'planner').toEqual([])
    }
  })
}
