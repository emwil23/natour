import { Button } from '@/components/ui/button'
import { Cover } from '@/landing/Cover'
import { JournalSpread } from '@/landing/JournalSpread'
import { Landscape } from '@/landing/Landscape'
import { useLandingMotion } from '@/landing/motion'
import { PlanStrip } from '@/landing/PlanStrip'
import { Postcard } from '@/landing/Postcard'
import { Words } from '@/landing/Route'
import { StampWindow } from '@/landing/StampWindow'
import { useSmoothScroll } from '@/landing/useSmoothScroll'
import { useReducedMotionSafe } from '@/lib/boot'
import { cn } from '@/lib/cn'
import { MOODS } from '@/lib/destinations'
import { PLANS } from '@/pages/Pro'
import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { useRef } from 'react'

/**
 * The landing, "The Long Way Round" (docs/landing-redesign.md): a travel magazine on map paper with one
 * route line drawn through the whole scroll, from the cover to a journal page.
 */
export function Landing() {
  const reduce = useReducedMotionSafe()
  const root = useRef<HTMLDivElement>(null)
  useSmoothScroll(!reduce)
  useLandingMotion(root, !reduce)
  return (
    <div ref={root} className="overflow-x-clip">
      <Cover animate={!reduce} />
      <StampWindow />
      <PlanStrip />
      <Landscape />
      <JournalSpread />
      <WhereNext />
      <Explore />
      <Pricing />
      <DeveloperCard />
    </div>
  )
}

const PROMISES = [
  {
    n: 'i.',
    title: 'Every place checked',
    body: 'Each stop is looked up on OpenStreetMap inside your destination and stamped with its coordinates. Made-up places are dropped.',
  },
  {
    n: 'ii.',
    title: 'One trip, one place',
    body: 'The plan, where to stay, what to pack and a rough budget all live in the same trip.',
  },
  {
    n: 'iii.',
    title: 'A journal that stays home',
    body: 'Notes and photos for each day, beside the route you walked. Never uploaded, never sent to an AI.',
  },
]

function WhereNext() {
  return (
    <section
      aria-labelledby="next-h"
      className="border-text/80 mx-auto max-w-[1400px] border-t-2 px-5 pt-20 pb-24 md:px-10"
    >
      <div className="grid items-end gap-12 lg:grid-cols-12">
        <h2
          id="next-h"
          data-reveal-words
          className="font-display text-[clamp(3.6rem,11vw,10rem)] leading-[0.85] font-semibold tracking-[-0.04em] lg:col-span-7"
        >
          <Words text="Where to next?" />
        </h2>
        <div className="flex justify-center lg:col-span-5 lg:justify-end">
          <Postcard tilt={1.5} />
        </div>
      </div>
      <ol className="mt-20 grid gap-10 md:grid-cols-3">
        {PROMISES.map((p) => (
          <li key={p.title} className="border-line border-t pt-5">
            <p className="font-display text-accent-text text-xl italic">{p.n}</p>
            <h3 className="font-display mt-2 text-2xl font-semibold">{p.title}</h3>
            <p className="text-muted mt-2 text-sm leading-relaxed">{p.body}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

function Explore() {
  return (
    <section aria-labelledby="moods-h" className="mx-auto max-w-[1400px] px-5 py-16 md:px-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="spec text-accent-text">Explore</p>
          <h2 id="moods-h" className="font-display mt-3 text-5xl font-semibold md:text-6xl">
            Start from a feeling.
          </h2>
        </div>
        <Button asChild>
          <Link to="/app/explore">
            Destination guides <ArrowRight />
          </Link>
        </Button>
      </div>
      <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {MOODS.map((m, i) => (
          <li key={m.id} className={cn(i % 2 === 1 && 'lg:translate-y-8')}>
            <Link
              to="/app/explore"
              className="group relative block aspect-[3/4] overflow-hidden rounded-[3px]"
            >
              <img
                src={`/media/mood-${m.id}.webp`}
                alt=""
                width={320}
                height={400}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 pt-12 font-medium text-white">
                {m.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-muted mt-14 text-xs">Mood pictures are illustrations, not real places.</p>
    </section>
  )
}

function Pricing() {
  return (
    <section aria-labelledby="pricing-h" className="mx-auto max-w-[1400px] px-5 py-16 md:px-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="spec text-accent-text">Pricing</p>
          <h2 id="pricing-h" className="font-display mt-3 text-5xl font-semibold md:text-6xl">
            Free to plan.
          </h2>
          <p className="text-muted mt-4 max-w-md">
            Everything above is free, AI included. Pro adds trip sync, shared trips where friends
            vote on stops and PDF export, for all EW apps at once.
          </p>
        </div>
        <Button asChild>
          <Link to="/pro">
            Compare plans <ArrowRight />
          </Link>
        </Button>
      </div>
      <ul className="mt-10 grid gap-4 md:grid-cols-3">
        {PLANS.map((p) => (
          <li
            key={p.name}
            className={cn(
              'rounded-[3px] border p-6',
              p.featured ? 'border-accent-text bg-accent/5' : 'border-line',
            )}
          >
            <p className="spec text-muted">Pro · {p.name}</p>
            <p className="mt-3">
              <span className="font-display text-5xl font-semibold">{p.price}</span>{' '}
              <span className="text-muted">{p.per}</span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}

function DeveloperCard() {
  return (
    <section aria-labelledby="dev-h" className="mx-auto max-w-[1400px] px-5 pt-8 pb-28 md:px-10">
      <Link
        to="/developer"
        className="group border-line bg-surface hover:border-accent-text grid items-center gap-8 overflow-hidden rounded-[3px] border p-6 transition-colors md:grid-cols-[auto_1fr_auto] md:p-8"
      >
        <img
          src="/media/developer.webp"
          alt="Emmanuel's 3D character with a backpack and a paper map"
          width={160}
          height={160}
          loading="lazy"
          className="size-32 rounded-[3px] object-cover md:size-40"
        />
        <div>
          <p className="spec text-accent-text">Built by</p>
          <h2 id="dev-h" className="font-display mt-2 text-4xl font-semibold">
            Emmanuel Wilson
          </h2>
          <p className="text-muted mt-2 max-w-md">
            Designer-developer behind EWSTUDIOS. Come and say hello.
          </p>
        </div>
        <ArrowRight
          className="text-muted group-hover:text-accent-text size-8 transition-transform group-hover:translate-x-1"
          aria-hidden
        />
      </Link>
    </section>
  )
}
