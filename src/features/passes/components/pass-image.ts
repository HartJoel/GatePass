import { qrMatrix } from '@/components/ui/qr-code'
import { formatWindow } from '@/lib/format'
import type { Pass } from '@/features/passes/components/pass-card'

const STATUS_LABEL: Partial<Record<Pass['status'], string>> = {
  active: 'Active',
  used: 'Used',
  expired: 'Expired',
  revoked: 'Revoked',
}

/** Renders the same card shown on screen (QR + code + visitor details) to a PNG so it can be
 * shared as an image attachment, not just text. Canvas-only — no new dependency. */
export function renderPassImage(pass: Pass): Promise<Blob> {
  const width = 640
  const height = 860
  const scale = 2

  const canvas = document.createElement('canvas')
  canvas.width = width * scale
  canvas.height = height * scale
  const ctx = canvas.getContext('2d')
  if (!ctx) return Promise.reject(new Error('Canvas is not supported.'))
  ctx.scale(scale, scale)

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = '#111111'
  ctx.font = '600 30px system-ui, -apple-system, sans-serif'
  ctx.fillText(pass.visitor, 40, 64)

  ctx.fillStyle = '#555555'
  ctx.font = '400 18px system-ui, -apple-system, sans-serif'
  ctx.fillText(pass.unit, 40, 98)
  ctx.fillText(formatWindow(pass.start, pass.end), 40, 126)

  ctx.fillStyle = pass.status === 'active' ? '#15803d' : '#555555'
  ctx.font = '600 14px system-ui, -apple-system, sans-serif'
  ctx.fillText((STATUS_LABEL[pass.status] ?? pass.status).toUpperCase(), 40, 154)

  const m = qrMatrix(pass.code)
  const qrSize = 420
  const qrX = (width - qrSize) / 2
  const qrY = 190
  const cell = qrSize / m.length
  ctx.fillStyle = '#111111'
  m.forEach((row, r) =>
    row.forEach((on, c) => {
      if (on) ctx.fillRect(qrX + c * cell, qrY + r * cell, cell, cell)
    }),
  )

  ctx.textAlign = 'center'
  ctx.fillStyle = '#111111'
  ctx.font = '700 52px system-ui, -apple-system, sans-serif'
  ctx.fillText(`${pass.code.slice(0, 3)} ${pass.code.slice(3)}`, width / 2, qrY + qrSize + 72)

  ctx.fillStyle = '#777777'
  ctx.font = '400 16px system-ui, -apple-system, sans-serif'
  ctx.fillText('Show this code to the guard at the gate', width / 2, qrY + qrSize + 102)
  ctx.textAlign = 'left'

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not render the pass image.'))), 'image/png')
  })
}
