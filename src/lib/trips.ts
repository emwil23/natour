import type { ActionOutputs, StopLine } from '@/ai/actions'
import { aiLines } from '@/ai/run'
import { PlacesUnavailable, getClimate, searchPlaces } from './api'
import { matchPlace, toOsmPlace, type ApiPlace } from './check'
import {
  BUDGET_CATEGORIES,
  KINDS,
  activeStops,
  db,
  newTrip,
  uid,
  updateTrip,
  type Budget,
  type Destination,
  type Effort,
  type Job,
  type Neighbourhood,
  type OsmPlace,
  type PackItem,
  type Stop,
  type Trip,
} from './db'
import { viewbox } from './geo'

// AI work runs here, outside React, and writes into IndexedDB as it goes; pages just watch the trip. So a
// plan keeps filling in if you switch pages, and two tabs show the same progress.

/** Stops per day for each effort; the AI is asked for one spare per day in case a place doesn't exist. */
export const STOPS_PER_DAY: Record<Effort, number> = { easy: 4, medium: 5, hard: 7 }

const running = new Map<string, AbortController>()

/** Jobs left over from a closed tab can't finish; clear them once per app load. */
export async function clearStaleJobs() {
  await db.trips
    .filter((t) => t.job !== null && !running.has(t.id))
    .modify((t) => {
      t.job = null
      t.error = 'This was interrupted when the page closed. Try again.'
    })
}

export const isRunning = (tripId: string) => running.has(tripId)

/** Runs one job on a trip: marks it busy, records any error, and always clears the job at the end. */
async function job(tripId: string, j: Job, work: (signal: AbortSignal) => Promise<void>) {
  if (running.has(tripId)) return
  const controller = new AbortController()
  running.set(tripId, controller)
  await updateTrip(tripId, () => ({ job: j, error: null }))
  try {
    await work(controller.signal)
    await updateTrip(tripId, () => ({ job: null }))
  } catch (e) {
    const message = controller.signal.aborted
      ? null
      : e instanceof Error
        ? e.message
        : 'Something went wrong.'
    await updateTrip(tripId, () => ({ job: null, error: message }))
  } finally {
    running.delete(tripId)
  }
}

export async function deleteTrip(id: string) {
  running.get(id)?.abort()
  await db.transaction('rw', db.trips, db.journal, async () => {
    await db.trips.delete(id)
    await db.journal.where('tripId').equals(id).delete()
  })
}

/** A model's field as text: strings trimmed and capped, numbers written out, anything else empty. */
const str = (v: unknown, max: number) =>
  typeof v === 'string' ? v.trim().slice(0, max) : typeof v === 'number' ? String(v) : ''
const num = (v: unknown) =>
  typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : Number.NaN
const strings = (v: unknown, n: number, max: number) =>
  (Array.isArray(v) ? v : [])
    .slice(0, n)
    .map((x) => str(x, max))
    .filter(Boolean)

const isKind = (k: unknown): k is Stop['kind'] => KINDS.includes(k as Stop['kind'])
const clampMinutes = (m: unknown) =>
  typeof m === 'number' && Number.isFinite(m) ? Math.min(360, Math.max(15, Math.round(m))) : 60

/**
 * Looks a name up on OpenStreetMap inside the destination's box. Without a box (the destination itself
 * wasn't found), it searches "name, city" instead. 'missing' when it isn't there; null when it can't check.
 */
export async function lookUp(
  name: string,
  dest: Destination | string | null,
  signal: AbortSignal,
): Promise<OsmPlace | null | 'missing'> {
  try {
    const results =
      typeof dest === 'object' && dest
        ? await searchPlaces(name, { near: viewbox(dest.bbox), limit: 3 }, signal)
        : await searchPlaces(dest ? `${name}, ${dest}` : name, { limit: 3 }, signal)
    const hit = matchPlace(name, results)
    return hit ? toOsmPlace(hit) : 'missing'
  } catch (e) {
    if (e instanceof PlacesUnavailable) return null
    throw e
  }
}

/** Turns an AI stop line into a checked stop, or null if the place doesn't exist. */
async function checkStop(
  line: StopLine,
  dest: Destination | string | null,
  signal: AbortSignal,
): Promise<Stop | null> {
  const name = str(line.name, 120)
  if (!name) return null
  const place = await lookUp(name, dest, signal)
  if (place === 'missing') return null
  return {
    id: uid(),
    // OSM's spelling, once checked: "Time Out Market" becomes "Time Out Market Lisboa".
    name: place ? place.address.split(',')[0]?.trim() || name : name,
    kind: isKind(line.kind) ? line.kind : 'sight',
    minutes: clampMinutes(line.minutes),
    why: str(line.why, 140),
    locked: false,
    place,
  }
}

const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase()

/** Finds the destination itself: its centre and bounding box keep every later search inside it. */
async function findDestination(name: string, country: string, signal: AbortSignal) {
  try {
    const [hit] = await searchPlaces(`${name}, ${country}`, { limit: 1 }, signal)
    if (!hit) return null
    const d: Destination = { name, country, lat: hit.lat, lon: hit.lon, bbox: hit.bbox }
    return d
  } catch (e) {
    if (e instanceof PlacesUnavailable) return null
    throw e
  }
}

