"use client"

import type React from "react"

import { useRef } from "react"
import type { FontConfig } from "../hooks/use-fonts"
import type { FontSettings } from "../hooks/use-font-settings"

interface TextPreviewProps {
  currentFont: FontConfig | undefined
  fontSettings: FontSettings
  globalText: string
  onTextChange: (text: string) => void
}

export function TextPreview({ currentFont, fontSettings, globalText, onTextChange }: TextPreviewProps) {
  const textRef = useRef<HTMLInputElement>(null)

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onTextChange(e.target.value)
  }

  return (
    <div className="text-center mb-8 w-full p-12 rounded-lg" style={{ backgroundColor: fontSettings.backgroundColor }}>
      <input
        ref={textRef}
        type="text"
        value={globalText}
        onChange={handleTextChange}
        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-center w-full bg-transparent focus:outline-none"
        style={{
          wordBreak: "break-word",
          fontFamily: currentFont?.font.style?.fontFamily || currentFont?.name,
          fontSize: `${fontSettings.size}px`,
          letterSpacing: `${fontSettings.spacing}px`,
          fontWeight: fontSettings.weight,
          fontStyle: fontSettings.italic ? "italic" : "normal",
          textAlign: fontSettings.alignment,
          color: fontSettings.textColor,
        }}
      />
    </div>
  )
}
