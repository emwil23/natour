// Bakes the landing globe's land dots: points spread evenly over a sphere (a Fibonacci lattice), kept where
// they fall on land in Natural Earth's 1:110m land shapes (public domain, via the world-atlas package).
// Run once: `node scripts/land-dots.mjs`. Writes src/landing/land-dots.json as a flat [lat, lon, …] list.
import { geoContains } from 'd3-geo'
import { readFile, writeFile } from 'node:fs/promises'
import { feature } from 'topojson-client'

const topo = JSON.parse(
  await readFile(new URL('../node_modules/world-atlas/land-110m.json', import.meta.url), 'utf8'),
)
const land = feature(topo, topo.objects.land)

const N = 16000
const golden = Math.PI * (3 - Math.sqrt(5))
const out = []
for (let i = 0; i < N; i++) {
  const y = 1 - (i / (N - 1)) * 2
  const lat = (Math.asin(y) * 180) / Math.PI
  const lon = (((((i * golden * 180) / Math.PI) % 360) + 540) % 360) - 180
  if (geoContains(land, [lon, lat])) out.push(Math.round(lat * 10) / 10, Math.round(lon * 10) / 10)
}
await writeFile(new URL('../src/landing/land-dots.json', import.meta.url), JSON.stringify(out))
console.log(`${String(out.length / 2)} land dots of ${String(N)}`)
