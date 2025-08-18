"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  Moon,
  Sun,
  RotateCcw,
  Download,
  BarChart3,
  Upload,
  X,
  FileText,
  Eye,
  EyeOff,
  Smartphone,
  MaximizeIcon as Limit,
  LogIn,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "./ui/button"
import { Switch } from "./ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { UserGuide } from "./user-guide"
import { useMobile } from "../hooks/use-mobile"
import { AnalyticsModal } from "./analytics-modal"
import { useAuth } from "./auth-provider"
import { AuthModal } from "./auth-modal"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
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

export default function QRGenerator() {
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()
  const [qrText, setQrText] = useState("https://example.com")
  const [showAuthModal, setShowAuthModal] = useState(false)
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

  const parseCSV = (csvText: string): CSVRow[] => {
    const lines = csvText.trim().split("\n")
    if (lines.length === 0) return []

    // Check if first line contains headers
    const firstLine = lines[0].toLowerCase()
    const hasHeaders = firstLine.includes("url") || firstLine.includes("link") || firstLine.includes("title")

    let headers: string[] = []
    let dataLines: string[] = []

    if (hasHeaders) {
      headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""))
      dataLines = lines.slice(1)
    } else {
      // Assume first column is URL if no headers
      headers = ["url"]
      dataLines = lines
    }

    const urlIndex = headers.findIndex((h) => h.includes("url") || h.includes("link"))
    const titleIndex = headers.findIndex((h) => h.includes("title") || h.includes("name"))
    const descIndex = headers.findIndex((h) => h.includes("description") || h.includes("desc"))

    if (urlIndex === -1 && !hasHeaders) {
      // If no URL column found and no headers, assume first column is URL
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

        // Auto-enable batch mode
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

  const createTrackingUrl = async (
    originalUrl: string,
    appStore?: AppStoreSettings,
    usageLimit?: UsageLimitSettings,
  ): Promise<string> => {
    // Check if user is authenticated when tracking is enabled
    if (!user) {
      console.warn("User not authenticated for tracking")
      return originalUrl
    }

    try {
      const response = await fetch("/api/track", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.access_token}`,
        },
        body: JSON.stringify({
          originalUrl,
          userId: user.id,
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

  const calculateLogoPosition = (canvasWidth: number, canvasHeight: number, logoSize: number) => {
    const padding = 10

    switch (logoSettings.position) {
      case "center":
        return {
          x: (canvasWidth - logoSize) / 2,
          y: (canvasHeight - logoSize) / 2,
        }
      case "top-left":
        return {
          x: padding,
          y: padding,
        }
      case "top-right":
        return {
          x: canvasWidth - logoSize - padding,
          y: padding,
        }
      case "bottom-left":
        return {
          x: padding,
          y: canvasHeight - logoSize - padding,
        }
      case "bottom-right":
        return {
          x: canvasWidth - logoSize - padding,
          y: canvasHeight - logoSize - padding,
        }
      case "custom":
        return {
          x: (canvasWidth * logoSettings.customX) / 100 - logoSize / 2,
          y: (canvasHeight * logoSettings.customY) / 100 - logoSize / 2,
        }
      default:
        return {
          x: (canvasWidth - logoSize) / 2,
          y: (canvasHeight - logoSize) / 2,
        }
    }
  }

  const generateQRWithLogo = async (text: string, canvas: HTMLCanvasElement): Promise<string> => {
    const options = {
      errorCorrectionLevel: qrSettings.errorCorrectionLevel,
      margin: qrSettings.margin,
      color: {
        dark: qrSettings.foregroundColor,
        light: qrSettings.backgroundColor,
      },
      width: qrSettings.size,
    }

    // Generate QR code on canvas
    await QRCode.toCanvas(canvas, text, options)

    // If no logo, return the canvas as data URL
    if (!logoDataUrl) {
      return canvas.toDataURL("image/png")
    }

    // Add logo to the QR code
    const ctx = canvas.getContext("2d")
    if (!ctx) return canvas.toDataURL("image/png")

    return new Promise((resolve) => {
      const logoImg = new Image()
      logoImg.crossOrigin = "anonymous"
      logoImg.onload = () => {
        const logoSize = Math.min((qrSettings.size * logoSettings.size) / 100, 120)
        const position = calculateLogoPosition(canvas.width, canvas.height, logoSize)

        // Ensure logo stays within canvas bounds
        const x = Math.max(0, Math.min(position.x, canvas.width - logoSize))
        const y = Math.max(0, Math.min(position.y, canvas.height - logoSize))

        // Draw background circle/square for logo (only for center position)
        if (logoSettings.position === "center") {
          ctx.fillStyle = qrSettings.backgroundColor
          ctx.beginPath()
          ctx.arc(x + logoSize / 2, y + logoSize / 2, logoSize / 2 + 4, 0, 2 * Math.PI)
          ctx.fill()
        } else {
          // For corner positions, draw a rounded rectangle background
          const radius = 4
          ctx.fillStyle = qrSettings.backgroundColor
          ctx.beginPath()
          ctx.roundRect(x - 2, y - 2, logoSize + 4, logoSize + 4, radius)
          ctx.fill()
        }

        // Draw logo
        ctx.drawImage(logoImg, x, y, logoSize, logoSize)
        resolve(canvas.toDataURL("image/png"))
      }
      logoImg.src = logoDataUrl
    })
  }

  // Generate single QR code
  useEffect(() => {
    if (batchMode) return

    const generateQR = async () => {
      if (!qrText.trim()) {
        setQrDataUrl("")
        return
      }

      try {
        let urlToEncode = qrText

        // Create tracking URL if tracking is enabled and the text looks like a URL
        if (enableTracking && (qrText.startsWith("http://") || qrText.startsWith("https://"))) {
          urlToEncode = await createTrackingUrl(qrText, appStoreSettings, usageLimitSettings)
        }

        if (canvasRef.current) {
          const dataUrl = await generateQRWithLogo(urlToEncode, canvasRef.current)
          setQrDataUrl(dataUrl)
        }
      } catch (error) {
        console.error("Error generating QR code:", error)
        setQrDataUrl("")
      }
    }

    generateQR()
  }, [qrText, qrSettings, logoSettings, enableTracking, logoDataUrl, batchMode, appStoreSettings, usageLimitSettings])

  // Generate batch QR codes
  useEffect(() => {
    if (!batchMode) return

    const generateBatchQRs = async () => {
      const urls = batchText.split("\n").filter((url) => url.trim())
      if (urls.length === 0) {
        setBatchQRs([])
        return
      }

      const generatedQRs: GeneratedQR[] = []

      for (let i = 0; i < urls.length; i++) {
        const url = urls[i].trim()
        if (!url) continue

        try {
          let urlToEncode = url

          // Create tracking URL if tracking is enabled and the text looks like a URL
          if (enableTracking && (url.startsWith("http://") || url.startsWith("https://"))) {
            urlToEncode = await createTrackingUrl(url, appStoreSettings, usageLimitSettings)
          }

          // Create a temporary canvas for this QR code
          const tempCanvas = document.createElement("canvas")
          const dataUrl = await generateQRWithLogo(urlToEncode, tempCanvas)

          // Find matching CSV data for additional info
          const csvRow = csvData.find((row) => row.url === url)

          generatedQRs.push({
            id: `qr-${i}`,
            url,
            title: csvRow?.title,
            description: csvRow?.description,
            dataUrl,
            trackingId: enableTracking ? trackingId : undefined,
            appStore: appStoreSettings.enabled ? appStoreSettings : undefined,
            usageLimit: usageLimitSettings.enabled ? usageLimitSettings : undefined,
          })
        } catch (error) {
          console.error(`Error generating QR code for ${url}:`, error)
        }
      }

      setBatchQRs(generatedQRs)
    }

    generateBatchQRs()
  }, [
    batchText,
    qrSettings,
    logoSettings,
    enableTracking,
    logoDataUrl,
    batchMode,
    csvData,
    appStoreSettings,
    usageLimitSettings,
  ])

  const downloadQR = async (format: "png" | "svg", qrData?: GeneratedQR) => {
    if (batchMode && !qrData) {
      // Download all QR codes as a zip would be ideal, but for now download individually
      for (const qr of batchQRs) {
        await downloadSingleQR(format, qr.url, qr.dataUrl, qr.title)
        // Add small delay between downloads
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
      return
    }

    const textToUse = qrData?.url || qrText
    const dataUrlToUse = qrData?.dataUrl || qrDataUrl
    const titleToUse = qrData?.title

    if (!textToUse.trim()) return

    await downloadSingleQR(format, textToUse, dataUrlToUse, titleToUse)
  }

  const downloadSingleQR = async (format: "png" | "svg", text: string, existingDataUrl?: string, title?: string) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5)
    const safeName = (title || text).replace(/[^a-zA-Z0-9]/g, "-").substring(0, 20)
    const filename = `qr-code-${safeName}-${timestamp}.${format}`

    try {
      let urlToEncode = text

      // Create tracking URL if tracking is enabled and the text looks like a URL
      if (enableTracking && (text.startsWith("http://") || text.startsWith("https://"))) {
        urlToEncode = await createTrackingUrl(text, appStoreSettings, usageLimitSettings)
      }

      if (format === "png") {
        if (existingDataUrl) {
          const link = document.createElement("a")
          link.download = filename
          link.href = existingDataUrl
          link.click()
        } else {
          // Generate high-res version for download
          const tempCanvas = document.createElement("canvas")
          const highResSettings = { ...qrSettings, size: qrSettings.size * 2 }

          const options = {
            errorCorrectionLevel: highResSettings.errorCorrectionLevel,
            margin: highResSettings.margin,
            color: {
              dark: highResSettings.foregroundColor,
              light: highResSettings.backgroundColor,
            },
            width: highResSettings.size,
          }

          await QRCode.toCanvas(tempCanvas, urlToEncode, options)

          // Add logo if present
          if (logoDataUrl) {
            const ctx = tempCanvas.getContext("2d")
            if (ctx) {
              const logoImg = new Image()
              logoImg.crossOrigin = "anonymous"
              logoImg.onload = () => {
                const logoSize = Math.min((highResSettings.size * logoSettings.size) / 100, 240)
                const position = calculateLogoPosition(tempCanvas.width, tempCanvas.height, logoSize)

                const x = Math.max(0, Math.min(position.x, tempCanvas.width - logoSize))
                const y = Math.max(0, Math.min(position.y, tempCanvas.height - logoSize))

                if (logoSettings.position === "center") {
                  ctx.fillStyle = highResSettings.backgroundColor
                  ctx.beginPath()
                  ctx.arc(x + logoSize / 2, y + logoSize / 2, logoSize / 2 + 8, 0, 2 * Math.PI)
                  ctx.fill()
                } else {
                  const radius = 8
                  ctx.fillStyle = highResSettings.backgroundColor
                  ctx.beginPath()
                  ctx.roundRect(x - 4, y - 4, logoSize + 8, logoSize + 8, radius)
                  ctx.fill()
                }

                ctx.drawImage(logoImg, x, y, logoSize, logoSize)

                const link = document.createElement("a")
                link.download = filename
                link.href = tempCanvas.toDataURL("image/png")
                link.click()
              }
              logoImg.src = logoDataUrl
              return
            }
          }

          const link = document.createElement("a")
          link.download = filename
          link.href = tempCanvas.toDataURL("image/png")
          link.click()
        }
      } else if (format === "svg") {
        const options = {
          errorCorrectionLevel: qrSettings.errorCorrectionLevel,
          type: "svg" as const,
          margin: qrSettings.margin,
          color: {
            dark: qrSettings.foregroundColor,
            light: qrSettings.backgroundColor,
          },
          width: qrSettings.size,
        }

        const svgString = await QRCode.toString(urlToEncode, options)
        const blob = new Blob([svgString], { type: "image/svg+xml" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.download = filename
        link.href = url
        link.click()
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("Error downloading QR code:", error)
    }
  }

  const currentUrls = batchMode ? batchText.split("\n").filter((url) => url.trim()) : [qrText]
  const hasUrls = currentUrls.some((url) => url.startsWith("http://") || url.startsWith("https://"))

  return (
    <div className="w-full bg-background text-foreground p-4">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-xl font-medium hover:text-primary transition-colors cursor-pointer">
            QR Playground
          </Link>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4" />
              <Switch checked={theme === "dark"} onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")} />
              <Moon className="h-4 w-4" />
            </div>
            {!user && (
              <Button
                onClick={() => setShowAuthModal(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            )}
          </div>
        </div>

        {/* Above QR Preview - Grid Layout */}
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Text Input - Spans 2 columns */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium mb-2">{batchMode ? "URLs (one per line)" : "Text or URL"}</label>
            {batchMode ? (
              <textarea
                value={batchText}
                onChange={(e) => setBatchText(e.target.value)}
                placeholder="Enter URLs, one per line:&#10;https://example.com&#10;https://google.com&#10;https://github.com&#10;&#10;Or upload a CSV file below for bulk import"
                className="w-full bg-background border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-h-[120px] resize-y font-mono"
              />
            ) : (
              <textarea
                value={qrText}
                onChange={(e) => setQrText(e.target.value)}
                placeholder="Enter text, URL, or any data to encode..."
                className="w-full bg-background border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-h-[80px] resize-y"
              />
            )}
          </div>

          {/* Logo Upload */}
          <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="text-sm font-medium">Logo</label>
                <p className="text-xs text-muted-foreground">Add a logo to your QR codes</p>
              </div>
              <div className="flex items-center gap-2">
                <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
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
                  <Button onClick={removeLogo} variant="ghost" size="sm">
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
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Position</label>
                    <Select
                      value={logoSettings.position}
                      onValueChange={(value: LogoSettings["position"]) => updateLogoSetting("position", value)}
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
                      onChange={(e) => updateLogoSetting("size", Number.parseInt(e.target.value))}
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
                        onChange={(e) => updateLogoSetting("customX", Number.parseInt(e.target.value))}
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
                        onChange={(e) => updateLogoSetting("customY", Number.parseInt(e.target.value))}
                        className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tracking Toggle */}
        {hasUrls && (
          <div className="mb-6 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="text-sm font-medium">Enable Scan Tracking</label>
                <p className="text-xs text-muted-foreground">
                  Track device info and location when QR code is scanned
                  {!user && " (requires account)"}
                </p>
              </div>
              <Switch 
                checked={enableTracking && !!user} 
                onCheckedChange={(checked) => {
                  if (checked && !user) {
                    setShowAuthModal(true)
                  } else {
                    setEnableTracking(checked)
                  }
                }} 
              />
            </div>
            {!user && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Sign in to enable QR code tracking and view analytics
                </p>
                <Button
                  onClick={() => setShowAuthModal(true)}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  Sign In
                </Button>
              </div>
            )}
            {enableTracking && trackingId && user && (
              <div className="flex items-center gap-2 mt-3">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Link href="/track">
                    <BarChart3 className="w-4 h-4" />
                    View Analytics
                  </Link>
                </Button>
                <span className="text-xs text-muted-foreground">Tracking ID: {trackingId}</span>
              </div>
            )}
          </div>
        )}

        {/* QR Code Preview */}
        <div className="mb-8">
          {batchMode ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {batchQRs.map((qr) => (
                <div key={qr.id} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
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
                  {qr.description && (
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2" title={qr.description}>
                      {qr.description}
                    </p>
                  )}

                  {/* QR Features Badges */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {qr.appStore?.enabled && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-xs rounded">
                        <Smartphone className="w-3 h-3" />
                        App Store
                      </span>
                    )}
                    {qr.usageLimit?.enabled && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 text-xs rounded">
                        <Limit className="w-3 h-3" />
                        {qr.usageLimit.maxScans} scans
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => downloadQR("png", qr)} size="sm" className="flex-1 text-xs">
                      PNG
                    </Button>
                    <Button
                      onClick={() => downloadQR("svg", qr)}
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                    >
                      SVG
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="text-center mb-8 w-full p-12 rounded-lg"
              style={{ backgroundColor: qrSettings.backgroundColor }}
            >
              {qrDataUrl ? (
                <img
                  src={qrDataUrl || "/placeholder.svg?height=256&width=256"}
                  alt="Generated QR Code"
                  className="mx-auto max-w-full h-auto"
                  style={{ maxWidth: `${qrSettings.size}px`, maxHeight: `${qrSettings.size}px` }}
                />
              ) : (
                <div
                  className="mx-auto border-2 border-dashed border-neutral-400 rounded-lg flex items-center justify-center"
                  style={{ width: `${qrSettings.size}px`, height: `${qrSettings.size}px` }}
                >
                  <span className="text-neutral-500 text-sm">Enter text to generate QR code</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between mb-8">
          {/* Error Correction Level */}
          <div className="w-48">
            <label className="block text-xs font-medium mb-1">Error Correction</label>
            <Select
              value={qrSettings.errorCorrectionLevel}
              onValueChange={(value: "L" | "M" | "Q" | "H") => updateSetting("errorCorrectionLevel", value)}
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

          {/* Color Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={qrSettings.backgroundColor}
                onChange={(e) => updateSetting("backgroundColor", e.target.value)}
                className="w-8 h-8 rounded border border-neutral-800 cursor-pointer"
              />
              <input
                type="text"
                value={qrSettings.backgroundColor}
                onChange={(e) => updateSetting("backgroundColor", e.target.value)}
                className="w-20 bg-background border border-neutral-800 rounded px-2 py-1 text-xs font-mono"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={qrSettings.foregroundColor}
                onChange={(e) => updateSetting("foregroundColor", e.target.value)}
                className="w-8 h-8 rounded border border-neutral-800 cursor-pointer"
              />
              <input
                type="text"
                value={qrSettings.foregroundColor}
                onChange={(e) => updateSetting("foregroundColor", e.target.value)}
                className="w-20 bg-background border border-neutral-800 rounded px-2 py-1 text-xs font-mono"
              />
            </div>
          </div>

          {/* Reset Button */}
          <Button onClick={resetSettings} variant="ghost" size="sm" title="Reset settings">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-xs font-medium mb-2">Size: {qrSettings.size}px</label>
            <input
              type="range"
              min={128}
              max={512}
              step={32}
              value={qrSettings.size}
              onChange={(e) => updateSetting("size", Number.parseInt(e.target.value))}
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
              onChange={(e) => updateSetting("margin", Number.parseInt(e.target.value))}
              className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>

        {/* Download Buttons */}
        {!batchMode && (
          <div className="flex flex-row justify-center items-center gap-4 mb-8">
            <Button
              onClick={() => downloadQR("png")}
              disabled={!qrDataUrl}
              className="flex items-center bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Download PNG <Download className="inline-block ml-2 w-4 h-4" />
            </Button>
            <Button
              onClick={() => downloadQR("svg")}
              disabled={!qrDataUrl}
              variant="outline"
              className="flex items-center bg-background text-foreground border-neutral-800 hover:bg-neutral-900"
            >
              Download SVG <Download className="inline-block ml-2 w-4 h-4" />
            </Button>
          </div>
        )}

        {batchMode && batchQRs.length > 0 && (
          <div className="flex flex-row justify-center items-center gap-4 mb-8">
            <Button
              onClick={() => downloadQR("png")}
              className="flex items-center bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Download All PNG <Download className="inline-block ml-2 w-4 h-4" />
            </Button>
            <Button
              onClick={() => downloadQR("svg")}
              variant="outline"
              className="flex items-center bg-background text-foreground border-neutral-800 hover:bg-neutral-900"
            >
              Download All SVG <Download className="inline-block ml-2 w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Below QR Preview Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* Mode Toggle */}
          <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Batch Mode</label>
                <p className="text-xs text-muted-foreground">Generate multiple QR codes at once</p>
              </div>
              <Switch checked={batchMode} onCheckedChange={setBatchMode} />
            </div>
          </div>

          {/* CSV Import */}
          {batchMode && (
            <div className="md:col-span-2 lg:col-span-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <label className="text-sm font-medium">CSV Import</label>
                  <p className="text-xs text-muted-foreground">Upload a CSV file with URLs for bulk generation</p>
                </div>
                <div className="flex items-center gap-2">
                  <input ref={csvInputRef} type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
                  <Button
                    onClick={() => csvInputRef.current?.click()}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Upload CSV
                  </Button>
                  {csvData.length > 0 && (
                    <>
                      <Button
                        onClick={() => setShowCsvPreview(!showCsvPreview)}
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        {showCsvPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {showCsvPreview ? "Hide" : "Preview"}
                      </Button>
                      <Button onClick={clearCsvData} variant="ghost" size="sm">
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {csvError && (
                <div className="mb-3 p-2 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-400">
                  {csvError}
                </div>
              )}

              {csvData.length > 0 && (
                <div className="mb-3 p-2 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-800 rounded text-sm text-green-700 dark:text-green-400">
                  Successfully imported {csvData.length} URLs from CSV
                </div>
              )}

              {/* CSV Preview */}
              {showCsvPreview && csvData.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">CSV Preview ({csvData.length} rows)</h4>
                    <Button onClick={applyCsvData} size="sm" className="flex items-center gap-2">
                      Apply to Batch
                    </Button>
                  </div>
                  <div className="max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>URL</TableHead>
                          {csvData.some((row) => row.title) && <TableHead>Title</TableHead>}
                          {csvData.some((row) => row.description) && <TableHead>Description</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {csvData.slice(0, 10).map((row, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-mono text-xs">{index + 1}</TableCell>
                            <TableCell className="font-mono text-xs max-w-xs truncate" title={row.url}>
                              {row.url}
                            </TableCell>
                            {csvData.some((r) => r.title) && (
                              <TableCell className="text-xs max-w-xs truncate" title={row.title}>
                                {row.title || "-"}
                              </TableCell>
                            )}
                            {csvData.some((r) => r.description) && (
                              <TableCell className="text-xs max-w-xs truncate" title={row.description}>
                                {r.description || "-"}
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                        {csvData.length > 10 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-xs text-muted-foreground py-2">
                              ... and {csvData.length - 10} more rows
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* App Store Links - Full Width */}
          {hasUrls && (
            <div className="md:col-span-2 lg:col-span-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <label className="text-sm font-medium">App Store Links</label>
                  <p className="text-xs text-muted-foreground">
                    Smart redirect to iOS App Store or Google Play Store based on device
                  </p>
                </div>
                <Switch
                  checked={appStoreSettings.enabled}
                  onCheckedChange={(enabled) => updateAppStoreSetting("enabled", enabled)}
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
                        onChange={(e) => updateAppStoreSetting("iosUrl", e.target.value)}
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
                        onChange={(e) => updateAppStoreSetting("androidUrl", e.target.value)}
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
                      onChange={(e) => updateAppStoreSetting("fallbackUrl", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Usage Limits */}
          {hasUrls && (
            <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <label className="text-sm font-medium">Usage Limits</label>
                  <p className="text-xs text-muted-foreground">
                    Restrict the number of times this QR code can be scanned
                  </p>
                </div>
                <Switch
                  checked={usageLimitSettings.enabled}
                  onCheckedChange={(enabled) => updateUsageLimitSetting("enabled", enabled)}
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
                      onChange={(e) => updateUsageLimitSetting("maxScans", Number.parseInt(e.target.value))}
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
        </div>

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>

      {/* User Guide */}
      <UserGuide isMobile={isMobile} />

      {/* Analytics Modal */}
      <AnalyticsModal open={showAnalytics} onOpenChange={setShowAnalytics} trackingId={trackingId} />
      
      {/* Auth Modal */}
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </div>
  )
}
