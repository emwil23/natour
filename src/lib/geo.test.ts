import { describe, expect, it } from 'vitest'
import {
  dayStats,
  distance,
  effortFor,
  formatCoords,
  formatMinutes,
  legs,
  project,
  viewbox,
  walkMinutes,
} from './geo'

// Real Lisbon points.
const rossio = { lat: 38.7139, lon: -9.1394 }
const timeOut = { lat: 38.7071, lon: -9.1459 }
const belem = { lat: 38.6916, lon: -9.216 }

describe('distance and walking time', () => {
  it('measures great-circle distance', () => {
    expect(distance(rossio, rossio)).toBe(0)
    // About 940 m between Rossio and the Time Out Market.
    expect(distance(rossio, timeOut)).toBeGreaterThan(900)
    expect(distance(rossio, timeOut)).toBeLessThan(980)
    // One degree of latitude is about 111 km.
    expect(distance({ lat: 0, lon: 0 }, { lat: 1, lon: 0 }) / 1000).toBeCloseTo(111.2, 0)
  })

  it('walks at 4.8 km/h along streets 1.3× the straight line, rounding long walks to 5 minutes', () => {
    // 0.94 km × 1.3 ÷ 4.8 km/h ≈ 15 min.
    expect(walkMinutes(rossio, timeOut)).toBe(15)
    expect(walkMinutes(rossio, rossio)).toBe(1)
    expect(walkMinutes(rossio, belem) % 5).toBe(0)
  })

  it('skips stops without a place when chaining legs', () => {
    const ls = legs([rossio, null, timeOut, belem])
    expect(ls[0]).toBeNull()
    expect(ls[1]).toBeNull()
    expect(ls[2]?.minutes).toBe(15)
    expect(ls[3]?.km).toBeGreaterThan(7)
  })

  it('totals a day and grades its effort like the old Easy / Medium / Hard tours', () => {
    const day = dayStats([rossio, timeOut, belem])
    expect(day.km).toBeGreaterThan(8)
    expect(day.minutes).toBe(15 + walkMinutes(timeOut, belem))
    expect(day.effort).toBe('medium')
    expect(dayStats([]).effort).toBe('easy')
    expect([effortFor(4.9), effortFor(5), effortFor(10)]).toEqual(['easy', 'medium', 'hard'])
  })
})

describe('formatting', () => {
  it('writes estimates with a tilde', () => {
    expect(formatMinutes(40)).toBe('~40 min')
    expect(formatMinutes(60)).toBe('~1 h')
    expect(formatMinutes(85)).toBe('~1 h 25')
  })

  it('writes coordinates with hemispheres', () => {
    expect(formatCoords(rossio)).toBe('38.71°N 9.14°W')
    expect(formatCoords({ lat: -33.86, lon: 151.21 })).toBe('33.86°S 151.21°E')
  })

  it("turns our [south, north, west, east] box into Nominatim's viewbox", () => {
    expect(viewbox([38.69, 38.8, -9.23, -9.09])).toBe('-9.23,38.69,-9.09,38.8')
  })
})

describe('project', () => {
  it('fits points inside the box with the margin, north up', () => {
    const pts = project([rossio, timeOut, belem], 200, 100, 10)
    for (const [x, y] of pts) {
      expect(x).toBeGreaterThanOrEqual(10 - 1e-9)
      expect(x).toBeLessThanOrEqual(190 + 1e-9)
      expect(y).toBeGreaterThanOrEqual(10 - 1e-9)
      expect(y).toBeLessThanOrEqual(90 + 1e-9)
    }
    // Rossio is north-east of Belém: right of it and higher up.
    expect(pts[0]?.[0]).toBeGreaterThan(pts[2]?.[0] ?? 0)
    expect(pts[0]?.[1]).toBeLessThan(pts[2]?.[1] ?? 0)
  })

  it('centres a single point', () => {
    expect(project([rossio], 100, 60)).toEqual([[50, 30]])
    expect(project([], 100, 60)).toEqual([])
  })
})
