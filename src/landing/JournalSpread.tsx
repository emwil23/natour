import { RouteSketch } from '@/components/RouteSketch'
import { Stamp } from '@/components/Stamp'
import { Words } from './Route'

// Day 1 of the Lisbon example, at the stops' real coordinates.
const DAY = [
  { lat: 38.719, lon: -9.1329 },
  { lat: 38.7139, lon: -9.1335 },
  { lat: 38.7075, lon: -9.1364 },
  { lat: 38.7071, lon: -9.1459 },
]

const Tape = ({ className }: { className: string }) => (
  <span aria-hidden className={`absolute h-6 w-20 bg-[#e9dcb8]/85 ${className}`} />
)

/**
 * Chapter 4, Remember. An open journal: notes, taped prints and the day's route, and a VISITED stamp that
 * lands when the spread comes into view. The real journal keeps all of this on the device.
 */
export function JournalSpread() {
  return (
    <section
      id="remember"
      aria-labelledby="remember-h"
      data-remember
      className="relative py-28 md:py-40"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <p className="spec text-accent-text">Chapter 4 of 4 · Remember</p>
        <h2
          id="remember-h"
          data-reveal-words
          className="font-display mt-3 max-w-3xl text-[clamp(2.4rem,5.5vw,5.5rem)] leading-[0.95] font-light tracking-tight"
        >
          <Words text="Keep the days you walked." />
        </h2>
        <p className="text-muted mt-4 max-w-xl">
          After the trip, notes and photos for each day sit next to the route you took. They stay on
          your device and never reach an AI.
        </p>

        <div
          data-spread
          className="bg-surface shadow-card border-line relative mt-14 grid rounded-[4px] border md:grid-cols-2"
        >
          {/* The fold between the pages. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-16 -translate-x-1/2 bg-gradient-to-r from-transparent via-black/[0.07] to-transparent md:block"
          />
          <div className="relative p-6 sm:p-10">
            <p className="spec text-muted">Day 1 · Lisbon · May</p>
            <p className="font-display mt-6 [background-image:repeating-linear-gradient(transparent,transparent_calc(2.2rem-1px),var(--line)_calc(2.2rem-1px),var(--line)_2.2rem)] text-2xl leading-[2.2rem] italic">
              Took the 28 tram up before the crowds. The view from the Senhora do Monte at five was
              worth every step, and the custard tarts were still warm at the bottom of the hill.
            </p>
            <figure data-print className="relative mt-10 w-64 -rotate-3 bg-white p-2 shadow-md">
              <Tape className="-top-3 left-1/2 -translate-x-1/2 rotate-2" />
              <RouteSketch points={DAY} width={240} height={150} className="w-full bg-[#f6f1e7]" />
              <figcaption className="spec mt-2 text-[10px] text-[#58615a]">
                Day 1 · 1.7 km · ~21 min walking
              </figcaption>
            </figure>
          </div>
          <div className="relative grid grid-cols-2 gap-5 p-6 sm:p-10">
            <figure data-print className="relative rotate-2 self-start bg-white p-2 pb-8 shadow-md">
              <Tape className="-top-3 left-6 -rotate-6" />
              <img
                src="/media/mood-old-town.webp"
                alt=""
                width={640}
                height={858}
                loading="lazy"
                decoding="async"
                className="aspect-[4/5] w-full object-cover"
              />
              <figcaption className="spec absolute bottom-2 left-2 text-[9px] text-[#58615a]">
                Illustration
              </figcaption>
            </figure>
            <figure
              data-print
              className="relative mt-16 -rotate-2 self-start bg-white p-2 pb-8 shadow-md"
            >
              <Tape className="-top-3 right-6 rotate-6" />
              <img
                src="/media/step-go.webp"
                alt=""
                width={900}
                height={900}
                loading="lazy"
                decoding="async"
                className="aspect-square w-full object-cover"
              />
              <figcaption className="spec absolute bottom-2 left-2 text-[9px] text-[#58615a]">
                Illustration
              </figcaption>
            </figure>
            <div data-slam className="absolute right-6 bottom-6 sm:right-10 sm:bottom-10">
              <Stamp kind="visited" size={128} />
              <span className="sr-only">Day 1 marked as visited</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
