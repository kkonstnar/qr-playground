"use client"

import { Play, Pause, RotateCcw } from "lucide-react"
import { Button } from "./ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Slider } from "./ui/slider"

export type AnimationType = "none" | "fade-in" | "particle-assembly"

export interface AnimationSettings {
  type: AnimationType
  duration: number
  delay: number
  isPlaying: boolean
}

interface AnimationControlsProps {
  animationSettings: AnimationSettings
  onAnimationChange: (settings: Partial<AnimationSettings>) => void
  onRestart: () => void
  theme: string | undefined
}

const animationOptions = [
  { value: "none", label: "No Animation" },
  { value: "fade-in", label: "Fade In" },
  { value: "particle-assembly", label: "Particle Assembly" },
]

export function AnimationControls({ animationSettings, onAnimationChange, onRestart, theme }: AnimationControlsProps) {
  const hasAnimation = animationSettings.type !== "none"

  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Animation</h3>
        {hasAnimation && (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => onAnimationChange({ isPlaying: !animationSettings.isPlaying })}
              variant="ghost"
              size="sm"
            >
              {animationSettings.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button onClick={onRestart} variant="ghost" size="sm" title="Restart animation">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <Select
        value={animationSettings.type}
        onValueChange={(value: AnimationType) => onAnimationChange({ type: value })}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select animation" />
        </SelectTrigger>
        <SelectContent>
          {animationOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasAnimation && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Slider
            label="Duration (s)"
            value={animationSettings.duration}
            onChange={(value) => onAnimationChange({ duration: value })}
            min={0.5}
            max={5}
            step={0.1}
            darkMode={theme === "dark"}
          />
          <Slider
            label="Delay (s)"
            value={animationSettings.delay}
            onChange={(value) => onAnimationChange({ delay: value })}
            min={0}
            max={3}
            step={0.1}
            darkMode={theme === "dark"}
          />
        </div>
      )}
    </div>
  )
}
