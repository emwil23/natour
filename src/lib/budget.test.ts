import { describe, expect, it } from 'vitest'
import { defaultCurrency, money, totals } from './budget'
import type { Budget } from './db'

const budget = (perDay: Partial<Budget['perDay']>, travellers = 1): Budget => ({
  currency: 'EUR',
  style: 'mid',
  travellers,
  perDay: { stay: 0, food: 0, transport: 0, activities: 0, extras: 0, ...perDay },
  notes: {},
})

describe('totals', () => {
  it('adds the categories per person, then scales by travellers and days', () => {
    const t = totals(budget({ stay: 60, food: 35, transport: 8, activities: 20, extras: 7 }, 2), 5)
    expect(t.perPersonDay).toBe(130)
    expect(t.perDay).toBe(260)
    expect(t.trip).toBe(1300)
  })

  it('gives each category its share of the day', () => {
    const t = totals(budget({ stay: 75, food: 25 }), 1)
    expect(t.shares.stay).toBe(0.75)
    expect(t.shares.food).toBe(0.25)
    expect(t.shares.extras).toBe(0)
  })

  it('counts half-typed or negative fields as nothing', () => {
    const t = totals(budget({ stay: Number.NaN, food: -10, extras: 5 }), 3)
    expect(t.perPersonDay).toBe(5)
    expect(t.trip).toBe(15)
    expect(totals(budget({}), 4).shares.stay).toBe(0)
  })
})

describe('money and currency', () => {
  it('formats whole units in the given locale', () => {
    expect(money(1240.4, 'EUR', 'en-IE')).toBe('€1,240')
    expect(money(12000, 'INR', 'en-IN')).toBe('₹12,000')
  })

  it("picks the currency of the browser's region", () => {
    expect(defaultCurrency('en-IN')).toBe('INR')
    expect(defaultCurrency('pt-PT')).toBe('EUR')
    expect(defaultCurrency('en-GB')).toBe('GBP')
    expect(defaultCurrency('en')).toBe('USD')
    expect(defaultCurrency('es-AR')).toBe('USD')
  })
})
