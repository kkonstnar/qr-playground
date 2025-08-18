"use client"

import type { FontSettings } from "../hooks/use-font-settings"

interface ColorControlsProps {
  fontSettings: FontSettings
  onSettingChange: <K extends keyof FontSettings>(key: K, value: FontSettings[K]) => void
}

export function ColorControls({ fontSettings, onSettingChange }: ColorControlsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="space-y-2">
        <label className="text-xs font-medium">Background Color</label>
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={fontSettings.backgroundColor}
            onChange={(e) => onSettingChange("backgroundColor", e.target.value)}
            className="w-8 h-8 rounded border border-neutral-800 cursor-pointer"
          />
          <input
            type="text"
            value={fontSettings.backgroundColor}
            onChange={(e) => onSettingChange("backgroundColor", e.target.value)}
            className="flex-1 bg-background border border-neutral-800 rounded px-2 py-1 text-xs font-mono"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium">Text Color</label>
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={fontSettings.textColor}
            onChange={(e) => onSettingChange("textColor", e.target.value)}
            className="w-8 h-8 rounded border border-neutral-800 cursor-pointer"
          />
          <input
            type="text"
            value={fontSettings.textColor}
            onChange={(e) => onSettingChange("textColor", e.target.value)}
            className="flex-1 bg-background border border-neutral-800 rounded px-2 py-1 text-xs font-mono"
          />
        </div>
      </div>
    </div>
  )
}
