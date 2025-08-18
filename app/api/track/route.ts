import { type NextRequest, NextResponse } from "next/server"

// In-memory storage for demo purposes
// In production, use a proper database
const trackingData = new Map<
  string,
  {
    id: string
    originalUrl: string
    createdAt: string
    userId?: string
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

function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

function parseUserAgent(userAgent: string) {
  const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent)
  const isTablet = /iPad|Tablet/.test(userAgent)

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
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { originalUrl, userId, appStore, usageLimit } = await request.json()

    if (!originalUrl) {
      return NextResponse.json({ error: "Original URL is required" }, { status: 400 })
    }

    const trackingId = generateId()
    const trackingUrl = `${request.nextUrl.origin}/track/${trackingId}`

    trackingData.set(trackingId, {
      id: trackingId,
      originalUrl,
      createdAt: new Date().toISOString(),
      userId,
      appStore,
      usageLimit: usageLimit ? { ...usageLimit, currentScans: 0 } : undefined,
      scans: [],
    })

    return NextResponse.json({
      trackingId,
      trackingUrl,
      originalUrl,
    })
  } catch (error) {
    console.error("Error creating tracking URL:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { trackingId, userAgent, ip } = await request.json()

    const tracking = trackingData.get(trackingId)
    if (!tracking) {
      return NextResponse.json({ error: "Tracking ID not found" }, { status: 404 })
    }

    // Check usage limit
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

    const device = parseUserAgent(userAgent || "")

    // In a real app, you might use a geolocation service here
    const location = {
      country: "Unknown",
      city: "Unknown",
      latitude: 0,
      longitude: 0,
    }

    const scan = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      userAgent: userAgent || "",
      ip: ip || "Unknown",
      location,
      device,
    }

    tracking.scans.unshift(scan) // Add to beginning for latest first

    // Increment usage count
    if (tracking.usageLimit?.enabled) {
      tracking.usageLimit.currentScans += 1
    }

    return NextResponse.json({
      success: true,
      originalUrl: tracking.originalUrl,
      appStore: tracking.appStore,
      usageLimit: tracking.usageLimit,
    })
  } catch (error) {
    console.error("Error recording scan:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
