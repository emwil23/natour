import { useEffect, useState } from 'react'
import { InkTrail } from './InkTrail'
import { Postcard } from './Postcard'
import { Route, Words } from './Route'

const COVER_LINES = [
  { page: '04', text: 'Every place on your plan, checked on OpenStreetMap', href: '#how' },
  { page: '12', text: 'Postcards from a plan: real stops, real stamps', href: '#plan' },
  { page: '20', text: 'Walk it: routes, times and how hard a day is', href: '#go' },
  { page: '28', text: 'A journal that never leaves your phone', href: '#remember' },
]

/**
 * Topographic lines behind the cover, baked by scripts/contours.mjs. Decoration only, so they load after
 * the page has painted and never weigh on the prerendered HTML.
 */
function Contours() {
  const [paths, setPaths] = useState<string[] | null>(null)
  useEffect(() => {
    let live = true
    void import('./contours.json').then((m) => live && setPaths(m.default))
    return () => {
      live = false
    }
  }, [])
  return (
    <svg
      viewBox="0 0 1200 750"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className="contour-drift pointer-events-none absolute -inset-[6%] h-[112%] w-[112%] opacity-0 transition-opacity duration-[1500ms] data-[on]:opacity-100"
      data-on={paths ? '' : undefined}
    >
      {paths?.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke={i % 4 === 0 ? 'var(--accent)' : 'var(--text)'}
          strokeOpacity={i % 4 === 0 ? 0.32 : 0.13}
          strokeWidth={i % 4 === 0 ? 1.3 : 0.9}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  )
}

/** The cover: a travel magazine's front page on map paper. */
export function Cover({ animate }: { animate: boolean }) {
  return (
    <section
      aria-labelledby="cover-h"
      data-cover
      className="bg-bg relative isolate flex min-h-[100svh] flex-col overflow-hidden pt-24 pb-10"
    >
      <Contours />
      <InkTrail enabled={animate} />
      {/* White Desert's fine column grid, in pencil. */}
      <div
        className="pointer-events-none absolute inset-0 mx-auto grid max-w-[1400px] grid-cols-4 px-5 opacity-60 md:grid-cols-6 md:px-10"
        aria-hidden
      >
        {Array.from({ length: 6 }, (_, i) => (
          <span
            key={i}
            className="border-line/70 border-l last:border-r max-md:[&:nth-child(n+5)]:hidden"
          />
        ))}
      </div>

      <div className="relative mx-auto flex w-full max-w-[1400px] flex-1 flex-col px-5 md:px-10">
        <p className="spec text-muted border-text/80 flex flex-wrap justify-between gap-x-6 gap-y-1 border-b-2 pb-2">
          <span>No. 01 · The real-places issue</span>
          <span className="hidden sm:inline">38.72°N 9.14°W</span>
          <span>Free · No account</span>
        </p>

        <h1
          id="cover-h"
          className="font-display -ml-[0.04em] pt-2 text-[37vw] leading-[0.82] font-semibold tracking-[-0.045em] min-[1400px]:text-[33rem]"
        >
          Natour<span className="sr-only">: describe the trip, walk it</span>
        </h1>

        <div className="mt-6 grid flex-1 items-end gap-10 md:mt-8 md:grid-cols-12">
          <nav
            aria-label="In this issue"
            className="order-3 md:order-none md:col-span-4 lg:col-span-3"
          >
            <p className="spec text-accent-text mb-3">In this issue</p>
            <ol className="flex flex-col">
              {COVER_LINES.map((c) => (
                <li key={c.page} className="border-line border-t py-2.5 last:border-b">
                  <a
                    href={c.href}
                    className="group hover:text-accent-text flex gap-4 text-sm leading-snug"
                  >
                    <span className="text-muted font-mono text-xs">p.{c.page}</span>
                    <span className="font-display italic group-hover:underline">{c.text}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <p
            data-reveal-words
            className="font-display text-[clamp(1.55rem,2.6vw,2.6rem)] leading-[1.08] font-light tracking-tight uppercase md:col-span-8 lg:col-span-5"
          >
            <Words text="Describe the trip. Walk it." />{' '}
            <span className="text-muted">
              <Words text="An AI planner that can't make places up: every stop is looked up on the map before it reaches yours." />
            </span>
          </p>

          <div className="relative z-10 flex justify-center md:col-span-12 lg:col-span-4 lg:-mt-56 lg:justify-end xl:-mt-72">
            <Postcard />
          </div>
        </div>
      </div>

      <Route d="M 82 70 C 92 80, 70 88, 68 100" className="hidden lg:block" />
      <Route d="M 50 92 C 54 95, 46 98, 50 100" className="lg:hidden" />
    </section>
  )
}
