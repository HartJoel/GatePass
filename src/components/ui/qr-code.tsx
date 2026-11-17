'use client'

import { useMemo } from 'react'

/** Deterministic placeholder matrix. Not a scannable code: swap for a real QR encoder. */
function matrix(seed: string, n = 25) {
  let h = 2166136261
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  const rnd = () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ (h >>> 13)), (h >>> 0) / 4294967296)
  const finder = (r: number, c: number) => {
    const inBox = (r0: number, c0: number) => r >= r0 && r < r0 + 7 && c >= c0 && c < c0 + 7
    for (const [r0, c0] of [[0, 0], [0, n - 7], [n - 7, 0]] as const) {
      if (inBox(r0, c0)) {
        const dr = r - r0, dc = c - c0
        const ring = dr === 0 || dr === 6 || dc === 0 || dc === 6
        const core = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4
        return ring || core
      }
      if (r >= r0 - 1 && r <= r0 + 7 && c >= c0 - 1 && c <= c0 + 7) return false
    }
    return null
  }
  return Array.from({ length: n }, (_, r) =>
    Array.from({ length: n }, (_, c) => {
      const f = finder(r, c)
      return f === null ? rnd() > 0.52 : f
    }),
  )
}

/** Always dark-on-white, even in the guard theme, so cameras can read it. */
export function QrCode({ value, size = 184 }: { value: string; size?: number }) {
  const m = useMemo(() => matrix(value), [value])
  return (
    <div className="inline-flex rounded-control bg-white p-3" style={{ width: size, height: size }}>
      <svg viewBox="0 0 25 25" className="size-full" shapeRendering="crispEdges" role="img" aria-label={`QR code for pass ${value}`}>
        {m.flatMap((row, r) => row.map((on, c) => (on ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#111111" /> : null)))}
      </svg>
    </div>
  )
}
