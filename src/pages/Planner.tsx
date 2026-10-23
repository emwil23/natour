import { EffortBar } from '@/components/EffortBar'
import { dayColor, type MapLine, type MapPin } from '@/components/MapView'
import { Stamp } from '@/components/Stamp'
import { LazyMap, MapSlot, TripFrame } from '@/components/TripFrame'
import { Button } from '@/components/ui/button'
import { PlacesUnavailable, searchPlaces } from '@/lib/api'
import type { ApiPlace } from '@/lib/check'
import { cn } from '@/lib/cn'
import { activeStops, updateTrip, type Day, type Stop, type Trip } from '@/lib/db'
import { dayStats, formatCoords, formatMinutes, legs, viewbox } from '@/lib/geo'
import { addPlace, editStop, moveStop, rainyDay, refineDay } from '@/lib/trips'
import {
  closestCorners,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useParams } from '@tanstack/react-router'
import {
  CloudRain,
  GripVertical,
  List,
  Lock,
  LockOpen,
  Map as MapIcon,
  Plus,
  RefreshCw,
  Search,
  Sun,
  Trash2,
  Columns3,
  Footprints,
} from 'lucide-react'
import { useMemo, useState, type SubmitEvent } from 'react'
import { toast } from 'sonner'

const KIND_LABEL: Record<Stop['kind'], string> = {
  sight: 'Sight',
  food: 'Food',
  view: 'Viewpoint',
  walk: 'Walk',
  museum: 'Museum',
  nature: 'Nature',
  shop: 'Shopping',
  night: 'Evening',
  beach: 'Beach',
}

const pad = (n: number) => String(n).padStart(2, '0')

export function Planner() {
  const { tripId } = useParams({ from: '/shell/app/trip/$tripId' })
  return (
    <TripFrame tripId={tripId} wide>
      {(trip) => <PlannerBody trip={trip} />}
    </TripFrame>
  )
}

function PlannerBody({ trip }: { trip: Trip }) {
  const [view, setView] = useState<'board' | 'list'>('board')
  const [showMap, setShowMap] = useState(false)
  const [focus, setFocus] = useState<number | null>(null)
  const empty = trip.days.every((d) => activeStops(d).length === 0)

  const { pins, lines } = useMemo(() => mapData(trip, focus), [trip, focus])

  return (
    <div>
      <div className="mx-auto mb-4 flex max-w-6xl flex-wrap items-center gap-2">
        <div role="group" aria-label="View" className="border-line flex rounded-full border p-0.5">
          <ToggleButton pressed={view === 'board'} onClick={() => setView('board')}>
            <Columns3 /> Days
          </ToggleButton>
          <ToggleButton pressed={view === 'list'} onClick={() => setView('list')}>
            <List /> List
          </ToggleButton>
        </div>
        <Button
          size="sm"
          className="lg:hidden"
          aria-pressed={showMap}
          onClick={() => setShowMap((v) => !v)}
        >
          <MapIcon /> {showMap ? 'Hide map' : 'Show map'}
        </Button>
        {trip.dropped > 0 && (
          <p className="text-muted ml-auto text-sm">
            <Stamp kind="checked" size={22} className="mr-1 inline" />
            {trip.dropped} {trip.dropped === 1 ? 'suggestion' : 'suggestions'} didn't exist on
            OpenStreetMap and {trip.dropped === 1 ? 'was' : 'were'} dropped.
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,38%)]">
        <div className="min-w-0">
          {empty && trip.job ? (
            <PlanningPlaceholder days={trip.days.length} />
          ) : view === 'board' ? (
            <Board trip={trip} />
          ) : (
            <ListView trip={trip} />
          )}
        </div>
        <aside
          aria-label="Map"
          className={cn(
            'border-line bg-surface-2 sticky top-20 h-[60vh] overflow-hidden rounded-2xl border lg:block lg:h-[calc(100dvh-7rem)]',
            !showMap && 'hidden',
          )}
        >
          <div className="flex flex-wrap gap-1 p-2" role="group" aria-label="Days on the map">
            <ToggleButton small pressed={focus === null} onClick={() => setFocus(null)}>
              All days
            </ToggleButton>
            {trip.days.map((_, i) => (
              <ToggleButton key={i} small pressed={focus === i} onClick={() => setFocus(i)}>
                <span className="size-2 rounded-full" style={{ background: dayColor(i) }} />
                Day {i + 1}
              </ToggleButton>
            ))}
          </div>
          <MapSlot>
            <LazyMap
              pins={pins}
              lines={lines}
              label={`Map of ${trip.title}: stops and walking routes`}
              area={trip.destination?.bbox}
              className="h-[calc(100%-2.75rem)] w-full"
            />
          </MapSlot>
        </aside>
      </div>
    </div>
  )
}