/**
 * Describe → plan. Creates the trip at once and returns its id; the plan streams in behind it, each stop
 * appearing only once OpenStreetMap confirms it exists.
 */
export async function startPlan(p: {
  description: string
  days: number
  effort: Effort
  month: number
}) {
  const trip = newTrip(p)
  await db.trips.add(trip)
  void job(trip.id, { kind: 'plan', label: 'Writing your plan' }, async (signal) => {
    const cap = STOPS_PER_DAY[p.effort]
    let dest: Destination | null = null
    let destName = ''
    // Checks run one after another (Nominatim allows one a second), while the AI keeps streaming.
    let chain = Promise.resolve()
    const handle = async (line: ActionOutputs['plan']) => {
      if (line.destination !== undefined) {
        destName = str(line.destination, 120)
        dest = await findDestination(destName, str(line.country, 80), signal)
        await updateTrip(trip.id, () => ({
          title: str(line.title, 60) || destName,
          summary: str(line.summary, 200),
          destination: dest ?? null,
          job: { kind: 'plan', label: `Checking places in ${destName}` },
        }))
        return
      }
      const day = Math.floor(num(line.day)) - 1
      const name = str(line.name, 120)
      const t = await db.trips.get(trip.id)
      const d = t?.days[day]
      if (!t || !d || d.stops.length >= cap) return
      if (!name || t.days.some((x) => x.stops.some((s) => sameName(s.name, name)))) return
      const stop = await checkStop(line, dest ?? destName, signal)
      await updateTrip(trip.id, (t) => {
        const target = t.days[day]
        if (!stop) t.dropped++
        else if (target && target.stops.length < cap) target.stops.push(stop)
      })
    }
    for await (const line of aiLines('plan', p, signal)) {
      chain = chain.then(() => handle(line))
    }
    await chain
  })
  return trip.id
}

/** Replans one day, keeping its locked stops. */
export function refineDay(trip: Trip, day: number, instruction: string) {
  return replaceDay(trip, day, 'refine', instruction)
}

/** Makes (or remakes) the rainy-day version of a day and switches to it. */
export function rainyDay(trip: Trip, day: number) {
  return replaceDay(trip, day, 'rainy', '')
}

async function replaceDay(trip: Trip, day: number, kind: 'refine' | 'rainy', instruction: string) {
  const d = trip.days[day]
  const dest = trip.destination
  if (!d || !dest) return
  const current = kind === 'rainy' ? d.stops : activeStops(d)
  const others = trip.days.flatMap((x, i) => (i === day ? [] : activeStops(x).map((s) => s.name)))
  const locked = current.filter((s) => s.locked)
  const cap = Math.max(STOPS_PER_DAY[trip.effort], locked.length)
  await job(
    trip.id,
    { kind, day, label: kind === 'rainy' ? 'Finding a rainy-day plan' : 'Replanning the day' },
    async (signal) => {
      const out: Stop[] = []
      let dropped = 0
      const lines =
        kind === 'rainy'
          ? aiLines(
              'rainy',
              {
                destination: dest.name,
                day: day + 1,
                stops: current.map((s) => s.name),
                avoid: others,
              },
              signal,
            )
          : aiLines(
              'refine',
              {
                destination: dest.name,
                day: day + 1,
                stops: current.map((s) => ({ name: s.name, locked: s.locked })),
                instruction,
                avoid: others,
              },
              signal,
            )
      for await (const line of lines) {
        const name = str(line.name, 120)
        if (out.length >= cap || !name) continue
        const keep = locked.find((s) => sameName(s.name, name))
        if (keep) {
          if (!out.includes(keep)) out.push(keep)
          continue
        }
        if (out.some((s) => sameName(s.name, name)) || others.some((n) => sameName(n, name)))
          continue
        // Leave room for locked stops the AI hasn't repeated yet.
        const unplacedLocked = locked.filter((s) => !out.includes(s)).length
        if (out.length + unplacedLocked >= cap) continue
        const stop = await checkStop(line, dest, signal)
        if (stop) out.push(stop)
        else dropped++
      }
      // A locked stop always stays, even if the AI forgot it.
      for (const s of locked) if (!out.includes(s)) out.push(s)
      if (!out.length) throw new Error("The AI didn't suggest any places that exist. Try again.")
      await updateTrip(trip.id, (t) => {
        const target = t.days[day]
        if (!target) return
        if (kind === 'rainy') {
          target.rainy = out
          target.useRainy = true
        } else if (target.useRainy && target.rainy) target.rainy = out
        else target.stops = out
        t.dropped += dropped
      })
    },
  )
}

