import type { Effort } from './db'

export interface LatLon {
  lat: number
  lon: number
}

/** Great-circle distance in metres. */
export function distance(a: LatLon, b: LatLon): number {
  const R = 6_371_000
  const rad = Math.PI / 180
  const dLat = (b.lat - a.lat) * rad
  const dLon = (b.lon - a.lon) * rad
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)))
}

// Streets aren't straight: city walks run about 1.3× the straight line. 4.8 km/h is a relaxed pace.
// shortcut: no real routing (the free OSRM server is non-commercial); a self-hosted router would be exact.
export const DETOUR = 1.3
export const WALK_KMH = 4.8

/** Estimated walking minutes between two points, rounded to 5 above 10 minutes. */
export function walkMinutes(a: LatLon, b: LatLon): number {
  const min = ((distance(a, b) * DETOUR) / 1000 / WALK_KMH) * 60
  return min < 10 ? Math.max(1, Math.round(min)) : Math.round(min / 5) * 5
}

export interface Leg {
  km: number
  minutes: number
}

/** Walking legs between consecutive placed stops; stops without a place are skipped. */
export function legs(points: (LatLon | null)[]): (Leg | null)[] {
  const out: (Leg | null)[] = []
  let prev: LatLon | null = null
  for (const p of points) {
    if (!p) {
      out.push(null)
      continue
    }
    out.push(
      prev ? { km: (distance(prev, p) * DETOUR) / 1000, minutes: walkMinutes(prev, p) } : null,
    )
    prev = p
  }
  return out
}

/** A day's walking distance and time, and how hard it is. */
export function dayStats(points: (LatLon | null)[]) {
  const ls = legs(points).filter((l): l is Leg => l !== null)
  const km = ls.reduce((s, l) => s + l.km, 0)
  return { km, minutes: ls.reduce((s, l) => s + l.minutes, 0), effort: effortFor(km) }
}

/** Natour's old Easy/Medium/Hard tours, now walking per day: under 5 km, under 10 km, more. */
export const effortFor = (km: number): Effort => (km < 5 ? 'easy' : km < 10 ? 'medium' : 'hard')

/** "~1 h 25", "~40 min". */
export function formatMinutes(min: number): string {
  if (min < 60) return `~${String(min)} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return `~${String(h)} h${m ? ` ${String(m).padStart(2, '0')}` : ''}`
}

/** Nominatim's viewbox (west,south,east,north) from our [south, north, west, east] box. */
export const viewbox = ([s, n, w, e]: [number, number, number, number]) => `${w},${s},${e},${n}`

/** "38.72°N 9.14°W". */
export function formatCoords({ lat, lon }: LatLon): string {
  return `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'} ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? 'E' : 'W'}`
}

/**
 * Projects points into a w×h box (equirectangular, with a cos(lat) squeeze), keeping the aspect and a margin.
 * For the small route prints on trip cards and journal pages, where a real map would be too heavy.
 */
export function project(points: LatLon[], w: number, h: number, margin = 12): [number, number][] {
  if (!points.length) return []
  const lat0 = points.reduce((s, p) => s + p.lat, 0) / points.length
  const k = Math.cos((lat0 * Math.PI) / 180)
  const xs = points.map((p) => p.lon * k)
  const ys = points.map((p) => -p.lat)
  const [minX, maxX, minY, maxY] = [
    Math.min(...xs),
    Math.max(...xs),
    Math.min(...ys),
    Math.max(...ys),
  ]
  const scale = Math.min(
    (w - 2 * margin) / (maxX - minX || 1),
    (h - 2 * margin) / (maxY - minY || 1),
  )
  const ox = (w - (maxX - minX) * scale) / 2
  const oy = (h - (maxY - minY) * scale) / 2
  return xs.map((x, i) => [ox + (x - minX) * scale, oy + ((ys[i] ?? 0) - minY) * scale])
}
