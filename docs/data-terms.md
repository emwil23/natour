# Data sources: terms checked 2026-10-23

Natour sells a Pro pass, so every source is judged as **commercial use**.

| Source | Use in Natour | Terms (as read on 2026-10-23) | Verdict |
|---|---|---|---|
| [OpenFreeMap](https://openfreemap.org/) | Map tiles (MapLibre GL) | Free, no key, no request cap; FAQ: commercial use "Yes". Attribution (OpenMapTiles + OpenStreetMap) required; MapLibre shows it. | ✅ Use |
| [Nominatim](https://operations.osmfoundation.org/policies/nominatim/) (public OSMF server) | Checking each AI-suggested place exists | Max 1 request/s **for the whole app**, an identifying User-Agent, cache results, **no autocomplete**, no bulk/systematic queries. Commercial apps shouldn't depend on it for paying customers, since access can be withdrawn. ODbL attribution. | ✅ Use, only through ew-apps-api: one shared 1 req/s queue, results cached, no search-as-you-type. If it's down or refuses, stops show "couldn't check" instead of failing the plan. |
| [Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API) (overpass-api.de) | Was planned for nearby places | "Commercial use should use self-hosted or paid Overpass servers"; regular use ~100 queries/day; server often overloaded. | ❌ Don't use. Nominatim's search covers the place check. |
| [OSRM demo server](https://github.com/Project-OSRM/osrm-backend/wiki/Demo-server) | Walking routes | "Reasonable, non-commercial use-cases" only, 1 req/s. | ❌ Don't use. Walking times are estimated in code (straight-line distance × detour factor ÷ walking speed), labelled "about". |
| [Wikivoyage / Wikipedia](https://www.mediawiki.org/wiki/API:Etiquette) | Destination guides | Text under CC BY-SA 4.0: credit and link the article. API: identifying User-Agent with contact, serial requests, cache. | ✅ Use, through ew-apps-api with cache. |
| [Unsplash](https://unsplash.com/api-terms) | Destination photos | Pixe's existing route: hotlink, credit photographer + Unsplash, trigger the download endpoint. | ✅ Reuse Pixe's route. |
| [Open-Meteo](https://open-meteo.com/en/terms) | Climate / best months | Free API is non-commercial only; "websites or apps that have subscriptions" count as commercial. Data CC BY 4.0. | ❌ Not usable: the app as a whole has a subscription, so even free features count as commercial. |
| [NASA POWER](https://power.larc.nasa.gov/docs/referencing/) climatology API | Climate / best months (proposed) | Free, no key. Monthly climatology (max/min temperature, rainfall) for any lat/lon, 2001–2025. NASA asks for an acknowledgement and a data reference; no commercial restriction found. | ✅ Proposed replacement (owner to confirm). |
