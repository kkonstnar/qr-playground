import { type NextRequest, NextResponse } from "next/server"

// This would typically connect to your database
// For demo purposes, we'll use the same in-memory storage
const trackingData = new Map<
  string,
  {
    id: string
    originalUrl: string
    createdAt: string
    appStore?: {
      enabled: boolean
      iosUrl: string
      androidUrl: string
      fallbackUrl: string
    }
    usageLimit?: {
      enabled: boolean
      maxScans: number
      currentScans: number
    }
    scans: Array<{
      id: string
      timestamp: string
      userAgent: string
      ip: string
      location?: {
        country: string
        city: string
        latitude: number
        longitude: number
      }
      device: {
        type: string
        browser: string
        os: string
      }
    }>
  }
>()

function parseUserAgent(userAgent: string) {
  const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent)
  const isTablet = /iPad|Tablet/.test(userAgent)
  const isIOS = /iPhone|iPad|iPod/.test(userAgent)
  const isAndroid = /Android/.test(userAgent)

  let browser = "Unknown"
  if (userAgent.includes("Chrome")) browser = "Chrome"
  else if (userAgent.includes("Firefox")) browser = "Firefox"
  else if (userAgent.includes("Safari")) browser = "Safari"
  else if (userAgent.includes("Edge")) browser = "Edge"

  let os = "Unknown"
  if (userAgent.includes("Windows")) os = "Windows"
  else if (userAgent.includes("Mac")) os = "macOS"
  else if (userAgent.includes("Linux")) os = "Linux"
  else if (userAgent.includes("Android")) os = "Android"
  else if (userAgent.includes("iOS")) os = "iOS"

  return {
    type: isTablet ? "tablet" : isMobile ? "mobile" : "desktop",
    browser,
    os,
    isIOS,
    isAndroid,
  }
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const trackingId = params.id
    const userAgent = request.headers.get("user-agent") || ""

    const tracking = trackingData.get(trackingId)
    if (!tracking) {
      return NextResponse.json({ error: "Tracking ID not found" }, { status: 404 })
    }

    // Check usage limit before processing
    if (tracking.usageLimit?.enabled) {
      if (tracking.usageLimit.currentScans >= tracking.usageLimit.maxScans) {
        return NextResponse.json(
          {
            error: "Usage limit exceeded",
            limitExceeded: true,
            maxScans: tracking.usageLimit.maxScans,
            currentScans: tracking.usageLimit.currentScans,
          },
          { status: 429 },
        )
      }
    }

    // Parse user agent for device detection
    const device = parseUserAgent(userAgent)

    // Determine redirect URL based on app store settings and device
    let redirectUrl = tracking.originalUrl

    if (tracking.appStore?.enabled) {
      if (device.isIOS && tracking.appStore.iosUrl) {
        redirectUrl = tracking.appStore.iosUrl
      } else if (device.isAndroid && tracking.appStore.androidUrl) {
        redirectUrl = tracking.appStore.androidUrl
      } else if (tracking.appStore.fallbackUrl) {
        redirectUrl = tracking.appStore.fallbackUrl
      }
    }

    // Record the scan
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    const location = {
      country: "Unknown",
      city: "Unknown",
      latitude: 0,
      longitude: 0,
    }

    const scan = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      userAgent,
      ip,
      location,
      device: {
        type: device.type,
        browser: device.browser,
        os: device.os,
      },
    }

    tracking.scans.unshift(scan)

    // Increment usage count
    if (tracking.usageLimit?.enabled) {
      tracking.usageLimit.currentScans += 1
    }

    return NextResponse.json({
      originalUrl: redirectUrl,
      trackingId,
      appStore: tracking.appStore,
      usageLimit: tracking.usageLimit,
      deviceDetected: {
        type: device.type,
        isIOS: device.isIOS,
        isAndroid: device.isAndroid,
      },
    })
  } catch (error) {
    console.error("Error processing tracking:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
