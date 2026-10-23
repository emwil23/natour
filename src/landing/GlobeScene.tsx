import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef, type RefObject } from 'react'
import {
  AdditiveBlending,
  BufferGeometry,
  CanvasTexture,
  Float32BufferAttribute,
  Line,
  LineDashedMaterial,
  MathUtils,
  Quaternion,
  Vector3,
  type Group,
} from 'three'
import dots from './land-dots.json'

/** Cities the arcs fly between, last one first: the camera flies into Lisbon as you scroll. */
export const ARC_CITIES = [
  { name: 'Lisbon', lat: 38.72, lon: -9.14 },
  { name: 'Mexico City', lat: 19.43, lon: -99.13 },
  { name: 'Reykjavík', lat: 64.15, lon: -21.94 },
  { name: 'Marrakesh', lat: 31.63, lon: -8.01 },
  { name: 'Cape Town', lat: -33.92, lon: 18.42 },
  { name: 'Kyoto', lat: 35.01, lon: 135.77 },
] as const

const EMBER = '#ff8a5c'

/** Latitude/longitude to a point on a sphere of radius r (y up, lon 0 facing +z). */
function toVec(lat: number, lon: number, r = 1) {
  const phi = MathUtils.degToRad(90 - lat)
  const theta = MathUtils.degToRad(lon + 90)
  return new Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  )
}

function dotTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 32
  const g = c.getContext('2d')
  if (g) {
    g.fillStyle = '#fff'
    g.beginPath()
    g.arc(16, 16, 14, 0, Math.PI * 2)
    g.fill()
  }
  return new CanvasTexture(c)
}

function Land() {
  const positions = useMemo(() => {
    const p = new Float32Array((dots.length / 2) * 3)
    for (let i = 0; i < dots.length; i += 2)
      toVec(dots[i] ?? 0, dots[i + 1] ?? 0).toArray(p, (i / 2) * 3)
    return p
  }, [])
  const map = useMemo(() => dotTexture(), [])
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={map}
        size={0.016}
        color="#cfe3d8"
        transparent
        opacity={0.8}
        alphaTest={0.4}
      />
    </points>
  )
}

/** Faint latitude and longitude rings, like the grid on an old globe. */
function Graticule() {
  const geo = useMemo(() => {
    const pts: number[] = []
    const seg = (a: Vector3, b: Vector3) => pts.push(...a.toArray(), ...b.toArray())
    for (let lat = -60; lat <= 60; lat += 30)
      for (let lon = -180; lon < 180; lon += 4)
        seg(toVec(lat, lon, 1.001), toVec(lat, lon + 4, 1.001))
    for (let lon = -180; lon < 180; lon += 30)
      for (let lat = -88; lat < 88; lat += 4)
        seg(toVec(lat, lon, 1.001), toVec(lat + 4, lon, 1.001))
    const g = new BufferGeometry()
    g.setAttribute('position', new Float32BufferAttribute(pts, 3))
    return g
  }, [])
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color="#9db0a8" transparent opacity={0.16} />
    </lineSegments>
  )
}

