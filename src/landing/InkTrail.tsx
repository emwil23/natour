import { useEffect, useRef } from 'react'

const LIFE = 1400 // ms a dot stays on the paper
const GAP = 14 // px between dots

/**
 * On the cover, the pointer leaves a dotted route that fades like ink drying, as if you were sketching a trip
 * on the map. Mouse and pen only, never with reduced motion; it draws only while there is ink to fade.
 */
export function InkTrail({ enabled }: { enabled: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = canvas.current
    const host = c?.parentElement
    const g = c?.getContext('2d')
    if (!enabled || !c || !host || !g || !matchMedia('(pointer: fine)').matches) return
    const dots: { x: number; y: number; t: number }[] = []
    let last: { x: number; y: number } | null = null
    let frame = 0
    const color = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()

    const resize = () => {
      const dpr = Math.min(devicePixelRatio, 2)
      c.width = host.clientWidth * dpr
      c.height = host.clientHeight * dpr
      g.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const draw = () => {
      const now = performance.now()
      while (dots.length && now - (dots[0]?.t ?? now) > LIFE) dots.shift()
      g.clearRect(0, 0, c.width, c.height)
      g.fillStyle = color || '#b8402a'
      for (const d of dots) {
        const life = 1 - (now - d.t) / LIFE
        g.globalAlpha = life * 0.85
        g.beginPath()
        g.arc(d.x, d.y, 1.4 + life * 1.6, 0, Math.PI * 2)
        g.fill()
      }
      frame = dots.length ? requestAnimationFrame(draw) : 0
    }
    const move = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      const r = host.getBoundingClientRect()
      const p = { x: e.clientX - r.left, y: e.clientY - r.top }
      if (last) {
        // Lay dots at an even spacing along the stroke, like a dotted route.
        const dist = Math.hypot(p.x - last.x, p.y - last.y)
        for (let s = GAP; s <= dist; s += GAP) {
          const k = s / dist
          dots.push({
            x: last.x + (p.x - last.x) * k,
            y: last.y + (p.y - last.y) * k,
            t: performance.now(),
          })
        }
        if (dist < GAP) return
      }
      last = p
      if (!frame) frame = requestAnimationFrame(draw)
    }
    const leave = () => {
      last = null
    }
    resize()
    addEventListener('resize', resize)
    host.addEventListener('pointermove', move)
    host.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(frame)
      removeEventListener('resize', resize)
      host.removeEventListener('pointermove', move)
      host.removeEventListener('pointerleave', leave)
    }
  }, [enabled])
  return (
    <canvas
      ref={canvas}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  )
}