/** Three neighbourhoods to stay in, each checked on OpenStreetMap so the app can measure distances. */
export async function compareStays(trip: Trip) {
  const dest = trip.destination
  if (!dest) return
  await job(trip.id, { kind: 'stay', label: 'Comparing neighbourhoods' }, async (signal) => {
    const stops = trip.days.flatMap((d) => activeStops(d).map((s) => s.name)).slice(0, 60)
    const found: Neighbourhood[] = []
    for await (const n of aiLines(
      'stay',
      { destination: dest.name, description: trip.description, stops },
      signal,
    )) {
      const name = str(n.name, 80)
      if (found.length >= 3 || !name) continue
      const place = await lookUp(name, dest, signal)
      if (place === 'missing') continue
      found.push({
        name,
        vibe: str(n.vibe, 120),
        pros: strings(n.pros, 3, 80),
        cons: strings(n.cons, 2, 80),
        goodFor: str(n.goodFor, 60),
        place,
      })
      await updateTrip(trip.id, () => ({ stay: [...found] }))
    }
    if (!found.length)
      throw new Error("The AI didn't suggest neighbourhoods that exist. Try again.")
  })
}

/** A packing list from the month's climate averages, the trip's activities and its length. */
export async function makePackingList(trip: Trip) {
  const dest = trip.destination
  if (!dest) return
  await job(trip.id, { kind: 'pack', label: 'Writing your packing list' }, async (signal) => {
    const climate = await getClimate(dest.lat, dest.lon, signal)
      .then((c) => c[trip.month - 1] ?? null)
      .catch(() => null)
    const activities = [...new Set(trip.days.flatMap((d) => activeStops(d).map((s) => s.kind)))]
    const items: PackItem[] = []
    for await (const it of aiLines(
      'pack',
      { destination: dest.name, days: trip.days.length, months: [trip.month], climate, activities },
      signal,
    )) {
      const group = (['clothes', 'gear', 'documents', 'health'] as const).find(
        (g) => g === it.group,
      )
      const item = str(it.item, 60)
      if (!group || !item || items.length >= 40) continue
      items.push({
        id: uid(),
        group,
        item,
        qty: Math.min(30, Math.max(1, Math.round(num(it.qty)) || 1)),
        why: str(it.why, 80),
        packed: false,
      })
    }
    if (!items.length) throw new Error('The AI returned no items. Try again.')
    await updateTrip(trip.id, () => ({ packing: items }))
  })
}

export const emptyBudget = (currency: string): Budget => ({
  currency,
  style: 'mid',
  travellers: 1,
  perDay: { stay: 0, food: 0, transport: 0, activities: 0, extras: 0 },
  notes: {},
})

/** Fills the budget's daily figures with the AI's rough estimate, keeping currency and travellers. */
export async function estimateBudget(trip: Trip, b: Budget) {
  const dest = trip.destination
  if (!dest) return
  await job(trip.id, { kind: 'budget', label: 'Estimating daily spend' }, async (signal) => {
    const perDay = { ...b.perDay }
    const notes: Budget['notes'] = {}
    let got = 0
    for await (const line of aiLines(
      'budget',
      {
        destination: dest.name,
        days: trip.days.length,
        style: b.style,
        currency: b.currency,
        travellers: b.travellers,
      },
      signal,
    )) {
      const c = BUDGET_CATEGORIES.find((x) => x === line.category)
      const n = Math.round(num(line.perDay))
      if (!c || !Number.isFinite(n) || n < 0) continue
      perDay[c] = n
      notes[c] = str(line.note, 100)
      got++
    }
    if (!got) throw new Error('The AI returned no figures. Try again.')
    await updateTrip(trip.id, () => ({ budget: { ...b, perDay, notes } }))
  })
}

/** Moves a stop within or between days (drag and drop, or the "Move to" menu). */
export function moveStop(tripId: string, from: number, stopId: string, to: number, index: number) {
  return updateTrip(tripId, (t) => {
    const src = t.days[from]
    const dst = t.days[to]
    if (!src || !dst) return
    const list = activeStops(src)
    const i = list.findIndex((s) => s.id === stopId)
    const [stop] = i >= 0 ? list.splice(i, 1) : []
    if (!stop) return
    const target = activeStops(dst)
    target.splice(Math.max(0, Math.min(index, target.length)), 0, stop)
  })
}

export function editStop(tripId: string, day: number, stopId: string, patch: Partial<Stop> | null) {
  return updateTrip(tripId, (t) => {
    const d = t.days[day]
    if (!d) return
    const list = activeStops(d)
    const i = list.findIndex((s) => s.id === stopId)
    const s = list[i]
    if (!s) return
    if (patch === null) list.splice(i, 1)
    else Object.assign(s, patch)
  })
}

/** Adds a place the user found themselves (search on submit, never autocomplete). */
export function addPlace(tripId: string, day: number, p: ApiPlace) {
  return updateTrip(tripId, (t) => {
    const d = t.days[day]
    if (!d) return
    activeStops(d).push({
      id: uid(),
      name: p.name,
      kind: p.type === 'viewpoint' ? 'view' : p.category === 'amenity' ? 'food' : 'sight',
      minutes: 60,
      why: '',
      locked: false,
      place: toOsmPlace(p),
    })
  })
}
