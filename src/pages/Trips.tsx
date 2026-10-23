import { AiNotice } from '@/components/AiNotice'
import { EffortBar } from '@/components/EffortBar'
import { EmptyState } from '@/components/EmptyState'
import { RouteSketch } from '@/components/RouteSketch'
import { Button } from '@/components/ui/button'
import { aiReady } from '@/ai/run'
import { PlacesUnavailable, searchPlaces } from '@/lib/api'
import { MONTHS } from '@/lib/climate'
import { activeStops, db, newTrip, type Effort, type Trip } from '@/lib/db'
import { dayStats } from '@/lib/geo'
import { deleteTrip, startPlan } from '@/lib/trips'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowRight, MapPinned, Trash2 } from 'lucide-react'
import { useState, type SubmitEvent } from 'react'
import { toast } from 'sonner'

const EXAMPLES = [
  '5 days in Lisbon in May: food, viewpoints and one slow morning, mid budget',
  'A long weekend in Kyoto for gardens, temples and quiet tea houses',
  '3 days in Mexico City: markets, murals and great street food',
  'A week in Edinburgh and the Highlands, easy walking, castles and whisky',
]

const field =
  'border-line bg-surface focus-visible:outline-accent-text h-10 rounded-xl border px-3 text-sm'

export function Trips() {
  const trips = useLiveQuery(() => db.trips.orderBy('updatedAt').reverse().toArray(), [])
  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 pt-10 pb-20 sm:px-6">
      <p className="spec text-accent-text">Plan a trip</p>
      <h1 className="font-display mt-3 text-5xl leading-[1.02] font-semibold sm:text-6xl">
        Where to, and how?
      </h1>
      <p className="text-muted mt-3 max-w-2xl">
        Describe the trip like you'd tell a friend. Natour plans it day by day, and every place it
        suggests is looked up on OpenStreetMap. Places that don't exist never reach your plan.
      </p>
      <DescribeForm />

      <section aria-labelledby="trips-h" className="mt-16">
        <h2 id="trips-h" className="font-display text-3xl font-semibold">
          Your trips
        </h2>
        {trips?.length === 0 && (
          <EmptyState art="/media/empty-trips" title="No trips yet">
            Your first plan will land here, with its route sketched on a postcard.
          </EmptyState>
        )}
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {trips?.map((t) => (
            <li key={t.id}>
              <Postcard trip={t} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function Postcard({ trip }: { trip: Trip }) {
  const stops = trip.days.flatMap(activeStops)
  const points = stops.flatMap((s) => (s.place ? [s.place] : []))
  const effort = dayStats(points).effort
  return (
    <article className="group border-line bg-surface shadow-card relative overflow-hidden rounded-2xl border">
      <RouteSketch points={points} className="bg-surface-2 aspect-[16/9] w-full" />
      <div className="p-5">
        <p className="spec text-muted">
          {trip.destination?.name ?? 'Somewhere'} · {MONTHS[trip.month - 1]}
        </p>
        <h3 className="font-display mt-1 text-2xl font-semibold">
          <Link
            to="/app/trip/$tripId"
            params={{ tripId: trip.id }}
            className="after:absolute after:inset-0 hover:underline"
          >
            {trip.title}
          </Link>
        </h3>
        <p className="text-muted mt-2 flex flex-wrap items-center gap-x-3 text-sm">
          <span>
            {trip.days.length} {trip.days.length === 1 ? 'day' : 'days'}
          </span>
          <span>{stops.length} places</span>
          {trip.job ? (
            <span className="text-accent-text">Planning…</span>
          ) : (
            <EffortBar effort={effort} />
          )}
        </p>
      </div>
      <button
        type="button"
        onClick={() => {
          if (confirm(`Delete "${trip.title}" and its journal? This can't be undone.`))
            void deleteTrip(trip.id)
        }}
        className="text-muted hover:text-danger bg-surface/90 absolute top-3 right-3 z-10 rounded-full p-2 opacity-100 sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100"
        aria-label={`Delete ${trip.title}`}
      >
        <Trash2 className="size-4" aria-hidden />
      </button>
    </article>
  )
}

const nextMonth = () => ((new Date().getMonth() + 1) % 12) + 1

/** Describe → plan. Also used on the landing page (it hands over through ?describe=). */
export function DescribeForm() {
  const navigate = useNavigate()
  const search: { describe?: string } = useSearch({ strict: false })
  const [description, setDescription] = useState(search.describe ?? '')
  const [days, setDays] = useState(4)
  const [month, setMonth] = useState(nextMonth)
  const [effort, setEffort] = useState<Effort>('medium')
  const [status, setStatus] = useState<'idle' | 'no-provider' | 'busy'>('idle')

  async function submit(e: SubmitEvent) {
    e.preventDefault()
    if (description.trim().length < 8) return
    setStatus('busy')
    if (!(await aiReady())) {
      setStatus('no-provider')
      return
    }
    const id = await startPlan({ description: description.trim(), days, effort, month })
    await navigate({ to: '/app/trip/$tripId', params: { tripId: id } })
  }

  return (
    <form
      onSubmit={(e) => void submit(e)}
      className="border-line bg-surface shadow-card mt-8 rounded-3xl border p-4 sm:p-6"
    >
      <label htmlFor="describe" className="spec text-muted">
        Describe your trip
      </label>
      <textarea
        id="describe"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={600}
        rows={3}
        required
        minLength={8}
        placeholder="5 days in Lisbon in May: food, viewpoints, one slow morning, mid budget"
        className="font-display placeholder:text-muted/70 mt-2 w-full resize-none bg-transparent text-2xl leading-snug outline-none sm:text-3xl"
      />
      <div className="mt-2 flex flex-wrap gap-2" aria-label="Examples">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => setDescription(ex)}
            className="border-line text-muted hover:text-text hover:border-accent-text rounded-full border px-3 py-1 text-xs"
          >
            {ex.split(':')[0]}
          </button>
        ))}
      </div>
      <div className="border-line mt-5 flex flex-wrap items-end gap-3 border-t pt-5">
        <label className="flex flex-col gap-1">
          <span className="spec text-muted">Days</span>
          <select className={field} value={days} onChange={(e) => setDays(Number(e.target.value))}>
            {Array.from({ length: 14 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="spec text-muted">Month</span>
          <select
            className={field}
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="spec text-muted">Walking</span>
          <select
            className={field}
            value={effort}
            onChange={(e) => setEffort(e.target.value as Effort)}
          >
            <option value="easy">Easy: 3–4 stops a day</option>
            <option value="medium">Medium: 4–5 stops a day</option>
            <option value="hard">Hard: 5–7 stops a day</option>
          </select>
        </label>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="ml-auto"
          disabled={status === 'busy'}
        >
          Plan my trip <ArrowRight />
        </Button>
      </div>
      <AiNotice status={status} error={null} />
      <EmptyTripForm days={days} month={month} effort={effort} />
    </form>
  )
}

/** No AI? Start an empty trip for a destination and add places by hand. */
function EmptyTripForm({ days, month, effort }: { days: number; month: number; effort: Effort }) {
  const navigate = useNavigate()
  const [place, setPlace] = useState('')
  const [busy, setBusy] = useState(false)

  async function start() {
    if (place.trim().length < 2) return
    setBusy(true)
    try {
      const [hit] = await searchPlaces(place.trim(), { limit: 1 })
      if (!hit) {
        toast.error(`OpenStreetMap doesn't know "${place}". Check the spelling?`)
        return
      }
      const country = hit.address.split(',').at(-1)?.trim() ?? ''
      const trip = newTrip({
        description: `${String(days)} days in ${hit.name}`,
        days,
        effort,
        month,
      })
      await db.trips.add({
        ...trip,
        title: `${hit.name}, ${String(days)} days`,
        destination: { name: hit.name, country, lat: hit.lat, lon: hit.lon, bbox: hit.bbox },
      })
      await navigate({ to: '/app/trip/$tripId', params: { tripId: trip.id } })
    } catch (e) {
      toast.error(e instanceof PlacesUnavailable ? e.message : 'Could not start the trip.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <details className="text-muted mt-4 text-sm">
      <summary className="cursor-pointer">Or plan it yourself, without AI</summary>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="spec">Destination</span>
          <input
            className={field}
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                void start()
              }
            }}
            placeholder="Lisbon"
            maxLength={120}
          />
        </label>
        <Button type="button" onClick={() => void start()} disabled={busy}>
          <MapPinned /> Start an empty trip
        </Button>
      </div>
    </details>
  )
}
