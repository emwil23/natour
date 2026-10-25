import { EffortBar } from '@/components/EffortBar'
import { Route, Words } from './Route'

// Paper-cut layers, back to front. `depth` is how far a layer travels as you scroll (parallax).
const LAYERS = [
  {
    depth: 0.12,
    fill: 'color-mix(in oklab, var(--live) 14%, var(--bg))',
    d: 'M0 470 L120 360 L210 410 L330 270 L430 360 L540 250 L660 380 L780 300 L900 400 L1010 280 L1130 370 L1250 300 L1360 380 L1440 330 V800 H0Z',
  },
  {
    depth: 0.25,
    fill: 'color-mix(in oklab, var(--live) 26%, var(--bg))',
    d: 'M0 540 C 160 470, 300 520, 440 480 S 720 420, 860 480 S 1140 520, 1260 470 S 1400 460, 1440 470 V800 H0Z',
  },
  {
    depth: 0.42,
    fill: 'color-mix(in oklab, var(--accent) 20%, var(--bg))',
    // An old town on a hill: roofs, a bell tower and a dome.
    d: 'M0 610 L60 600 L60 560 L95 540 L130 560 L130 590 L170 590 L170 548 L190 548 L190 500 L200 488 L210 500 L210 548 L240 548 L240 575 L285 556 L330 575 L330 590 L380 590 C 380 548, 440 548, 440 590 L500 590 L500 560 L540 540 L580 560 L580 600 L700 610 C 860 580, 1000 600, 1160 585 L1200 585 L1200 552 L1240 532 L1280 552 L1280 585 L1330 585 L1330 560 L1360 545 L1390 560 L1390 590 L1440 595 V800 H0Z',
  },
  {
    depth: 0.62,
    fill: 'color-mix(in oklab, var(--live) 40%, var(--bg))',
    d: 'M0 680 C 200 630, 360 690, 560 660 S 900 610, 1080 660 S 1340 690, 1440 650 V800 H0Z',
  },
  {
    depth: 0.85,
    fill: 'var(--surface-2)',
    d: 'M0 740 C 240 700, 420 760, 680 728 S 1100 700, 1440 735 V800 H0Z',
  },
]

const STOPS = [
  { x: 18, y: 78, label: 'Praça do Comércio' },
  { x: 36, y: 60, label: '~15 min' },
  { x: 60, y: 46, label: '~10 min' },
  { x: 84, y: 30, label: '~20 min' },
]

/**
 * Chapter 3, Go. Layers of paper landscape slide past at different speeds while the day's route climbs
 * through them, stop by stop, with estimated walking times along the way.
 */
export function Landscape() {
  return (
    <section id="go" aria-labelledby="go-h" data-go className="relative md:h-[220vh]">
      <div className="relative min-h-[100svh] overflow-hidden md:sticky md:top-0 md:h-[100svh]">
        <div
          data-sun
          aria-hidden
          className="absolute top-[48%] right-[10%] size-[18vmin] rounded-full md:top-[14%] md:right-[12%]"
          style={{ background: 'color-mix(in oklab, var(--accent) 30%, var(--bg))' }}
        />
        {LAYERS.map((l) => (
          <svg
            key={l.depth}
            data-depth={l.depth}
            viewBox="0 0 1440 800"
            preserveAspectRatio="xMidYMax slice"
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-full w-full"
          >
            <path d={l.d} fill={l.fill} />
          </svg>
        ))}

        <div className="absolute inset-x-0 bottom-0 h-[46%] md:inset-0 md:h-full" aria-hidden>
          <Route d="M 18 78 C 24 70, 30 64, 36 60 S 52 50, 60 46 S 76 36, 84 30" />
          {STOPS.map((s, i) => (
            <div
              key={s.label}
              data-pin
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${String(s.x)}%`, top: `${String(s.y)}%` }}
            >
              <span className="bg-accent text-accent-ink grid size-7 place-items-center rounded-full font-mono text-[11px] font-bold ring-4 ring-[var(--bg)]">
                {i + 1}
              </span>
              <span className="spec bg-surface/90 absolute top-9 left-1/2 -translate-x-1/2 rounded px-1.5 py-0.5 whitespace-nowrap">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <div className="relative mx-auto max-w-[1400px] px-5 pt-24 pb-[52svh] md:px-10 md:pt-28 md:pb-0">
          <p className="spec text-accent-text">Chapter 3 of 4 · Go</p>
          <h2
            id="go-h"
            data-reveal-words
            className="font-display mt-3 max-w-2xl text-[clamp(2.4rem,5.5vw,5.5rem)] leading-[0.95] font-light tracking-tight"
          >
            <Words text="Walk it, one stop at a time." />
          </h2>
          <p className="text-muted mt-4 max-w-md">
            Each day becomes a walking route with the time between stops. Drag stops between days,
            lock the ones you love, ask for a rainy-day version.
          </p>
          <dl className="bg-surface/85 border-line mt-6 inline-grid grid-cols-[auto_auto] items-center gap-x-6 gap-y-2 rounded-xl border p-4 text-sm backdrop-blur-sm">
            <dt>Day 1 · 1.7 km</dt>
            <dd>
              <EffortBar effort="easy" />
            </dd>
            <dt>Day 2 · 6.4 km</dt>
            <dd>
              <EffortBar effort="medium" />
            </dd>
            <dt>Day 3 · 11.1 km</dt>
            <dd>
              <EffortBar effort="hard" />
            </dd>
          </dl>
        </div>
      </div>
    </section>
  )
}
