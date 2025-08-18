"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import type { FontConfig } from "../hooks/use-fonts"
import type { FontSettings } from "../hooks/use-font-settings"
import type { AnimationSettings } from "./animation-controls"

interface Particle {
  id: number
  startX: number
  startY: number
  targetX: number
  targetY: number
  currentX: number
  currentY: number
  size: number
  opacity: number
  color: string
  delay: number
}

interface ParticleAnimationProps {
  currentFont: FontConfig | undefined
  fontSettings: FontSettings
  globalText: string
  animationSettings: AnimationSettings
  animationKey: number
}

export function ParticleAnimation({
  currentFont,
  fontSettings,
  globalText,
  animationSettings,
  animationKey,
}: ParticleAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [particles, setParticles] = useState<Particle[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [canvasReady, setCanvasReady] = useState(false)
  const animationFrameRef = useRef<number>()
  const startTimeRef = useRef<number>()

  // Wait for container to be properly sized
  useEffect(() => {
    const checkCanvasReady = () => {
      if (containerRef.current && canvasRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        if (rect.width > 0 && rect.height > 0) {
          setCanvasReady(true)
          return
        }
      }
      // Keep checking until ready
      setTimeout(checkCanvasReady, 100)
    }

    checkCanvasReady()
  }, [])

  // Generate particles based on text shape
  const generateParticles = useCallback(() => {
    if (!canvasRef.current || !containerRef.current || !canvasReady) {
      console.log("Canvas not ready for particle generation")
      return []
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      console.log("Could not get canvas context")
      return []
    }

    // Get container dimensions
    const container = containerRef.current
    const rect = container.getBoundingClientRect()

    // Ensure we have valid dimensions
    const width = Math.max(rect.width, 400)
    const height = Math.max(rect.height, 200)

    if (width <= 0 || height <= 0) {
      console.log("Invalid canvas dimensions:", { width, height })
      return []
    }

    // Set canvas size with device pixel ratio for crisp rendering
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Set font properties
    const fontSize = fontSettings.size
    const fontStyle = fontSettings.italic ? "italic " : ""
    const fontFamily = currentFont?.name || "Arial"

    ctx.font = `${fontStyle}${fontSettings.weight} ${fontSize}px "${fontFamily}"`
    ctx.fillStyle = fontSettings.textColor
    ctx.textAlign = fontSettings.alignment as CanvasTextAlign
    ctx.textBaseline = "middle"

    // Calculate text position
    let textX: number
    if (fontSettings.alignment === "center") {
      textX = width / 2
    } else if (fontSettings.alignment === "right") {
      textX = width - 40
    } else {
      textX = 40
    }
    const textY = height / 2

    // Draw text to get pixel data
    ctx.fillText(globalText, textX, textY)

    // Get image data with error handling
    let imageData: ImageData
    try {
      imageData = ctx.getImageData(0, 0, width, height)
    } catch (error) {
      console.error("Failed to get image data:", error)
      return []
    }

    const data = imageData.data

    // Find text pixels and create particles
    const textPixels: { x: number; y: number }[] = []
    const step = Math.max(2, Math.floor(fontSize / 20)) // Adaptive step based on font size

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const index = (y * width + x) * 4
        const alpha = data[index + 3]

        if (alpha > 128) {
          // If pixel is part of text
          textPixels.push({ x, y })
        }
      }
    }

    if (textPixels.length === 0) {
      console.log("No text pixels found")
      return []
    }

    // Create particles from text pixels
    const particleCount = Math.min(100, Math.max(20, textPixels.length))
    const selectedPixels = textPixels.sort(() => Math.random() - 0.5).slice(0, particleCount)

    const newParticles: Particle[] = selectedPixels.map((pixel, index) => {
      // Generate random start positions from edges for more dramatic effect
      const side = Math.floor(Math.random() * 4)
      let startX: number, startY: number

      switch (side) {
        case 0: // Top
          startX = Math.random() * width
          startY = -20
          break
        case 1: // Right
          startX = width + 20
          startY = Math.random() * height
          break
        case 2: // Bottom
          startX = Math.random() * width
          startY = height + 20
          break
        case 3: // Left
        default:
          startX = -20
          startY = Math.random() * height
          break
      }

      return {
        id: index,
        startX,
        startY,
        targetX: pixel.x,
        targetY: pixel.y,
        currentX: startX,
        currentY: startY,
        size: Math.random() * 2 + 1.5,
        opacity: 0,
        color: fontSettings.textColor,
        delay: Math.random() * 0.3, // Random delay up to 0.3s
      }
    })

    console.log(`Generated ${newParticles.length} particles from ${textPixels.length} text pixels`)
    return newParticles
  }, [canvasReady, currentFont, fontSettings, globalText])

  // Easing function
  const easeOutCubic = (t: number): number => {
    return 1 - Math.pow(1 - t, 3)
  }

  // Animation loop
  const animate = useCallback(
    (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime
      }

      const elapsed = (currentTime - startTimeRef.current) / 1000
      const duration = animationSettings.duration
      const progress = Math.min(elapsed / duration, 1)

      if (!canvasRef.current) return

      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const width = Math.max(rect.width, 400)
      const height = Math.max(rect.height, 200)

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Update and draw particles
      particles.forEach((particle) => {
        const particleProgress = Math.max(0, Math.min(1, (progress - particle.delay) / (1 - particle.delay)))
        const easedProgress = easeOutCubic(particleProgress)

        // Update particle position
        particle.currentX = particle.startX + (particle.targetX - particle.startX) * easedProgress
        particle.currentY = particle.startY + (particle.targetY - particle.startY) * easedProgress
        particle.opacity = Math.min(1, easedProgress * 1.2) // Slightly faster opacity

        // Draw particle
        if (particle.opacity > 0) {
          ctx.save()
          ctx.globalAlpha = particle.opacity
          ctx.fillStyle = particle.color
          ctx.beginPath()
          ctx.arc(particle.currentX, particle.currentY, particle.size, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }
      })

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        setIsAnimating(false)
        console.log("Particle animation completed")
      }
    },
    [particles, animationSettings.duration],
  )

  // Start animation
  const startAnimation = useCallback(() => {
    if (animationSettings.type !== "particle-assembly" || !animationSettings.isPlaying || !canvasReady) {
      return
    }

    console.log("Starting particle animation...")
    const newParticles = generateParticles()

    if (newParticles.length === 0) {
      console.log("No particles generated, skipping animation")
      return
    }

    setParticles(newParticles)
    setIsAnimating(true)
    startTimeRef.current = undefined

    const startDelay = animationSettings.delay * 1000
    setTimeout(() => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      animationFrameRef.current = requestAnimationFrame(animate)
    }, startDelay)
  }, [animationSettings, canvasReady, generateParticles, animate])

  // Effect to start animation
  useEffect(() => {
    if (canvasReady && animationSettings.type === "particle-assembly" && animationSettings.isPlaying) {
      // Small delay to ensure everything is rendered
      const timeout = setTimeout(startAnimation, 100)
      return () => clearTimeout(timeout)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [animationSettings, globalText, animationKey, canvasReady, startAnimation])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  if (animationSettings.type !== "particle-assembly") {
    return null
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full"
      style={{
        pointerEvents: "none",
        minHeight: "200px", // Ensure minimum height
        minWidth: "400px", // Ensure minimum width
      }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 10,
        }}
      />
    </div>
  )
}
