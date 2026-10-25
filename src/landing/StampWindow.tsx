import { Words } from './Route'

// A row of perforations along one edge of the stamp: paper-coloured holes punched half out of the frame.
function Perf({ side }: { side: 'top' | 'bottom' | 'left' | 'right' }) {
  const horizontal = side === 'top' || side === 'bottom'
  return (
    <span
      aria-hidden
      className="absolute"
      style={{
        [side]: '-7px',
        ...(horizontal
          ? { left: 0, right: 0, height: '14px' }
          : { top: 0, bottom: 0, width: '14px' }),
        backgroundImage: 'radial-gradient(circle, var(--bg) 5px, transparent 5.5px)',
        backgroundSize: horizontal ? '18px 14px' : '14px 18px',
        backgroundPosition: 'center',
      }}
    />
  )
}

/**
 * Chapter 1, Dream. A postage stamp in the middle of the page grows until it fills the screen, then the
 * scene dissolves through paper cloud into the next chapter (after White Desert's cloud transition).
 * Without motion (phones, reduced motion) it is simply a large stamp.
 */
export function StampWindow() {
  return (
    <section id="how" aria-labelledby="dream-h" data-window className="relative md:h-[230vh]">
      <div className="relative flex min-h-[100svh] items-center justify-center overflow-hidden py-12 md:sticky md:top-0 md:h-[100svh] md:py-0">
        <div data-window-frame className="relative h-[78svh] w-[90vw] md:h-[82svh] md:w-[88vw]">
          <div className="absolute inset-0 overflow-hidden">
            <img
              data-window-img
              src="/media/stamp-coast-1280.webp"
              srcSet="/media/stamp-coast-768.webp 768w, /media/stamp-coast-1280.webp 1280w, /media/stamp-coast-1920.webp 1920w"
              sizes="(min-width: 768px) 100vw, 90vw"
              alt=""
              width={1920}
              height={1072}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover object-[62%_50%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
            <div data-window-text className="absolute inset-x-0 bottom-0 p-5 sm:p-8 md:p-12">
              <p className="spec mb-3 text-white/85">Chapter 1 of 4 · Dream</p>
              <h2
                id="dream-h"
                data-reveal-words
                className="font-display max-w-4xl text-[clamp(2.4rem,6.5vw,6.5rem)] leading-[0.95] font-light tracking-tight text-white"
              >
                <Words text="Every trip starts as a daydream." />
              </h2>
              <p className="mt-4 max-w-md text-white/90">
                Tell Natour where, when and what you love, in a sentence, the way you'd tell a
                friend.
              </p>
            </div>
          </div>
          <Perf side="top" />
          <Perf side="bottom" />
          <Perf side="left" />
          <Perf side="right" />
          <p className="spec text-muted absolute -bottom-8 left-0 text-[10px]">
            Illustration · not a photo of a real place
          </p>
        </div>

        {/* Paper cloud that rises over the scene at the end of the chapter. */}
        <svg
          data-window-cloud
          viewBox="0 0 1440 600"
          preserveAspectRatio="none"
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-[130%] w-full translate-y-full md:block"
        >
          <path
            d="M0 180 C 120 90, 220 160, 320 110 S 520 40, 640 120 S 860 60, 980 110 S 1220 30, 1320 100 S 1440 90, 1440 90 V600 H0Z"
            fill="var(--bg)"
            opacity="0.55"
          />
          <path
            d="M0 260 C 160 170, 260 240, 400 190 S 640 130, 760 210 S 980 150, 1100 200 S 1320 140, 1440 190 V600 H0Z"
            fill="var(--bg)"
          />
        </svg>
      </div>
    </section>
  )
}
