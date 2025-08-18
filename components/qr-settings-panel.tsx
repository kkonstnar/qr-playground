"use client"

import type React from "react"
import { Switch } from "./ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Button } from "./ui/button"
import { Smartphone, MaximizeIcon as Limit } from "lucide-react"

interface QRSettings {
  size: number
  margin: number
  errorCorrectionLevel: "L" | "M" | "Q" | "H"
  backgroundColor: string
  foregroundColor: string
}

interface AppStoreSettings {
  enabled: boolean
  iosUrl: string
  androidUrl: string
  fallbackUrl: string
}

interface UsageLimitSettings {
  enabled: boolean
  maxScans: number
}

interface QRSettingsPanelProps {
  qrSettings: QRSettings
  appStoreSettings: AppStoreSettings
  usageLimitSettings: UsageLimitSettings
  enableTracking: boolean
  hasUrls: boolean
  onQRSettingChange: <K extends keyof QRSettings>(key: K, value: QRSettings[K]) => void
  onAppStoreSettingChange: <K extends keyof AppStoreSettings>(key: K, value: AppStoreSettings[K]) => void
  onUsageLimitSettingChange: <K extends keyof UsageLimitSettings>(key: K, value: UsageLimitSettings[K]) => void
  onTrackingChange: (enabled: boolean) => void
  onResetSettings: () => void
}

export function QRSettingsPanel({
  qrSettings,
  appStoreSettings,
  usageLimitSettings,
  enableTracking,
  hasUrls,
  onQRSettingChange,
  onAppStoreSettingChange,
  onUsageLimitSettingChange,
  onTrackingChange,
  onResetSettings,
}: QRSettingsPanelProps) {
  return (
    <div className="space-y-6">
      {/* App Store Links */}
      {hasUrls && (
        <div className="p-4 border border-neutral-800 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <label className="text-sm font-medium">App Store Links</label>
              <p className="text-xs text-muted-foreground">
                Smart redirect to iOS App Store or Google Play Store based on device
              </p>
            </div>
            <Switch
              checked={appStoreSettings.enabled}
              onCheckedChange={(enabled) => onAppStoreSettingChange("enabled", enabled)}
            />
          </div>

          {appStoreSettings.enabled && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ios-url" className="text-xs font-medium">
                    iOS App Store URL
                  </Label>
                  <Input
                    id="ios-url"
                    type="url"
                    placeholder="https://apps.apple.com/app/..."
                    value={appStoreSettings.iosUrl}
                    onChange={(e) => onAppStoreSettingChange("iosUrl", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="android-url" className="text-xs font-medium">
                    Google Play Store URL
                  </Label>
                  <Input
                    id="android-url"
                    type="url"
                    placeholder="https://play.google.com/store/apps/..."
                    value={appStoreSettings.androidUrl}
                    onChange={(e) => onAppStoreSettingChange("androidUrl", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="fallback-url" className="text-xs font-medium">
                  Fallback URL (for desktop/unknown devices)
                </Label>
                <Input
                  id="fallback-url"
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={appStoreSettings.fallbackUrl}
                  onChange={(e) => onAppStoreSettingChange("fallbackUrl", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Usage Limits */}
      {hasUrls && (
        <div className="p-4 border border-neutral-800 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <label className="text-sm font-medium">Usage Limits</label>
              <p className="text-xs text-muted-foreground">
                Restrict the number of times this QR code can be scanned
              </p>
            </div>
            <Switch
              checked={usageLimitSettings.enabled}
              onCheckedChange={(enabled) => onUsageLimitSettingChange("enabled", enabled)}
            />
          </div>

          {usageLimitSettings.enabled && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="max-scans" className="text-xs font-medium">
                  Maximum Scans: {usageLimitSettings.maxScans}
                </Label>
                <input
                  id="max-scans"
                  type="range"
                  min={1}
                  max={10000}
                  step={1}
                  value={usageLimitSettings.maxScans}
                  onChange={(e) => onUsageLimitSettingChange("maxScans", Number.parseInt(e.target.value))}
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer slider mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1</span>
                  <span>10,000</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tracking Toggle */}
      {hasUrls && (
        <div className="p-4 border border-neutral-800 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between mb-2">
            <div>
              <label className="text-sm font-medium">Enable Scan Tracking</label>
              <p className="text-xs text-muted-foreground">Track device info and location when QR code is scanned</p>
            </div>
            <Switch checked={enableTracking} onCheckedChange={onTrackingChange} />
          </div>
        </div>
      )}

      {/* QR Visual Settings */}
      <div className="p-4 border border-neutral-800 rounded-lg bg-muted/50">
        <div className="mb-4">
          <h3 className="text-sm font-medium">Visual Settings</h3>
        </div>
        
        <div className="space-y-4">
          {/* Error Correction Level */}
          <div>
            <label className="block text-xs font-medium mb-1">Error Correction</label>
            <Select
              value={qrSettings.errorCorrectionLevel}
              onValueChange={(value: "L" | "M" | "Q" | "H") => onQRSettingChange("errorCorrectionLevel", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">Low (7%)</SelectItem>
                <SelectItem value="M">Medium (15%)</SelectItem>
                <SelectItem value="Q">Quartile (25%)</SelectItem>
                <SelectItem value="H">High (30%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Background</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={qrSettings.backgroundColor}
                  onChange={(e) => onQRSettingChange("backgroundColor", e.target.value)}
                  className="w-8 h-8 rounded border border-neutral-800 cursor-pointer"
                />
                <input
                  type="text"
                  value={qrSettings.backgroundColor}
                  onChange={(e) => onQRSettingChange("backgroundColor", e.target.value)}
                  className="flex-1 bg-background border border-neutral-800 rounded px-2 py-1 text-xs font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Foreground</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={qrSettings.foregroundColor}
                  onChange={(e) => onQRSettingChange("foregroundColor", e.target.value)}
                  className="w-8 h-8 rounded border border-neutral-800 cursor-pointer"
                />
                <input
                  type="text"
                  value={qrSettings.foregroundColor}
                  onChange={(e) => onQRSettingChange("foregroundColor", e.target.value)}
                  className="flex-1 bg-background border border-neutral-800 rounded px-2 py-1 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Size and Margin Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-2">Size: {qrSettings.size}px</label>
              <input
                type="range"
                min={128}
                max={512}
                step={32}
                value={qrSettings.size}
                onChange={(e) => onQRSettingChange("size", Number.parseInt(e.target.value))}
                className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-2">Margin: {qrSettings.margin}</label>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={qrSettings.margin}
                onChange={(e) => onQRSettingChange("margin", Number.parseInt(e.target.value))}
                className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={onResetSettings} variant="ghost" size="sm">
              Reset Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}