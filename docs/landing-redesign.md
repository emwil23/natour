# Natour landing redesign: "The Long Way Round"

October 2026. Only the landing page (`/`) changes; the app pages stay as they are.

## Why

Natour's first landing shared its skeleton with Willify's: a dark page, a mono eyebrow chip, a two-line headline with a coloured second line, a paragraph, an input pill, a marquee ticker along the bottom and a 3D object on the right. The two apps should look nothing alike. Natour is about **travel on paper**: maps, routes, postcards and stamps. So the new page is light, editorial and cinematic, and it moves like a pen drawing a route.

## References (Awwwards, studied with the `awwwards` MCP and in a browser)

| Site | Award | What we take | What we don't |
| --- | --- | --- | --- |
| [White Desert](https://white-desert.com/) | Site of the Day + Developer Award, Sep 2026 (Design 7.28, Content 7.74) | The hero doesn't cut to the next section; it **flies through cloud into a calm white page**. A **fine vertical column grid** runs through the page. Long editorial sentences are set huge in a serif, in uppercase, with ragged indents. Lenis smooth scroll. | Their photography, their Oswald display type, and the dark video hero. |
| [Tengile MalaMala Collection](https://tengilemalamala.com/) | Site of the Day + Developer Award, Oct 2026 (Content 7.43) | A **monogram preloader drawn stroke by stroke** before anything else. Warm off-white paper (#FBF8F6) with one earthy accent. **Thin, staggered serif lines** that read like a magazine cover. Restraint: few elements, lots of air. | The luxury-lodge tone, the menu and the gallery layout. |
| [The Tuscan Journey Begins](https://weekend-mm-2026-pasticcino-bag-master.monogrid.io/en/) (Monogrid) | Site of the Day, Sep 2026 (Creativity 7.71) | A trip told as a **journey through scenes**, with **collage, torn paper and ticket graphics** layered on top of each other. The page feels like a physical object you travel through. | Its WebGL painting, sound and fashion story. |
| [Mammut Local Adventure](https://localadventure.mammut.com/) | Site of the Day + Developer Award | Chapter words set **as big as the screen allows** over nature. | Their red brand and their photography. |

## The concept: one line, the long way round

A single terracotta route is drawn by the reader's scroll through the whole page. It starts as a pen mark beside the masthead, wanders across a topographic map, threads between postcards, climbs over paper-cut hills and ends on a journal page. Wherever it reaches a place, that place gets stamped.

1. **Cover.** The page opens like a travel magazine cover on map paper, without a hero image:
   - A masthead, **NATOUR**, set across the whole width in Fraunces.
   - An issue line: "No. 01 · The real-places issue".
   - Cover lines with page numbers, like a print issue.
   - Behind it, slowly drifting **topographic contour lines**, generated from noise and drawn once as SVG.
   - The describe box becomes a **postcard**: a ruled "To:" line you write your trip on, a perforated stamp in the corner and a postmark button. It is the same `?describe=` entry point as before, and it works before the JavaScript loads.
2. **Window.** A **perforated postage-stamp window** in the middle of the page grows to full bleed as you scroll, showing the coast diorama, then flies through a paper cloud into the next scene. This takes White Desert's transition and makes it a stamp.
3. **Dream → Plan.** A pinned horizontal strip of postcards (places in Lisbon). The route threads through them. As each card reaches the centre it gets a green "CHECKED · OSM" stamp with its coordinates. One card, a rooftop bar that doesn't exist, is torn and crossed out: "didn't exist, dropped".
4. **Go.** **Paper-cut landscape layers** (sea, town, hills, mountains, drawn as SVG) move at different speeds. The route climbs through them, and walking times count up along it ("~15 min", "~10 min"). Effort bars fill in: Easy, Medium, Hard.
5. **Remember.** A journal spread: photos and notes slide in with washi tape, and a **VISITED stamp slams** down with a little press-and-settle.
6. **Where to next?** Huge editorial type, the postcard again, the pricing teaser, the developer card and the credits (OpenStreetMap, OpenFreeMap, Wikivoyage, NASA POWER, Unsplash). The footer still says "Made with ♥ by EWSTUDIOS".

## Motion rules

- GSAP core + ScrollTrigger + Lenis only. Route drawing uses `stroke-dashoffset`, and text reveals use our own word and line splitting, so no Club plugins are needed. Note: GSAP's Standard "no charge" licence (since the Webflow acquisition) allows commercial use and excludes only no-code animation builders that compete with Webflow.
- Easing: a soft expo out (`power4.out`) for reveals; `none` for anything scrubbed to scroll. Durations of 0.6–1.2 s. Nothing loops faster than 20 s except the contour drift.
- **Phones get their own layout:**
  - The masthead stacks.
  - The postcard strip becomes a vertical deck.
  - The landscape uses fewer layers.
  - The route runs down the edge of the page.
- **Reduced motion:** no Lenis, no pinning and no scrubbing. The route is fully drawn, every stamp is already down, and the page is a calm static magazine.
- **Performance:** no WebGL on this page. The cover's largest element is text (the masthead), and the contours are one inline SVG. Diorama images load lazily as they approach. Target: Lighthouse ≥ 95 on phones.

## Accessibility

- Every decorative SVG is `aria-hidden`, and the meaning is in text.
- Stamps have text equivalents. Horizontal sections are normal lists in the DOM order.
- Everything works from the keyboard.
- Contrast passes AA in both the paper and the night theme. At night the cover becomes a night map: ink paper with pale contours.
