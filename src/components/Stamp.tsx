import { cn } from '@/lib/cn'
import { useId } from 'react'

const TONES = {
  checked: 'text-live',
  visited: 'text-accent-text',
  estimate: 'text-accent-text',
  unchecked: 'text-muted',
} as const

/**
 * A round passport-style stamp. `checked`: the place exists on OpenStreetMap (with its coordinates around
 * the rim); `visited`: a journal day; `estimate`: the budget's figures are rough; `unchecked`: our server
 * couldn't look it up.
 */
export function Stamp({
  kind,
  rim,
  size = 44,
  animate = false,
  className,
}: {
  kind: keyof typeof TONES
  /** Text around the rim, e.g. the coordinates. */
  rim?: string
  size?: number
  animate?: boolean
  className?: string
}) {
  const id = useId()
  const word = { checked: 'OSM', visited: 'VISITED', estimate: 'ESTIMATE', unchecked: '?' }[kind]
  const top = {
    checked: 'CHECKED',
    visited: 'NATOUR',
    estimate: 'ROUGH',
    unchecked: 'NOT CHECKED',
  }[kind]
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-hidden="true"
      className={cn(TONES[kind], animate && 'stamp-in', 'shrink-0 [--tilt:-8deg]', className)}
      style={{ transform: 'rotate(-8deg)' }}
    >
      <defs>
        <path id={`${id}t`} d="M15 50a35 35 0 0 1 70 0" />
        <path id={`${id}b`} d="M12 50a38 38 0 0 0 76 0" />
      </defs>
      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="4" />
      <circle cx="50" cy="50" r="27" fill="none" stroke="currentColor" strokeWidth="2" />
      <text
        fontSize="11"
        fontFamily="JetBrains Mono, monospace"
        fill="currentColor"
        letterSpacing="1.5"
      >
        <textPath href={`#${id}t`} startOffset="50%" textAnchor="middle">
          {top}
        </textPath>
      </text>
      {rim && (
        <text fontSize="8.5" fontFamily="JetBrains Mono, monospace" fill="currentColor">
          <textPath href={`#${id}b`} startOffset="50%" textAnchor="middle">
            {rim}
          </textPath>
        </text>
      )}
      <text
        x="50"
        y="54"
        textAnchor="middle"
        fontSize={word.length > 4 ? 10 : 15}
        fontWeight="700"
        fontFamily="JetBrains Mono, monospace"
        fill="currentColor"
      >
        {word}
      </text>
    </svg>
  )
}
