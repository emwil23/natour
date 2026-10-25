import { LogoMark } from '@/components/Logo'
import { cn } from '@/lib/cn'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { useId } from 'react'

/**
 * The landing's way in: describe a trip on a postcard and post it to the planner (`/app?describe=…`).
 * A plain GET form, so it works from the prerendered HTML before the app's JavaScript has loaded.
 */
export function Postcard({ className, tilt = -2 }: { className?: string; tilt?: number }) {
  const navigate = useNavigate()
  const id = useId()
  return (
    <form
      action="/app"
      method="get"
      onSubmit={(e) => {
        e.preventDefault()
        const v = new FormData(e.currentTarget).get('describe')
        const describe = typeof v === 'string' ? v.trim() : ''
        void navigate({ to: '/app', search: { describe } })
      }}
      style={{ rotate: `${String(tilt)}deg` }}
      className={cn(
        'border-line bg-surface shadow-card relative w-full max-w-md rounded-[3px] border p-5 sm:p-6',
        className,
      )}
    >
      {/* The stamp: our mark in a perforated frame. */}
      <div
        className="border-line bg-bg absolute top-4 right-4 grid size-16 place-items-center border-2 border-dashed p-1"
        aria-hidden
      >
        <LogoMark className="size-9" />
        <span className="spec text-[8px] tracking-[0.2em]">No. 01</span>
      </div>
      {/* The postmark, half over the stamp. */}
      <svg
        viewBox="0 0 120 60"
        className="text-accent-text absolute top-9 right-14 w-28 opacity-70"
        aria-hidden
      >
        <circle cx="30" cy="30" r="24" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <text
          x="30"
          y="28"
          textAnchor="middle"
          fontSize="7"
          fontFamily="JetBrains Mono, monospace"
          fill="currentColor"
        >
          POSTED
        </text>
        <text
          x="30"
          y="38"
          textAnchor="middle"
          fontSize="6"
          fontFamily="JetBrains Mono, monospace"
          fill="currentColor"
        >
          ANYWHERE
        </text>
        {[0, 8, 16].map((y) => (
          <path
            key={y}
            d={`M58 ${String(22 + y)} q8 -5 16 0 t16 0 t16 0 t16 0`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          />
        ))}
      </svg>

      <p className="spec text-muted">Postcard · to the planner</p>
      <label htmlFor={id} className="font-display mt-3 block pr-20 text-2xl leading-tight italic">
        Describe your trip
      </label>
      <textarea
        id={id}
        name="describe"
        required
        minLength={8}
        maxLength={600}
        rows={3}
        placeholder="5 days in Lisbon in May: food, viewpoints, one slow morning"
        className="font-display placeholder:text-muted/80 mt-3 w-full resize-none bg-transparent [background-image:repeating-linear-gradient(transparent,transparent_calc(2rem-1px),var(--line)_calc(2rem-1px),var(--line)_2rem)] text-lg leading-[2rem] outline-none"
      />
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-muted text-xs">Every place gets checked on OpenStreetMap.</p>
        <button
          type="submit"
          className="bg-accent text-accent-ink inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-5 text-sm font-medium transition-[filter] hover:brightness-110"
        >
          Plan it <ArrowRight className="size-4" aria-hidden />
        </button>
      </div>
    </form>
  )
}
