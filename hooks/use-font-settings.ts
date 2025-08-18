"use client"

import { useState } from "react"

export interface FontSettings {
  size: number
  spacing: number
  weight: string
  alignment: "left" | "center" | "right"
  italic: boolean
  backgroundColor: string
  textColor: string
}

const defaultSettings: FontSettings = {
  size: 44,
  spacing: 0,
  weight: "400",
  alignment: "center",
  italic: false,
  backgroundColor: "#000000",
  textColor: "#ffffff",
}

export function useFontSettings() {
  const [fontSettings, setFontSettings] = useState<FontSettings>({
    ...defaultSettings,
    weight: "400",
  })

  const resetSettings = () => {
    setFontSettings(defaultSettings)
  }

  const updateSetting = <K extends keyof FontSettings>(key: K, value: FontSettings[K]) => {
    setFontSettings((prev) => ({ ...prev, [key]: value }))
  }

  return {
    fontSettings,
    setFontSettings,
    resetSettings,
    updateSetting,
  }
}
