import { describe, expect, it } from 'vitest'
import { bestMonths, comfort, type ClimateMonth } from './climate'

// NASA POWER averages for Lisbon (2001-2025): daily high and low °C, rain mm/day.
const lisbon: ClimateMonth[] = [
  [16.8, 7.3, 2.09],
  [17.0, 7.5, 1.79],
  [19.2, 8.3, 1.94],
  [21.1, 10.9, 1.8],
  [24.7, 12.4, 0.99],
  [26.3, 14.9, 0.36],
  [27.3, 16.4, 0.11],
  [27.3, 16.7, 0.19],
  [26.2, 16.1, 0.84],
  [24.0, 13.7, 2.56],
  [20.5, 10.4, 3.07],
  [17.5, 7.7, 2.08],
].map(([high = 0, low = 0, rainMm = 0]) => ({ high, low, rainMm }))

describe('comfort', () => {
  it('scores mild dry months highest', () => {
    expect(comfort({ high: 22, low: 12, rainMm: 0 })).toBe(1)
    expect(comfort({ high: 22, low: 12, rainMm: 6 })).toBe(0.4)
    expect(comfort({ high: 40, low: 28, rainMm: 0 })).toBe(0)
    expect(comfort({ high: 2, low: -5, rainMm: 0 })).toBe(0)
  })
})

describe('bestMonths', () => {
  it("picks Lisbon's late spring to early autumn", () => {
    const best = bestMonths(lisbon)
    expect(best.length).toBeGreaterThan(0)
    expect(best.length).toBeLessThanOrEqual(4)
    // Indexes: 4 = May … 8 = September.
    for (const m of best) expect(m).toBeGreaterThanOrEqual(4)
    for (const m of best) expect(m).toBeLessThanOrEqual(8)
  })

  it('returns nothing when no month is pleasant at all', () => {
    expect(
      bestMonths(Array.from({ length: 12 }, () => ({ high: 45, low: 30, rainMm: 0 }))),
    ).toEqual([])
  })
})
