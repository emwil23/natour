import type { ApiPlace } from './check'
import type { ClimateMonth } from './climate'

const API_URL = import.meta.env.VITE_API_URL as string | undefined

export class PlacesUnavailable extends Error {}

/**
 * GET one of ew-apps-api's cached place routes. A busy answer (Nominatim's shared one-a-second queue is full)
 * is retried once after a pause; after that, or with no server at all, it throws PlacesUnavailable.
 */
async function get<T>(path: string, params: Record<string, string>, signal?: AbortSignal) {
  if (!API_URL) throw new PlacesUnavailable('No place server configured.')
  const url = `${API_URL}${path}?${new URLSearchParams(params).toString()}`
  for (let attempt = 0; ; attempt++) {
    let res: Response
    try {
      res = await fetch(url, signal ? { signal } : {})
    } catch (e) {
      if (signal?.aborted) throw e
      throw new PlacesUnavailable('The place server is unreachable.')
    }
    if (res.ok) return ((await res.json()) as { result: T }).result
    if (res.status === 503 && attempt === 0) {
      await new Promise((r) => setTimeout(r, 3000))
      continue
    }
    throw new PlacesUnavailable(`The place server answered ${String(res.status)}.`)
  }
}

export const placesConfigured = Boolean(API_URL)

/** OpenStreetMap search via Nominatim; `near` is a viewbox "west,south,east,north". Never call it per keystroke. */
export const searchPlaces = (
  q: string,
  opts: { near?: string; limit?: number } = {},
  signal?: AbortSignal,
) =>
  get<ApiPlace[]>(
    '/api/places/search',
    {
      q,
      limit: String(opts.limit ?? 3),
      lang: navigator.language.slice(0, 2) || 'en',
      ...(opts.near && { near: opts.near }),
    },
    signal,
  )

export interface Guide {
  title: string
  extract: string
  url: string
}

export const getGuide = (title: string, signal?: AbortSignal) =>
  get<Guide | null>('/api/places/guide', { title }, signal)

export const getClimate = (lat: number, lon: number, signal?: AbortSignal) =>
  get<ClimateMonth[]>('/api/places/climate', { lat: lat.toFixed(2), lon: lon.toFixed(2) }, signal)

/** An Unsplash photo from Pixe's photo route. Hotlinked from Unsplash's CDN, as its terms require. */
export interface Photo {
  id: string
  width: number
  height: number
  color: string | null
  alt: string
  thumb: string
  src: string
  pageUrl: string
  author: { name: string; url: string | null }
}

export async function searchPhotos(q: string, signal?: AbortSignal): Promise<Photo[]> {
  if (!API_URL) return []
  const res = await fetch(
    `${API_URL}/api/photos/unsplash/search?${new URLSearchParams({ q, orientation: 'landscape' }).toString()}`,
    signal ? { signal } : {},
  )
  if (!res.ok) return []
  return ((await res.json()) as { photos: Photo[] }).photos
}

const UTM = 'utm_source=natour&utm_medium=referral'
/** Unsplash's credit links carry the app's name, as its API guidelines ask. */
export const withUtm = (url: string) => `${url}${url.includes('?') ? '&' : '?'}${UTM}`
