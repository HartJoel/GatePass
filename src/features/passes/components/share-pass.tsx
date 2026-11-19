'use client'

import { useState } from 'react'
import { Check, Copy, Download, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatWindow } from '@/lib/format'
import { renderPassImage } from '@/features/passes/components/pass-image'
import type { Pass } from '@/features/passes/components/pass-card'

function shareText(pass: Pass) {
  return `Visitor entry code for ${pass.unit}: ${pass.code}\nValid ${formatWindow(pass.start, pass.end)}.`
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/** Shares the pass as an image (QR + code), not just text, so it lands in WhatsApp/SMS/etc. as
 * an attachment. Tries the OS share sheet with the file first, falls back to text-only share,
 * then to downloading the image + opening WhatsApp Web with the text pre-filled. All branching
 * happens at click time, never during render, so there's no server/client mismatch over
 * `navigator`. */
export function SharePass({ pass }: { pass: Pass }) {
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)

  async function share() {
    setBusy(true)
    try {
      const text = shareText(pass)
      const blob = await renderPassImage(pass)
      const file = new File([blob], `pass-${pass.code}.png`, { type: 'image/png' })
      const nav = navigator as Navigator & { canShare?: (data?: ShareData) => boolean }

      if (nav.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text })
        return
      }
      if (nav.share) {
        await nav.share({ text })
        return
      }
      downloadBlob(blob, `pass-${pass.code}.png`)
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
    } catch {
      // Cancelled share sheet, or the browser blocked the popup — Download/Copy still work.
    } finally {
      setBusy(false)
    }
  }

  async function download() {
    try {
      const blob = await renderPassImage(pass)
      downloadBlob(blob, `pass-${pass.code}.png`)
    } catch {
      // Rendering failed — Copy still works.
    }
  }

  function copy() {
    void navigator.clipboard.writeText(shareText(pass))
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <Button variant="filled" icon={<Share2 className="size-4" />} onClick={share} disabled={busy} className="min-w-[140px] flex-1">
        {busy ? 'Preparing…' : 'Share'}
      </Button>
      <Button variant="ghost" icon={<Download className="size-4" />} onClick={download}>
        Save image
      </Button>
      <Button variant="ghost" icon={copied ? <Check className="size-4" /> : <Copy className="size-4" />} onClick={copy}>
        {copied ? 'Copied' : 'Copy'}
      </Button>
    </div>
  )
}
