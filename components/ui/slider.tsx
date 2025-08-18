"use client"

import type * as React from "react"
import { cn } from "../../lib/utils"

interface SliderProps {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  label: string
  darkMode: boolean
}

export const Slider: React.FC<SliderProps> = ({ value, onChange, min, max, step = 1, label, darkMode }) => (
  <div className="w-full">
    <div className="flex justify-between mb-1">
      <label className="text-xs font-medium">{label}</label>
      <span className="text-xs font-medium">{value}</span>
    </div>
    <input
      type="range"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      min={min}
      max={max}
      step={step}
      className={cn(
        "w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer",
        "[&::-webkit-slider-thumb]:appearance-none",
        "[&::-webkit-slider-thumb]:w-4",
        "[&::-webkit-slider-thumb]:h-4",
        "[&::-webkit-slider-thumb]:rounded-full",
        "[&::-webkit-slider-thumb]:cursor-pointer",
        "[&::-moz-range-thumb]:w-4",
        "[&::-moz-range-thumb]:h-4",
        "[&::-moz-range-thumb]:rounded-full",
        "[&::-moz-range-thumb]:border-0",
        "[&::-moz-range-thumb]:cursor-pointer",
        darkMode
          ? "[&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:bg-white"
          : "[&::-webkit-slider-thumb]:bg-black [&::-moz-range-thumb]:bg-black",
      )}
    />
  </div>
)
