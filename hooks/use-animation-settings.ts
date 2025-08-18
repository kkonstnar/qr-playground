"use client"

import { useState } from "react"
import type { AnimationSettings } from "../components/animation-controls"

const defaultSettings: AnimationSettings = {
  type: "none",
  duration: 2,
  delay: 0,
  isPlaying: true,
}

export function useAnimationSettings() {
  const [animationSettings, setAnimationSettings] = useState<AnimationSettings>(defaultSettings)
  const [animationKey, setAnimationKey] = useState(0)

  const updateAnimationSetting = (updates: Partial<AnimationSettings>) => {
    setAnimationSettings((prev) => ({ ...prev, ...updates }))

    // If changing animation type, restart it
    if (updates.type && updates.type !== animationSettings.type) {
      setAnimationKey((prev) => prev + 1)
    }
  }

  const restartAnimation = () => {
    setAnimationKey((prev) => prev + 1)
  }

  const resetAnimationSettings = () => {
    setAnimationSettings(defaultSettings)
    setAnimationKey((prev) => prev + 1)
  }

  return {
    animationSettings,
    animationKey,
    updateAnimationSetting,
    restartAnimation,
    resetAnimationSettings,
  }
}
