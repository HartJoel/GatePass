import { create } from 'qrcode'

/** Real, scannable QR modules (not the earlier deterministic placeholder) — a boolean grid
 * shared by the on-screen <QrCode> and the canvas-rendered share image, so both encode the
 * exact same symbol. */
export function encodeQr(value: string): boolean[][] {
  const { modules } = create(value, { errorCorrectionLevel: 'M' })
  const { size, data } = modules
  const grid: boolean[][] = []
  for (let r = 0; r < size; r++) {
    const row: boolean[] = []
    for (let c = 0; c < size; c++) row.push(!!data[r * size + c])
    grid.push(row)
  }
  return grid
}
