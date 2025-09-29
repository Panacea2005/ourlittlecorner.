"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

interface ColorTheme {
  center: string
  mid1: string
  mid2: string
  edge: string
}

interface GradientSakuraProps {
  colors?: ColorTheme
}

export default function GradientSakura({ colors }: GradientSakuraProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef({ rotation: 0, speed: 0.0015, animate: true })

  const defaultColors: ColorTheme = {
    center: "rgba(255, 210, 230, 1)",
    mid1: "rgba(255, 168, 190, 0.95)",
    mid2: "rgba(255, 140, 170, 0.85)",
    edge: "rgba(255, 120, 160, 0.75)",
  }

  const currentColors = colors || defaultColors

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const setCanvasDimensions = () => {
      const isMobile = window.innerWidth < 640
      const maxSize = isMobile ? 420 : 720
      const percentage = isMobile ? 0.7 : 0.9
      const size = Math.min(window.innerWidth * percentage, maxSize)
      canvas.width = size
      canvas.height = size
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const distX = (x - centerX) / centerX
      const distY = (y - centerY) / centerY
      // slower response to mouse movement to keep speed low
      animRef.current.speed = 0.0015 + Math.min(0.0008, Math.abs(distX * distY) * 0.0008)
    }

    window.addEventListener("mousemove", handleMouseMove)

    // removed periodic speed bursts to reduce CPU/GPU load

    const drawPetal = (
      ctx: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      radius: number,
      rotation: number,
      colorInner: string,
      colorOuter: string
    ) => {
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(rotation)
      ctx.beginPath()
      ctx.moveTo(0, -radius * 0.1)
      ctx.bezierCurveTo(radius * 0.35, -radius * 0.6, radius * 0.75, -radius * 0.05, 0, radius)
      ctx.bezierCurveTo(-radius * 0.75, -radius * 0.05, -radius * 0.35, -radius * 0.6, 0, -radius * 0.1)
      ctx.closePath()

      const grad = ctx.createLinearGradient(0, -radius, 0, radius)
      grad.addColorStop(0, colorInner)
      grad.addColorStop(0.7, colorOuter)
      grad.addColorStop(1, "rgba(255,255,255,0)")
      ctx.fillStyle = grad
      ctx.fill()

      ctx.strokeStyle = colorOuter.replace(/[\d.]+\)$/i, "0.65)")
      ctx.lineWidth = Math.max(1, radius * 0.02)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(0, -radius * 0.05)
      ctx.quadraticCurveTo(0, radius * 0.35, 0, radius * 0.8)
      ctx.strokeStyle = colorInner.replace(/[\d.]+\)$/i, "0.35)")
      ctx.lineWidth = Math.max(0.5, radius * 0.01)
      ctx.stroke()

      ctx.restore()
    }

    const draw = () => {
      if (!ctx || !canvas) return
      const { width, height } = canvas
      const centerX = width / 2
      const centerY = height / 2
      const radius = Math.min(width, height) / 2.4

      ctx.clearRect(0, 0, width, height)

      const angle = animRef.current.rotation
      const now = Date.now() / 1000
      const wobble = Math.sin(now * 0.6) * radius * 0.03

      const bgGrad = ctx.createRadialGradient(centerX, centerY, radius * 0.1, centerX, centerY, radius * 1.15)
      bgGrad.addColorStop(0, currentColors.center.replace(/[\d.]+\)$/i, "0.45)"))
      bgGrad.addColorStop(1, "rgba(255,255,255,0)")
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, width, height)

      ctx.save()
      ctx.translate(centerX + radius * 0.05, centerY + radius * 0.12)
      ctx.scale(1, 0.9)
      ctx.beginPath()
      ctx.ellipse(0, 0, radius * 0.65, radius * 0.25, 0, 0, Math.PI * 2)
      const shadowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 0.65)
      shadowGrad.addColorStop(0, "rgba(0,0,0,0.12)")
      shadowGrad.addColorStop(1, "rgba(0,0,0,0)")
      ctx.fillStyle = shadowGrad
      ctx.fill()
      ctx.restore()

      const petalCount = 5
      for (let i = 0; i < petalCount; i++) {
        const rot = angle + (i * (Math.PI * 2)) / petalCount + Math.sin(now * 0.8 + i) * 0.03
        drawPetal(ctx, centerX, centerY - wobble, radius * 0.8, rot, currentColors.mid1, currentColors.edge)
      }

      for (let i = 0; i < petalCount; i++) {
        const rot = -angle + (i * (Math.PI * 2)) / petalCount + Math.cos(now * 1.1 + i) * 0.02
        drawPetal(ctx, centerX, centerY, radius * 0.5, rot, currentColors.center, currentColors.mid2)
      }

      ctx.save()
      ctx.translate(centerX, centerY)
      for (let i = 0; i < 28; i++) {
        const r = radius * (0.05 + Math.random() * 0.06)
        const a = (i / 28) * Math.PI * 2 + now * 0.4
        const x = Math.cos(a) * r
        const y = Math.sin(a) * r
        const grad = ctx.createRadialGradient(x, y, 0, x, y, radius * 0.09)
        grad.addColorStop(0, "rgba(255, 230, 120, 1)")
        grad.addColorStop(1, "rgba(255, 230, 120, 0)")
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(x, y, radius * 0.04, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()

      if (animRef.current.animate) {
        animRef.current.rotation += animRef.current.speed
      }

      requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
      window.removeEventListener("mousemove", handleMouseMove)
      // no interval to clear
    }
  }, [currentColors])

  const glowColor = currentColors.center.replace(/[\d.]+\)$/i, "0.4)")

  return (
    <motion.div
      className="relative z-10"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
      transition={{ duration: 2, y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
    >
      <canvas
        ref={canvasRef}
        className="max-w-full h-auto"
        style={{
          filter: typeof window !== "undefined" && window.innerWidth < 640 ? "blur(2px)" : "blur(3px)",
          maxWidth: typeof window !== "undefined" && window.innerWidth < 640 ? "88%" : "92%",
        }}
      />
      <motion.div
        className="absolute inset-0 rounded-full opacity-40 blur-3xl -z-10"
        style={{ background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)` }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  )
}


