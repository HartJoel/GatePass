'use client'

import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'

/** Reads frames from the device camera via a hidden canvas and decodes with jsQR — works on
 * iOS Safari too, unlike the native BarcodeDetector API which Safari doesn't support. Stops the
 * camera stream on unmount or once a code is found. */
export function QrScanner({ onDetect, onClose }: { onDetect: (value: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const detectedRef = useRef(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let stream: MediaStream | null = null
    let frameId = 0
    let cancelled = false

    function tick() {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (video && canvas && !detectedRef.current && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          const frame = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const result = jsQR(frame.data, frame.width, frame.height)
          if (result?.data) {
            detectedRef.current = true
            onDetect(result.data.trim())
            return
          }
        }
      }
      frameId = requestAnimationFrame(tick)
    }

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        tick()
      } catch {
        if (!cancelled) setError('Camera access was denied or isn’t available. Use manual entry instead.')
      }
    }

    void start()
    return () => {
      cancelled = true
      if (frameId) cancelAnimationFrame(frameId)
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [onDetect])

  return (
    <div className="flex flex-col gap-5">
      <div className="relative aspect-square overflow-hidden rounded-card bg-black">
        <video ref={videoRef} muted playsInline className="size-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />
        <div className="pointer-events-none absolute inset-8 rounded-[14px] border-2 border-white/70" />
      </div>
      <p className="text-center text-[15px] text-ink-2">
        {error ?? 'Point the camera at the visitor’s QR code.'}
      </p>
      <button type="button" onClick={onClose} className="text-sm font-medium text-ink-2 underline-offset-4 hover:text-ink hover:underline">
        {error ? 'Back to manual entry' : 'Cancel'}
      </button>
    </div>
  )
}
