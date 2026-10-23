# Natour: build brief (approved by the owner 2026-10-23)

Read `D:\Code\AIPro\AIPro\ew-apps\CLAUDE.md` first, plus the saved memory on EW apps infrastructure and lessons. They all apply. **Reuse the shared pieces from `../willify` (the newest), `../translateapp`, `../pixe` and `../taskpilot`**: Vite starter setup, AI-connect layer, email-code auth, Meet-the-developer page, CI, the Cloudflare Workers deploy setup. Copy them; don't rebuild them. Add Natour's routes to `../ew-apps-api`. Only one session writes there at a time, so check nobody else is working in it. Work on a new branch `revamp` from `master`, commit in small steps, push, and open a PR to `master`. Replace the CRA app entirely; keep git history. ew_trillo and nexter (github.com/emwil23/ew_trillo, github.com/emwil23/nexter) are folded into this app's ideas. Leave those repos and their old GitHub Pages sites alone unless the owner asks. Don't rename the repo without asking.

## 1. What's there now
- All three are 2021 design-only exercises with no logic. They match the well-known *Advanced CSS* course projects (Natours, Trillo, Nexter), so the new app keeps the names and ideas but **none of their layouts, copy or images**.
- **natour:** React 17 CRA tour-booking landing page: hero video, three tour cards (Easy/Medium/Hard, group size, tents vs hotels), a booking popup, and a form that does nothing.
- **ew_trillo:** a hotel page ("Hotel Bilando, Alabama, Calefornia") with amenities, made-up reviews and "Only 4 rooms left".
- **nexter:** a real-estate homes page. The repo holds only built files with the title "React App", and no source.
- Problems:
  - fake reviews and fake scarcity
  - typos ("genuienly", "Calefornia")
  - forms that go nowhere
  - no alt text
- Keep: the travel idea, natour's Easy/Medium/Hard difficulty (it becomes walking effort per day), and "where to stay" from Trillo and Nexter.

## 2. What we're making
**Natour: an AI trip planner that only suggests real places.** Describe a trip ("5 days in Lisbon in May, food and viewpoints, mid budget, one slow morning") and get a day-by-day plan on a map. Every place the AI suggests is **checked against OpenStreetMap in code, and dropped if it doesn't exist** (same idea as Willify's iTunes check).

Pages:
- `/`: landing with a 3D globe that flies into your destination, routes drawing across it like flight paths. Scroll story *dream → plan → go → remember*, pricing teaser, footer "Made with ♥ by EWSTUDIOS".
- `/app`: trip list.
- `/app/trip/:id`: the planner.
  - Days as columns; drag stops between days; the map route and walking times update.
  - Effort per day (Easy/Medium/Hard).
  - Lock a stop and regenerate the rest; a "rainy-day version" of a day.
- `/app/trip/:id/stay`: compares 3 neighbourhoods for the trip: vibe, distances to your stops, pros and cons. "Search stays" buttons open plain Booking.com or Airbnb search links. No bookings in the app, and no prices or reviews shown as fact.
- `/app/trip/:id/pack`: packing list from climate, activities and trip length.
- `/app/trip/:id/budget`: estimated daily spend you can edit, in your currency, clearly labelled as an estimate.
- `/app/explore`: destination pages with Unsplash photos, a short guide from Wikivoyage, and the best months to visit.
- `/app/journal`: after the trip, notes and photos per day. Kept **only on the device** (IndexedDB), with the trip route drawn as a map line.
- `/developer`, `/pro`, `/settings`, `/privacy`, `/terms`, a designed 404.

## 3. Taken from competitors
| From | Feature | In Natour |
|---|---|---|
| Wanderlog | Day-by-day plan on a map, drag to reorder | The planner columns plus a live route |
| Mindtrip / Layla | Plan from a chat prompt | "Describe your trip", with every place checked |
| TripIt | Everything for one trip in one place | Each trip holds plan, stay, packing and budget |
| Roadtrippers | Route and stops on the way | Walking or transit times, "add a stop on the way" |
| Polarsteps | A map journal after the trip | Journal with the route drawn |
| Google Travel | Best time to visit | Best months chart on destination pages |

