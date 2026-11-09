"use client"

import React, { useEffect, useRef, useState } from "react"

export const BrandLoadingSplash: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [progress, setProgress] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)
  const [isRemoved, setIsRemoved] = useState(false)

  // Fluid wave rendering inside the canvas matching NeoLeaf
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let step = 0

    const resize = () => {
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
    }

    resize()
    window.addEventListener("resize", resize)

    const render = () => {
      const rect = canvas.getBoundingClientRect()
      const w = rect.width
      const h = rect.height

      if (!w || !h || !Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
        animationFrameId = requestAnimationFrame(render)
        return
      }

      ctx.clearRect(0, 0, w, h)
      step += 0.028

      // 1. Base vibrant gradient flow
      const baseGrad = ctx.createLinearGradient(0, 0, w, h)
      baseGrad.addColorStop(0, "#2563eb") // blue
      baseGrad.addColorStop(0.35, "#7c3aed") // purple
      baseGrad.addColorStop(0.7, "#06b6d4") // cyan
      baseGrad.addColorStop(1, "#10b981") // emerald

      ctx.fillStyle = baseGrad
      ctx.fillRect(0, 0, w, h)

      // 2. Flowing Wave 1 (Cyan / Emerald)
      ctx.beginPath()
      ctx.moveTo(0, h)
      for (let x = 0; x <= w; x += 8) {
        const y =
          h * 0.42 +
          Math.sin(x * 0.008 + step * 1.2) * (h * 0.32) +
          Math.cos(x * 0.016 - step * 0.8) * (h * 0.16)
        ctx.lineTo(x, y)
      }
      ctx.lineTo(w, h)
      ctx.closePath()

      const waveGrad1 = ctx.createLinearGradient(0, 0, w, h)
      waveGrad1.addColorStop(0, "rgba(56, 189, 248, 0.95)")
      waveGrad1.addColorStop(0.5, "rgba(168, 85, 247, 0.9)")
      waveGrad1.addColorStop(1, "rgba(16, 185, 129, 0.85)")
      ctx.fillStyle = waveGrad1
      ctx.globalCompositeOperation = "screen"
      ctx.fill()

      // 3. Flowing Wave 2 (Violet / Pink)
      ctx.beginPath()
      ctx.moveTo(0, h)
      for (let x = 0; x <= w; x += 8) {
        const y =
          h * 0.48 +
          Math.sin(x * 0.01 + step * 1.5 + 2.0) * (h * 0.28) +
          Math.cos(x * 0.006 - step) * (h * 0.12)
        ctx.lineTo(x, y)
      }
      ctx.lineTo(w, h)
      ctx.closePath()

      const waveGrad2 = ctx.createLinearGradient(0, 0, w, 0)
      waveGrad2.addColorStop(0, "rgba(236, 72, 153, 0.9)")
      waveGrad2.addColorStop(0.5, "rgba(168, 85, 247, 0.95)")
      waveGrad2.addColorStop(1, "rgba(99, 102, 241, 0.9)")
      ctx.fillStyle = waveGrad2
      ctx.globalCompositeOperation = "screen"
      ctx.fill()

      // 4. Sweeping bright light beam (NeoLeaf specular gleam)
      const beamX = ((step * 140) % (w * 1.8)) - w * 0.4
      if (Number.isFinite(beamX)) {
        const x1 = Math.max(-w, beamX - 100)
        const x2 = Math.min(w * 2, beamX + 100)
        if (Number.isFinite(x1) && Number.isFinite(x2) && x2 > x1) {
          const beamGrad = ctx.createLinearGradient(x1, 0, x2, 0)
          beamGrad.addColorStop(0, "rgba(255, 255, 255, 0)")
          beamGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.9)")
          beamGrad.addColorStop(1, "rgba(255, 255, 255, 0)")

          ctx.globalCompositeOperation = "lighter"
          ctx.fillStyle = beamGrad
          ctx.fillRect(0, 0, w, h)
        }
      }

      ctx.globalCompositeOperation = "source-over"
      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("resize", resize)
    }
  }, [])

  // Deliberate ~4.6s loading duration taking its time
  useEffect(() => {
    let current = 0
    const startTime = Date.now()
    const targetDuration = 4600 // 4.6 seconds

    const tick = () => {
      const elapsed = Date.now() - startTime
      const ratio = Math.min(elapsed / targetDuration, 1)

      // Natural pacing: steady start, deliberate middle, gentle finish
      const nextProgress = Math.min(Math.round(ratio * 100), 100)
      setProgress(nextProgress)

      if (ratio < 1) {
        requestAnimationFrame(tick)
      } else {
        // Hold at 100% briefly before fading out smoothly
        setTimeout(() => {
          setFadeOut(true)
        }, 350)

        setTimeout(() => {
          setIsRemoved(true)
          onComplete()
        }, 1100)
      }
    }

    const frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [onComplete])

  if (isRemoved) return null

  // SVG mask string for MANDI CONNECT
  const svgMask = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 962 192' width='962' height='192'%3E%3Ctext x='50%25' y='54%25' dominant-baseline='central' text-anchor='middle' font-family='system-ui, -apple-system, sans-serif' font-weight='900' font-size='96' letter-spacing='6px' fill='black'%3EMANDI CONNECT%3C/text%3E%3C/svg%3E")`

  return (
    <div
      className={`fixed inset-0 z-[999] flex select-none items-center justify-center bg-black text-center text-white transition-opacity duration-700 ease-out ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Centered NeoLeaf Container matching exact markup */}
      <div className="relative w-full max-w-[80%] md:max-w-[70%] lg:max-w-[740px] xl:max-w-[965px]">
        {/* Masked Aspect Ratio Container */}
        <div
          className="relative aspect-[962/192] w-full bg-[#aaa] bg-opacity-30"
          style={{
            maskImage: svgMask,
            WebkitMaskImage: svgMask,
            maskSize: "contain",
            WebkitMaskSize: "contain",
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
            maskPosition: "center",
            WebkitMaskPosition: "center",
          }}
        >
          {/* Inner canvas container */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <canvas ref={canvasRef} className="size-full" />
          </div>
        </div>

        {/* NeoLeaf Loading Indicator exactly as in example site */}
        <div className="text-sm font-medium absolute right-0 top-full mt-2 font-mono text-neutral-400">
          loading... <span className="inline-block min-w-[2.5ch] text-right text-white font-bold">{progress}</span>%
        </div>
      </div>
    </div>
  )
}
