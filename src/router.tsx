import { SiteLayout } from '@/components/SiteLayout'
import { NotFound } from '@/pages/NotFound'
import { useSettings, applyTheme } from '@/stores/settings'
import {
  createRootRoute,
  createRoute,
  createRouter,
  lazyRouteComponent,
  Outlet,
} from '@tanstack/react-router'
import { useEffect } from 'react'
import { Toaster } from 'sonner'

function Root() {
  const theme = useSettings((s) => s.theme)
  useEffect(() => {
    applyTheme(theme)
    if (theme !== 'system') return
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyTheme('system')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [theme])
  return (
    <>
      <Outlet />
      <Toaster
        position="bottom-center"
        theme={theme === 'system' ? 'system' : theme}
        richColors
        closeButton
      />
    </>
  )
}

const root = createRootRoute({ component: Root, notFoundComponent: NotFound })

const site = createRoute({ getParentRoute: () => root, id: 'site', component: SiteLayout })
// The app shell is lazy too, so the landing page doesn't download the app.
const shell = createRoute({
  getParentRoute: () => root,
  id: 'shell',
  component: lazyRouteComponent(() => import('@/components/AppShell'), 'AppShell'),
})

const sitePages = [
  createRoute({
    getParentRoute: () => site,
    path: '/',
    component: lazyRouteComponent(() => import('@/pages/Landing'), 'Landing'),
  }),
  createRoute({
    getParentRoute: () => site,
    path: 'developer',
    component: lazyRouteComponent(() => import('@/pages/Developer'), 'Developer'),
  }),
  createRoute({
    getParentRoute: () => site,
    path: 'pro',
    component: lazyRouteComponent(() => import('@/pages/Pro'), 'Pro'),
  }),
  createRoute({
    getParentRoute: () => site,
    path: 'privacy',
    component: lazyRouteComponent(() => import('@/pages/Legal'), 'Privacy'),
  }),
  createRoute({
    getParentRoute: () => site,
    path: 'terms',
    component: lazyRouteComponent(() => import('@/pages/Legal'), 'Terms'),
  }),
]

const appPages = [
  createRoute({
    getParentRoute: () => shell,
    path: 'app',
    // ?describe=... fills the describe box (landing page box, example chips).
    validateSearch: (s: Record<string, unknown>): { describe?: string } =>
      typeof s.describe === 'string' && s.describe.trim()
        ? { describe: s.describe.slice(0, 600) }
        : {},
    component: lazyRouteComponent(() => import('@/pages/Trips'), 'Trips'),
  }),
  createRoute({
    getParentRoute: () => shell,
    path: 'app/trip/$tripId',
    component: lazyRouteComponent(() => import('@/pages/Planner'), 'Planner'),
  }),
  createRoute({
    getParentRoute: () => shell,
    path: 'app/trip/$tripId/stay',
    component: lazyRouteComponent(() => import('@/pages/Stay'), 'Stay'),
  }),
  createRoute({
    getParentRoute: () => shell,
    path: 'app/trip/$tripId/pack',
    component: lazyRouteComponent(() => import('@/pages/Pack'), 'Pack'),
  }),
  createRoute({
    getParentRoute: () => shell,
    path: 'app/trip/$tripId/budget',
    component: lazyRouteComponent(() => import('@/pages/BudgetPage'), 'BudgetPage'),
  }),
  createRoute({
    getParentRoute: () => shell,
    path: 'app/explore',
    component: lazyRouteComponent(() => import('@/pages/Explore'), 'Explore'),
  }),
  createRoute({
    getParentRoute: () => shell,
    path: 'app/explore/$place',
    component: lazyRouteComponent(() => import('@/pages/Destination'), 'Destination'),
  }),
  createRoute({
    getParentRoute: () => shell,
    path: 'app/journal',
    validateSearch: (s: Record<string, unknown>): { trip?: string } =>
      typeof s.trip === 'string' && s.trip ? { trip: s.trip.slice(0, 64) } : {},
    component: lazyRouteComponent(() => import('@/pages/Journal'), 'Journal'),
  }),
  createRoute({
    getParentRoute: () => shell,
    path: 'settings',
    component: lazyRouteComponent(() => import('@/pages/SettingsPage'), 'SettingsPage'),
  }),
]

const routeTree = root.addChildren([site.addChildren(sitePages), shell.addChildren(appPages)])

export const router = createRouter({ routeTree, defaultPreload: 'intent', scrollRestoration: true })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
