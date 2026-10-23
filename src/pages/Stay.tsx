import { EmptyState } from '@/components/EmptyState'
import { dayColor, type MapPin } from '@/components/MapView'
import { Stamp } from '@/components/Stamp'
import { LazyMap, MapSlot, TripFrame } from '@/components/TripFrame'
import { Button } from '@/components/ui/button'
import { activeStops, type Neighbourhood, type Trip } from '@/lib/db'
import { formatCoords, formatMinutes, walkMinutes } from '@/lib/geo'
import { compareStays } from '@/lib/trips'
import { useParams } from '@tanstack/react-router'
import { ArrowUpRight, BedDouble, Check, Minus } from 'lucide-react'
import { useMemo } from 'react'

const LETTERS = ['A', 'B', 'C']
const RING = ['#c2482f', '#2f6db3', '#8b4fa3']

export function Stay() {
  const { tripId } = useParams({ from: '/shell/app/trip/$tripId/stay' })
  return <TripFrame tripId={tripId}>{(trip) => <StayBody trip={trip} />}</TripFrame>
}

/** Walking times from a neighbourhood to every checked stop: the nearest, the average and the farthest. */
export function reach(n: Neighbourhood, trip: Trip) {
  if (!n.place) return null
  const from = n.place
  const times = trip.days
    .flatMap(activeStops)
    .flatMap((s) => (s.place ? [{ name: s.name, min: walkMinutes(from, s.place) }] : []))
  if (!times.length) return null
  const sorted = [...times].sort((a, b) => a.min - b.min)
  const avg = Math.round(times.reduce((s, t) => s + t.min, 0) / times.length)
  return { nearest: sorted[0], farthest: sorted.at(-1), avg, all: sorted }
}

function StayBody({ trip }: { trip: Trip }) {
  const pins = useMemo<MapPin[]>(() => {
    const stops = trip.days.flatMap((d, i) =>
      activeStops(d).flatMap((s, j) =>
        s.place ? [{ ...s.place, n: String(j + 1), label: s.name, color: dayColor(i) }] : [],
      ),
    )
    const hoods = (trip.stay ?? []).flatMap((n, i) =>
      n.place
        ? [
            {
              ...n.place,
              n: LETTERS[i] ?? '',
              label: n.name,
              color: RING[i] ?? '#c2482f',
              ring: true,
            },
          ]
        : [],
    )
    return [...hoods, ...stops]
  }, [trip])

  const busy = trip.job?.kind === 'stay'
  if (!trip.stay?.length)
    return (
      <EmptyState
        art="/media/empty-results"
        title="Where should you stay?"
        action={
          <Button
            variant="primary"
            disabled={!trip.destination || trip.job !== null}
            onClick={() => void compareStays(trip)}
          >
            <BedDouble /> {busy ? 'Comparing…' : 'Compare 3 neighbourhoods'}
          </Button>
        }
      >
        Natour suggests three areas of {trip.destination?.name ?? 'the city'} that suit this trip,
        checks each on OpenStreetMap, and measures how far your stops are from each. No bookings,
        prices or ratings: just where to look.
      </EmptyState>
    )

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,36%)]">
      <div>
        <ul className="grid gap-4 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          {trip.stay.map((n, i) => (
            <li key={n.name}>
              <HoodCard n={n} i={i} trip={trip} />
            </li>
          ))}
        </ul>
        <p className="text-muted mt-6 text-sm">
          Natour doesn't book anything and shows no prices or reviews. "Search stays" opens a plain
          search on that site, which has its own terms. Walking times are estimates from
          straight-line distance.{' '}
          <button
            type="button"
            className="text-accent-text underline underline-offset-4"
            disabled={trip.job !== null}
            onClick={() => void compareStays(trip)}
          >
            Suggest other areas
          </button>
        </p>
      </div>
      <aside
        aria-label="Map of the neighbourhoods and your stops"
        className="border-line sticky top-20 h-[50vh] overflow-hidden rounded-2xl border lg:h-[70vh]"
      >
        <MapSlot>
          <LazyMap
            pins={pins}
            lines={[]}
            label="Map: the three neighbourhoods as lettered rings, your stops as numbered pins"
            area={trip.destination?.bbox}
          />
        </MapSlot>
      </aside>
    </div>
  )
}

function HoodCard({ n, i, trip }: { n: Neighbourhood; i: number; trip: Trip }) {
  const r = reach(n, trip)
  const where = `${n.name}, ${trip.destination?.name ?? ''}`
  return (
    <article className="border-line bg-surface flex h-full flex-col rounded-2xl border p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="spec" style={{ color: RING[i] }}>
            Area {LETTERS[i]}
          </p>
          <h2 className="font-display mt-1 text-2xl font-semibold">{n.name}</h2>
        </div>
        <Stamp
          kind={n.place ? 'checked' : 'unchecked'}
          rim={n.place ? formatCoords(n.place) : undefined}
          size={48}
        />
      </div>
      <p className="mt-2">{n.vibe}</p>
      {n.goodFor && <p className="spec text-muted mt-2">Good for: {n.goodFor}</p>}
      <ul className="mt-4 flex flex-col gap-1.5 text-sm">
        {n.pros.map((p) => (
          <li key={p} className="flex gap-2">
            <Check className="text-live mt-0.5 size-4 shrink-0" aria-label="Pro" /> {p}
          </li>
        ))}
        {n.cons.map((c) => (
          <li key={c} className="text-muted flex gap-2">
            <Minus className="mt-0.5 size-4 shrink-0" aria-label="Con" /> {c}
          </li>
        ))}
      </ul>
      {r && (
        <div className="border-line mt-4 border-t pt-4 text-sm">
          <p className="spec text-muted">Walking to your stops</p>
          <p className="mt-1">
            Average <strong>{formatMinutes(r.avg)}</strong>
            {r.nearest && (
              <>
                , nearest {r.nearest.name} {formatMinutes(r.nearest.min)}
              </>
            )}
          </p>
          <details className="text-muted mt-1">
            <summary className="cursor-pointer text-xs">All {r.all.length} stops</summary>
            <ul className="mt-1 text-xs">
              {r.all.map((t) => (
                <li key={t.name}>
                  {t.name}: {formatMinutes(t.min)}
                </li>
              ))}
            </ul>
          </details>
        </div>
      )}
      <p className="spec text-muted mt-auto pt-5">Search stays</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Button asChild size="sm">
          <a
            href={`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(where)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="sr-only">Search stays in {n.name} on</span> Booking.com{' '}
            <ArrowUpRight />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </Button>
        <Button asChild size="sm">
          <a
            href={`https://www.airbnb.com/s/${encodeURIComponent(where)}/homes`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="sr-only">Search stays in {n.name} on</span> Airbnb <ArrowUpRight />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </Button>
      </div>
    </article>
  )
}