**AI actions** (shared route `/api/ai/natour/:action`): plan trip, refine day, rainy-day swap, neighbourhood compare, packing list, budget estimate.

## 4. Data and rules (required)
- **Before building, read the current terms** of each source below and note the findings in the PR.
- **Map:** MapLibre GL with OpenFreeMap tiles (free, no key) and OSM attribution. Check that OpenFreeMap allows use in an app with a paid Pro tier.
- **Places:** Nominatim and Overpass through ew-apps-api (new `/api/places/*` routes) with caching. Nominatim's public server allows at most 1 request a second, a real User-Agent and no heavy use, so the API rate-limits and caches it.
- **Guides:** Wikivoyage and Wikipedia text under CC BY-SA, credited and linked.
- **Photos:** Pixe's existing Unsplash route, with the same credit and download-tracking rules.
- **Climate:** Open-Meteo's free plan is non-commercial only, and the Pro pass makes Natour commercial. Check the current licence and **ask the owner** before choosing between Open-Meteo for free features only, a CC-licensed climate-averages dataset, or dropping weather.
- **No fakes:** no invented reviews, ratings, scarcity or prices shown as fact.
- **Gemini:** free-tier Gemini may be read by Google. Send only the trip description and place names, never the journal, photos or personal data. Say so on the privacy page.
- **Age and region:** 18+ for the Gemini route, hidden for EU/UK/CH users (per CLAUDE.md). Fallback providers still work there.

## 5. Tech (all in)
- Same base as the other apps: React 19, strict TS, Vite, TanStack Router, Dexie, Zustand, Tailwind v4, shadcn/Radix, Motion, GSAP + Lenis, React Three Fiber + drei, PWA, CI with Lighthouse ≥ 95 and axe.
- Map: MapLibre GL. Drag: dnd-kit with keyboard support. A list view of every day is the accessible alternative to the map.
- Tests:
  - unit tests for the place check, the route times and the budget maths
  - Playwright for describe → plan → reorder → packing list

## 6. Sign-in and hosting
- **Email code only, no passkey button** (per CLAUDE.md).
- Host at `natour.ewstudios.workers.dev`. Add that origin to the Supabase redirect URLs and `ALLOWED_ORIGINS` when deploying; it is not a passkey origin.

## 7. Pro (gated through the shared entitlement)
Trip sync across devices, shared trips where friends vote on stops (Supabase Realtime), PDF export of the itinerary, higher AI quota.

## 8. Design and assets
- Use the `awwwards` MCP for 3–5 references (travel, maps, 3D globes, editorial travel guides) and write docs/design-brief.md. Show the owner the direction before building the UI.
- Assets come through the `flow` MCP (rules in CLAUDE.md):
  - always `model: "Nano Banana Pro"` for images and `model: "Omni 1.1 Flash"` for videos
  - output in `E:\flow-mcp-out\natour`
  - check that Flow is on project Revamp first
- The owner's character appears **only** on the developer page. Assets:
  - hero: the globe flying into a city, an 8s clip and a still, no people
  - 6 destination-mood stills (coast, mountains, old town, desert, forest, night city)
  - 4 step illustrations and 4 empty-state illustrations
  - developer portrait and loop
  - OG image
- Real destination photos in the app come from Unsplash with credit, never AI images passed off as real places.
- List assets in docs/assets.md. Delete downloaded originals after use. Draw the logo and icons as SVG.

## Done means
- All pages work and tests pass in CI.
- docs/design-brief.md and docs/assets.md exist.
- A showcase README (see CLAUDE.md) uses real screenshots.
- A PR is open.
- After the owner approves, deploy to its workers.dev address, then set the GitHub About section.

Don't deploy, rename the repo or spend anything without asking.