/** A raised great-circle arc between two cities, drawn as dots that grow along it, one arc at a time. */
function Arcs() {
  const lines = useMemo(() => {
    const out: Line[] = []
    for (let i = 1; i < ARC_CITIES.length; i++) {
      const a = ARC_CITIES[i] ?? ARC_CITIES[0]
      const b = ARC_CITIES[i === 1 ? 0 : i - 1] ?? ARC_CITIES[0]
      const va = toVec(a.lat, a.lon)
      const vb = toVec(b.lat, b.lon)
      const pts: Vector3[] = []
      const q = new Quaternion()
      const angle = va.angleTo(vb)
      const axis = new Vector3().crossVectors(va, vb).normalize()
      for (let t = 0; t <= 1.0001; t += 1 / 64) {
        q.setFromAxisAngle(axis, angle * t)
        pts.push(
          va
            .clone()
            .applyQuaternion(q)
            .multiplyScalar(1 + Math.sin(Math.PI * t) * Math.min(angle * 0.18, 0.22)),
        )
      }
      const g = new BufferGeometry().setFromPoints(pts)
      const line = new Line(
        g,
        new LineDashedMaterial({ color: EMBER, dashSize: 0.012, gapSize: 0.022 }),
      )
      line.computeLineDistances()
      g.setDrawRange(0, 0)
      out.push(line)
    }
    return out
  }, [])
  const t0 = useRef<number | null>(null)
  useFrame(({ clock }) => {
    t0.current ??= clock.elapsedTime
    const t = clock.elapsedTime - t0.current
    lines.forEach((l, i) => {
      // Each arc draws over 1.6s, 0.9s after the one before, then stays; the one into Lisbon comes last.
      const k = MathUtils.clamp((t - (lines.length - 1 - i) * 0.9) / 1.6, 0, 1)
      l.geometry.setDrawRange(0, Math.floor(MathUtils.smootherstep(k, 0, 1) * 65))
    })
  })
  return (
    <group>
      {lines.map((l, i) => (
        <primitive key={i} object={l} />
      ))}
      {ARC_CITIES.map((c) => (
        <mesh key={c.name} position={toVec(c.lat, c.lon, 1.004)}>
          <sphereGeometry args={[c.name === 'Lisbon' ? 0.022 : 0.014, 12, 12]} />
          <meshBasicMaterial color={EMBER} />
        </mesh>
      ))}
    </group>
  )
}

// The globe turns so Lisbon faces the camera at the end of the fly-in.
const lisbon = toVec(ARC_CITIES[0].lat, ARC_CITIES[0].lon).normalize()
const FACE = new Quaternion().setFromUnitVectors(lisbon, new Vector3(0, 0, 1))

function Globe({ progress }: { progress: RefObject<number> }) {
  const group = useRef<Group>(null)
  // Starts with Lisbon a little left of centre and turns west to east, like the Earth.
  const spin = useRef(-0.5)
  const q = useMemo(() => new Quaternion(), [])
  const tilt = useMemo(() => new Quaternion(), [])
  useFrame(({ camera, pointer }, dt) => {
    const g = group.current
    if (!g) return
    const p = MathUtils.clamp(progress.current, 0, 1)
    // Idle: a slow spin with a pointer tilt. Scrolling: ease from that spin to Lisbon, face on, and fly in.
    spin.current += dt * 0.05 * (1 - p)
    q.setFromAxisAngle(new Vector3(0, 1, 0), spin.current).multiply(FACE)
    tilt.setFromAxisAngle(new Vector3(1, 0, 0), 0.3 + pointer.y * 0.08)
    q.premultiply(tilt)
    g.quaternion.copy(q).slerp(FACE, MathUtils.smootherstep(p, 0, 1))
    camera.position.z = MathUtils.lerp(3.9, 1.32, MathUtils.smootherstep(p, 0, 1))
    camera.position.x = MathUtils.lerp(pointer.x * 0.12, 0, p)
    camera.lookAt(0, 0, 0)
  })
  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[0.995, 64, 64]} />
        <meshBasicMaterial color="#112a2e" />
      </mesh>
      <mesh scale={1.06}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial
          color="#ff8a5c"
          transparent
          opacity={0.06}
          blending={AdditiveBlending}
          // A halo must not hide what's inside it from the depth test.
          depthWrite={false}
        />
      </mesh>
      <Graticule />
      <Land />
      <Arcs />
    </group>
  )
}

/** The landing hero's globe. `progress` (0-1) is how far the hero has scrolled: the camera flies in with it. */
export default function GlobeScene({ progress }: { progress: RefObject<number> }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.9], fov: 40 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <Globe progress={progress} />
    </Canvas>
  )
}
