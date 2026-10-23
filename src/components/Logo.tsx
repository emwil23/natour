import { cn } from '@/lib/cn'

/** The Natour mark: an N drawn as one route, its diagonal the dotted part, ending in a pin. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-7', className)} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#1b2420" />
      <path d="M9.5 24V9.5" fill="none" stroke="#f4efe6" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M9.5 9.5 22.5 23"
        fill="none"
        stroke="#ff8a5c"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="0 4.6"
      />
      <path d="M22.5 23v-7" fill="none" stroke="#f4efe6" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M22.5 16.8c-2.9-3.3-3.8-5-3.8-6.6a3.8 3.8 0 0 1 7.6 0c0 1.6-.9 3.3-3.8 6.6Z"
        fill="#ff8a5c"
      />
      <circle cx="22.5" cy="10.2" r="1.4" fill="#1b2420" />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <LogoMark />
      <span className="font-display text-[1.35rem] leading-none font-semibold tracking-tight">
        Natour
      </span>
    </span>
  )
}
