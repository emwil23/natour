import type { OsmPlace } from './db'

/** A Nominatim answer from ew-apps-api (`/api/places/search`). */
export interface ApiPlace {
  name: string
  address: string
  lat: number
  lon: number
  category: string
  type: string
  osm: string
  bbox: [number, number, number, number]
}

// Words that don't tell two places apart.
const STOP_WORDS = new Set(
  'the a an of and de da do das dos del della di du des la le les el los las il lo der die das am im y e et'.split(
    ' ',
  ),
)

/** Lower-case words without accents or punctuation, minus the filler words. */
export function words(s: string): string[] {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .split(' ')
    .filter((w) => w && !STOP_WORDS.has(w))
}

/** Share of the suggested name's words found in the OSM name (0-1). */
export function nameScore(suggested: string, found: string): number {
  const want = words(suggested)
  if (!want.length) return 0
  const have = new Set(words(found))
  return want.filter((w) => have.has(w)).length / want.length
}

// Kinds of OSM result that are never a place to visit, even when the name matches (a bus stop named after
// the museum, a street named after the square).
const NOT_A_PLACE = new Set(['bus_stop', 'platform', 'stop_position', 'residential', 'service'])

/**
 * The OpenStreetMap result that is really the suggested place, or null if none is. Nominatim's search is
 * fuzzy and returns its best guesses, so a result counts only if at least half the suggested name's words
 * are in its name and it isn't a bus stop or a road.
 */
export function matchPlace(suggested: string, results: ApiPlace[]): ApiPlace | null {
  let best: ApiPlace | null = null
  let bestScore = 0
  for (const r of results) {
    if (NOT_A_PLACE.has(r.type)) continue
    const score = nameScore(suggested, r.name)
    if (score > bestScore) [best, bestScore] = [r, score]
  }
  return bestScore >= 0.5 ? best : null
}

export const toOsmPlace = (p: ApiPlace): OsmPlace => ({
  lat: p.lat,
  lon: p.lon,
  address: p.address,
  osm: p.osm,
  category: p.category,
  type: p.type,
})
