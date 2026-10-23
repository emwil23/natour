/** One month of NASA POWER averages: daily high and low in °C, rain in mm a day. */
export interface ClimateMonth {
  high: number
  low: number
  rainMm: number
}

export const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

/**
 * How pleasant a month is for walking about, 0-1: best with daytime highs of 18-27 °C and little rain.
 * A plain rule, shown as "best months"; it says nothing about crowds or prices.
 */
export function comfort(m: ClimateMonth): number {
  const t =
    m.high < 18
      ? Math.max(0, 1 - (18 - m.high) / 14)
      : m.high > 27
        ? Math.max(0, 1 - (m.high - 27) / 9)
        : 1
  const rain = Math.max(0, 1 - m.rainMm / 6)
  return Math.round(t * (0.4 + 0.6 * rain) * 100) / 100
}

/** Month indexes (0-11) within 0.1 of the best score, best first; at most four. */
export function bestMonths(months: ClimateMonth[]): number[] {
  const scores = months.map(comfort)
  const top = Math.max(...scores)
  return scores
    .map((s, i) => [s, i] as const)
    .filter(([s]) => s >= top - 0.1 && s > 0)
    .sort((a, b) => b[0] - a[0])
    .slice(0, 4)
    .map(([, i]) => i)
}
