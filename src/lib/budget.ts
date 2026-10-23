import { BUDGET_CATEGORIES, type Budget, type BudgetCategory } from './db'

/** Totals for a budget over `days`: per person per day, per day for the group, and the whole trip. */
export function totals(b: Budget, days: number) {
  const perPersonDay = BUDGET_CATEGORIES.reduce((s, c) => s + safe(b.perDay[c]), 0)
  const perDay = perPersonDay * b.travellers
  return {
    perPersonDay,
    perDay,
    trip: perDay * days,
    /** Each category's share of the day, 0-1, for the bar. */
    shares: Object.fromEntries(
      BUDGET_CATEGORIES.map((c) => [c, perPersonDay ? safe(b.perDay[c]) / perPersonDay : 0]),
    ) as Record<BudgetCategory, number>,
  }
}

// An edited field can be empty or negative while typing; it counts as 0.
const safe = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0)

/** Whole-unit money in the user's locale: "€1,240", "₹12,000". */
export const money = (n: number, currency: string, locale?: string) =>
  new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)

const REGION_CURRENCY: Record<string, string> = {
  US: 'USD',
  GB: 'GBP',
  IN: 'INR',
  JP: 'JPY',
  CA: 'CAD',
  AU: 'AUD',
  NZ: 'NZD',
  CH: 'CHF',
  CN: 'CNY',
  BR: 'BRL',
  MX: 'MXN',
  ZA: 'ZAR',
  NG: 'NGN',
  KE: 'KES',
  SG: 'SGD',
  AE: 'AED',
  SE: 'SEK',
  NO: 'NOK',
  DK: 'DKK',
  PL: 'PLN',
  KR: 'KRW',
  TR: 'TRY',
  ID: 'IDR',
  TH: 'THB',
  PH: 'PHP',
}
// prettier-ignore
const EURO = new Set(['AT','BE','CY','DE','EE','ES','FI','FR','GR','HR','IE','IT','LT','LU','LV','MT','NL','PT','SI','SK'])

/** The currency of the browser's region ("en-IN" → INR), else US dollars. */
export function defaultCurrency(lang = typeof navigator === 'undefined' ? '' : navigator.language) {
  const region = /-([A-Z]{2})(?![A-Za-z])/.exec(lang)?.[1]
  if (!region) return 'USD'
  if (EURO.has(region)) return 'EUR'
  return REGION_CURRENCY[region] ?? 'USD'
}

export const CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'INR',
  'JPY',
  'CAD',
  'AUD',
  'CHF',
  'NZD',
  'SGD',
  'AED',
  'ZAR',
  'NGN',
  'KES',
  'BRL',
  'MXN',
  'SEK',
  'NOK',
  'DKK',
  'PLN',
  'KRW',
  'TRY',
  'IDR',
  'THB',
  'PHP',
  'CNY',
] as const
