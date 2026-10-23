import { Stamp } from '@/components/Stamp'
import { TripFrame } from '@/components/TripFrame'
import { Button } from '@/components/ui/button'
import { CURRENCIES, defaultCurrency, money, totals } from '@/lib/budget'
import {
  BUDGET_CATEGORIES,
  updateTrip,
  type Budget,
  type BudgetCategory,
  type Trip,
  type TravelStyle,
} from '@/lib/db'
import { emptyBudget, estimateBudget } from '@/lib/trips'
import { useParams } from '@tanstack/react-router'
import { Sparkles } from 'lucide-react'

const LABEL: Record<BudgetCategory, string> = {
  stay: 'Stay',
  food: 'Food and drink',
  transport: 'Getting around',
  activities: 'Sights and activities',
  extras: 'Extras',
}
const BAR = ['bg-accent', 'bg-live', 'bg-[#2f6db3]', 'bg-[#b7791f]', 'bg-[#8b4fa3]']

export function BudgetPage() {
  const { tripId } = useParams({ from: '/shell/app/trip/$tripId/budget' })
  return <TripFrame tripId={tripId}>{(trip) => <BudgetBody trip={trip} />}</TripFrame>
}

const field = 'border-line bg-surface h-10 rounded-xl border px-3 text-sm'

function BudgetBody({ trip }: { trip: Trip }) {
  const b = trip.budget ?? emptyBudget(defaultCurrency())
  const t = totals(b, trip.days.length)
  const save = (patch: Partial<Budget>) =>
    updateTrip(trip.id, (x) => ({ budget: { ...(x.budget ?? b), ...patch } }))

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <section aria-labelledby="daily-h">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1">
            <span className="spec text-muted">Currency</span>
            <select
              className={field}
              value={b.currency}
              onChange={(e) => void save({ currency: e.target.value })}
            >
              {[...new Set([b.currency, ...CURRENCIES])].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="spec text-muted">Style</span>
            <select
              className={field}
              value={b.style}
              onChange={(e) => void save({ style: e.target.value as TravelStyle })}
            >
              <option value="budget">Budget</option>
              <option value="mid">Mid-range</option>
              <option value="comfort">Comfort</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="spec text-muted">Travellers</span>
            <input
              type="number"
              min={1}
              max={12}
              className={`${field} w-20`}
              value={b.travellers}
              onChange={(e) =>
                void save({
                  travellers: Math.min(12, Math.max(1, Math.round(Number(e.target.value) || 1))),
                })
              }
            />
          </label>
          <Button
            variant="ai"
            className="ml-auto"
            disabled={!trip.destination || trip.job !== null}
            onClick={() => void estimateBudget(trip, b)}
          >
            <Sparkles /> {trip.job?.kind === 'budget' ? 'Estimating…' : 'Rough estimate'}
          </Button>
        </div>

        <h2 id="daily-h" className="font-display mt-8 text-2xl font-semibold">
          Per person, per day
        </h2>
        <ul className="mt-3 flex flex-col">
          {BUDGET_CATEGORIES.map((c, i) => (
            <li key={c} className="border-line flex flex-wrap items-center gap-3 border-b py-3">
              <span className={`size-3 rounded-sm ${BAR[i] ?? ''}`} aria-hidden />
              <label htmlFor={`b-${c}`} className="min-w-40 flex-1">
                {LABEL[c]}
                {b.notes[c] && <span className="text-muted block text-xs">{b.notes[c]}</span>}
              </label>
              <input
                id={`b-${c}`}
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                value={b.perDay[c] || ''}
                placeholder="0"
                onChange={(e) =>
                  void save({
                    perDay: { ...b.perDay, [c]: Math.max(0, Number(e.target.value) || 0) },
                  })
                }
                className={`${field} w-32 text-right font-mono`}
              />
              <span className="spec text-muted w-10">{b.currency}</span>
            </li>
          ))}
        </ul>
        <p className="text-muted mt-4 text-sm">
          Every figure is yours to edit. "Rough estimate" asks the AI for ballpark numbers for{' '}
          {trip.destination?.name ?? 'the destination'}; they are a starting point, not prices.
        </p>
      </section>

      <aside className="border-line bg-surface relative h-fit rounded-2xl border p-6">
        <Stamp kind="estimate" size={64} className="absolute -top-5 -right-3" />
        <p className="spec text-muted">Whole trip</p>
        <p className="font-display mt-1 text-5xl font-semibold">{money(t.trip, b.currency)}</p>
        <p className="text-muted mt-1 text-sm">
          {money(t.perDay, b.currency)} a day for {b.travellers}{' '}
          {b.travellers === 1 ? 'traveller' : 'travellers'}, {trip.days.length}{' '}
          {trip.days.length === 1 ? 'day' : 'days'}
        </p>
        <div className="bg-surface-2 mt-5 flex h-3 overflow-hidden rounded-full" aria-hidden>
          {BUDGET_CATEGORIES.map((c, i) => (
            <div key={c} className={BAR[i]} style={{ width: `${String(t.shares[c] * 100)}%` }} />
          ))}
        </div>
        <ul className="mt-4 flex flex-col gap-1 text-sm">
          {BUDGET_CATEGORIES.map((c, i) => (
            <li key={c} className="flex items-center gap-2">
              <span className={`size-2.5 rounded-sm ${BAR[i] ?? ''}`} aria-hidden />
              <span className="flex-1">{LABEL[c]}</span>
              <span className="font-mono text-xs">{Math.round(t.shares[c] * 100)}%</span>
            </li>
          ))}
        </ul>
        <p className="text-muted mt-5 text-xs">An estimate for planning, not a quote.</p>
      </aside>
    </div>
  )
}
