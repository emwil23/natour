import { Stamp } from '@/components/Stamp'
import { cn } from '@/lib/cn'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef, useState } from 'react'

gsap.registerPlugin(ScrollTrigger)

// Real Lisbon places for the demo, at their real positions (projected by hand onto the little map).
const PINS = [
  { name: 'Miradouro da Senhora do Monte', x: 232, y: 70, walk: null },
  { name: 'Castelo de São Jorge', x: 214, y: 128, walk: '~10 min' },
  { name: 'Praça do Comércio', x: 166, y: 196, walk: '~15 min' },
  { name: 'Time Out Market Lisboa', x: 88, y: 214, walk: '~15 min' },
]
const FAKE = { name: 'Golden Sunset Rooftop, Alfama', x: 268, y: 168 }
const ROUTE = 'M232 70 C 236 96, 220 108, 214 128 S 186 176, 166 196 S 112 206, 88 214'

const CHAPTERS = [
  {
    key: 'dream',
    word: 'Dream',
    body: 'Describe the trip like you would to a friend: where, when, what you love, how fast you like to go. “5 days in Lisbon in May: food, viewpoints, one slow morning.”',
  },
  {
    key: 'plan',
    word: 'Plan',
    body: 'Natour plans it day by day, and looks every place up on OpenStreetMap as it arrives. Real places get a stamp. Places the AI made up never reach your plan.',
  },
  {
    key: 'go',
    word: 'Go',
    body: 'Each day becomes a walking route with times between stops. Drag stops between days, lock the ones you love, ask for a rainy-day version.',
  },
  {
    key: 'remember',
    word: 'Remember',
    body: 'Afterwards, keep notes and photos for each day next to the route you walked. The journal stays on your device.',
  },
] as const

function Demo({ beat }: { beat: number }) {
  return (
    <div
      className={cn(
        'border-line bg-surface shadow-card relative w-full rounded-3xl border p-5 transition-transform duration-700',
        beat === 3 && 'rotate-[-2.5deg]',
      )}
    >
      {beat === 3 && (
        <span
          className="absolute -top-3 left-1/2 h-7 w-28 -translate-x-1/2 rotate-[2deg] bg-[#e9dcb8]/85"
          aria-hidden
        />
      )}
      <p className="spec text-muted">Your trip</p>
      <p className="font-display mt-1 text-xl leading-snug">
        5 days in Lisbon in May: food, viewpoints, one slow morning
        {beat === 0 && (
          <span className="bg-accent ml-1 inline-block h-5 w-0.5 animate-pulse align-middle" />
        )}
      </p>
      <div className="graticule bg-bg relative mt-4 overflow-hidden rounded-2xl">
        <svg viewBox="0 0 320 260" className="w-full">
          {/* The Tagus, roughly. */}
          <path
            d="M0 236 C 80 226, 150 240, 220 222 S 300 200, 320 206 L320 260 L0 260 Z"
            fill="color-mix(in oklab, #2f6db3 18%, transparent)"
          />
          <path
            d={ROUTE}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="0.1 10"
            pathLength={100}
            style={{
              clipPath: beat >= 2 ? 'inset(0 0 0 0)' : 'inset(0 0 0 100%)',
              transition: 'clip-path 1.4s ease',
            }}
          />
          {PINS.map((p, i) => (
            <g
              key={p.name}
              style={{
                transform: beat >= 1 ? 'translateY(0)' : 'translateY(-14px)',
                opacity: beat >= 1 ? 1 : 0,
                transition: `all 500ms cubic-bezier(.2,.8,.2,1) ${String(i * 180)}ms`,
              }}
            >
              <circle cx={p.x} cy={p.y} r="10" fill="var(--accent)" />
              <text
                x={p.x}
                y={p.y + 4}
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fill="#fff"
                fontFamily="JetBrains Mono, monospace"
              >
                {i + 1}
              </text>
              {beat >= 2 && p.walk && (
                <text
                  x={p.x + 14}
                  y={p.y - 10}
                  fontSize="10"
                  fill="var(--muted)"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {p.walk}
                </text>
              )}
            </g>
          ))}
          <g
            style={{
              opacity: beat === 1 ? 1 : 0,
              transition: 'opacity 600ms ease 900ms',
            }}
          >
            <circle
              cx={FAKE.x}
              cy={FAKE.y}
              r="10"
              fill="none"
              stroke="var(--muted)"
              strokeDasharray="3 3"
            />
            <path
              d={`M${String(FAKE.x - 6)} ${String(FAKE.y - 6)}l12 12m0-12l-12 12`}
              stroke="var(--danger)"
              strokeWidth="2"
            />
          </g>
        </svg>
      </div>
      <ol className="mt-4 space-y-1.5 text-sm">
        {PINS.map((p, i) => (
          <li
            key={p.name}
            className={cn(
              'flex items-center gap-2 transition-opacity duration-500',
              beat >= 1 ? 'opacity-100' : 'opacity-0',
            )}
            style={{ transitionDelay: `${String(i * 180)}ms` }}
          >
            <span className="font-mono text-xs">{i + 1}.</span>
            <span className="flex-1 truncate">{p.name}</span>
            {beat >= 1 && <Stamp kind="checked" size={26} animate />}
          </li>
        ))}
        <li
          className={cn(
            'text-muted flex items-center gap-2 text-xs transition-opacity duration-500',
            beat === 1 ? 'opacity-100' : 'opacity-0',
          )}
        >
          <span className="line-through">{FAKE.name}</span>
          <span className="text-danger">didn't exist, dropped</span>
        </li>
      </ol>
      {beat === 3 && (
        <Stamp kind="visited" size={96} animate className="absolute right-4 bottom-4" />
      )}
    </div>
  )
}

