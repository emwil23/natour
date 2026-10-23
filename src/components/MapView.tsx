import type { LatLon } from '@/lib/geo'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

export interface MapPin extends LatLon {
  /** Shown inside the pin: the stop's number. */
  n: string
  /** For the tooltip. */
  label: string
  color: string
  /** Neighbourhoods: a ring instead of a filled pin. */
  ring?: boolean
}

export interface MapLine {
  id: string
  color: string
  points: LatLon[]
}

// OpenFreeMap: free vector tiles with no key and no request cap, commercial use allowed. The style carries
// the © OpenMapTiles / © OpenStreetMap attribution, which MapLibre shows in the corner.
const STYLE = {
  light: 'https://tiles.openfreemap.org/styles/positron',
  dark: 'https://tiles.openfreemap.org/styles/dark',
}

const themeNow = () => document.documentElement.dataset.theme === 'dark'
const watchTheme = (cb: () => void) => {
  const mo = new MutationObserver(cb)
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => mo.disconnect()
}

/**
 * The trip map. Pins and dotted route lines over OpenFreeMap tiles; it refits whenever the pins change.
 * The map is extra for sighted mouse and touch users: every page that shows it also lists the same stops
 * in order, which is the accessible view.
 */
export function MapView({
  pins,
  lines,
  label,
  className,
}: {
  pins: MapPin[]
  lines: MapLine[]
  label: string
  className?: string
}) {
  const box = useRef<HTMLDivElement>(null)
  const markers = useRef<maplibregl.Marker[]>([])
  // The map once its style has loaded; lines can only be added then.
  const [map, setMap] = useState<maplibregl.Map | null>(null)
  const dark = useSyncExternalStore(watchTheme, themeNow)

  useEffect(() => {
    if (!box.current) return
    const m = new maplibregl.Map({
      container: box.current,
      style: dark ? STYLE.dark : STYLE.light,
      center: [0, 20],
      zoom: 1,
      attributionControl: { compact: false },
      cooperativeGestures: true,
    })
    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
    m.on('load', () => setMap(m))
    return () => {
      for (const mk of markers.current) mk.remove()
      markers.current = []
      setMap(null)
      m.remove()
    }
  }, [dark])

  useEffect(() => {
    if (map) markers.current = draw(map, pins, lines, markers.current)
  }, [map, pins, lines])

  return (
    <div
      ref={box}
      role="region"
      aria-label={label}
      className={className ?? 'h-full min-h-80 w-full'}
    />
  )
}

/** Puts the pins and route lines on the map, replacing the previous ones; returns the new markers. */
function draw(m: maplibregl.Map, pins: MapPin[], lines: MapLine[], old: maplibregl.Marker[]) {
  for (const mk of old) mk.remove()
  const markers = pins.map((p) => {
    const el = document.createElement('div')
    el.className = p.ring
      ? 'grid size-9 place-items-center rounded-full border-[3px] bg-surface/80 font-mono text-[11px] font-bold shadow-md'
      : 'grid size-7 place-items-center rounded-full border-2 border-white font-mono text-[11px] font-bold text-white shadow-md'
    el.style[p.ring ? 'borderColor' : 'backgroundColor'] = p.color
    if (p.ring) el.style.color = p.color
    el.textContent = p.n
    el.title = p.label
    el.setAttribute('aria-hidden', 'true')
    return new maplibregl.Marker({ element: el }).setLngLat([p.lon, p.lat]).addTo(m)
  })
  // Remove last time's lines, then draw this time's.
  for (const layer of m.getStyle().layers)
    if (layer.id.startsWith('route-')) m.removeLayer(layer.id)
  for (const id of Object.keys(m.getStyle().sources))
    if (id.startsWith('route-')) m.removeSource(id)
  for (const l of lines) {
    if (l.points.length < 2) continue
    m.addSource(`route-${l.id}`, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: l.points.map((p) => [p.lon, p.lat]) },
      },
    })
    m.addLayer({
      id: `route-${l.id}`,
      type: 'line',
      source: `route-${l.id}`,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': l.color, 'line-width': 3.5, 'line-dasharray': [0.1, 2] },
    })
  }
  if (pins.length) {
    const b = new maplibregl.LngLatBounds()
    for (const p of pins) b.extend([p.lon, p.lat])
    m.fitBounds(b, { padding: 56, maxZoom: 15, duration: 600 })
  }
  return markers
}

/** Colours for days on the map, readable on both the paper and the night tiles. */
export const DAY_COLORS = [
  '#c2482f',
  '#2f7a57',
  '#2f6db3',
  '#b7791f',
  '#8b4fa3',
  '#1f8a8a',
  '#b03a6b',
]
export const dayColor = (i: number) => DAY_COLORS[i % DAY_COLORS.length] ?? '#c2482f'
