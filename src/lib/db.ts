import Dexie, { type EntityTable } from 'dexie'

export const KINDS = [
  'sight',
  'food',
  'view',
  'walk',
  'museum',
  'nature',
  'shop',
  'night',
  'beach',
] as const
export type Kind = (typeof KINDS)[number]
export type Effort = 'easy' | 'medium' | 'hard'

/** Where a place is on OpenStreetMap, as Nominatim found it. */
export interface OsmPlace {
  lat: number
  lon: number
  address: string
  /** "node/123". */
  osm: string
  category: string
  type: string
}

export interface Stop {
  id: string
  /** The name as OpenStreetMap has it (the AI's spelling is replaced once checked). */
  name: string
  kind: Kind
  /** Time to spend there. */
  minutes: number
  why: string
  locked: boolean
  /** null: our server couldn't check it (offline or busy); it shows "not checked" and has no pin. */
  place: OsmPlace | null
}

export interface Day {
  stops: Stop[]
  /** The rainy-day version, once asked for. */
  rainy: Stop[] | null
  useRainy: boolean
}

export interface Destination {
  name: string
  country: string
  lat: number
  lon: number
  /** [south, north, west, east]. */
  bbox: [number, number, number, number]
}

export interface Neighbourhood {
  name: string
  vibe: string
  pros: string[]
  cons: string[]
  goodFor: string
  place: OsmPlace | null
}

export interface PackItem {
  id: string
  group: 'clothes' | 'gear' | 'documents' | 'health'
  item: string
  qty: number
  why: string
  packed: boolean
}

export const BUDGET_CATEGORIES = ['stay', 'food', 'transport', 'activities', 'extras'] as const
export type BudgetCategory = (typeof BUDGET_CATEGORIES)[number]
export type TravelStyle = 'budget' | 'mid' | 'comfort'

export interface Budget {
  currency: string
  style: TravelStyle
  travellers: number
  /** Per person per day, in `currency`. */
  perDay: Record<BudgetCategory, number>
  notes: Partial<Record<BudgetCategory, string>>
}

/** A job running on the trip (the AI writing, places being checked). */
export interface Job {
  kind: 'plan' | 'refine' | 'rainy' | 'stay' | 'pack' | 'budget'
  day?: number
  /** What's happening, for the screen reader and the status line. */
  label: string
}

export interface Trip {
  id: string
  title: string
  description: string
  summary: string
  destination: Destination | null
  days: Day[]
  effort: Effort
  /** Travel month, 1-12, for the climate and packing. */
  month: number
  stay: Neighbourhood[] | null
  packing: PackItem[] | null
  budget: Budget | null
  job: Job | null
  /** The last job's error, shown until the next one starts. */
  error: string | null
  /** AI suggestions that weren't on OpenStreetMap, so never shown. */
  dropped: number
  createdAt: number
  updatedAt: number
}

/** A day's notes and photos after the trip. Never leaves the device. */
export interface JournalEntry {
  /** `${tripId}:${day}`. */
  id: string
  tripId: string
  day: number
  notes: string
  photos: Blob[]
  visited: boolean
  updatedAt: number
}

export const db = new Dexie('natour') as Dexie & {
  trips: EntityTable<Trip, 'id'>
  journal: EntityTable<JournalEntry, 'id'>
}

db.version(1).stores({
  trips: 'id, updatedAt',
  journal: 'id, tripId',
})

export const uid = () => crypto.randomUUID()

/** The stops a day shows: its rainy version when switched on. */
export const activeStops = (d: Day) => (d.useRainy && d.rainy ? d.rainy : d.stops)

/** Changes a trip in one transaction, so two quick edits can't overwrite each other. */
export async function updateTrip(id: string, change: (t: Trip) => Partial<Trip> | undefined) {
  await db.transaction('rw', db.trips, async () => {
    const t = await db.trips.get(id)
    if (!t) return
    const patch = change(t)
    await db.trips.put({ ...t, ...(patch ?? {}), updatedAt: Date.now() })
  })
}

export function newTrip(p: Pick<Trip, 'description' | 'effort' | 'month'> & { days: number }) {
  const now = Date.now()
  const trip: Trip = {
    id: uid(),
    title: 'New trip',
    description: p.description,
    summary: '',
    destination: null,
    days: Array.from({ length: p.days }, () => ({ stops: [], rainy: null, useRainy: false })),
    effort: p.effort,
    month: p.month,
    stay: null,
    packing: null,
    budget: null,
    job: null,
    error: null,
    dropped: 0,
    createdAt: now,
    updatedAt: now,
  }
  return trip
}
