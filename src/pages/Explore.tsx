import { Button } from '@/components/ui/button'
import { cn } from '@/lib/cn'
import { FEATURED, MOODS, roman, type Mood } from '@/lib/destinations'
import { formatCoords } from '@/lib/geo'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowUpRight, Search } from 'lucide-react'
import { useState } from 'react'

export function Explore() {
  const [mood, setMood] = useState<Mood | null>(null)
  const [q, setQ] = useState('')
  const navigate = useNavigate()
  const list = mood ? FEATURED.filter((f) => f.moods.includes(mood)) : FEATURED

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 pt-10 pb-24 sm:px-6">
      <p className="spec text-accent-text">Explore</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-6">
        <h1 className="font-display max-w-2xl text-5xl leading-[1.02] font-semibold sm:text-6xl">
          Somewhere worth the walk.
        </h1>
        <form
          role="search"
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            const name = q.trim()
            if (name.length >= 2)
              void navigate({ to: '/app/explore/$place', params: { place: name.slice(0, 80) } })
          }}
        >
          <label htmlFor="any-place" className="sr-only">
            Any city or region
          </label>
          <input
            id="any-place"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            maxLength={80}
            placeholder="Any city or region"
            className="border-line bg-surface h-11 w-56 rounded-full border px-4 text-sm"
          />
          <Button
            type="submit"
            variant="primary"
            size="icon"
            className="size-11"
            aria-label="Open guide"
          >
            <Search />
          </Button>
        </form>
      </div>

      <div role="group" aria-label="Moods" className="mt-10 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {MOODS.map((m) => (
          <button
            key={m.id}
            type="button"
            aria-pressed={mood === m.id}
            onClick={() => setMood(mood === m.id ? null : m.id)}
            className={cn(
              'group relative aspect-[4/5] overflow-hidden rounded-2xl text-left ring-offset-2 ring-offset-[var(--bg)]',
              mood === m.id && 'ring-accent-text ring-2',
            )}
          >
            <img
              src={`/media/mood-${m.id}.webp`}
              alt=""
              width={320}
              height={400}
              loading="lazy"
              className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 pt-10 font-medium text-white">
              {m.label}
            </span>
          </button>
        ))}
      </div>
      <p className="text-muted mt-2 text-xs">
        Mood pictures are illustrations, not the places below.
      </p>

      <ol
        className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
        aria-label="Destinations"
      >
        {list.map((f, i) => (
          <li
            key={f.slug}
            className={cn(
              i % 3 === 1 && 'lg:translate-y-10',
              i % 2 === 1 && 'sm:max-lg:translate-y-8',
            )}
          >
            <article className="group border-line hover:border-accent-text relative border-t pt-4 transition-colors">
              <p className="spec text-muted flex justify-between">
                <span>{roman(FEATURED.indexOf(f))}.</span>
                <span>{formatCoords(f)}</span>
              </p>
              <h2 className="font-display mt-3 text-4xl font-semibold">
                <Link
                  to="/app/explore/$place"
                  params={{ place: f.slug }}
                  className="after:absolute after:inset-0"
                >
                  {f.name}
                </Link>
              </h2>
              <p className="text-muted">{f.country}</p>
              <p className="mt-3">{f.line}</p>
              <p className="spec text-accent-text mt-4 flex items-center gap-1">
                Read the guide{' '}
                <ArrowUpRight
                  className="size-3.5 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </p>
            </article>
          </li>
        ))}
      </ol>
    </div>
  )
}
