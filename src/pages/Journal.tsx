import { EmptyState } from '@/components/EmptyState'
import { RouteSketch } from '@/components/RouteSketch'
import { Stamp } from '@/components/Stamp'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/cn'
import { activeStops, db, type JournalEntry, type Trip } from '@/lib/db'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { ImagePlus, Lock, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

export function Journal() {
  const { trip: tripId } = useSearch({ from: '/shell/app/journal' })
  const navigate = useNavigate()
  const trips = useLiveQuery(() => db.trips.orderBy('updatedAt').reverse().toArray(), [])
  const trip = trips?.find((t) => t.id === tripId) ?? trips?.[0]

  if (trips === undefined) return <div className="flex-1" aria-busy="true" />
  if (!trip)
    return (
      <EmptyState
        art="/media/empty-journal"
        title="Your journal is empty"
        action={
          <Button asChild variant="primary">
            <Link to="/app">Plan a trip</Link>
          </Button>
        }
      >
        After a trip, keep notes and photos for each day here, next to the route you walked.
      </EmptyState>
    )

  const allPoints = trip.days.flatMap(activeStops).flatMap((s) => (s.place ? [s.place] : []))
  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 pt-10 pb-24 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="spec text-accent-text">Journal</p>
          <h1 className="font-display mt-3 text-5xl font-semibold">{trip.title}</h1>
        </div>
        {trips.length > 1 && (
          <label className="flex flex-col gap-1">
            <span className="spec text-muted">Trip</span>
            <select
              value={trip.id}
              onChange={(e) =>
                void navigate({ to: '/app/journal', search: { trip: e.target.value } })
              }
              className="border-line bg-surface h-10 rounded-xl border px-3 text-sm"
            >
              {trips.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <p className="border-line bg-surface mt-4 flex items-center gap-2 rounded-xl border p-3 text-sm">
        <Lock className="text-live size-4 shrink-0" aria-hidden />
        Your journal stays on this device. Notes and photos are never uploaded or sent to any AI.
      </p>

      <figure className="border-line bg-surface mt-8 overflow-hidden rounded-2xl border">
        <RouteSketch points={allPoints} width={900} height={260} className="w-full" />
        <figcaption className="spec text-muted border-line border-t px-4 py-2">
          The whole route · {allPoints.length} places
        </figcaption>
      </figure>

      <ol className="mt-12 flex flex-col gap-16">
        {trip.days.map((_, i) => (
          <JournalDay key={`${trip.id}-${String(i)}`} trip={trip} day={i} />
        ))}
      </ol>
    </div>
  )
}

// Phone photos are 3-12 MB; a 1600px JPEG keeps a journal of hundreds of them small.
async function shrink(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file)
  const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height))
  const canvas = new OffscreenCanvas(Math.round(bmp.width * k), Math.round(bmp.height * k))
  canvas.getContext('2d')?.drawImage(bmp, 0, 0, canvas.width, canvas.height)
  bmp.close()
  return canvas.convertToBlob({ type: 'image/jpeg', quality: 0.82 })
}

function JournalDay({ trip, day }: { trip: Trip; day: number }) {
  const id = `${trip.id}:${String(day)}`
  const entry = useLiveQuery(() => db.journal.get(id), [id])
  const [notes, setNotes] = useState<string | null>(null)
  const stops = activeStops(trip.days[day] ?? { stops: [], rainy: null, useRainy: false })
  const points = stops.flatMap((s) => (s.place ? [s.place] : []))

  const save = (patch: Partial<JournalEntry>) =>
    db.transaction('rw', db.journal, async () => {
      const cur = (await db.journal.get(id)) ?? {
        id,
        tripId: trip.id,
        day,
        notes: '',
        photos: [],
        visited: false,
        updatedAt: 0,
      }
      await db.journal.put({ ...cur, ...patch, updatedAt: Date.now() })
    })

  return (
    <li
      aria-labelledby={`j-${String(day)}`}
      className="grid gap-6 md:grid-cols-[16rem_minmax(0,1fr)]"
    >
      <div className="relative">
        <h2 id={`j-${String(day)}`} className="font-display text-3xl font-semibold">
          Day {day + 1}
        </h2>
        <div className="bg-surface shadow-card relative mt-4 rotate-[-2deg] rounded-sm p-2">
          <span
            className="absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 rotate-[3deg] bg-[#e9dcb8]/80"
            aria-hidden
          />
          <RouteSketch points={points} width={240} height={170} className="w-full" />
        </div>
        <ol className="text-muted mt-4 text-sm">
          {stops.map((s, j) => (
            <li key={s.id}>
              {j + 1}. {s.name}
            </li>
          ))}
        </ol>
        {entry?.visited && (
          <Stamp kind="visited" size={84} animate className="absolute top-0 right-0" />
        )}
      </div>

      <div>
        <label htmlFor={`notes-${String(day)}`} className="spec text-muted">
          Notes
        </label>
        <textarea
          id={`notes-${String(day)}`}
          value={notes ?? entry?.notes ?? ''}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => {
            if (notes !== null) void save({ notes })
          }}
          rows={5}
          maxLength={5000}
          placeholder="What happened, what you ate, who you met…"
          className="border-line bg-surface mt-2 w-full rounded-2xl border p-4 leading-relaxed"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="border-line bg-surface hover:bg-surface-2 focus-within:outline-accent-text inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-medium focus-within:outline-2">
            <ImagePlus className="size-4" aria-hidden /> Add photos
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(e) => {
                const files = [...(e.target.files ?? [])].slice(0, 12)
                e.target.value = ''
                void Promise.all(files.map(shrink))
                  .then((blobs) =>
                    save({ photos: [...(entry?.photos ?? []), ...blobs].slice(0, 24) }),
                  )
                  .catch(() => toast.error('Those photos could not be read.'))
              }}
            />
          </label>
          <button
            type="button"
            aria-pressed={entry?.visited ?? false}
            onClick={() => void save({ visited: !entry?.visited })}
            className={cn(
              'h-9 rounded-full px-4 text-sm font-medium',
              entry?.visited
                ? 'bg-accent text-accent-ink'
                : 'border-line text-muted hover:text-text border',
            )}
          >
            {entry?.visited ? 'Visited' : 'Mark as visited'}
          </button>
        </div>
        {entry && entry.photos.length > 0 && (
          <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {entry.photos.map((b, k) => (
              <li key={k} className="relative">
                <BlobImage blob={b} alt={`Day ${String(day + 1)}, photo ${String(k + 1)}`} />
                <button
                  type="button"
                  onClick={() => void save({ photos: entry.photos.filter((_, x) => x !== k) })}
                  className="bg-bg/85 absolute top-1 right-1 rounded-full p-1"
                  aria-label={`Remove photo ${String(k + 1)}`}
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  )
}

/** A photo from IndexedDB; its object URL is made and freed with the element. */
function BlobImage({ blob, alt }: { blob: Blob; alt: string }) {
  const img = useRef<HTMLImageElement>(null)
  useEffect(() => {
    const u = URL.createObjectURL(blob)
    if (img.current) img.current.src = u
    return () => URL.revokeObjectURL(u)
  }, [blob])
  return <img ref={img} alt={alt} className="aspect-square w-full rounded-lg object-cover" />
}
