"use client"

import { AlignLeft, AlignCenter, AlignRight, Italic } from "lucide-react"
import { Button } from "./ui/button"
import { Switch } from "./ui/switch"
import { Slider } from "./ui/slider"
import type { FontConfig } from "../hooks/use-fonts"
import type { FontSettings } from "../hooks/use-font-settings"

interface FontControlsProps {
  currentFont: FontConfig | undefined
  fontSettings: FontSettings
  onSettingChange: <K extends keyof FontSettings>(key: K, value: FontSettings[K]) => void
  theme: string | undefined
}

export function FontControls({ currentFont, fontSettings, onSettingChange, theme }: FontControlsProps) {
  if (!currentFont) return null

  return (
    <div className="mb-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weight and Italic */}
        <div className="space-y-4">
          <select
            value={fontSettings.weight}
            onChange={(e) => onSettingChange("weight", e.target.value)}
            className="w-full bg-background border border-neutral-800 rounded-md px-3 py-2 text-sm"
          >
            {currentFont.weights.map((weight) => (
              <option key={weight} value={weight}>
                {weight === "400" ? "Regular" : weight === "700" ? "Bold" : `Weight ${weight}`}
              </option>
            ))}
          </select>

          {currentFont.hasItalic && (
            <div className="flex items-center space-x-2">
              <Switch checked={fontSettings.italic} onChange={() => onSettingChange("italic", !fontSettings.italic)} />
              <Italic className="w-4 h-4" />
              <span className="text-sm">Italic</span>
            </div>
          )}
        </div>

        {/* Alignment Controls */}
        <div className="flex justify-start gap-1">
          {(["left", "center", "right"] as const).map((align) => (
            <Button
              key={align}
              onClick={() => onSettingChange("alignment", align)}
              variant={fontSettings.alignment === align ? "default" : "ghost"}
              size="sm"
            >
              {align === "left" && <AlignLeft className="w-3.5 h-3.5" />}
              {align === "center" && <AlignCenter className="w-3.5 h-3.5" />}
              {align === "right" && <AlignRight className="w-3.5 h-3.5" />}
            </Button>
          ))}
        </div>
      </div>

      {/* Size and Spacing Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Slider
          label="Size"
          value={fontSettings.size}
          onChange={(value) => onSettingChange("size", value)}
          min={12}
          max={120}
          darkMode={theme === "dark"}
        />
        <Slider
          label="Spacing"
          value={fontSettings.spacing}
          onChange={(value) => onSettingChange("spacing", value)}
          min={-10}
          max={50}
          step={1}
          darkMode={theme === "dark"}
        />
      </div>
    </div>
  )
}
