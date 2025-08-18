"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Moon, Sun, RotateCcw, Download, BarChart3 } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "./ui/button"
import { Switch } from "./ui/switch"
import { UserGuide } from "./user-guide"
import { useMobile } from "../hooks/use-mobile"
import { AnalyticsModal } from "./analytics-modal"
import { QRSettingsPanel } from "./qr-settings-panel"
import { BatchInputSection } from "./batch-input-section"
import { LogoUploadSection } from "./logo-upload-section"
import QRCode from "qrcode"

interface QRSettings {
  size: number
  margin: number
  errorCorrectionLevel: "L" | "M" | "Q" | "H"
  backgroundColor: string
  foregroundColor: string
}

interface LogoSettings {
  position: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | "custom"
  customX: number
  customY: number
  size: number
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

interface CSVRow {
  url: string
  title?: string
  description?: string
}

interface GeneratedQR {
  id: string
  url: string
  title?: string
  description?: string
  dataUrl: string
  trackingId?: string
  appStore?: AppStoreSettings
  usageLimit?: UsageLimitSettings
}

const defaultSettings: QRSettings = {
  size: 256,
  margin: 4,
  errorCorrectionLevel: "M",
  backgroundColor: "#ffffff",
  foregroundColor: "#000000",
}

const defaultLogoSettings: LogoSettings = {
  position: "center",
  customX: 50,
  customY: 50,
  size: 20,
}

const defaultAppStoreSettings: AppStoreSettings = {
  enabled: false,
  iosUrl: "",
  androidUrl: "",
  fallbackUrl: "",
}

const defaultUsageLimitSettings: UsageLimitSettings = {
  enabled: false,
  maxScans: 100,
}

export default function QRGeneratorOptimized() {
  const { theme, setTheme } = useTheme()
  const [qrText, setQrText] = useState("https://example.com")
  const [batchText, setBatchText] = useState("https://example.com\nhttps://google.com\nhttps://github.com")
  const [qrSettings, setQrSettings] = useState<QRSettings>(defaultSettings)
  const [logoSettings, setLogoSettings] = useState<LogoSettings>(defaultLogoSettings)
  const [appStoreSettings, setAppStoreSettings] = useState<AppStoreSettings>(defaultAppStoreSettings)
  const [usageLimitSettings, setUsageLimitSettings] = useState<UsageLimitSettings>(defaultUsageLimitSettings)
  const [qrDataUrl, setQrDataUrl] = useState<string>("")
  const [batchQRs, setBatchQRs] = useState<GeneratedQR[]>([])
  const [enableTracking, setEnableTracking] = useState(false)
  const [trackingId, setTrackingId] = useState<string>("")
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [batchMode, setBatchMode] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoDataUrl, setLogoDataUrl] = useState<string>("")
  const [csvData, setCsvData] = useState<CSVRow[]>([])
  const [showCsvPreview, setShowCsvPreview] = useState(false)
  const [csvError, setCsvError] = useState<string>("")
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const csvInputRef = useRef<HTMLInputElement>(null)
  const isMobile = useMobile()

  const updateSetting = <K extends keyof QRSettings>(key: K, value: QRSettings[K]) => {
    setQrSettings((prev) => ({ ...prev, [key]: value }))
  }

  const updateLogoSetting = <K extends keyof LogoSettings>(key: K, value: LogoSettings[K]) => {
    setLogoSettings((prev) => ({ ...prev, [key]: value }))
  }

  const updateAppStoreSetting = <K extends keyof AppStoreSettings>(key: K, value: AppStoreSettings[K]) => {
    setAppStoreSettings((prev) => ({ ...prev, [key]: value }))
  }

  const updateUsageLimitSetting = <K extends keyof UsageLimitSettings>(key: K, value: UsageLimitSettings[K]) => {
    setUsageLimitSettings((prev) => ({ ...prev, [key]: value }))
  }

  const resetSettings = () => {
    setQrSettings(defaultSettings)
    setLogoSettings(defaultLogoSettings)
    setAppStoreSettings(defaultAppStoreSettings)
    setUsageLimitSettings(defaultUsageLimitSettings)
  }

