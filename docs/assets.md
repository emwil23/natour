# Natour assets

Generated in Google Flow, project "Revamp", on 2026-10-23: stills with **Nano Banana Pro** (0 credits) and clips with **Omni 1.1 Flash** (720p). The owner's character (the `master` image in the project) appears only on the developer page. Real places in the app are always Unsplash photos with credit; the AI images here are mood and illustration, never shown as a named place (the Explore page says so under the mood tiles).

Shared style lines:

- Share image: a dark dotted globe, teal-black space (#0B1517), ember (#FF8A5C) flight arcs, pale green land light, film grain.
- Mood tiles: miniature dioramas with tilt-shift, so they read as crafted models, not photos.
- Illustrations and empty states: soft 3D on warm map paper (#F4EFE6), terracotta (#B8402A) and forest green (#2C6A4C).
- Always: no readable text, no logos, unbranded objects, no people (except the developer page).

| File (public/media)                                     | Used on                               | Prompt (short)                                                                                                                    |
| ------------------------------------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `stamp-coast-{768,1280,1920}.webp`                      | Landing, the stamp window (Dream)     | A wide paper-and-clay coast diorama with a dotted route stitched along the clifftop and a tiny lighthouse (2K upscale, 0 credits) |
| `mood-coast.webp`                                       | Landing and Explore mood tiles        | A diorama of a turquoise cove under white cliffs with a tiny lighthouse                                                           |
| `mood-mountains.webp`                                   | Landing and Explore mood tiles        | A diorama of snowy peaks over a pine valley, a winding trail and an alpine lake                                                   |
| `mood-old-town.webp`                                    | Landing and Explore mood tiles        | A diorama of a hill town of terracotta roofs, cobbled lanes and a bell tower                                                      |
| `mood-desert.webp`                                      | Landing and Explore mood tiles        | A diorama of golden dunes, a palm oasis and two tents                                                                             |
| `mood-forest.webp`                                      | Landing and Explore mood tiles        | A diorama of a misty mossy forest with a boardwalk over a stream                                                                  |
| `mood-night-city.webp`                                  | Landing and Explore mood tiles        | A diorama of a city at night, lit windows, a river bridge and wet streets                                                         |
| `step-go.webp`                                          | Landing journal spread, a taped print | Walking shoes on cobbles with a dotted route painted on past a café table                                                         |
| `empty-trips.webp`                                      | Trips, no trips yet                   | A blank folded map with one pin lying beside it and a dotted line that starts and stops                                           |
| `empty-journal.webp`                                    | Journal, nothing yet                  | A closed journal tied with an elastic band, a pen on top                                                                          |
| `empty-packing.webp`                                    | Pack, no list yet                     | An open empty backpack, a folded shirt and a water bottle beside it                                                               |
| `empty-results.webp`                                    | Stay (before comparing), missing trip | A brass compass and a magnifying glass on a blank map                                                                             |
| `og.jpg`                                                | Social share image (1200×630)         | Globe and arcs on the right, a paper route map below, dark empty space left; title added in code                                  |
| `developer.webp`                                        | Developer page, landing card          | The owner's character with an unbranded backpack and a paper route map, smiling (reference `master`)                              |
| `developer-loop.mp4` / `.webm`, `developer-poster.webp` | Developer page (6s)                   | From the portrait: he traces the route with a finger, then looks up and waves                                                     |

## Processing

- Flow marks each output with a small sparkle in the bottom-right corner; every still and clip is cropped to its top-left 90% to leave it out.
- Stills: Pillow, WebP quality 78, sized for their largest use at 2× (mood tiles 640 px wide, story steps 900, empty states 480). Clips: `ffmpeg`, H.264 (`+faststart`) and VP9, no audio; posters are each clip's own first frame.
- The landing globe's land dots are baked from Natural Earth's 1:110m land (public domain, via `world-atlas`) by `scripts/land-dots.mjs`.
- Fonts: Fraunces (weight and optical-size axes, Latin, from Fontsource), Inter Tight and JetBrains Mono as in the other EW apps.
- Logo, favicon and PWA icons: hand-drawn SVG (`public/favicon.svg`, `src/components/Logo.tsx`), rendered to PNG with Playwright.
- Spend: 22 credits in all for the first build (an 8s globe clip, 12, since retired with the old landing; the 6s developer loop, 10). Every still was 0, including the landing redesign's stamp image. Flow's download sometimes picks up an older tile from another app; each file was checked by eye, and two were fetched again by their real titles.
- The downloaded originals in `E:\flow-mcp-out\natour` are deleted once the optimised files are in the repo; Flow keeps every original.
