import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'

/** A designed 404: a dotted route that runs off the edge of a torn map. */
export function NotFound() {
  return (
    <main
      id="main"
      className="graticule grain relative grid min-h-dvh place-items-center overflow-hidden px-6 text-center"
    >
      <svg
        viewBox="0 0 800 500"
        className="pointer-events-none absolute top-1/2 left-1/2 w-[min(120vw,1100px)] -translate-x-1/2 -translate-y-1/2 opacity-60"
        aria-hidden
      >
        <path
          d="M40 60 L560 40 L590 110 L548 170 L600 240 L556 320 L610 400 L60 450 Z"
          fill="var(--surface)"
          stroke="var(--line)"
          strokeWidth="2"
        />
        <path
          d="M110 380 C 180 300, 260 340, 300 260 S 420 150, 520 200 S 640 260, 760 170"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="0.1 18"
        />
        <circle cx="110" cy="380" r="14" fill="var(--accent)" />
        <circle cx="110" cy="380" r="5" fill="var(--surface)" />
        <circle
          cx="300"
          cy="260"
          r="9"
          fill="var(--surface)"
          stroke="var(--accent)"
          strokeWidth="4"
        />
      </svg>
      <div className="relative">
        <p className="spec text-accent-text">Error 404 · Off the map</p>
        <h1 className="font-display mt-4 text-6xl font-semibold md:text-8xl">
          This road isn't on the map.
        </h1>
        <p className="text-muted mx-auto mt-4 max-w-md">
          The route ran past the edge of the paper. Let's head back to somewhere that exists.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild variant="primary" size="lg">
            <Link to="/app">Your trips</Link>
          </Button>
          <Button asChild size="lg">
            <Link to="/">Home</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
