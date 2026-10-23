import { EmptyState } from '@/components/EmptyState'
import { TripFrame } from '@/components/TripFrame'
import { Button } from '@/components/ui/button'
import { getClimate } from '@/lib/api'
import { MONTHS, type ClimateMonth } from '@/lib/climate'
import { cn } from '@/lib/cn'
import { updateTrip, uid, type PackItem, type Trip } from '@/lib/db'
import { makePackingList } from '@/lib/trips'
import { useLoad } from '@/lib/useLoad'
import { useParams } from '@tanstack/react-router'
import { Backpack, CloudRain, Plus, Thermometer, Trash2 } from 'lucide-react'
import { useState } from 'react'

const GROUPS: { id: PackItem['group']; label: string }[] = [
  { id: 'clothes', label: 'Clothes' },
  { id: 'gear', label: 'Gear' },
  { id: 'documents', label: 'Documents' },
  { id: 'health', label: 'Health' },
]

export function Pack() {
  const { tripId } = useParams({ from: '/shell/app/trip/$tripId/pack' })
  return <TripFrame tripId={tripId}>{(trip) => <PackBody trip={trip} />}</TripFrame>
}

function PackBody({ trip }: { trip: Trip }) {
  const dest = trip.destination
  const climate = useLoad(
    () => (dest ? getClimate(dest.lat, dest.lon) : Promise.resolve(null)),
    [dest?.lat, dest?.lon],
  )
  const month = climate.data?.[trip.month - 1] ?? null
  const items = trip.packing
  const packed = items?.filter((i) => i.packed).length ?? 0

  return (
    <div className="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <aside className="flex flex-col gap-4">
        <ClimateCard
          month={month}
          name={MONTHS[trip.month - 1] ?? ''}
          failed={Boolean(climate.error)}
        />
        {items && (
          <div className="border-line bg-surface rounded-2xl border p-5">
            <p className="spec text-muted">Packed</p>
            <p className="font-display mt-1 text-4xl font-semibold">
              {packed}
              <span className="text-muted text-xl"> / {items.length}</span>
            </p>
            <div
              className="bg-surface-2 mt-3 h-2 overflow-hidden rounded-full"
              role="progressbar"
              aria-label="Packed"
              aria-valuemin={0}
              aria-valuemax={items.length}
              aria-valuenow={packed}
            >
              <div
                className="bg-live h-full rounded-full transition-[width]"
                style={{ width: `${String(items.length ? (packed / items.length) * 100 : 0)}%` }}
              />
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="mt-4"
              disabled={trip.job !== null}
              onClick={() => {
                if (confirm('Write a new list? Your ticks and own items on this one go.'))
                  void makePackingList(trip)
              }}
            >
              Write a new list
            </Button>
          </div>
        )}
      </aside>

      {!items ? (
        <EmptyState
          art="/media/empty-packing"
          title="Nothing packed yet"
          action={
            <Button
              variant="primary"
              disabled={!dest || trip.job !== null}
              onClick={() => void makePackingList(trip)}
            >
              <Backpack /> {trip.job?.kind === 'pack' ? 'Writing…' : 'Write my packing list'}
            </Button>
          }
        >
          Built from {MONTHS[trip.month - 1]}'s climate averages in{' '}
          {dest?.name ?? 'your destination'}, what you'll be doing and {trip.days.length} days away.
          Ticks are saved on this device.
        </EmptyState>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {GROUPS.map((g) => (
            <Group key={g.id} trip={trip} group={g.id} label={g.label} items={items} />
          ))}
        </div>
      )}
    </div>
  )
}

function ClimateCard({
  month,
  name,
  failed,
}: {
  month: ClimateMonth | null
  name: string
  failed: boolean
}) {
  return (
    <div className="border-line bg-surface rounded-2xl border p-5">
      <p className="spec text-muted">{name} on average</p>
      {month ? (
        <dl className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <dt className="text-muted flex items-center gap-1 text-xs">
              <Thermometer className="size-3.5" aria-hidden /> Highs / lows
            </dt>
            <dd className="font-display text-2xl font-semibold">
              {Math.round(month.high)}°{' '}
              <span className="text-muted">/ {Math.round(month.low)}°</span>
            </dd>
          </div>
          <div>
            <dt className="text-muted flex items-center gap-1 text-xs">
              <CloudRain className="size-3.5" aria-hidden /> Rain a day
            </dt>
            <dd className="font-display text-2xl font-semibold">{month.rainMm.toFixed(1)} mm</dd>
          </div>
        </dl>
      ) : (
        <p className="text-muted mt-2 text-sm">
          {failed ? 'Climate averages are unavailable right now.' : 'Loading climate averages…'}
        </p>
      )}
      <p className="text-muted mt-3 text-[11px]">
        Averages for 2001–2025 from{' '}
        <a className="underline" href="https://power.larc.nasa.gov/">
          NASA POWER
        </a>
        , not a forecast.
      </p>
    </div>
  )
}

const setItems = (tripId: string, change: (items: PackItem[]) => void) =>
  updateTrip(tripId, (t) => {
    if (t.packing) change(t.packing)
  })

function Group({
  trip,
  group,
  label,
  items,
}: {
  trip: Trip
  group: PackItem['group']
  label: string
  items: PackItem[]
}) {
  const [draft, setDraft] = useState('')
  const mine = items.filter((i) => i.group === group)
  return (
    <section
      aria-labelledby={`g-${group}`}
      className="border-line bg-surface rounded-2xl border p-5"
    >
      <h2 id={`g-${group}`} className="font-display text-2xl font-semibold">
        {label}
      </h2>
      <ul className="mt-3 flex flex-col">
        {mine.map((it) => (
          <li
            key={it.id}
            className="group border-line flex items-start gap-3 border-b py-2 last:border-0"
          >
            <input
              id={`p-${it.id}`}
              type="checkbox"
              checked={it.packed}
              onChange={() =>
                void setItems(trip.id, (list) => {
                  const x = list.find((i) => i.id === it.id)
                  if (x) x.packed = !x.packed
                })
              }
              className="accent-live mt-1 size-4"
            />
            <label htmlFor={`p-${it.id}`} className="min-w-0 flex-1 cursor-pointer">
              <span className={cn(it.packed && 'text-muted line-through')}>
                {it.qty > 1 && <span className="font-mono text-xs">{it.qty}× </span>}
                {it.item}
              </span>
              {it.why && <span className="text-muted block text-xs">{it.why}</span>}
            </label>
            <button
              type="button"
              aria-label={`Remove ${it.item}`}
              onClick={() =>
                void setItems(trip.id, (list) => {
                  const i = list.findIndex((x) => x.id === it.id)
                  if (i >= 0) list.splice(i, 1)
                })
              }
              className="text-muted hover:text-danger p-1 opacity-60 group-hover:opacity-100"
            >
              <Trash2 className="size-3.5" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          const item = draft.trim()
          if (!item) return
          void setItems(trip.id, (list) =>
            list.push({
              id: uid(),
              group,
              item: item.slice(0, 60),
              qty: 1,
              why: '',
              packed: false,
            }),
          )
          setDraft('')
        }}
      >
        <label className="sr-only" htmlFor={`add-${group}`}>
          Add to {label.toLowerCase()}
        </label>
        <input
          id={`add-${group}`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={60}
          placeholder="Add an item"
          className="border-line bg-bg/60 h-8 min-w-0 flex-1 rounded-full border px-3 text-sm"
        />
        <Button size="sm" type="submit" aria-label={`Add to ${label.toLowerCase()}`}>
          <Plus />
        </Button>
      </form>
    </section>
  )
}
