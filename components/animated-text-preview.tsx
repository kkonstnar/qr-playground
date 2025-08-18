"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import type { FontConfig } from "../hooks/use-fonts"
import type { FontSettings } from "../hooks/use-font-settings"
import type { AnimationSettings } from "./animation-controls"
import { LottieAnimations } from "./lottie-animations"
import { ParticleAnimation } from "./particle-animation"

interface AnimatedTextPreviewProps {
  currentFont: FontConfig | undefined
  fontSettings: FontSettings
  globalText: string
  onTextChange: (text: string) => void
  animationSettings: AnimationSettings
  animationKey: number
}

export function AnimatedTextPreview({
  currentFont,
  fontSettings,
  globalText,
  onTextChange,
  animationSettings,
  animationKey,
}: AnimatedTextPreviewProps) {
  const textRef = useRef<HTMLInputElement>(null)
  const [displayText, setDisplayText] = useState(globalText)
  const [isAnimating, setIsAnimating] = useState(false)
  const animationRef = useRef<number>()
  const timeoutRef = useRef<NodeJS.Timeout>()
  const [showText, setShowText] = useState(true)

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onTextChange(e.target.value)
  }

  // Reset and start animation when settings change or restart is triggered
  useEffect(() => {
    if (animationSettings.type === "none" || !animationSettings.isPlaying) {
      setDisplayText(globalText)
      setIsAnimating(false)
      return
    }

    // Clear any existing timeouts/animations
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (animationRef.current) cancelAnimationFrame(animationRef.current)

    setIsAnimating(true)

    // Start animation after delay
    timeoutRef.current = setTimeout(() => {
      startAnimation()
    }, animationSettings.delay * 1000)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [animationSettings, globalText, animationKey])

  // Sync displayText with globalText when not animating
  useEffect(() => {
    if (!isAnimating || animationSettings.type === "none") {
      setDisplayText(globalText)
    }
  }, [globalText, isAnimating, animationSettings.type])

  // Hide text during particle animation
  useEffect(() => {
    if (animationSettings.type === "particle-assembly" && animationSettings.isPlaying) {
      setShowText(false)
      // Show text again after animation completes
      const timeout = setTimeout(
        () => {
          setShowText(true)
        },
        (animationSettings.delay + animationSettings.duration + 0.5) * 1000,
      )

      return () => clearTimeout(timeout)
    } else {
      setShowText(true)
    }
  }, [animationSettings, animationKey])

  const startAnimation = () => {
    const duration = animationSettings.duration * 1000
    const startTime = Date.now()

    switch (animationSettings.type) {
      case "typewriter":
        animateTypewriter(startTime, duration)
        break
      case "letter-drop":
        animateLetterDrop(startTime, duration)
        break
      case "letter-fade-shape":
        animateLetterFadeShape(startTime, duration)
        break
      case "spiral-in":
        animateSpiralIn(startTime, duration)
        break
      case "bounce-letters":
        animateBounceLetter(startTime, duration)
        break
      case "rainbow-wave":
        animateRainbowWave(startTime, duration)
        break
      case "typewriter-reverse":
        animateTypewriterReverse(startTime, duration)
        break
      default:
        // For CSS-based animations, just show the text
        setDisplayText(globalText)
        setTimeout(() => setIsAnimating(false), duration)
    }
  }

  const animateTypewriter = (startTime: number, duration: number) => {
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const charactersToShow = Math.floor(progress * globalText.length)

      setDisplayText(globalText.slice(0, charactersToShow))

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setIsAnimating(false)
      }
    }

    setDisplayText("")
    animate()
  }

  const animateLetterDrop = (startTime: number, duration: number) => {
    const letters = globalText.split("")
    const letterDelay = duration / letters.length

    setDisplayText("")

    letters.forEach((letter, index) => {
      setTimeout(() => {
        setDisplayText((prev) => prev + letter)
        if (index === letters.length - 1) {
          setIsAnimating(false)
        }
      }, index * letterDelay)
    })
  }

  const animateLetterFadeShape = (startTime: number, duration: number) => {
    const letters = globalText.split("")
    const letterDelay = duration / letters.length

    setDisplayText("")

    letters.forEach((letter, index) => {
      setTimeout(() => {
        setDisplayText((prev) => prev + letter)
        if (index === letters.length - 1) {
          setIsAnimating(false)
        }
      }, index * letterDelay)
    })
  }

  const animateSpiralIn = (startTime: number, duration: number) => {
    const letters = globalText.split("")
    const letterDelay = duration / letters.length

    setDisplayText("")

    letters.forEach((letter, index) => {
      setTimeout(() => {
        setDisplayText((prev) => prev + letter)
        if (index === letters.length - 1) {
          setIsAnimating(false)
        }
      }, index * letterDelay)
    })
  }

  const animateBounceLetter = (startTime: number, duration: number) => {
    const letters = globalText.split("")
    const letterDelay = duration / letters.length

    setDisplayText("")

    letters.forEach((letter, index) => {
      setTimeout(() => {
        setDisplayText((prev) => prev + letter)
        if (index === letters.length - 1) {
          setIsAnimating(false)
        }
      }, index * letterDelay)
    })
  }

  const animateRainbowWave = (startTime: number, duration: number) => {
    setDisplayText(globalText)
    setTimeout(() => setIsAnimating(false), duration)
  }

  const animateTypewriterReverse = (startTime: number, duration: number) => {
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const charactersToShow = Math.floor(progress * globalText.length)
      const reverseIndex = globalText.length - charactersToShow

      setDisplayText(globalText.slice(reverseIndex))

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setIsAnimating(false)
      }
    }

    setDisplayText("")
    animate()
  }

  const getAnimationClasses = () => {
    if (!isAnimating || animationSettings.type === "none") return ""

    const baseClasses = "animate-in"
    const duration = `duration-[${animationSettings.duration * 1000}ms]`

    switch (animationSettings.type) {
      case "fade-in":
        return `${baseClasses} fade-in ${duration}`
      case "slide-up":
        return `${baseClasses} slide-in-from-bottom-8 ${duration}`
      case "bounce-in":
        return `${baseClasses} zoom-in-95 ${duration} animate-bounce`
      case "rotate-in":
        return `${baseClasses} spin-in-180 ${duration}`
      case "scale-in":
        return `${baseClasses} zoom-in-50 ${duration}`
      case "wave":
        return `${baseClasses} ${duration} animate-pulse`
      case "glitch":
        return `${baseClasses} ${duration} animate-ping`
      case "morphing-circle":
        return `${baseClasses} ${duration} animate-spin`
      case "neon-flicker":
        return `${baseClasses} ${duration} animate-pulse`
      case "letter-fade-shape":
        return `${baseClasses} fade-in ${duration}`
      case "spiral-in":
        return `${baseClasses} ${duration} animate-spin`
      case "bounce-letters":
        return `${baseClasses} ${duration} animate-bounce`
      case "rainbow-wave":
        return `${baseClasses} ${duration} animate-pulse`
      case "typewriter-reverse":
        return ""
      default:
        return ""
    }
  }

  const getSpecialStyles = () => {
    if (!isAnimating) return {}

    switch (animationSettings.type) {
      case "glitch":
        return {
          textShadow: `
            2px 0 #ff0000,
            -2px 0 #00ff00,
            0 2px #0000ff,
            0 -2px #ffff00
          `,
          animation: `glitch ${animationSettings.duration}s ease-in-out`,
        }
      case "neon-flicker":
        return {
          textShadow: `
            0 0 5px ${fontSettings.textColor},
            0 0 10px ${fontSettings.textColor},
            0 0 15px ${fontSettings.textColor},
            0 0 20px ${fontSettings.textColor}
          `,
          animation: `neon-flicker ${animationSettings.duration}s ease-in-out`,
        }
      case "morphing-circle":
        return {
          clipPath: isAnimating ? "circle(0% at 50% 50%)" : "circle(100% at 50% 50%)",
          transition: `clip-path ${animationSettings.duration}s ease-out`,
        }
      case "wave":
        return {
          animation: `wave ${animationSettings.duration}s ease-in-out`,
        }
      case "rainbow-wave":
        return {
          background: `linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)`,
          backgroundSize: "400% 400%",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animation: `rainbow-wave ${animationSettings.duration}s ease-in-out infinite`,
        }
      default:
        return {}
    }
  }

  const isLottieAnimation = [
    "morphing-shapes",
    "typeface-transition",
    "liquid-effect",
    "digital-glitch",
    "color-morph",
    "weight-transition",
  ].includes(animationSettings.type)

  return (
    <>
      <style jsx>{`
        @keyframes glitch {
          0%, 100% { transform: translate(0); }
          10% { transform: translate(-2px, -2px); }
          20% { transform: translate(2px, 2px); }
          30% { transform: translate(-2px, 2px); }
          40% { transform: translate(2px, -2px); }
          50% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          70% { transform: translate(-2px, 2px); }
          80% { transform: translate(2px, -2px); }
          90% { transform: translate(-2px, -2px); }
        }
        
        @keyframes neon-flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        @keyframes wave {
          0%, 100% { transform: translateY(0px); }
          25% { transform: translateY(-10px); }
          75% { transform: translateY(10px); }
        }

        @keyframes rainbow-wave {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <div
        className="text-center mb-8 w-full p-12 rounded-lg relative"
        style={{ backgroundColor: fontSettings.backgroundColor }}
      >
        {isLottieAnimation ? (
          <LottieAnimations
            currentFont={currentFont}
            fontSettings={fontSettings}
            globalText={globalText}
            animationSettings={animationSettings}
            animationKey={animationKey}
          />
        ) : (
          <>
            <input
              ref={textRef}
              type="text"
              value={
                animationSettings.type === "typewriter" ||
                animationSettings.type === "letter-drop" ||
                animationSettings.type === "letter-fade-shape" ||
                animationSettings.type === "spiral-in" ||
                animationSettings.type === "bounce-letters" ||
                animationSettings.type === "typewriter-reverse"
                  ? displayText
                  : globalText
              }
              onChange={handleTextChange}
              className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-center w-full bg-transparent focus:outline-none relative z-20 ${getAnimationClasses()}`}
              style={{
                wordBreak: "break-word",
                fontFamily: currentFont?.font.style?.fontFamily || currentFont?.name,
                fontSize: `${fontSettings.size}px`,
                letterSpacing: `${fontSettings.spacing}px`,
                fontWeight: fontSettings.weight,
                fontStyle: fontSettings.italic ? "italic" : "normal",
                textAlign: fontSettings.alignment,
                color: showText ? fontSettings.textColor : "transparent",
                transition: "color 0.3s ease",
                ...getSpecialStyles(),
              }}
            />

            {animationSettings.type === "typewriter" && isAnimating && (
              <span
                className="animate-pulse text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
                style={{
                  fontFamily: currentFont?.font.style?.fontFamily || currentFont?.name,
                  fontSize: `${fontSettings.size}px`,
                  color: fontSettings.textColor,
                  marginLeft: "2px",
                }}
              >
                |
              </span>
            )}
          </>
        )}
        {animationSettings.type === "particle-assembly" && (
          <ParticleAnimation
            currentFont={currentFont}
            fontSettings={fontSettings}
            globalText={globalText}
            animationSettings={animationSettings}
            animationKey={animationKey}
          />
        )}
      </div>
    </>
  )
}
