import { Button } from '@/components/ui/button'
import { getClimate, getGuide, searchPhotos, searchPlaces, withUtm, type Photo } from '@/lib/api'
import { bestMonths, comfort, MONTHS, type ClimateMonth } from '@/lib/climate'
import { cn } from '@/lib/cn'
import { featured } from '@/lib/destinations'
import { formatCoords } from '@/lib/geo'
import { useLoad } from '@/lib/useLoad'
import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface Place {
  name: string
  country: string
  lat: number
  lon: number
  wiki: string
}

/** A featured destination, or any place OpenStreetMap knows by that name. */
async function resolve(slug: string): Promise<Place | null> {
  const f = featured(slug)
  if (f) return f
  const [hit] = await searchPlaces(slug, { limit: 1 })
  if (!hit) return null
  return {
    name: hit.name,
    country: hit.address.split(',').at(-1)?.trim() ?? '',
    lat: hit.lat,
    lon: hit.lon,
    wiki: hit.name,
  }
}

export function Destination() {
  const { place: slug } = useParams({ from: '/shell/app/explore/$place' })
  const place = useLoad(() => resolve(slug), [slug])
  const p = place.data
  const guide = useLoad(() => (p ? getGuide(p.wiki) : Promise.resolve(null)), [p?.wiki])
  const photos = useLoad(
    () => (p ? searchPhotos(`${p.name} ${p.country}`) : Promise.resolve([])),
    [p?.name],
  )
  const climate = useLoad(
    () => (p ? getClimate(p.lat, p.lon) : Promise.resolve(null)),
    [p?.lat, p?.lon],
  )

  if (place.loading) return <div className="flex-1" aria-busy="true" />
  if (!p)
    return (
      <div className="mx-auto max-w-3xl flex-1 px-6 py-24 text-center">
        <h1 className="font-display text-5xl font-semibold">Not on the map</h1>
        <p className="text-muted mt-3">
          {place.error ?? `OpenStreetMap doesn't know "${slug}". Check the spelling?`}
        </p>
        <Button asChild className="mt-6">
          <Link to="/app/explore">Back to Explore</Link>
        </Button>
      </div>
    )

  const [hero, ...more] = photos.data ?? []
  return (
    <article className="flex-1 pb-24">
      <header className="relative">
        <div className="bg-surface-2 relative h-[52vh] min-h-80 overflow-hidden">
          {hero && (
            <img
              src={hero.src}
              alt={hero.alt || `${p.name}, ${p.country}`}
              width={hero.width}
              height={hero.height}
              className="absolute inset-0 size-full object-cover"
              style={{ backgroundColor: hero.color ?? undefined }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-4 pb-8 text-white sm:px-6">
            <Link
              to="/app/explore"
              className="spec flex items-center gap-1 opacity-90 hover:opacity-100"
            >
              <ArrowLeft className="size-3.5" aria-hidden /> Explore
            </Link>
            <p className="spec mt-6 opacity-90">
              {p.country} · {formatCoords(p)}
            </p>
            <h1 className="font-display mt-1 text-6xl leading-none font-semibold sm:text-8xl">
              {p.name}
            </h1>
          </div>
        </div>
        {hero && <Credit photo={hero} className="mx-auto max-w-6xl px-4 pt-2 sm:px-6" />}
      </header>

      <div className="mx-auto mt-10 grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section aria-labelledby="guide-h">
          <h2 id="guide-h" className="spec text-muted">
            The short guide
          </h2>
          {guide.data ? (
            <>
              <div className="font-display mt-4 space-y-4 text-xl leading-relaxed first-letter:float-left first-letter:mr-2 first-letter:text-6xl first-letter:leading-none first-letter:font-semibold">
                {guide.data.extract
                  .split('\n')
                  .filter(Boolean)
                  .map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
              </div>
              <p className="text-muted mt-4 text-xs">
                From{' '}
                <a className="underline" href={guide.data.url}>
                  “{guide.data.title}” on Wikivoyage
                </a>
                , by its contributors, under{' '}
                <a className="underline" href="https://creativecommons.org/licenses/by-sa/4.0/">
                  CC BY-SA 4.0
                </a>
                .
              </p>
            </>
          ) : (
            <p className="text-muted mt-4">
              {guide.loading
                ? 'Loading the guide…'
                : 'Wikivoyage has no guide under this name yet.'}
            </p>
          )}
          <Button asChild variant="primary" size="lg" className="mt-8">
            <Link to="/app" search={{ describe: `4 days in ${p.name}, ${p.country}: ` }}>
              Plan a trip here <ArrowRight />
            </Link>
          </Button>
        </section>

        <aside className="flex flex-col gap-8">
          <BestMonths months={climate.data} failed={Boolean(climate.error)} />
          {more.length > 0 && (
            <ul className="grid grid-cols-2 gap-3" aria-label="More photos">
              {more.slice(0, 4).map((ph) => (
                <li key={ph.id}>
                  <img
                    src={ph.thumb}
                    alt={ph.alt || p.name}
                    width={ph.width}
                    height={ph.height}
                    loading="lazy"
                    className="aspect-[4/5] w-full rounded-xl object-cover"
                    style={{ backgroundColor: ph.color ?? undefined }}
                  />
                  <Credit photo={ph} className="mt-1" />
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </article>
  )
}

/** Unsplash's required credit: photographer and Unsplash, both linked with the app's UTM tags. */
function Credit({ photo, className }: { photo: Photo; className?: string }) {
  return (
    <p className={cn('text-muted text-[11px]', className)}>
      Photo by{' '}
      {photo.author.url ? (
        <a className="underline" href={withUtm(photo.author.url)}>
          {photo.author.name}
        </a>
      ) : (
        photo.author.name
      )}{' '}
      on{' '}
      <a className="underline" href={withUtm('https://unsplash.com/')}>
        Unsplash
      </a>
    </p>
  )
}

function BestMonths({ months, failed }: { months: ClimateMonth[] | null; failed: boolean }) {
  if (!months)
    return (
      <p className="text-muted text-sm">
        {failed ? 'Climate averages are unavailable right now.' : 'Loading climate averages…'}
      </p>
    )
  const best = bestMonths(months)
  return (
    <section aria-labelledby="best-h">
      <h2 id="best-h" className="spec text-muted">
        Best months to walk about
      </h2>
      <p className="font-display mt-2 text-2xl font-semibold">
        {best.length
          ? [...best]
              .sort((a, b) => a - b)
              .map((m) => MONTHS[m])
              .join(', ')
          : 'No month is ideal; pack for it'}
      </p>
      <ol
        className="mt-4 flex h-36 items-end gap-1"
        aria-label="Average daily high and rain by month"
      >
        {months.map((m, i) => (
          <li key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
            <span className="text-muted font-mono text-[10px]" aria-hidden>
              {Math.round(m.high)}°
            </span>
            <span
              className={cn('w-full rounded-t-md', best.includes(i) ? 'bg-accent' : 'bg-line')}
              style={{ height: `${String(Math.max(6, comfort(m) * 100))}%` }}
            />
            <span className="text-muted font-mono text-[10px]" aria-hidden>
              {MONTHS[i]?.[0]}
            </span>
            <span className="sr-only">
              {MONTHS[i]}: highs {Math.round(m.high)}°C, lows {Math.round(m.low)}°C,{' '}
              {m.rainMm.toFixed(1)} mm rain a day
            </span>
          </li>
        ))}
      </ol>
      <p className="text-muted mt-3 text-[11px]">
        Bar height: how comfortable the month is for walking (highs of 18–27 °C, little rain).
        Averages for 2001–2025 from{' '}
        <a className="underline" href="https://power.larc.nasa.gov/">
          NASA POWER
        </a>
        .
      </p>
    </section>
  )
}
