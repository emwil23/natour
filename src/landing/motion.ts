import { prerendered } from '@/lib/boot'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, type RefObject } from 'react'

gsap.registerPlugin(ScrollTrigger)

const WIDE = '(min-width: 768px)'

/**
 * Every scroll animation on the landing, driven by data attributes in the sections. Nothing is hidden by
 * CSS: the static page is the finished state, so with reduced motion (or before this runs) everything reads.
 * Wide screens get the pinned, scrubbed version; phones get lighter reveals designed for a vertical scroll.
 */
export function useLandingMotion(root: RefObject<HTMLElement | null>, animate: boolean) {
  useEffect(() => {
    const page = root.current
    if (!animate || !page) return
    const q = <T extends Element = HTMLElement>(sel: string, el: ParentNode = page) => [
      ...el.querySelectorAll<T>(sel),
    ]

    const ctx = gsap.context(() => {
      // The cover's own reveals would hide prerendered text that is already on screen; leave it still then.
      const skipCover = (el: Element) => prerendered && el.closest('[data-cover]') !== null

      // Words rise from behind their line, once, as their paragraph comes into view.
      for (const el of q('[data-reveal-words]')) {
        if (skipCover(el) || el.closest('[data-window]')) continue
        gsap.from(q('[data-word]', el), {
          yPercent: 115,
          duration: 1.1,
          ease: 'power4.out',
          stagger: 0.035,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        })
      }

      // Route pens. The cover's is drawn as the page arrives; the others follow the scroll.
      for (const pen of q<SVGPathElement>('[data-route-pen]')) {
        if (pen.closest('[data-track]')) continue // drawn with the postcard strip below
        const len = pen.getTotalLength()
        gsap.set(pen, { strokeDasharray: len, strokeDashoffset: len })
        const section = pen.closest('section')
        if (pen.closest('[data-cover]'))
          gsap.to(pen, { strokeDashoffset: 0, duration: 2.4, ease: 'power2.inOut', delay: 0.8 })
        else
          gsap.to(pen, {
            strokeDashoffset: 0,
            ease: 'none',
            scrollTrigger: { trigger: section, start: 'top 60%', end: 'bottom bottom', scrub: 0.8 },
          })
      }

      const mm = gsap.matchMedia()

      // ---- Chapter 1: the stamp grows to the whole screen, then paper cloud rises over it. ----
      mm.add(WIDE, () => {
        const frame = page.querySelector('[data-window-frame]')
        if (!frame) return
        const words = q('[data-window] [data-word]')
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: '[data-window]',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.7,
          },
        })
        tl.fromTo(
          frame,
          { width: () => innerWidth * 0.34, height: () => innerHeight * 0.52, rotate: -3 },
          {
            width: () => innerWidth,
            height: () => innerHeight,
            rotate: 0,
            ease: 'power2.inOut',
            duration: 0.55,
          },
        )
          .fromTo(
            '[data-window-img]',
            { scale: 1.35 },
            { scale: 1, ease: 'none', duration: 0.55 },
            0,
          )
          .fromTo('[data-window-text]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 }, 0.42)
          .from(words, { yPercent: 115, stagger: 0.02, duration: 0.18, ease: 'power3.out' }, 0.44)
          .to('[data-window-cloud]', { yPercent: -100, ease: 'power1.in', duration: 0.3 }, 0.7)
      })

      // ---- Chapter 2: postcards slide past and get stamped in the middle of the screen. ----
      mm.add(WIDE, () => {
        const track = page.querySelector<HTMLElement>('[data-track]')
        const pin = page.querySelector('[data-plan-pin]')
        if (!track || !pin) return
        const distance = () => Math.max(0, track.scrollWidth - innerWidth)
        const slide = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: pin,
            start: 'top top',
            end: () => `+=${String(distance())}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        })
        const pen = track.querySelector<SVGPathElement>('[data-route-pen]')
        if (pen) {
          const len = pen.getTotalLength()
          gsap.fromTo(
            pen,
            { strokeDasharray: len, strokeDashoffset: len },
            {
              strokeDashoffset: 0,
              ease: 'none',
              scrollTrigger: {
                trigger: pin,
                start: 'top top',
                end: () => `+=${String(distance())}`,
                scrub: 0.6,
                invalidateOnRefresh: true,
              },
            },
          )
        }
        for (const card of q('[data-card]'))
          stampCard(card, { containerAnimation: slide, start: 'center 62%' })
      })
      mm.add('(max-width: 767px)', () => {
        for (const card of q('[data-card]')) stampCard(card, { start: 'top 62%' })
      })

      // ---- Chapter 3: paper layers part at their own speeds; the day's stops pop up along the route. ----
      mm.add(WIDE, () => {
        const go = page.querySelector('[data-go]')
        const scrub = { trigger: go, start: 'top bottom', end: 'bottom bottom', scrub: 0.8 }
        for (const layer of q('[data-depth]')) {
          const depth = Number(layer.getAttribute('data-depth'))
          gsap.fromTo(
            layer,
            { yPercent: depth * 42 },
            { yPercent: 0, ease: 'none', scrollTrigger: scrub },
          )
        }
        gsap.fromTo(
          '[data-sun]',
          { yPercent: 120 },
          { yPercent: -10, ease: 'none', scrollTrigger: scrub },
        )
        for (const [i, p] of q('[data-pin]').entries())
          gsap.from(p, {
            scale: 0,
            autoAlpha: 0,
            ease: 'back.out(2.2)',
            duration: 0.5,
            scrollTrigger: {
              trigger: go,
              start: () => `top+=${String((go?.clientHeight ?? 0) * (0.18 + i * 0.16))} top`,
              toggleActions: 'play none none reverse',
              invalidateOnRefresh: true,
            },
          })
      })
      mm.add('(max-width: 767px)', () => {
        gsap.from(q('[data-pin]'), {
          scale: 0,
          autoAlpha: 0,
          stagger: 0.25,
          ease: 'back.out(2.2)',
          duration: 0.5,
          scrollTrigger: { trigger: '[data-go]', start: 'top 30%', once: true },
        })
      })

      // ---- Chapter 4: prints are taped down, then the VISITED stamp slams onto the spread. ----
      const remember = { trigger: '[data-spread]', start: 'top 70%', once: true }
      const tl = gsap.timeline({ scrollTrigger: remember })
      tl.from(q('[data-print]'), {
        y: 90,
        rotate: (i) => [-14, 10, -8][i] ?? 0,
        autoAlpha: 0,
        duration: 0.9,
        ease: 'power4.out',
        stagger: 0.12,
      })
        .from(
          '[data-slam]',
          { scale: 2.6, rotate: -28, autoAlpha: 0, duration: 0.28, ease: 'power4.in' },
          '-=0.2',
        )
        .fromTo(
          '[data-spread]',
          { x: 0 },
          { x: 4, duration: 0.05, repeat: 3, yoyo: true, ease: 'none' },
        )
        .to('[data-spread]', { x: 0, duration: 0.05 })
    }, page)

    // Images and the cover's contours change the page height as they load.
    const refresh = () => ScrollTrigger.refresh()
    addEventListener('load', refresh)
    const late = setTimeout(refresh, 1500)
    return () => {
      removeEventListener('load', refresh)
      clearTimeout(late)
      ctx.revert()
    }
  }, [root, animate])
}

/** A real place gets its stamp pressed on; the made-up one drops out of line. */
function stampCard(card: HTMLElement, trigger: ScrollTrigger.Vars) {
  const stamp = card.querySelector('[data-card-stamp]')
  const fake = card.hasAttribute('data-fake')
  const st = { trigger: card, toggleActions: 'play none none reverse', ...trigger }
  if (stamp)
    gsap.from(stamp, {
      scale: fake ? 1 : 2,
      rotate: fake ? 0 : -24,
      autoAlpha: 0,
      duration: fake ? 0.3 : 0.4,
      ease: fake ? 'power2.out' : 'back.out(1.8)',
      scrollTrigger: st,
    })
  if (fake)
    gsap.to(card, {
      y: 26,
      rotate: 6,
      opacity: 0.7,
      duration: 0.6,
      ease: 'power3.out',
      scrollTrigger: st,
    })
}