function mapData(trip: Trip, focus: number | null) {
  const pins: MapPin[] = []
  const lines: MapLine[] = []
  trip.days.forEach((d, i) => {
    if (focus !== null && focus !== i) return
    const placed = activeStops(d).flatMap((s, j) =>
      s.place ? [{ ...s.place, n: String(j + 1), label: s.name, color: dayColor(i) }] : [],
    )
    pins.push(...placed)
    lines.push({ id: String(i), color: dayColor(i), points: placed })
  })
  return { pins, lines }
}

function ToggleButton({
  pressed,
  onClick,
  children,
  small = false,
}: {
  pressed: boolean
  onClick: () => void
  children: React.ReactNode
  small?: boolean
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-full font-medium [&_svg]:size-4',
        small ? 'bg-surface/90 px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm',
        pressed ? 'bg-text text-bg' : 'text-muted hover:text-text',
      )}
    >
      {children}
    </button>
  )
}

function PlanningPlaceholder({ days }: { days: number }) {
  return (
    <div className="flex gap-4 overflow-hidden" aria-hidden>
      {Array.from({ length: Math.min(days, 3) }, (_, i) => (
        <div key={i} className="border-line bg-surface w-72 shrink-0 rounded-2xl border p-4">
          <p className="spec text-muted">Day {pad(i + 1)}</p>
          <svg viewBox="0 0 200 260" className="mt-4 w-full">
            <path
              d="M30 20 C 160 40, 40 110, 150 140 S 60 230, 170 245"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="0.1 12"
              className="march"
            />
          </svg>
        </div>
      ))}
    </div>
  )
}

// ---------- Board: days as columns, drag stops between them ----------

function Board({ trip }: { trip: Trip }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function onDragEnd(e: DragEndEvent) {
    const id = String(e.active.id)
    const overId = e.over ? String(e.over.id) : null
    if (!overId || overId === id) return
    const from = trip.days.findIndex((d) => activeStops(d).some((s) => s.id === id))
    let to = trip.days.findIndex((d) => activeStops(d).some((s) => s.id === overId))
    let index = to >= 0 ? activeStops(trip.days[to] as Day).findIndex((s) => s.id === overId) : -1
    if (to < 0 && overId.startsWith('day-')) {
      to = Number(overId.slice(4))
      index = activeStops(trip.days[to] as Day).length
    }
    if (from < 0 || to < 0) return
    void moveStop(trip.id, from, id, to, index)
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={onDragEnd}>
      <ol className="flex snap-x gap-4 overflow-x-auto pb-4" aria-label="Days">
        {trip.days.map((d, i) => (
          <DayColumn key={i} trip={trip} day={d} index={i} />
        ))}
      </ol>
    </DndContext>
  )
}

