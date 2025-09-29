"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import Image from "next/image"
import { motion, AnimatePresence, useAnimation } from "framer-motion"

export default function LoadingAnimation() {
  // Animation state management
  const [showAnimation, setShowAnimation] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Advanced animation controls
  const flowerControls = useAnimation()
  const sphereControls = useAnimation()
  const pulseControls = useAnimation()
  const backgroundControls = useAnimation()
  const overlayControls = useAnimation()
  const logoControls = useAnimation()
  const particleControls = useAnimation()
  // Intro sequence controls
  const introTextControls = useAnimation()
  const introLogoControls = useAnimation()
  
  // Color transition state
  const [colorProgress, setColorProgress] = useState(0)
  
  // Animation timeouts for cleanup
  const timeoutsRef = useRef<Array<NodeJS.Timeout>>([])
  const animationFrameRef = useRef<number | null>(null)
  
  // Generate particles with fixed seed to avoid hydration mismatch
  const particles = useMemo(() => {
    const particleCount = 30
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000
      return x - Math.floor(x)
    }
    
    return Array.from({ length: particleCount }).map((_, i) => {
      const seed = i * 1.1
      return {
        id: i,
        scale: 0.2 + seededRandom(seed) * 0.8,
        x: seededRandom(seed + 1) * 250 - 125,
        y: seededRandom(seed + 2) * 250 - 125,
        rotation: seededRandom(seed + 3) * 360,
        opacity: 0.3 + seededRandom(seed + 4) * 0.7,
        delay: seededRandom(seed + 5) * 1.5,
        duration: 2 + seededRandom(seed + 6) * 1.5,
        size: 2 + seededRandom(seed + 7) * 4,
      }
    })
  }, [])

  // Generate floating particles with fixed seed
  const floatingParticles = useMemo(() => {
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000
      return x - Math.floor(x)
    }
    
    return Array.from({ length: 12 }).map((_, i) => {
      const seed = (i + 100) * 1.3
      return {
        id: i,
        size: 10 + seededRandom(seed) * 40,
        initialX: seededRandom(seed + 1) * 100,
        initialY: seededRandom(seed + 2) * 100,
        midX: seededRandom(seed + 3) * 100,
        midY: seededRandom(seed + 4) * 100,
        endX: seededRandom(seed + 5) * 100,
        endY: seededRandom(seed + 6) * 100,
        duration: 8 + seededRandom(seed + 7) * 7,
        delay: seededRandom(seed + 8) * 2,
      }
    })
  }, [])

  // Set mounted state to enable client-only features
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Enhanced smooth color transition animation with higher frame rate
  useEffect(() => {
    if (!isMounted) return

    const colorDuration = 15000 // Slightly longer for smoother transitions
    const startTime = Date.now()

    const updateColorProgress = () => {
      const elapsed = Date.now() - startTime
      const newProgress = (elapsed % colorDuration) / colorDuration
      // Smoother easing for color transitions
      const easedProgress = 0.5 - Math.cos(newProgress * Math.PI * 2) / 2
      setColorProgress(easedProgress)

      animationFrameRef.current = requestAnimationFrame(updateColorProgress)
    }

    animationFrameRef.current = requestAnimationFrame(updateColorProgress)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isMounted])

  // Enhanced choreographed animation sequence with smoother transitions
  useEffect(() => {
    if (!isMounted) return

    const animationSequence = async () => {
      // New intro: big black text at bottom, large sakura logo scrolls right, then finish
      // Start text
      introTextControls.start({
        opacity: [0, 1],
        y: [20, 0],
        transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
      })
      // Start logo: run to the right (decelerate), pause, drop to "floor", then slow roll a bit
      introLogoControls.start({
        x: ['-50vw', '72vw', '72vw', '80vw'],
        y: ['0vh', '0vh', '60vh', '60vh'],
        rotate: [0, 680, 680, 860],
        opacity: [1, 1, 1, 1],
        transition: {
          duration: 5.8,
          times: [0, 0.6, 0.8, 1],
          ease: [[0.05, 0.8, 0.1, 1], 'linear', [0.3, 0.7, 0.2, 1], 'linear']
        }
      })
      // Wait for full staged motion to finish
      await new Promise(resolve => {
        const timeout = setTimeout(resolve, 5900)
        timeoutsRef.current.push(timeout)
      })
      // Fade everything and finish
      overlayControls.start({ opacity: [0, 1], transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } })
      await new Promise(resolve => {
        const timeout = setTimeout(resolve, 400)
        timeoutsRef.current.push(timeout)
      })
      setShowAnimation(false)
    }
    
    animationSequence()
    
    return () => {
      timeoutsRef.current.forEach(clearTimeout)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isMounted, flowerControls, sphereControls, backgroundControls, overlayControls, pulseControls, logoControls, particleControls])

  // Enhanced color interpolation function with smoother transitions
  const interpolateColor = (color1: string, color2: string, factor: number) => {
    const hex2rgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      return [r, g, b]
    }
    
    // Enhanced easing for smoother color transitions
    const easedFactor = 0.5 - Math.cos(factor * Math.PI) / 2
    
    const [r1, g1, b1] = hex2rgb(color1)
    const [r2, g2, b2] = hex2rgb(color2)
    
    const r = Math.round(r1 + (r2 - r1) * easedFactor)
    const g = Math.round(g1 + (g2 - g1) * easedFactor)
    const b = Math.round(b1 + (b2 - b1) * easedFactor)
    
    return `rgb(${r}, ${g}, ${b})`
  }
  
  // Sakura-toned dynamic gradient
  const sphereGradient = isMounted ? {
    background: `radial-gradient(circle, 
      ${interpolateColor("#ffd6e6", "#ffb6c1", colorProgress)} 0%, 
      ${interpolateColor("#ffb6c1", "#ffa0b4", colorProgress)} 50%, 
      ${interpolateColor("#ffa0b4", "#ff91af", colorProgress)} 100%)`,
    filter: `blur(${3 + Math.sin(colorProgress * Math.PI * 4) * 1.5}px)`,
    transform: `scale(${1 + Math.sin(colorProgress * Math.PI * 2) * 0.02})`,
  } : {
    background: `radial-gradient(circle, #ffd6e6 0%, #ffb6c1 50%, #ff91af 100%)`,
    filter: `blur(3px)`,
  }

  if (!showAnimation) {
    return null
  }

  return (
    <>
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          25% { transform: translateY(-8px) rotate(2deg) scale(1.02); }
          50% { transform: translateY(-12px) rotate(0deg) scale(1.05); }
          75% { transform: translateY(-6px) rotate(-2deg) scale(1.02); }
        }
        @keyframes pulse-glow {
          0%, 100% { 
            filter: drop-shadow(0 0 12px rgba(255,182,193,0.7)) saturate(1) brightness(1);
            transform: scale(1);
          }
          50% { 
            filter: drop-shadow(0 0 24px rgba(255,182,193,0.9)) saturate(1.3) brightness(1.1);
            transform: scale(1.08);
          }
        }
        @keyframes morph {
          0% { border-radius: 50%; transform: scale(1) rotate(0deg); }
          25% { border-radius: 40% 60% 70% 30%; transform: scale(1.1) rotate(90deg); }
          50% { border-radius: 60% 40% 30% 70%; transform: scale(1.2) rotate(180deg); }
          75% { border-radius: 30% 70% 40% 60%; transform: scale(1.1) rotate(270deg); }
          100% { border-radius: 50%; transform: scale(1) rotate(360deg); }
        }
        @keyframes ripple {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(4); opacity: 0; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(100%) rotate(45deg); }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
      <AnimatePresence>
        {showAnimation && (
          <motion.div 
            ref={containerRef} 
            className="fixed inset-0 bg-white flex items-center justify-center z-50 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
          {/* New intro: large text bottom and big sakura logo scrolling right */}
          <motion.div 
            className="absolute left-0 top-4 sm:top-10 z-20"
            initial={{ x: '-40vw', opacity: 1 }}
            animate={introLogoControls}
          >
            <Image src="/images/flower-pattern.png" alt="Sakura" width={800} height={800} className="object-contain"
              style={{ width: 'min(40vh, 70vw)', height: 'auto' }}
            />
          </motion.div>

          <motion.div 
            className="absolute bottom-0 left-0 right-0 z-10"
            initial={{ opacity: 0, y: 30 }}
            animate={introTextControls}
          >
            <div className="w-full flex items-end justify-start pb-6 pl-4 sm:pl-10 md:pl-14 lg:pl-20">
              <div className="font-handwriting text-black" style={{ fontSize: 'clamp(36px, 14vw, 42vh)', lineHeight: 0.9 }}>
                ourlittlecorner.
              </div>
            </div>
          </motion.div>
          
          {/* Enhanced background gradient overlay */}
          <motion.div 
            className="absolute inset-0 z-25"
            initial={{ opacity: 0 }}
            animate={backgroundControls}
            style={{
              background: "linear-gradient(135deg, rgba(255,214,230,0.35) 0%, rgba(255,182,193,0.28) 50%, rgba(255,160,180,0.22) 100%)",
            }}
          >
            {/* Enhanced floating light particles with smoother movements */}
            {isMounted && floatingParticles.map((particle) => (
              <motion.div 
                key={particle.id}
                className="absolute rounded-full"
                style={{
                  width: particle.size,
                  height: particle.size,
                  background: "radial-gradient(circle, rgba(255,182,193,0.3) 0%, rgba(255,160,180,0.2) 100%)",
                  filter: "blur(10px)",
                  boxShadow: "0 0 20px rgba(255,182,193,0.3)"
                }}
                initial={{
                  x: `${particle.initialX}%`,
                  y: `${particle.initialY}%`,
                  opacity: 0,
                }}
                animate={{
                  x: [
                    `${particle.initialX}%`, 
                    `${particle.midX}%`, 
                    `${particle.endX}%`,
                    `${particle.midX}%`,
                    `${particle.initialX}%`
                  ],
                  y: [
                    `${particle.initialY}%`, 
                    `${particle.midY}%`, 
                    `${particle.endY}%`,
                    `${particle.midY}%`,
                    `${particle.initialY}%`
                  ],
                  opacity: [0, 0.4, 0.6, 0.3, 0],
                  scale: [0.6, 1.2, 1.4, 1.0, 0.6],
                  rotate: [0, 90, 180, 270, 360]
                }}
                transition={{
                  duration: particle.duration * 1.4,
                  delay: particle.delay,
                  ease: [0.4, 0, 0.6, 1],
                  repeat: Infinity,
                  times: [0, 0.25, 0.5, 0.75, 1]
                }}
              />
            ))}
          </motion.div>
          
          {/* Enhanced final overlay for smoother transition to app */}
          <motion.div 
            className="absolute inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={overlayControls}
            style={{
              background: "radial-gradient(circle, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 70%, rgba(255,255,255,0.8) 100%)"
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
    </>
  )
}