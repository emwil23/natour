import { cn } from '@/lib/cn'
import { Fragment, useId } from 'react'

/**
 * One stretch of the landing's route: a dotted terracotta line in a 100×100 box stretched over its parent.
 * A solid path in a mask reveals it; the page's scroll moves that path's dash (see `drawRoutes`), so the
 * line looks drawn by a pen. Neighbouring sections share their end and start x, so the stretches read as one
 * line down the page. Decorative: the sections say everything in text.
 */
export function Route({ d, className }: { d: string; className?: string }) {
  const id = useId()
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 h-full w-full overflow-visible',
        className,
      )}
    >
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x="-10" y="-10" width="120" height="120">
          <path
            data-route-pen
            d={d}
            fill="none"
            stroke="#fff"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </mask>
      </defs>
      <path
        d={d}
        mask={`url(#${id})`}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray="0.1 11"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

/** Splits text into words that can rise from behind a mask; each word is a span marked `data-word`. */
export function Words({ text, className }: { text: string; className?: string }) {
  const words = text.split(' ')
  return (
    <span className={className}>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
            <span data-word className="inline-block will-change-transform">
              {w}
            </span>
          </span>
          {i < words.length - 1 && ' '}
        </Fragment>
      ))}
    </span>
  )
}
