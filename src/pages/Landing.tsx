import { LoopVideo } from '@/components/LoopVideo'
import { Stamp } from '@/components/Stamp'
import { Button } from '@/components/ui/button'
import { Story } from '@/landing/Story'
import { useSmoothScroll } from '@/landing/useSmoothScroll'
import { prerendered, useReducedMotionSafe } from '@/lib/boot'
import { cn } from '@/lib/cn'
import { MOODS } from '@/lib/destinations'
import { Quiet, useCan3D } from '@/lib/use3d'
import { PLANS } from '@/pages/Pro'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowRight, BookLock, Footprints, Layers, MapPinned } from 'lucide-react'
import { motion } from 'motion/react'
import { lazy, Suspense, useEffect, useId, useRef, type ReactNode } from 'react'

const GlobeScene = lazy(() => import('@/landing/GlobeScene'))

const TRIPS = [
  '5 days in Lisbon in May: food, viewpoints, one slow morning',
  'A long weekend in Kyoto for gardens and quiet tea houses',
  '3 days in Mexico City: markets, murals, street food',
  'A week in Cape Town with easy hikes and the coast',
  'Edinburgh in winter: castles, bookshops and pubs',
  'Marrakesh for 4 days: souks, riads and a desert night',
]

// The arc cities' coordinates, pinned around the hero like labels on a chart.
const HUD = [
  { text: 'Lisbon · 38.72°N 9.14°W', className: 'top-[24%] right-[7%]' },
  { text: 'Reykjavík · 64.15°N 21.94°W', className: 'top-[14%] right-[31%]' },
  { text: 'Mexico City · 19.43°N 99.13°W', className: 'bottom-[24%] right-[36%]' },
  { text: 'Cape Town · 33.92°S 18.42°E', className: 'bottom-[15%] right-[5%]' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + i * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

export function Landing() {
  const reduce = useReducedMotionSafe()
  const can3D = useCan3D(reduce)
  useSmoothScroll(!reduce)
  return (
    <>
      <Hero can3D={can3D} />
      <Story animate={!reduce} />
      <Different />
      <Moods reduce={reduce} />
      <Pricing />
      <DeveloperCard />
    </>
  )
}

function Hero({ can3D }: { can3D: boolean }) {
  const navigate = useNavigate()
  const inputId = useId()
  const section = useRef<HTMLElement>(null)
  // How far the hero has scrolled away (0-1); the globe flies into Lisbon with it.
  const progress = useRef(0)
  useEffect(() => {
    if (!can3D) return
    const onScroll = () => {
      const h = section.current?.offsetHeight ?? 1
      progress.current = Math.min(1, Math.max(0, scrollY / (h * 0.8)))
    }
    onScroll()
    addEventListener('scroll', onScroll, { passive: true })
    return () => removeEventListener('scroll', onScroll)
  }, [can3D])

  return (
    <section
      ref={section}
      aria-labelledby="hero-h"
      className="grain relative flex min-h-dvh items-center overflow-hidden bg-[#0b1517] pt-28 pb-24 text-[#eef1ea]"
    >
      {/* The Flow still of the globe; on wide screens with a GPU the live 3D globe fades in over it. */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <img
          src="/media/hero.webp"
          alt=""
          width={1376}
          height={768}
          fetchPriority="high"
          className={cn(
            'h-full w-full object-cover object-[70%_50%] transition-opacity duration-1000',
            can3D ? 'opacity-0' : 'opacity-75',
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b1517] via-[#0b1517]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1517] via-transparent to-[#0b1517]/40" />
      </div>
      {can3D && (
        <div className="absolute inset-0 hidden md:left-[44%] md:block" aria-hidden>
          <Quiet>
            <Suspense fallback={null}>
              <GlobeScene progress={progress} />
            </Suspense>
          </Quiet>
        </div>
      )}
      {HUD.map((h) => (
        <span
          key={h.text}
          className={cn(
            'spec pointer-events-none absolute hidden rounded border border-white/15 bg-black/30 px-2 py-1 text-white/60 backdrop-blur xl:block',
            h.className,
          )}
          aria-hidden
        >
          ◦ {h.text}
        </span>
      ))}

      <div className="relative mx-auto w-full max-w-6xl px-6">
        <motion.p
          custom={0}
          initial={prerendered ? false : 'hidden'}
          animate="show"
          variants={fadeUp}
          className="spec inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3 py-1.5 text-white/70 backdrop-blur"
        >
          <span className="size-1.5 rounded-full bg-[#86d6ae]" /> AI trip planner · real places only
          · free
        </motion.p>
        {/* Not animated in: it is the LCP element and must paint straight from the prerendered HTML. */}
        <h1
          id="hero-h"
          className="font-display mt-6 max-w-3xl text-[clamp(3.4rem,9vw,7.5rem)] leading-[0.92] font-semibold tracking-tight"
        >
          Describe the trip.
          <br />
          <em className="text-[#ff8a5c]">Walk it.</em>
        </h1>
        <motion.p
          custom={2}
          initial={prerendered ? false : 'hidden'}
          animate="show"
          variants={fadeUp}
          className="mt-6 max-w-xl text-lg text-white/75"
        >
          Natour turns a sentence into a day-by-day plan on a map. Every place it suggests is
          checked on OpenStreetMap, so nothing in your plan is made up. No account needed.
        </motion.p>
        <motion.form
          custom={3}
          initial={prerendered ? false : 'hidden'}
          animate="show"
          variants={fadeUp}
          className="mt-8 flex max-w-xl flex-col gap-2 rounded-3xl border border-white/15 bg-black/40 p-2 backdrop-blur-md sm:flex-row sm:items-center sm:pl-5"
          // Works as a plain form before the app's JS has loaded (the page is prerendered).
          action="/app"
          method="get"
          onSubmit={(e) => {
            e.preventDefault()
            const v = new FormData(e.currentTarget).get('describe')
            const describe = typeof v === 'string' ? v.trim() : ''
            void navigate({ to: '/app', search: { describe } })
          }}
        >
          <label htmlFor={inputId} className="sr-only">
            Describe your trip
          </label>
          <input
            id={inputId}
            name="describe"
            required
            minLength={8}
            maxLength={600}
            placeholder={TRIPS[0]}
            className="h-12 flex-1 bg-transparent px-3 text-base text-white outline-none placeholder:text-white/45 sm:px-0"
          />
          <Button type="submit" variant="primary" size="lg" className="bg-[#ff8a5c] text-[#0b1517]">
            Plan it <ArrowRight />
          </Button>
        </motion.form>
      </div>

      {/* A ticker of example trips along the bottom edge; each one fills the planner. */}
      <div className="absolute inset-x-0 bottom-0 overflow-hidden border-t border-white/10 bg-black/30 py-3 backdrop-blur">
        <p className="sr-only">Example trips</p>
        <ul className="ticker flex w-max gap-8 whitespace-nowrap">
          {[...TRIPS, ...TRIPS].map((v, i) => (
            <li key={i} aria-hidden={i >= TRIPS.length}>
              <Link
                to="/app"
                search={{ describe: v }}
                tabIndex={i >= TRIPS.length ? -1 : undefined}
                className="spec text-white/60 hover:text-white"
              >
                <span className="text-[#ff8a5c]">→ Try</span> {v}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Card({
  icon,
  title,
  children,
  className,
}: {
  icon: ReactNode
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <li className={cn('border-line bg-surface/70 rounded-3xl border p-6', className)}>
      <span className="text-accent-text [&_svg]:size-6" aria-hidden>
        {icon}
      </span>
      <h3 className="font-display mt-4 text-2xl font-semibold">{title}</h3>
      <div className="text-muted mt-2 text-sm leading-relaxed">{children}</div>
    </li>
  )
}

function Different() {
  return (
    <section aria-labelledby="diff-h" className="mx-auto max-w-6xl px-6 py-20">
      <p className="spec text-accent-text">Why it's different</p>
      <h2
        id="diff-h"
        className="font-display mt-3 max-w-3xl text-5xl leading-[1] font-semibold md:text-6xl"
      >
        A planner that can't make places up.
      </h2>
      <ul className="mt-10 grid gap-4 md:grid-cols-3">
        <Card icon={<MapPinned />} title="Every place checked" className="relative md:col-span-2">
          <Stamp kind="checked" rim="38.72°N 9.14°W" size={88} className="absolute top-6 right-6" />
          <p className="max-w-md">
            AI models sometimes invent cafés and viewpoints. Natour looks every suggestion up on
            OpenStreetMap, inside your destination, and drops anything it can't find. Each real
            place gets a stamp with its coordinates.
          </p>
        </Card>
        <Card icon={<Layers />} title="One trip, one place">
          The plan, where to stay, what to pack and a rough budget all live in the same trip.
        </Card>
        <Card icon={<Footprints />} title="Walkable days">
          Days are walking routes with times between stops, graded Easy, Medium or Hard by distance.
        </Card>
        <Card icon={<BookLock />} title="A journal that stays home" className="md:col-span-2">
          Notes and photos for each day, next to the route you walked. They never leave your device
          and never reach an AI.
        </Card>
      </ul>
    </section>
  )
}

function Moods({ reduce }: { reduce: boolean }) {
  return (
    <section aria-labelledby="moods-h" className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid items-end gap-8 md:grid-cols-[1fr_auto]">
        <div>
          <p className="spec text-accent-text">Explore</p>
          <h2
            id="moods-h"
            className="font-display mt-3 text-5xl leading-[1] font-semibold md:text-6xl"
          >
            Start from a feeling.
          </h2>
          <p className="text-muted mt-4 max-w-md">
            Coast or mountains, old towns or night cities. Each destination comes with a short guide
            and the best months to visit.
          </p>
        </div>
        <LoopVideo
          src="/media/hero"
          poster="/media/hero-poster.webp"
          label="A globe at night turning slowly as glowing routes draw between cities"
          reduce={reduce}
          className="hidden aspect-video w-72 rounded-2xl object-cover md:block"
        />
      </div>
      <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {MOODS.map((m, i) => (
          <li key={m.id} className={cn(i % 2 === 1 && 'lg:translate-y-8')}>
            <Link
              to="/app/explore"
              className="group relative block aspect-[3/4] overflow-hidden rounded-2xl"
            >
              <img
                src={`/media/mood-${m.id}.webp`}
                alt=""
                width={320}
                height={400}
                loading="lazy"
                className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 pt-12 font-medium text-white">
                {m.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Pricing() {
  return (
    <section aria-labelledby="pricing-h" className="mx-auto max-w-6xl px-6 py-20">
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
              'rounded-3xl border p-6',
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
    <section aria-labelledby="dev-h" className="mx-auto max-w-6xl px-6 pb-28">
      <Link
        to="/developer"
        className="group border-line bg-surface/70 hover:border-accent-text grid items-center gap-8 overflow-hidden rounded-3xl border p-6 transition-colors md:grid-cols-[auto_1fr_auto] md:p-8"
      >
        <img
          src="/media/developer.webp"
          alt="Emmanuel's 3D character with a backpack and a paper map"
          width={160}
          height={160}
          loading="lazy"
          className="size-32 rounded-2xl object-cover md:size-40"
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
