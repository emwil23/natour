import { project, type LatLon } from '@/lib/geo'

/**
 * A small route print: the stops as dots joined by a dotted line, north up, on a faint grid. Used on trip
 * cards and journal pages, where loading a real map for each would be too heavy. Decorative: the stops are
 * always listed in text next to it.
 */
export function RouteSketch({
  points,
  width = 240,
  height = 150,
  color = 'var(--accent)',
  className,
}: {
  points: LatLon[]
  width?: number
  height?: number
  color?: string
  className?: string
}) {
  const xy = project(points, width, height, 18)
  return (
    <svg
      viewBox={`0 0 ${String(width)} ${String(height)}`}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <pattern id="rs-grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24 0H0V24" fill="none" stroke="var(--line)" strokeWidth="0.75" />
        </pattern>
      </defs>
      <rect width={width} height={height} fill="url(#rs-grid)" />
      {xy.length > 1 && (
        <polyline
          points={xy.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="0.1 7"
        />
      )}
      {xy.map(([x, y], i) => (
        <g key={i}>
          <circle
            cx={x}
            cy={y}
            r={i === 0 ? 6 : 4.5}
            fill="var(--surface)"
            stroke={color}
            strokeWidth="2.5"
          />
          {i === 0 && <circle cx={x} cy={y} r="2" fill={color} />}
        </g>
      ))}
    </svg>
  )
}