function DayColumn({ trip, day, index }: { trip: Trip; day: Day; index: number }) {
  const stops = activeStops(day)
  const stats = dayStats(stops.map((s) => s.place))
  const legList = legs(stops.map((s) => s.place))
  const busy = trip.job?.day === index
  const { setNodeRef, isOver } = useDroppable({ id: `day-${String(index)}` })
  const locked = trip.job !== null

  return (
    <li
      className={cn(
        'border-line bg-surface relative flex w-[19rem] shrink-0 snap-start flex-col rounded-2xl border',
        isOver && 'border-accent-text',
      )}
      aria-labelledby={`day-${String(index)}-h`}
    >
      <header className="border-line border-b p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 id={`day-${String(index)}-h`} className="spec flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ background: dayColor(index) }} />
            Day {pad(index + 1)}
          </h2>
          <EffortBar effort={stats.effort} />
        </div>
        <p className="spec text-muted mt-2">
          {stats.km.toFixed(1)} km · {formatMinutes(stats.minutes)} walking
        </p>
        {day.rainy && (
          <div role="group" aria-label="Weather version" className="mt-3 flex gap-1">
            <button
              type="button"
              aria-pressed={!day.useRainy}
              onClick={() => void setRainy(trip.id, index, false)}
              className="aria-pressed:bg-text aria-pressed:text-bg text-muted flex items-center gap-1 rounded-full px-2.5 py-1 text-xs [&_svg]:size-3.5"
            >
              <Sun aria-hidden /> Sunny plan
            </button>
            <button
              type="button"
              aria-pressed={day.useRainy}
              onClick={() => void setRainy(trip.id, index, true)}
              className="aria-pressed:bg-text aria-pressed:text-bg text-muted flex items-center gap-1 rounded-full px-2.5 py-1 text-xs [&_svg]:size-3.5"
            >
              <CloudRain aria-hidden /> Rainy plan
            </button>
          </div>
        )}
      </header>

      <SortableContext items={stops.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <ol
          ref={setNodeRef}
          className="flex min-h-24 flex-1 flex-col gap-0 p-3"
          aria-label={`Day ${String(index + 1)} stops`}
        >
          {stops.map((s, j) => (
            <li key={s.id}>
              {legList[j] && (
                <p className="spec text-muted flex items-center gap-1.5 py-1.5 pl-9">
                  <Footprints className="size-3.5" aria-hidden />
                  {formatMinutes(legList[j].minutes)} walk
                </p>
              )}
              <StopCard trip={trip} stop={s} day={index} n={j + 1} disabled={locked} />
            </li>
          ))}
          {!stops.length && (
            <li className="text-muted grid flex-1 place-items-center p-6 text-center text-sm">
              No stops yet. Drag one here or add a place.
            </li>
          )}
        </ol>
      </SortableContext>

      <DayActions trip={trip} index={index} disabled={locked} />
      {busy && (
        <div className="bg-surface/80 absolute inset-0 grid place-items-center rounded-2xl backdrop-blur-[1px]">
          <svg viewBox="0 0 120 40" className="w-32" aria-hidden>
            <path
              d="M6 30 C 30 0, 60 40, 114 10"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray="0.1 9"
              className="march"
            />
          </svg>
        </div>
      )}
    </li>
  )
}

const setRainy = (tripId: string, day: number, useRainy: boolean) =>
  updateTrip(tripId, (t) => {
    const d = t.days[day]
    if (d) d.useRainy = useRainy
  })

