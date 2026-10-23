# Natour design brief

Made with the `awwwards` MCP (`search_sites`, `get_site_details`, `create_design_brief`) on 2026-10-23. We take ideas from these sites and copy none of them. The old natour, Trillo and Nexter layouts aren't used either: they came from a course.

## References

| Site | Award | What we take |
| --- | --- | --- |
| [Hedwig: Curated Travel](https://hedwigtravel.com/) | Honorable Mention (Apr 2026) | Film photos scattered on a flat colour field, each with a numbered caption ("VIII. … Atlantic Ocean, The Gambia"). Natour's explore and journal pages caption every photo with a numeral, the place and its coordinates. |
| [The Explora Journal](https://explorajourneys.com/int/en/explora-journal) | Honorable Mention | A calm, warm-paper travel magazine: a big serif title, generous margins, photo and text split in halves. Destination guides read like magazine articles, not like app screens. |
| [EXOLAUNCH Orbit Explorer](https://exolaunch.com/missions/mission1.html) | Nominee | Dotted orbit lines drawn over a graticule, with mono city labels. Natour draws routes as dotted arcs that fill in as you scroll, with a faint lat/long grid behind them. |
| [Dérive](https://derive-ocean.com/) | Nominee | A real-time 3D world seen from above, with a Polaroid-style map card pinned in the corner. Our journal pins a small route map to each day like a print taped into a notebook. |
| [Mammut Local Adventure](https://localadventure.mammut.com/) | SOTD + Developer | Huge white type over full-bleed nature photography, and a three-item menu. The landing's chapter titles ("Dream", "Plan", "Go", "Remember") are set huge over the Flow mood stills. |

## The idea: the route is a thread

Every trip is one thread pulled through real places. On the landing a 3D globe turns, dotted flight-path arcs draw between cities, and as you scroll the camera flies into one city where the arc becomes a walking route through its streets. In the app the same thread runs through each day: stops are pins, the line between them is the route, and the walking time is written along it.

The second motif is the **check stamp**. Every place the AI suggests is looked up on OpenStreetMap. A place that exists gets a small round stamp, like a passport stamp, with "CHECKED · OSM" and its coordinates. A place that doesn't exist never reaches the screen; a line under the plan says how many were dropped ("2 suggestions didn't exist and were dropped"). The stamp is the proof, and it is also the journal's look: after the trip, days are stamped "VISITED".

It keeps the old natour ideas (travel, tours, Easy/Medium/Hard) and turns the difficulty into **walking effort per day**: a little three-step bar on each day column.

## Palette

Warm map paper by day, night flight by dark. The route colour is the one loud colour.

Light ("paper", default):

| Token | Hex | Use |
| --- | --- | --- |
| `--bg` | `#F4EFE6` | map paper |
| `--surface` | `#FFFDF8` | cards, day columns |
| `--line` | `#DDD3C2` | borders, the graticule |
| `--text` | `#1B2420` | ink, a touch of forest (13.9:1 on bg) |
| `--muted` | `#58615A` | captions, coordinates (5.6:1) |
| `--accent` | `#B8402A` | terracotta: the route line, primary buttons (white text 5.5:1), focus rings (4.8:1) |
| `--live` | `#2C6A4C` | forest: the check stamp, "Easy" effort (5.6:1) |
| `--danger` | `#B42318` | errors (5.7:1) |

Dark ("night flight"): `--bg #0B1517` (deep sea at night), `--surface #132224`, `--text #EEF1EA` (16.2:1), `--muted #9DB0A8` (8.1:1), `--accent #FF8A5C` (ember route, 8.0:1; dark text on it 8.0:1), `--live #86D6AE` (10.8:1), `--danger #FF7B7B` (7.4:1).

Contrast is computed above and checked by axe in both themes in CI. The map tiles get a matching OpenFreeMap style per theme (Positron-like paper tones by day, Dark Matter-like by night) with the route on top in the accent.

## Type

- Display: **Fraunces** variable (optical size and "soft" axes), for magazine titles and the landing chapters. Self-hosted, Latin subset.
- UI and body: **Inter Tight** variable (shared with the other EW apps).
- Labels: **JetBrains Mono** uppercase 11px with wide tracking, for coordinates, walking times, the check stamp and day numbers ("DAY 02 · 6.4 KM · ~1 H 25 WALKING").

## Motion

- **Hero globe (React Three Fiber + drei):** a low-poly globe of land dots (one instanced draw call), a faint graticule, and five dotted arcs between cities that draw themselves in turn. The pointer tilts it. On scroll, the camera dollies into the last arc's city and the dots resolve into a flat map; there the 2D story takes over. On phones, slow GPUs, no WebGL or reduced motion it is the Flow still, and the 8s Flow clip on wide screens without WebGL, loaded after first paint like the other EW apps.
- **Scroll story (GSAP ScrollTrigger + Lenis), four chapters, each a huge Fraunces word over a Flow mood still:**
  - _Dream_: a trip description types itself into the box.
  - _Plan_: pins drop onto a map one by one, each gets its stamp, and one fake pin fades out with "doesn't exist, dropped".
  - _Go_: the route draws between the pins, and walking times count up along it.
  - _Remember_: the map folds into a journal page with a taped route print and a "VISITED" stamp.
- **App (Motion):** stops slide between day columns (dnd-kit, keyboard too); the route redraws with a short dash animation; stamps land with a small press-and-settle. No scroll-jacking in the app.
- `prefers-reduced-motion`: no Lenis, no scrub, no globe spin or flight, no stamp animation; the same content and keyboard access.

## Layout, page by page

- **Landing `/`:** globe hero (headline "Describe the trip. Walk it." bottom-left, the describe box under it, mono coordinates of the arc cities around the edges) → four pinned chapters → "why it's different" bento (every place checked on OpenStreetMap; plan, stay, pack and budget in one trip; the journal stays on your device; no account to start) → six destination mood tiles from Flow (coast, mountains, old town, desert, forest, night city) leading to Explore → pricing teaser → developer card → footer "Made with ♥ by EWSTUDIOS".
- **Trips `/app`:** "Describe your trip" box with example chips, then your trips as postcards: city name in Fraunces, dates, a mini route map, days and stops count.
- **Planner `/app/trip/:id`:** desktop has day columns on the left half and the map on the right half; phones have a Days | Map toggle. Each column shows "DAY 01", the effort bar, the distance and walking time, and its stops (name, check stamp, a "why" line, time to next stop). Per-stop actions: lock, move, remove. Per-day actions: regenerate the unlocked stops, "rainy-day version", add a stop on the way. A **List view** of every day is the accessible alternative to the map. Tabs to Stay, Pack and Budget sit under the trip title.
- **Stay `/app/trip/:id/stay`:** three neighbourhood cards side by side, each with its vibe, pros and cons, and the walking distance to each of your stops (computed in code, not by the AI). The map shows the three areas and your stops. "Search stays on Booking.com" and "…on Airbnb" open plain search links. No prices, ratings or reviews.
- **Pack `/app/trip/:id/pack`:** a checklist grouped into clothes, gear, documents and health, built from the climate, activities and trip length. The climate for the trip's months comes from NASA POWER, if approved. Ticks are saved on the device.
- **Budget `/app/trip/:id/budget`:** a daily spend table (stay, food, transport, activities) you can edit, in your currency, with a total and a per-day bar. "ESTIMATE" is stamped on it, and the AI's numbers are clearly marked as rough.
- **Explore `/app/explore`** and **`/app/explore/:place`:** a Hedwig-like loose grid of destinations (Unsplash photos with credit, numbered captions). A destination page reads like a magazine article: hero photo, a short guide from Wikivoyage (credited and linked, CC BY-SA), a best-months chart (12 bars, warm-to-cool), and "Plan a trip here".
- **Journal `/app/journal`:** a notebook. Per day: notes, photos (device only, IndexedDB), the day's route print taped in the corner, a "VISITED" stamp. A clear line says nothing here leaves your device.
- **Developer, Pro, Settings, Privacy, Terms:** the shared EW layouts in Natour's colours. Sign-in is the email code only, with no passkey button. The developer page shows the owner's character with a map and a backpack. This is the only place the character appears.
- **404:** a dotted route that runs off the edge of a torn map: "This road isn't on the map." with links home and to your trips.

## Assets (from Flow, project "Revamp")

- Hero: a globe flying into a city at dusk, an 8s clip and a still, no people.
- Six destination mood stills: coast, mountains, old town, desert, forest, night city.
- Four step illustrations: dream, plan, go, remember.
- Four empty states: no trips yet, empty journal, no packing list, no results.
- Developer portrait and loop, with the owner's character.
- OG image.

Style for all: soft, filmic light, warm paper and terracotta with forest green, no readable fake text, no fake brand logos, unbranded devices. Mood stills are clearly mood, never shown as a named real place; real places are Unsplash photos with credit. Logo and icons are SVG, drawn by hand. The mark is an **N drawn as one route line with a pin at its end**, its middle stroke the dotted part of the route.

## Data rules that shape the design

See [data-terms.md](data-terms.md). In short: the check stamp, "dropped" counts and the attribution line (© OpenStreetMap contributors, OpenFreeMap, OpenMapTiles) are part of the design, not fine print. Walking times are estimates in code and shown with "~". Nothing invented is shown as fact: no reviews, ratings, prices or scarcity.