/**
 * The four chapters: Dream, Plan, Go, Remember. On big screens the demo card stays put while each huge
 * chapter word scrolls past and moves it on; with reduced motion (and on phones) it's a plain list.
 */
export function Story({ animate }: { animate: boolean }) {
  const root = useRef<HTMLElement>(null)
  const [active, setActive] = useState(animate ? 0 : 3)

  useEffect(() => {
    if (!animate || !root.current) return
    const ctx = gsap.context(() => {
      root.current?.querySelectorAll('[data-beat]').forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 55%',
          end: 'bottom 55%',
          onToggle: (self) => self.isActive && setActive(i),
        })
      })
      gsap.utils.toArray<HTMLElement>('[data-word]').forEach((el) => {
        gsap.fromTo(
          el,
          { yPercent: 18, opacity: 0.2 },
          {
            yPercent: 0,
            opacity: 1,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 45%', scrub: true },
          },
        )
      })
    }, root)
    return () => ctx.revert()
  }, [animate])

  return (
    <section ref={root} id="how" aria-labelledby="how-h" className="relative scroll-mt-20 py-28">
      <div className="mx-auto max-w-6xl px-6">
        <p className="spec text-accent-text">How it works</p>
        <h2
          id="how-h"
          className="font-display mt-3 max-w-3xl text-5xl leading-[1] font-semibold md:text-7xl"
        >
          From a sentence to a route you can walk.
        </h2>
      </div>

      <div className="mx-auto mt-16 grid max-w-6xl gap-10 px-6 md:grid-cols-[1.1fr_1fr]">
        <ol className="flex flex-col">
          {CHAPTERS.map((c, i) => (
            <li
              key={c.key}
              data-beat
              className="border-line relative flex min-h-[50vh] flex-col justify-center overflow-hidden border-t py-12 md:min-h-[78vh]"
            >
              <img
                src={`/media/step-${c.key}.webp`}
                alt=""
                width={720}
                height={720}
                loading="lazy"
                className="shadow-card mb-8 size-32 rounded-2xl object-cover md:size-44"
              />
              <p className="spec text-muted">Chapter {i + 1} of 4</p>
              <h3
                data-word
                className={cn(
                  'font-display mt-2 text-[clamp(4rem,11vw,9rem)] leading-[0.9] font-semibold transition-colors duration-500',
                  animate && active === i ? 'text-accent-text' : '',
                )}
              >
                {c.word}
              </h3>
              <p className="text-muted mt-6 max-w-md text-lg">{c.body}</p>
            </li>
          ))}
        </ol>
        <div className="sticky top-24 hidden h-[78vh] items-center md:flex" aria-hidden>
          <Demo beat={active} />
        </div>
      </div>
    </section>
  )
}