function StopCard({
  trip,
  stop,
  day,
  n,
  disabled,
}: {
  trip: Trip
  stop: Stop
  day: number
  n: number
  disabled: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: stop.id,
    disabled,
  })
  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'group border-line bg-bg/60 relative flex gap-2 rounded-xl border p-3',
        isDragging && 'shadow-card z-10 opacity-90',
      )}
    >
      <button
        type="button"
        className="text-muted hover:text-text -ml-1 h-fit cursor-grab touch-none rounded p-0.5"
        aria-label={`Drag ${stop.name}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" aria-hidden />
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <span
            className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full font-mono text-[11px] font-bold text-white"
            style={{ background: dayColor(day) }}
            aria-hidden
          >
            {n}
          </span>
          <h3 className="min-w-0 flex-1 leading-snug font-semibold">
            {stop.place ? (
              <a
                href={`https://www.openstreetmap.org/${stop.place.osm}`}
                className="hover:underline"
                title={stop.place.address}
              >
                {stop.name}
              </a>
            ) : (
              stop.name
            )}
          </h3>
          <Stamp
            kind={stop.place ? 'checked' : 'unchecked'}
            rim={stop.place ? formatCoords(stop.place) : undefined}
            size={40}
            animate
          />
        </div>
        <p className="spec text-muted mt-1">
          {KIND_LABEL[stop.kind]} · {formatMinutes(stop.minutes)} there
          <span className="sr-only">
            {stop.place
              ? `. Checked on OpenStreetMap at ${formatCoords(stop.place)}`
              : '. Not checked on OpenStreetMap'}
          </span>
        </p>
        {stop.why && <p className="text-muted mt-1.5 text-sm">{stop.why}</p>}
        <div className="mt-2 flex items-center gap-1">
          <button
            type="button"
            aria-pressed={stop.locked}
            disabled={disabled}
            onClick={() => void editStop(trip.id, day, stop.id, { locked: !stop.locked })}
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-1 text-xs [&_svg]:size-3.5',
              stop.locked ? 'bg-accent text-accent-ink' : 'text-muted hover:text-text',
            )}
          >
            {stop.locked ? <Lock aria-hidden /> : <LockOpen aria-hidden />}
            {stop.locked ? 'Locked' : 'Lock'}
          </button>
          <label className="sr-only" htmlFor={`move-${stop.id}`}>
            Move {stop.name} to
          </label>
          <select
            id={`move-${stop.id}`}
            value={day}
            disabled={disabled}
            onChange={(e) => {
              const to = Number(e.target.value)
              void moveStop(trip.id, day, stop.id, to, Infinity)
            }}
            className="text-muted hover:text-text rounded-full bg-transparent px-1 py-1 text-xs"
          >
            {trip.days.map((_, i) => (
              <option key={i} value={i}>
                {i === day ? `Day ${String(i + 1)}` : `Move to day ${String(i + 1)}`}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={disabled}
            onClick={() => void editStop(trip.id, day, stop.id, null)}
            className="text-muted hover:text-danger ml-auto rounded-full p-1"
            aria-label={`Remove ${stop.name}`}
          >
            <Trash2 className="size-3.5" aria-hidden />
          </button>
        </div>
      </div>
    </article>
  )
}

function DayActions({ trip, index, disabled }: { trip: Trip; index: number; disabled: boolean }) {
  const [instruction, setInstruction] = useState('')
  const [adding, setAdding] = useState(false)
  const canAi = Boolean(trip.destination) && !disabled
  return (
    <footer className="border-line flex flex-col gap-2 border-t p-3">
      <div className="flex flex-wrap gap-1.5">
        <Button
          size="sm"
          variant="ai"
          disabled={!canAi}
          onClick={() =>
            void refineDay(
              trip,
              index,
              'Replace the unlocked stops with different places that fit the trip.',
            )
          }
        >
          <RefreshCw /> New ideas
        </Button>
        <Button size="sm" variant="ai" disabled={!canAi} onClick={() => void rainyDay(trip, index)}>
          <CloudRain /> Rainy day
        </Button>
        <Button
          size="sm"
          variant="ai"
          disabled={!canAi}
          onClick={() =>
            void refineDay(
              trip,
              index,
              'Keep every stop and add one more place on the way between two of them, where the walk is longest.',
            )
          }
        >
          <Footprints /> Stop on the way
        </Button>
      </div>
      <form
        className="flex gap-1.5"
        onSubmit={(e) => {
          e.preventDefault()
          if (instruction.trim().length < 3) return
          void refineDay(trip, index, instruction.trim())
          setInstruction('')
        }}
      >
        <label className="sr-only" htmlFor={`refine-${String(index)}`}>
          Change day {index + 1}
        </label>
        <input
          id={`refine-${String(index)}`}
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          maxLength={200}
          disabled={!canAi}
          placeholder="Slower morning, more food…"
          className="border-line bg-bg/60 h-8 min-w-0 flex-1 rounded-full border px-3 text-xs"
        />
        <Button size="sm" type="submit" disabled={!canAi}>
          Change
        </Button>
      </form>
      {adding ? (
        <AddPlace trip={trip} day={index} onDone={() => setAdding(false)} />
      ) : (
        <Button
          size="sm"
          variant="ghost"
          disabled={disabled || !trip.destination}
          onClick={() => setAdding(true)}
        >
          <Plus /> Add a place
        </Button>
      )}
    </footer>
  )
}

/** Search OpenStreetMap for a place to add. On submit only: Nominatim forbids search-as-you-type. */
function AddPlace({ trip, day, onDone }: { trip: Trip; day: number; onDone: () => void }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<ApiPlace[] | null>(null)
  const [busy, setBusy] = useState(false)

  async function search(e: SubmitEvent) {
    e.preventDefault()
    if (q.trim().length < 2 || !trip.destination) return
    setBusy(true)
    try {
      setResults(await searchPlaces(q.trim(), { near: viewbox(trip.destination.bbox), limit: 5 }))
    } catch (err) {
      toast.error(err instanceof PlacesUnavailable ? err.message : 'Search failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="border-line rounded-xl border p-2">
      <form onSubmit={(e) => void search(e)} className="flex gap-1.5">
        <label className="sr-only" htmlFor={`add-${String(day)}`}>
          Find a place in {trip.destination?.name}
        </label>
        <input
          id={`add-${String(day)}`}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          maxLength={120}
          placeholder={`A place in ${trip.destination?.name ?? 'town'}`}
          className="bg-bg/60 border-line h-8 min-w-0 flex-1 rounded-full border px-3 text-xs"
        />
        <Button size="sm" type="submit" disabled={busy} aria-label="Search OpenStreetMap">
          <Search />
        </Button>
      </form>
      {results && (
        <ul className="mt-2 flex flex-col gap-1" aria-label="Places found">
          {results.length === 0 && (
            <li className="text-muted p-2 text-xs">Nothing found nearby.</li>
          )}
          {results.map((r) => (
            <li key={r.osm}>
              <button
                type="button"
                onClick={() => {
                  void addPlace(trip.id, day, r)
                  onDone()
                }}
                className="hover:bg-surface-2 w-full rounded-lg p-2 text-left text-xs"
              >
                <span className="block font-medium">{r.name}</span>
                <span className="text-muted line-clamp-1">{r.address}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <button type="button" onClick={onDone} className="text-muted mt-1 px-2 text-xs underline">
        Cancel
      </button>
    </div>
  )
}

// ---------- List: every day as plain text, the accessible view of the map ----------

function ListView({ trip }: { trip: Trip }) {
  return (
    <ol className="flex flex-col gap-8">
      {trip.days.map((d, i) => {
        const stops = activeStops(d)
        const stats = dayStats(stops.map((s) => s.place))
        const legList = legs(stops.map((s) => s.place))
        return (
          <li key={i} aria-labelledby={`list-day-${String(i)}`}>
            <h2 id={`list-day-${String(i)}`} className="font-display text-2xl font-semibold">
              Day {i + 1}
              {d.useRainy && d.rainy ? ' (rainy plan)' : ''}
            </h2>
            <p className="text-muted text-sm">
              {stats.km.toFixed(1)} km, {formatMinutes(stats.minutes)} walking ·{' '}
              <EffortBar effort={stats.effort} />
            </p>
            <ol className="border-line mt-3 flex flex-col gap-3 border-l-2 border-dashed pl-5">
              {stops.map((s, j) => (
                <li key={s.id}>
                  {legList[j] && (
                    <p className="text-muted text-xs">
                      Then walk {formatMinutes(legList[j].minutes)} ({legList[j].km.toFixed(1)} km)
                    </p>
                  )}
                  <p className="font-semibold">
                    {j + 1}. {s.name}
                  </p>
                  <p className="text-muted text-sm">
                    {KIND_LABEL[s.kind]}, {formatMinutes(s.minutes)} there.{' '}
                    {s.place ? `${s.place.address}.` : 'Not checked on OpenStreetMap.'} {s.why}
                  </p>
                </li>
              ))}
              {!stops.length && <li className="text-muted text-sm">No stops yet.</li>}
            </ol>
          </li>
        )
      })}
    </ol>
  )
}
