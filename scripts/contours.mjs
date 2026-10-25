// Bakes the landing cover's topographic lines: a seeded noise "terrain" traced into contour paths with
// d3-contour, written once to src/landing/contours.json as SVG path strings in a 1200×750 box.
// Run: `node scripts/contours.mjs`.
import { contours } from 'd3-contour'
import { writeFile } from 'node:fs/promises'

const W = 120
const H = 75
const SCALE = 10 // grid cell → SVG units (1200×750)

// Seeded value noise with smooth interpolation, summed over octaves (fbm).
let seed = 7
const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647
const G = 64
const grid = Array.from({ length: G * G }, rand)
const lerp = (a, b, t) => a + (b - a) * t
const smooth = (t) => t * t * (3 - 2 * t)
function noise(x, y) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const g = (i, j) => grid[((((j % G) + G) % G) * G + (((i % G) + G) % G)) | 0]
  const tx = smooth(x - xi)
  const ty = smooth(y - yi)
  return lerp(lerp(g(xi, yi), g(xi + 1, yi), tx), lerp(g(xi, yi + 1), g(xi + 1, yi + 1), tx), ty)
}
const fbm = (x, y) => {
  let v = 0
  let a = 0.55
  let f = 1
  for (let o = 0; o < 4; o++) {
    v += a * noise(x * f, y * f)
    a *= 0.5
    f *= 2.03
  }
  return v
}

const values = new Float64Array(W * H)
for (let j = 0; j < H; j++)
  for (let i = 0; i < W; i++) values[j * W + i] = fbm(i / 20 + 3.1, j / 20 + 1.7)

const lo = Math.min(...values)
const hi = Math.max(...values)
const LEVELS = 13
const thresholds = Array.from({ length: LEVELS }, (_, k) => lo + ((k + 0.5) * (hi - lo)) / LEVELS)

const r = (n) => Math.round(n * SCALE)
const paths = contours()
  .size([W, H])
  .smooth(true)
  .thresholds(thresholds)(Array.from(values))
  .map((c) =>
    c.coordinates
      .flatMap((poly) =>
        poly.map((ring) => `M${ring.map(([x, y]) => `${r(x)} ${r(y)}`).join('L')}Z`),
      )
      .join(''),
  )

const out = new URL('../src/landing/contours.json', import.meta.url)
await writeFile(out, JSON.stringify(paths))
console.log(`${String(paths.length)} levels, ${String(JSON.stringify(paths).length)} bytes`)
