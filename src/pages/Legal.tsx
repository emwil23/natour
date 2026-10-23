import type { ReactNode } from 'react'

function Page({
  title,
  updated,
  children,
}: {
  title: string
  updated: string
  children: ReactNode
}) {
  return (
    <article className="[&_h2]:font-display [&_p]:text-muted [&_ul]:text-muted mx-auto max-w-3xl px-6 pt-36 pb-28 [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-3xl [&_h2]:font-semibold [&_li]:mt-2 [&_p]:mt-3 [&_ul]:list-disc [&_ul]:pl-5">
      <p className="spec text-accent-text">Last updated {updated}</p>
      <h1 className="font-display mt-4 text-6xl font-semibold">{title}</h1>
      {children}
    </article>
  )
}

const link = 'text-accent-text underline'

export function Privacy() {
  return (
    <Page title="Privacy" updated="23 October 2026">
      <p>
        The short version: your trips and your journal stay on your device. We don't run ads,
        trackers or analytics.
      </p>

      <h2>What stays on your device</h2>
      <p>
        Trips, packing lists, budgets, your journal's notes and photos, and your settings are stored
        in your browser (IndexedDB and local storage). Journal photos are shrunk on your device and
        never uploaded. Clearing your browser data deletes all of it.
      </p>

      <h2>Places, maps, guides and photos</h2>
      <ul>
        <li>
          Place lookups go through our server (ew-apps-api) to OpenStreetMap's Nominatim service, so
          its one-request-a-second limit can be shared fairly and answers cached. They carry place
          names and the destination's area, not who you are.
        </li>
        <li>
          Map tiles load straight from{' '}
          <a className={link} href="https://openfreemap.org/">
            OpenFreeMap
          </a>
          , which sees your IP address like any website would and sets no cookies.
        </li>
        <li>
          Guides come from Wikivoyage and climate averages from NASA POWER, both through our server.
          Destination photos load from Unsplash's servers.
        </li>
        <li>
          "Search stays" buttons open Booking.com or Airbnb in a new tab, under their own privacy
          policies. Natour sends them only the neighbourhood's name and has no affiliate deal with
          them.
        </li>
      </ul>

      <h2>When you use the AI</h2>
      <p>
        You choose the provider in Settings. The AI only ever sees your trip description, the
        destination, the number of days and month, and place names. Never your journal, photos or
        anything personal.
      </p>
      <ul>
        <li>
          <strong>Natour AI (free)</strong> runs through our server on Google's Gemini API free
          tier.{' '}
          <strong>
            Google may read and use prompts sent on the free tier to improve its products
          </strong>
          , so don't put personal or sensitive details in a trip description. You sign in with a
          code sent to your email (Supabase) so we can count your daily calls; we store your email,
          a user id, the date you confirmed you're 18 or over and a per-day call count. Nothing
          else. You can delete all of it any time from Settings. This option is not offered in the
          EEA, the UK or Switzerland, or to anyone under 18.
        </li>
        <li>
          <strong>Puter</strong>, <strong>OpenRouter</strong> and <strong>your own key</strong> send
          requests straight from your browser to that service, under its own privacy policy. Keys
          are stored only in your browser.
        </li>
      </ul>

      <h2>Our server</h2>
      <p>
        Our API logs the time, route and status of requests to keep it running, and uses your IP
        address in memory to apply rate limits and the region rule. Place, guide and climate answers
        are cached in memory for up to a month. We don't sell or share data.
      </p>

      <h2>Contact</h2>
      <p>
        Questions or deletion requests: reach Emmanuel via{' '}
        <a className={link} href="https://emmanuelwilson.tech">
          emmanuelwilson.tech
        </a>
        .
      </p>
    </Page>
  )
}

export function Terms() {
  return (
    <Page title="Terms" updated="23 October 2026">
      <p>
        Natour is open-source software provided as is, without warranty. By using it you agree to
        these terms.
      </p>
      <h2>Plans are suggestions</h2>
      <p>
        Every place in a plan has been found on OpenStreetMap, but OpenStreetMap can be out of date:
        a place may have closed, moved or changed its hours. Walking times are estimates from
        straight-line distance, not routes. Check before you go, and never rely on Natour for
        safety, access or opening times.
      </p>
      <h2>Estimates, not prices</h2>
      <p>
        Budget figures are rough estimates for planning, made by an AI or typed by you. Natour shows
        no prices, ratings or reviews as fact, and doesn't sell or book anything. Booking.com and
        Airbnb links open plain searches on those sites, which have their own terms.
      </p>
      <h2>Data and credits</h2>
      <ul>
        <li>
          Map data ©{' '}
          <a className={link} href="https://www.openstreetmap.org/copyright">
            OpenStreetMap contributors
          </a>
          , under the ODbL. Map tiles by OpenFreeMap, © OpenMapTiles.
        </li>
        <li>
          Guide text from{' '}
          <a className={link} href="https://en.wikivoyage.org/">
            Wikivoyage
          </a>
          , by its contributors, under{' '}
          <a className={link} href="https://creativecommons.org/licenses/by-sa/4.0/">
            CC BY-SA 4.0
          </a>
          ; each guide links to its article.
        </li>
        <li>
          Climate averages: data obtained from the NASA Langley Research Center POWER Project,
          funded through the NASA Earth Science Division (Climatology API, 2001–2025).
        </li>
        <li>Destination photos from Unsplash, credited to each photographer.</li>
        <li>
          Mood pictures and illustrations are made for Natour and are not photos of real places.
        </li>
      </ul>
      <h2>Your journal</h2>
      <p>Your journal lives on your device. You are responsible for keeping a copy.</p>
      <h2>The AI</h2>
      <p>
        The AI's descriptions can be wrong. Fair-use limits apply to the free AI server, and we may
        change or pause it.
      </p>
      <h2>Pro</h2>
      <p>
        When Pro launches, its price and refund rules will be shown at checkout. Pro never unlocks
        the AI itself; that stays free.
      </p>
      <h2>Licence</h2>
      <p>
        The source code is MIT-licensed. The Natour name, logo, illustrations and character artwork
        belong to EWSTUDIOS.
      </p>
    </Page>
  )
}
