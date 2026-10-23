import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/cn'
import { db, type Trip } from '@/lib/db'
import { formatCoords } from '@/lib/geo'
import { Link } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { LoaderCircle } from 'lucide-react'
import { lazy, Suspense, type ReactNode } from 'react'
import { MONTHS } from '@/lib/climate'

// MapLibre is ~800 kB; only trip pages load it, after their text.
export const LazyMap = lazy(() => import('./MapView').then((m) => ({ default: m.MapView })))

export function MapSlot({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={<div className="graticule bg-surface-2 h-full min-h-80 w-full animate-pulse" />}
    >
      {children}
    </Suspense>
  )
}

const TABS = [
  { to: '/app/trip/$tripId', label: 'Plan' },
  { to: '/app/trip/$tripId/stay', label: 'Stay' },
  { to: '/app/trip/$tripId/pack', label: 'Pack' },
  { to: '/app/trip/$tripId/budget', label: 'Budget' },
] as const

/** Loads a trip live from IndexedDB and frames every trip page: title, tabs and what the AI is doing. */
export function TripFrame({
  tripId,
  children,
  wide = false,
}: {
  tripId: string
  children: (trip: Trip) => ReactNode
  wide?: boolean
}) {
  // undefined while loading, null when there's no such trip.
  const trip = useLiveQuery(() => db.trips.get(tripId).then((t) => t ?? null), [tripId])
  if (trip === undefined) return <div className="flex-1" aria-busy="true" />
  if (trip === null)
    return (
      <EmptyState
        art="/media/empty-results"
        title="This trip isn't here"
        action={
          <Button asChild variant="primary">
            <Link to="/app">Your trips</Link>
          </Button>
        }
      >
        Trips live in this browser. It may have been deleted, or made on another device.
      </EmptyState>
    )

  return (
    <div className={cn('mx-auto w-full flex-1 px-4 pt-8 pb-16 sm:px-6', !wide && 'max-w-6xl')}>
      <header className={cn('mb-6', wide && 'mx-auto max-w-6xl')}>
        <p className="spec text-muted flex flex-wrap gap-x-3">
          {trip.destination ? (
            <>
              <span>
                {trip.destination.name}, {trip.destination.country}
              </span>
              <span>{formatCoords(trip.destination)}</span>
            </>
          ) : (
            <span>Destination not set yet</span>
          )}
          <span>
            {trip.days.length} {trip.days.length === 1 ? 'day' : 'days'} · {MONTHS[trip.month - 1]}
          </span>
        </p>
        <h1 className="font-display mt-2 text-4xl leading-tight font-semibold sm:text-5xl">
          {trip.title}
        </h1>
        {trip.summary && <p className="text-muted mt-2 max-w-2xl">{trip.summary}</p>}
        <nav aria-label="Trip" className="border-line mt-5 flex gap-1 overflow-x-auto border-b">
          {TABS.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              params={{ tripId }}
              activeOptions={{ exact: true }}
              className="text-muted hover:text-text [&.active]:border-accent [&.active]:text-text -mb-px border-b-2 border-transparent px-3 py-2 text-sm font-medium"
            >
              {t.label}
            </Link>
          ))}
          <Link
            to="/app/journal"
            search={{ trip: tripId }}
            className="text-muted hover:text-text -mb-px border-b-2 border-transparent px-3 py-2 text-sm font-medium"
          >
            Journal
          </Link>
        </nav>
        <JobLine trip={trip} />
      </header>
      {children(trip)}
    </div>
  )
}

/** What the AI is doing right now, or the last error, announced politely. */
function JobLine({ trip }: { trip: Trip }) {
  return (
    <div role="status" aria-live="polite" className="min-h-0">
      {trip.job && (
        <p className="text-accent-text mt-3 flex items-center gap-2 text-sm">
          <LoaderCircle className="size-4 animate-spin" aria-hidden />
          {trip.job.label}…
          <span className="text-muted">Each place is checked on OpenStreetMap as it arrives.</span>
        </p>
      )}
      {!trip.job && trip.error && (
        <p className="border-danger/30 bg-danger/10 text-danger mt-3 rounded-xl border p-3 text-sm">
          {trip.error}{' '}
          {/provider|sign in/i.test(trip.error) && (
            <Link to="/settings" hash="ai" className="font-medium underline underline-offset-4">
              Open AI settings
            </Link>
          )}
        </p>
      )}
    </div>
  )
}
