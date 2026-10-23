import { cn } from '@/lib/cn'
import { clearStaleJobs } from '@/lib/trips'
import { Link, Outlet } from '@tanstack/react-router'
import { BookOpen, Compass, Map, Settings } from 'lucide-react'
import { useEffect } from 'react'
import { Logo, LogoMark } from './Logo'

const NAV = [
  { to: '/app', label: 'Trips', icon: Map, exact: true },
  { to: '/app/explore', label: 'Explore', icon: Compass, exact: false },
  { to: '/app/journal', label: 'Journal', icon: BookOpen, exact: false },
] as const

const navLink =
  'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-muted transition-colors hover:text-text [&.active]:bg-surface-2 [&.active]:text-text [&_svg]:size-4'

export function AppShell() {
  useEffect(() => {
    void clearStaleJobs()
  }, [])
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="focus:bg-accent focus:text-accent-ink sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <header className="border-line bg-bg/85 sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b px-3 backdrop-blur-md sm:px-5">
        <Link to="/" aria-label="Natour home" className="shrink-0">
          <Logo className="hidden sm:inline-flex" />
          <LogoMark className="sm:hidden" />
        </Link>
        <nav aria-label="App" className="flex min-w-0 items-center gap-0.5 sm:ml-4">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: n.exact }} className={navLink}>
              <n.icon aria-hidden /> <span>{n.label}</span>
            </Link>
          ))}
        </nav>
        <Link to="/settings" className={cn(navLink, 'ml-auto px-2')} aria-label="Settings">
          <Settings aria-hidden />
        </Link>
      </header>
      <main id="main" className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  )
}