  // CSV and Logo handlers would go here (same as before)
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoDataUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeLogo = () => {
    setLogoFile(null)
    setLogoDataUrl("")
    if (logoInputRef.current) {
      logoInputRef.current.value = ""
    }
  }

  // CSV handling functions would go here
  const parseCSV = (csvText: string): CSVRow[] => {
    // CSV parsing logic (same as original)
    const lines = csvText.trim().split("\n")
    if (lines.length === 0) return []

    const firstLine = lines[0].toLowerCase()
    const hasHeaders = firstLine.includes("url") || firstLine.includes("link") || firstLine.includes("title")

    let headers: string[] = []
    let dataLines: string[] = []

    if (hasHeaders) {
      headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""))
      dataLines = lines.slice(1)
    } else {
      headers = ["url"]
      dataLines = lines
    }

    const urlIndex = headers.findIndex((h) => h.includes("url") || h.includes("link"))
    const titleIndex = headers.findIndex((h) => h.includes("title") || h.includes("name"))
    const descIndex = headers.findIndex((h) => h.includes("description") || h.includes("desc"))

    if (urlIndex === -1 && !hasHeaders) {
      return dataLines
        .map((line) => {
          const columns = line.split(",").map((col) => col.trim().replace(/"/g, ""))
          return { url: columns[0] || "" }
        })
        .filter((row) => row.url)
    }

    return dataLines
      .map((line) => {
        const columns = line.split(",").map((col) => col.trim().replace(/"/g, ""))
        const row: CSVRow = {
          url: columns[urlIndex] || columns[0] || "",
        }

        if (titleIndex !== -1 && columns[titleIndex]) {
          row.title = columns[titleIndex]
        }

        if (descIndex !== -1 && columns[descIndex]) {
          row.description = columns[descIndex]
        }

        return row
      })
      .filter((row) => row.url)
  }

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setCsvError("Please upload a CSV file")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string
        const parsed = parseCSV(csvText)

        if (parsed.length === 0) {
          setCsvError("No valid URLs found in CSV file")
          return
        }

        setCsvData(parsed)
        setCsvError("")
        setShowCsvPreview(true)
        setBatchMode(true)
      } catch (error) {
        setCsvError("Error parsing CSV file. Please check the format.")
        console.error("CSV parsing error:", error)
      }
    }

    reader.onerror = () => {
      setCsvError("Error reading CSV file")
    }

    reader.readAsText(file)
  }

  const applyCsvData = () => {
    const urls = csvData.map((row) => row.url).join("\n")
    setBatchText(urls)
    setShowCsvPreview(false)
  }

  const clearCsvData = () => {
    setCsvData([])
    setShowCsvPreview(false)
    setCsvError("")
    if (csvInputRef.current) {
      csvInputRef.current.value = ""
    }
  }

  // QR generation logic would go here (same as original but optimized)
  const createTrackingUrl = async (
    originalUrl: string,
    appStore?: AppStoreSettings,
    usageLimit?: UsageLimitSettings,
  ): Promise<string> => {
    try {
      const response = await fetch("/api/track", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalUrl,
          appStore: appStore?.enabled ? appStore : undefined,
          usageLimit: usageLimit?.enabled ? usageLimit : undefined,
        }),
      })

      if (response.ok) {
        const { trackingUrl, trackingId: newTrackingId } = await response.json()
        setTrackingId(newTrackingId)
        return trackingUrl
      }
    } catch (error) {
      console.error("Error creating tracking URL:", error)
    }

    return originalUrl
  }

  const currentUrls = batchMode ? batchText.split("\n").filter((url) => url.trim()) : [qrText]
  const hasUrls = currentUrls.some((url) => url.startsWith("http://") || url.startsWith("https://"))

  return (
    <div className="w-full bg-background text-foreground p-4">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-medium">QR Playground</h1>
          <div className="flex items-center space-x-2">
            <Sun className="h-4 w-4" />
            <Switch checked={theme === "dark"} onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")} />
            <Moon className="h-4 w-4" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Input and Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Batch Input Section */}
            <BatchInputSection
              batchMode={batchMode}
              batchText={batchText}
              csvData={csvData}
              showCsvPreview={showCsvPreview}
              csvError={csvError}
              onBatchModeChange={setBatchMode}
              onBatchTextChange={setBatchText}
              onCsvUpload={handleCSVUpload}
              onCsvPreviewToggle={() => setShowCsvPreview(!showCsvPreview)}
              onApplyCsvData={applyCsvData}
              onClearCsvData={clearCsvData}
              csvInputRef={csvInputRef}
            />

            {/* Single QR Text Input */}
            {!batchMode && (
              <div>
                <label className="block text-sm font-medium mb-2">Text or URL</label>
                <textarea
                  value={qrText}
                  onChange={(e) => setQrText(e.target.value)}
                  placeholder="Enter text, URL, or any data to encode..."
                  className="w-full bg-background border border-neutral-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-h-[80px] resize-y"
                />
              </div>
            )}

            {/* Logo Upload Section */}
            <LogoUploadSection
              logoFile={logoFile}
              logoDataUrl={logoDataUrl}
              logoSettings={logoSettings}
              onLogoUpload={handleLogoUpload}
              onRemoveLogo={removeLogo}
              onLogoSettingChange={updateLogoSetting}
              logoInputRef={logoInputRef}
            />
          </div>

          {/* Right Column - Settings */}
          <div className="space-y-6">
            <QRSettingsPanel
              qrSettings={qrSettings}
              appStoreSettings={appStoreSettings}
              usageLimitSettings={usageLimitSettings}
              enableTracking={enableTracking}
              hasUrls={hasUrls}
              onQRSettingChange={updateSetting}
              onAppStoreSettingChange={updateAppStoreSetting}
              onUsageLimitSettingChange={updateUsageLimitSetting}
              onTrackingChange={setEnableTracking}
              onResetSettings={resetSettings}
            />

            {enableTracking && trackingId && (
              <div className="p-4 border border-neutral-800 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setShowAnalytics(true)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    View Analytics
                  </Button>
                  <span className="text-xs text-muted-foreground">ID: {trackingId}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* QR Code Preview - Now below the input sections */}
        <div className="mt-8">
          {batchMode ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {batchQRs.map((qr) => (
                <div key={qr.id} className="border border-neutral-800 rounded-lg p-4">
                  <div
                    className="text-center mb-4 w-full p-6 rounded-lg"
                    style={{ backgroundColor: qrSettings.backgroundColor }}
                  >
                    <img
                      src={qr.dataUrl || "/placeholder.svg?height=200&width=200"}
                      alt={`QR Code for ${qr.url}`}
                      className="mx-auto max-w-full h-auto"
                      style={{ maxWidth: "200px", maxHeight: "200px" }}
                    />
                  </div>
                  {qr.title && (
                    <h4 className="text-sm font-medium mb-1 truncate" title={qr.title}>
                      {qr.title}
                    </h4>
                  )}
                  <p className="text-xs text-muted-foreground mb-2 truncate" title={qr.url}>
                    {qr.url}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 text-xs">
                      PNG
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-xs">
                      SVG
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center">
              <div
                className="inline-block p-12 rounded-lg mb-6"
                style={{ backgroundColor: qrSettings.backgroundColor }}
              >
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl || "/placeholder.svg?height=256&width=256"}
                    alt="Generated QR Code"
                    className="max-w-full h-auto"
                    style={{ maxWidth: `${qrSettings.size}px`, maxHeight: `${qrSettings.size}px` }}
                  />
                ) : (
                  <div
                    className="border-2 border-dashed border-neutral-400 rounded-lg flex items-center justify-center"
                    style={{ width: `${qrSettings.size}px`, height: `${qrSettings.size}px` }}
                  >
                    <span className="text-neutral-500 text-sm">Enter text to generate QR code</span>
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-4">
                <Button
                  disabled={!qrDataUrl}
                  className="flex items-center bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Download PNG <Download className="inline-block ml-2 w-4 h-4" />
                </Button>
                <Button
                  disabled={!qrDataUrl}
                  variant="outline"
                  className="flex items-center bg-background text-foreground border-neutral-800 hover:bg-neutral-900"
                >
                  Download SVG <Download className="inline-block ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>

      {/* User Guide */}
      <UserGuide isMobile={isMobile} />

      {/* Analytics Modal */}
      <AnalyticsModal open={showAnalytics} onOpenChange={setShowAnalytics} trackingId={trackingId} />
    </div>
  )
}