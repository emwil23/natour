import { Stamp } from '@/components/Stamp'
import { cn } from '@/lib/cn'
import { Route, Words } from './Route'

// Real Lisbon places at their real coordinates, and one the AI made up.
const CARDS = [
  {
    n: '01',
    name: 'Miradouro da Senhora do Monte',
    kind: 'Viewpoint',
    at: '38.72°N 9.13°W',
    why: 'The highest viewpoint in the city, best just before sunset.',
  },
  {
    n: '02',
    name: 'Castelo de São Jorge',
    kind: 'Sight',
    at: '38.71°N 9.13°W',
    why: 'Moorish walls above the Alfama, with peacocks and the river.',
  },
  {
    n: '—',
    name: 'Golden Sunset Rooftop, Alfama',
    kind: 'Rooftop bar',
    at: 'not on the map',
    why: 'Suggested by the AI. OpenStreetMap has never heard of it.',
    fake: true,
  },
  {
    n: '03',
    name: 'Praça do Comércio',
    kind: 'Sight',
    at: '38.71°N 9.14°W',
    why: 'The grand riverside square where the city meets the Tagus.',
  },
  {
    n: '04',
    name: 'Time Out Market Lisboa',
    kind: 'Food',
    at: '38.71°N 9.15°W',
    why: 'Lunch with forty kitchens to choose from.',
  },
  {
    n: '05',
    name: 'Pastéis de Belém',
    kind: 'Food',
    at: '38.70°N 9.20°W',
    why: 'The custard tarts, still warm, since 1837.',
  },
] as const

/**
 * Chapter 2, Plan. The AI's suggestions arrive as postcards; each real one is stamped "checked" as it
 * reaches the middle of the screen, and the made-up one is torn and dropped. On wide screens the strip is
 * pinned and scrolls sideways; on phones it is a deck you scroll down.
 */
export function PlanStrip() {
  return (
    <section id="plan" aria-labelledby="plan-h" data-plan className="relative">
      <div
        data-plan-pin
        className="relative flex flex-col justify-center gap-10 overflow-hidden py-24 md:h-[100svh] md:py-0"
      >
        <header className="mx-auto w-full max-w-[1400px] px-5 md:px-10">
          <p className="spec text-accent-text">Chapter 2 of 4 · Plan</p>
          <h2
            id="plan-h"
            data-reveal-words
            className="font-display mt-3 max-w-3xl text-[clamp(2.4rem,5.5vw,5.5rem)] leading-[0.95] font-light tracking-tight"
          >
            <Words text="Postcards from places that exist." />
          </h2>
          <p className="text-muted mt-4 max-w-xl">
            Natour plans your days, then looks every suggestion up on OpenStreetMap inside your
            destination. Real places get a stamp with their coordinates. The rest never reach your
            map.
          </p>
        </header>

        <div data-track className="relative md:w-max">
          <Route
            d="M 0 55 C 12 30, 22 80, 34 52 S 58 30, 70 56 S 90 70, 100 45"
            className="hidden md:block"
          />
          <ol
            aria-label="Suggested places"
            className="relative flex flex-col items-center gap-8 px-5 md:flex-row md:items-stretch md:gap-10 md:px-[max(2.5rem,calc((100vw-1400px)/2+2.5rem))]"
          >
            {CARDS.map((c, i) => (
              <li
                key={c.name}
                data-card
                data-fake={'fake' in c ? '' : undefined}
                style={{ rotate: `${String([-2, 1.5, -1, 2, -1.5, 1][i] ?? 0)}deg` }}
                className={cn(
                  'border-line bg-surface shadow-card relative flex w-full max-w-sm shrink-0 flex-col rounded-[3px] border p-6 md:h-[24rem] md:w-[19rem]',
                  'fake' in c &&
                    'bg-surface-2 [clip-path:polygon(0_0,100%_0,100%_86%,92%_90%,84%_86%,75%_92%,66%_87%,57%_93%,48%_88%,39%_94%,30%_88%,21%_93%,12%_88%,0_92%)]',
                )}
              >
                <p className="spec text-muted flex justify-between">
                  <span>{c.kind}</span>
                  <span>{c.n}</span>
                </p>
                <h3
                  className={cn(
                    'font-display mt-6 text-3xl leading-tight font-semibold',
                    'fake' in c && 'text-muted decoration-danger line-through decoration-2',
                  )}
                >
                  {c.name}
                </h3>
                <p className="text-muted mt-3 text-sm">{c.why}</p>
                <div className="mt-auto flex items-end justify-between pt-6">
                  <p className="font-mono text-xs">{c.at}</p>
                  {'fake' in c ? (
                    <p
                      data-card-stamp
                      className="text-danger spec rotate-[-6deg] border-2 border-current px-2 py-1"
                    >
                      Doesn't exist · dropped
                    </p>
                  ) : (
                    <span data-card-stamp className="inline-flex">
                      <Stamp kind="checked" rim={c.at} size={76} />
                      <span className="sr-only">Checked on OpenStreetMap at {c.at}</span>
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
