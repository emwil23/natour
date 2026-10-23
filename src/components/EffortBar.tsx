import { cn } from '@/lib/cn'
import type { Effort } from '@/lib/db'

const STEPS: Effort[] = ['easy', 'medium', 'hard']
const LABEL: Record<Effort, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' }

/** Natour's old Easy / Medium / Hard tours, now how much walking a day takes: three steps, filled in. */
export function EffortBar({ effort, className }: { effort: Effort; className?: string }) {
  const n = STEPS.indexOf(effort) + 1
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className="flex items-end gap-0.5" aria-hidden>
        {STEPS.map((s, i) => (
          <span
            key={s}
            className={cn(
              'w-1.5 rounded-sm',
              ['h-2', 'h-3', 'h-4'][i],
              i < n ? (effort === 'easy' ? 'bg-live' : 'bg-accent') : 'bg-line',
            )}
          />
        ))}
      </span>
      <span className="spec text-muted">{LABEL[effort]}</span>
    </span>
  )
}
