'use client'

import { useMemo } from 'react'
import { encodeQr } from '@/lib/qr'

/** Always dark-on-white, even in the guard theme, so cameras can read it. Real, scannable QR
 * (via the `qrcode` package's pure-JS encoder) — not a placeholder pattern. */
export function QrCode({ value, size = 184 }: { value: string; size?: number }) {
  const m = useMemo(() => encodeQr(value), [value])
  return (
    <div className="inline-flex rounded-control bg-white p-3" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${m.length} ${m.length}`} className="size-full" shapeRendering="crispEdges" role="img" aria-label={`QR code for pass ${value}`}>
        <rect width={m.length} height={m.length} fill="#ffffff" />
        {m.flatMap((row, r) => row.map((on, c) => (on ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#111111" /> : null)))}
      </svg>
    </div>
  )
}
