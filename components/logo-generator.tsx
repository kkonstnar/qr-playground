"use client"

import { useState, useEffect, useRef } from "react"
import { Moon, Sun, RotateCcw, AlignLeft, AlignCenter, AlignRight, Italic, Trash2, ChevronDown } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "./ui/button"
import { Switch } from "./ui/switch"
import { Slider } from "./ui/slider"
import { LoaderIcon } from "./ui/loader-icon"
import { FontSelector } from "./font-selector"
import { UserGuide } from "./user-guide"
import { useFonts } from "../hooks/use-fonts"
import { useFontSettings } from "../hooks/use-font-settings"
import { useMobile } from "../hooks/use-mobile"
import { AnimationControls } from "./animation-controls"
import { AnimatedTextPreview } from "./animated-text-preview"
import { useAnimationSettings } from "../hooks/use-animation-settings"
import { DownloadButtons } from "./download-buttons"

export default function LogoGenerator() {
  const { theme, setTheme } = useTheme()
  const [currentFontIndex, setCurrentFontIndex] = useState(0)
  const [globalText, setGlobalText] = useState("Brand X")
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isMobile = useMobile()
  const [brandInput, setBrandInput] = useState("Brand X")

  const { fonts, isLoading, isPending, skeletonCount, handleAddFont, handleDeleteFont } = useFonts()
  const { fontSettings, resetSettings: resetFontSettings, updateSetting } = useFontSettings()
  const { animationSettings, animationKey, updateAnimationSetting, restartAnimation, resetAnimationSettings } =
    useAnimationSettings()

  const currentFont = fonts[currentFontIndex]
  const isProduction = process.env.NODE_ENV === "production"

  useEffect(() => {
    setDeleteConfirmId(null)
  }, [currentFontIndex])

  useEffect(() => {
    if (fonts.length > 0 && currentFont) {
      // Only set weight if current weight is not available in new font
      if (!currentFont.weights.includes(fontSettings.weight)) {
        const newWeight = currentFont.weights.includes("400") ? "400" : currentFont.weights[0]
        updateSetting("weight", newWeight)
      }
    }
  }, [currentFont, fonts.length])

  const handleFontSelect = (fontName: string) => {
    const index = fonts.findIndex((font) => font.name === fontName)
    if (index !== -1) {
      setCurrentFontIndex(index)
    }
  }

  const handleDeleteFontWithIndex = async (id?: number) => {
    if (!id || isProduction) return

    // Adjust current font index if needed
    if (currentFont?.id === id) {
      setCurrentFontIndex(Math.max(0, currentFontIndex - 1))
    } else if (currentFontIndex >= fonts.length - 1) {
      setCurrentFontIndex(Math.max(0, fonts.length - 2))
    }

    await handleDeleteFont(id)
    setDeleteConfirmId(null)
  }

  const confirmDelete = (id?: number) => {
    if (!id || isProduction) return
    setDeleteConfirmId(id)
  }

  const cancelDelete = () => {
    setDeleteConfirmId(null)
  }

  const generateImage = async (format: "png" | "svg" | "gif") => {
    const content = globalText || currentFont?.defaultText || "Brand X"
    const fontFamily = currentFont?.name || "Arial"
    const fontSize = fontSettings.size

    // Create timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5)

    // Create filename: brand-name-font-name-timestamp.extension
    const brandName = content
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
    const fontNameForFile = fontFamily
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
    const filename = `${brandName}-${fontNameForFile}-${timestamp}.${format}`

    if (format === "png") {
      await generatePNG(content, fontFamily, fontSize, filename)
    } else if (format === "svg") {
      generateSVG(content, fontFamily, fontSize, filename)
    } else if (format === "gif") {
      await generateGIF(content, fontFamily, fontSize, filename)
    }
  }

  const generatePNG = async (content: string, fontFamily: string, fontSize: number, filename: string) => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const fontStyle = fontSettings.italic ? "italic " : ""
    await document.fonts.load(`${fontStyle}${fontSettings.weight} ${fontSize}px "${fontFamily}"`)

    const dpr = window.devicePixelRatio || 1
    const padding = 40
    const letterSpacing = fontSettings.spacing

    ctx.font = `${fontStyle}${fontSettings.weight} ${fontSize}px "${fontFamily}"`

    const wholeTextWidth = ctx.measureText(content).width
    const totalWidth = wholeTextWidth + (content.length - 1) * letterSpacing

    const displayWidth = Math.max(totalWidth + padding * 2, 400)
    const displayHeight = Math.max(fontSize + padding * 2, 200)

    canvas.width = displayWidth * dpr
    canvas.height = displayHeight * dpr
    canvas.style.width = `${displayWidth}px`
    canvas.style.height = `${displayHeight}px`

    ctx.scale(dpr, dpr)

    ctx.fillStyle = fontSettings.backgroundColor
    ctx.fillRect(0, 0, displayWidth, displayHeight)

    ctx.fillStyle = fontSettings.textColor
    ctx.font = `${fontStyle}${fontSettings.weight} ${fontSize}px "${fontFamily}"`
    ctx.textBaseline = "middle"

    if (fontSettings.alignment === "center") {
      ctx.textAlign = "center"
      if (letterSpacing === 0) {
        ctx.fillText(content, displayWidth / 2, displayHeight / 2)
      } else {
        const totalTextWidth = wholeTextWidth + (content.length - 1) * letterSpacing
        let currentX = (displayWidth - totalTextWidth) / 2
        for (let i = 0; i < content.length; i++) {
          const charWidth = ctx.measureText(content[i]).width
          ctx.fillText(content[i], currentX + charWidth / 2, displayHeight / 2)
          currentX += charWidth + letterSpacing
        }
      }
    } else if (fontSettings.alignment === "right") {
      if (letterSpacing === 0) {
        ctx.textAlign = "right"
        ctx.fillText(content, displayWidth - padding, displayHeight / 2)
      } else {
        let totalCharWidth = 0
        for (let i = content.length - 1; i >= 0; i--) {
          const charWidth = ctx.measureText(content[i]).width
          ctx.fillText(content[i], displayWidth - padding - totalCharWidth - charWidth / 2, displayHeight / 2)
          totalCharWidth += charWidth + letterSpacing
        }
      }
    } else {
      if (letterSpacing === 0) {
        ctx.textAlign = "left"
        ctx.fillText(content, padding, displayHeight / 2)
      } else {
        let currentX = padding
        for (let i = 0; i < content.length; i++) {
          const charWidth = ctx.measureText(content[i]).width
          ctx.fillText(content[i], currentX + charWidth / 2, displayHeight / 2)
          currentX += charWidth + letterSpacing
        }
      }
    }

    const dataUrl = canvas.toDataURL("image/png")
    const link = document.createElement("a")
    link.download = filename
    link.href = dataUrl
    link.click()
  }

  const generateSVG = (content: string, fontFamily: string, fontSize: number, filename: string) => {
    const padding = 40
    const letterSpacing = fontSettings.spacing

    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")
    if (!context) return

    const fontStyle = fontSettings.italic ? "italic " : ""
    context.font = `${fontStyle}${fontSettings.weight} ${fontSize}px "${fontFamily}"`
    let totalWidth = 0
    for (let i = 0; i < content.length; i++) {
      totalWidth += context.measureText(content[i]).width + (i < content.length - 1 ? letterSpacing : 0)
    }

    const width = Math.max(totalWidth + padding * 2, 400)
    const height = Math.max(fontSize + padding * 2, 200)

    let textX, textAnchor
    if (fontSettings.alignment === "center") {
      textX = width / 2
      textAnchor = "middle"
    } else if (fontSettings.alignment === "right") {
      textX = width - padding
      textAnchor = "end"
    } else {
      textX = padding
      textAnchor = "start"
    }

    const encodedFontFamily = encodeURIComponent(fontFamily)
    const encodedWeight = encodeURIComponent(fontSettings.weight)

    const svg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=${encodedFontFamily}:ital,wght@0,${encodedWeight};1,${encodedWeight}');
      text {
        font-family: "${fontFamily}", sans-serif;
        font-size: ${fontSize}px;
        font-weight: ${fontSettings.weight};
        font-style: ${fontSettings.italic ? "italic" : "normal"};
        letter-spacing: ${letterSpacing}px;
      }
    </style>
  </defs>
  <rect width="100%" height="100%" fill="${fontSettings.backgroundColor}"/>
  <text
    x="${textX}"
    y="${height / 2}"
    fill="${fontSettings.textColor}"
    textAnchor="${textAnchor}"
    dominantBaseline="middle"
    style="font-family: '${fontFamily}', sans-serif; font-style: ${fontSettings.italic ? "italic" : "normal"};"
  >${content}</text>
</svg>`

    const blob = new Blob([svg], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.download = filename
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }

  const generateGIF = async (content: string, fontFamily: string, fontSize: number, filename: string) => {
    // For now, we'll create a simple animated GIF by capturing multiple frames
    // This is a simplified version - in production you'd want to use a proper GIF library
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const padding = 40
    const displayWidth = Math.max(400, fontSize * content.length * 0.6 + padding * 2)
    const displayHeight = Math.max(200, fontSize + padding * 2)

    canvas.width = displayWidth
    canvas.height = displayHeight

    // For now, just download a PNG with a note about GIF support
    ctx.fillStyle = fontSettings.backgroundColor
    ctx.fillRect(0, 0, displayWidth, displayHeight)

    ctx.fillStyle = fontSettings.textColor
    ctx.font = `${fontSettings.italic ? "italic " : ""}${fontSettings.weight} ${fontSize}px "${fontFamily}"`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(content, displayWidth / 2, displayHeight / 2)

    // Add animation indicator
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
    ctx.fillRect(10, 10, 200, 30)
    ctx.fillStyle = "#000"
    ctx.font = "12px Arial"
    ctx.textAlign = "left"
    ctx.fillText(`Animation: ${animationSettings.type}`, 15, 28)

    const dataUrl = canvas.toDataURL("image/png")
    const link = document.createElement("a")
    link.download = filename.replace(".gif", ".png")
    link.href = dataUrl
    link.click()
  }

  const handleResetSettings = () => {
    resetFontSettings()
    resetAnimationSettings()
  }

  // Sync brand input with global text changes from the preview
  useEffect(() => {
    setBrandInput(globalText)
  }, [globalText])

  return (
    <div className="w-full bg-background text-foreground p-4">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-semibold">Playground</h1>
          <div className="flex items-center space-x-2">
            <Sun className="h-4 w-4" />
            <Switch checked={theme === "dark"} onChange={() => setTheme(theme === "dark" ? "light" : "dark")} />
            <Moon className="h-4 w-4" />
          </div>
        </div>

        {/* Font Controls Row */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1">
            <FontSelector
              fonts={fonts}
              currentFontIndex={currentFontIndex}
              onFontSelect={handleFontSelect}
              onAddFont={handleAddFont}
              isPending={isPending}
              isLoading={isLoading}
              skeletonCount={skeletonCount}
            />
          </div>
          <div className="w-32">
            <select
              value={fontSettings.weight}
              onChange={(e) => updateSetting("weight", e.target.value)}
              className="w-full bg-background border border-neutral-800 rounded-md px-3 py-2 text-sm appearance-none"
              style={{
                backgroundImage: currentFont?.hasItalic
                  ? "none"
                  : `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: "right 0.5rem center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "1.5em 1.5em",
              }}
            >
              {currentFont?.weights.map((weight) => (
                <option key={weight} value={weight}>
                  Weight {weight}
                </option>
              ))}
            </select>
            {currentFont?.hasItalic && (
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none hidden sm:block" />
            )}
          </div>
          {currentFont?.hasItalic && (
            <div className="flex items-center space-x-2">
              <Switch checked={fontSettings.italic} onChange={() => updateSetting("italic", !fontSettings.italic)} />
              <Italic className="w-4 h-4" />
            </div>
          )}
          <Button onClick={handleResetSettings} variant="ghost" size="sm" title="Reset settings">
            <RotateCcw className="w-4 h-4" />
          </Button>
          {currentFont?.id && !isProduction && (
            <Button
              onClick={() => confirmDelete(currentFont.id)}
              variant="ghost"
              size="sm"
              title="Delete font"
              disabled={isPending}
              className="text-red-500 hover:text-red-400"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Brand Input */}
        <div className="mb-8">
          <label className="block text-sm font-medium mb-2">Brand Name</label>
          <input
            type="text"
            value={brandInput}
            onChange={(e) => {
              setBrandInput(e.target.value)
              setGlobalText(e.target.value || "Brand X")
            }}
            placeholder="Enter your brand name..."
            className="w-full bg-background border border-neutral-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
        </div>

        {/* Animation Controls */}
        <AnimationControls
          animationSettings={animationSettings}
          onAnimationChange={updateAnimationSetting}
          onRestart={restartAnimation}
          theme={theme}
        />

        {/* Delete Confirmation */}
        {deleteConfirmId && !isProduction && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-900 rounded-md">
            <p className="text-sm mb-3">Are you sure you want to delete this font?</p>
            <div className="flex gap-2">
              <Button
                onClick={() => handleDeleteFontWithIndex(deleteConfirmId)}
                variant="destructive"
                size="sm"
                disabled={isPending}
              >
                {isPending ? <LoaderIcon size={14} /> : "Delete"}
              </Button>
              <Button onClick={cancelDelete} variant="secondary" size="sm" disabled={isPending}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Text Preview */}
        <div className="mb-8">
          <AnimatedTextPreview
            currentFont={currentFont}
            fontSettings={fontSettings}
            globalText={globalText}
            onTextChange={setGlobalText}
            animationSettings={animationSettings}
            animationKey={animationKey}
          />
        </div>

        {/* Controls Row - Alignment and Colors */}
        <div className="flex items-center justify-between mb-8">
          {/* Alignment Controls */}
          <div className="flex gap-1">
            {(["left", "center", "right"] as const).map((align) => (
              <Button
                key={align}
                onClick={() => updateSetting("alignment", align)}
                variant={fontSettings.alignment === align ? "default" : "ghost"}
                size="sm"
              >
                {align === "left" && <AlignLeft className="w-3.5 h-3.5" />}
                {align === "center" && <AlignCenter className="w-3.5 h-3.5" />}
                {align === "right" && <AlignRight className="w-3.5 h-3.5" />}
              </Button>
            ))}
          </div>

          {/* Color Controls - Inline for better performance */}
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={fontSettings.backgroundColor}
                onChange={(e) => updateSetting("backgroundColor", e.target.value)}
                className="w-8 h-8 rounded border border-neutral-800 cursor-pointer"
              />
              <input
                type="text"
                value={fontSettings.backgroundColor}
                onChange={(e) => updateSetting("backgroundColor", e.target.value)}
                className="w-20 bg-background border border-neutral-800 rounded px-2 py-1 text-xs font-mono"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={fontSettings.textColor}
                onChange={(e) => updateSetting("textColor", e.target.value)}
                className="w-8 h-8 rounded border border-neutral-800 cursor-pointer"
              />
              <input
                type="text"
                value={fontSettings.textColor}
                onChange={(e) => updateSetting("textColor", e.target.value)}
                className="w-20 bg-background border border-neutral-800 rounded px-2 py-1 text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Slider
            label="Size"
            value={fontSettings.size}
            onChange={(value) => updateSetting("size", value)}
            min={12}
            max={120}
            darkMode={theme === "dark"}
          />
          <Slider
            label="Tracking/Spacing"
            value={fontSettings.spacing}
            onChange={(value) => updateSetting("spacing", value)}
            min={-10}
            max={50}
            step={1}
            darkMode={theme === "dark"}
          />
        </div>

        {/* Download Button */}
        <div className="flex justify-center">
          <DownloadButtons onDownload={generateImage} hasAnimation={animationSettings.type !== "none"} />
        </div>

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>

      {/* User Guide */}
      <UserGuide isMobile={isMobile} />
    </div>
  )
}
