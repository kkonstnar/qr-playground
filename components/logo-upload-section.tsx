"use client"

import type React from "react"
import { Button } from "./ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Upload, X } from "lucide-react"

interface LogoSettings {
  position: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | "custom"
  customX: number
  customY: number
  size: number
}

interface LogoUploadSectionProps {
  logoFile: File | null
  logoDataUrl: string
  logoSettings: LogoSettings
  onLogoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveLogo: () => void
  onLogoSettingChange: <K extends keyof LogoSettings>(key: K, value: LogoSettings[K]) => void
  logoInputRef: React.RefObject<HTMLInputElement>
}

export function LogoUploadSection({
  logoFile,
  logoDataUrl,
  logoSettings,
  onLogoUpload,
  onRemoveLogo,
  onLogoSettingChange,
  logoInputRef,
}: LogoUploadSectionProps) {
  return (
    <div className="p-4 border border-neutral-800 rounded-lg bg-muted/50">
      <div className="flex items-center justify-between mb-3">
        <div>
          <label className="text-sm font-medium">Logo</label>
          <p className="text-xs text-muted-foreground">Add a logo to your QR codes</p>
        </div>
        <div className="flex items-center gap-2">
          <input ref={logoInputRef} type="file" accept="image/*" onChange={onLogoUpload} className="hidden" />
          <Button
            onClick={() => logoInputRef.current?.click()}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Logo
          </Button>
          {logoFile && (
            <Button onClick={onRemoveLogo} variant="ghost" size="sm">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      {logoDataUrl && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img
              src={logoDataUrl || "/placeholder.svg"}
              alt="Logo preview"
              className="w-12 h-12 object-contain border rounded"
            />
            <span className="text-sm text-muted-foreground">{logoFile?.name}</span>
          </div>

          {/* Logo Position Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Position</label>
              <Select
                value={logoSettings.position}
                onValueChange={(value: LogoSettings["position"]) => onLogoSettingChange("position", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="top-left">Top Left</SelectItem>
                  <SelectItem value="top-right">Top Right</SelectItem>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Size: {logoSettings.size}%</label>
              <input
                type="range"
                min={10}
                max={40}
                step={2}
                value={logoSettings.size}
                onChange={(e) => onLogoSettingChange("size", Number.parseInt(e.target.value))}
                className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>

          {/* Custom Position Controls */}
          {logoSettings.position === "custom" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1">X Position: {logoSettings.customX}%</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={logoSettings.customX}
                  onChange={(e) => onLogoSettingChange("customX", Number.parseInt(e.target.value))}
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Y Position: {logoSettings.customY}%</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={logoSettings.customY}
                  onChange={(e) => onLogoSettingChange("customY", Number.parseInt(e.target.value))}
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}