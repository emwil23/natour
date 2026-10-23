export type Mood = 'coast' | 'mountains' | 'old-town' | 'desert' | 'forest' | 'night-city'

export const MOODS: { id: Mood; label: string }[] = [
  { id: 'coast', label: 'Coast' },
  { id: 'mountains', label: 'Mountains' },
  { id: 'old-town', label: 'Old towns' },
  { id: 'desert', label: 'Desert' },
  { id: 'forest', label: 'Forest' },
  { id: 'night-city', label: 'Night cities' },
]

export interface Featured {
  slug: string
  name: string
  country: string
  lat: number
  lon: number
  /** The Wikivoyage article. */
  wiki: string
  moods: Mood[]
  /** One line in our own words. */
  line: string
}

/** A short, hand-picked list for the Explore page. Any other place works through search. */
export const FEATURED: Featured[] = [
  {
    slug: 'lisbon',
    name: 'Lisbon',
    country: 'Portugal',
    lat: 38.72,
    lon: -9.14,
    wiki: 'Lisbon',
    moods: ['coast', 'old-town'],
    line: 'Seven hills, river light and tiled façades.',
  },
  {
    slug: 'kyoto',
    name: 'Kyoto',
    country: 'Japan',
    lat: 35.01,
    lon: 135.77,
    wiki: 'Kyoto',
    moods: ['old-town', 'forest'],
    line: 'Temple gardens, quiet lanes and bamboo.',
  },
  {
    slug: 'mexico-city',
    name: 'Mexico City',
    country: 'Mexico',
    lat: 19.43,
    lon: -99.13,
    wiki: 'Mexico City',
    moods: ['night-city', 'old-town'],
    line: 'Markets, murals and the best street food.',
  },
  {
    slug: 'edinburgh',
    name: 'Edinburgh',
    country: 'United Kingdom',
    lat: 55.95,
    lon: -3.19,
    wiki: 'Edinburgh',
    moods: ['old-town', 'mountains'],
    line: 'A castle on a volcano and closes to wander.',
  },
  {
    slug: 'marrakesh',
    name: 'Marrakesh',
    country: 'Morocco',
    lat: 31.63,
    lon: -8.01,
    wiki: 'Marrakech',
    moods: ['desert', 'old-town'],
    line: 'Souks, riads and the Atlas on the horizon.',
  },
  {
    slug: 'cape-town',
    name: 'Cape Town',
    country: 'South Africa',
    lat: -33.92,
    lon: 18.42,
    wiki: 'Cape Town',
    moods: ['coast', 'mountains'],
    line: 'A flat-topped mountain over two oceans.',
  },
  {
    slug: 'hong-kong',
    name: 'Hong Kong',
    country: 'China',
    lat: 22.32,
    lon: 114.17,
    wiki: 'Hong Kong',
    moods: ['night-city', 'mountains'],
    line: 'Neon harbour nights and green island trails.',
  },
  {
    slug: 'vancouver',
    name: 'Vancouver',
    country: 'Canada',
    lat: 49.28,
    lon: -123.12,
    wiki: 'Vancouver',
    moods: ['forest', 'coast'],
    line: 'Rainforest parks where the city meets the sea.',
  },
  {
    slug: 'reykjavik',
    name: 'Reykjavík',
    country: 'Iceland',
    lat: 64.15,
    lon: -21.94,
    wiki: 'Reykjavík',
    moods: ['coast', 'mountains'],
    line: 'Colourful roofs, hot pools and long light.',
  },
  {
    slug: 'istanbul',
    name: 'Istanbul',
    country: 'Türkiye',
    lat: 41.01,
    lon: 28.98,
    wiki: 'Istanbul',
    moods: ['old-town', 'night-city'],
    line: 'Two continents, domes and ferries at dusk.',
  },
  {
    slug: 'queenstown',
    name: 'Queenstown',
    country: 'New Zealand',
    lat: -45.03,
    lon: 168.66,
    wiki: 'Queenstown (New Zealand)',
    moods: ['mountains', 'forest'],
    line: 'A lake town ringed by sharp peaks.',
  },
  {
    slug: 'jaipur',
    name: 'Jaipur',
    country: 'India',
    lat: 26.91,
    lon: 75.79,
    wiki: 'Jaipur',
    moods: ['desert', 'old-town'],
    line: 'Pink walls, hill forts and stepwells.',
  },
]

export const featured = (slug: string) => FEATURED.find((f) => f.slug === slug)

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
export const roman = (i: number) => ROMAN[i] ?? String(i + 1)
