import { type NextRequest, NextResponse } from "next/server"

// In-memory storage for demo purposes
// In production, use a proper database
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const trackingId = searchParams.get("trackingId")

    if (!trackingId) {
      return NextResponse.json({ error: "Tracking ID is required" }, { status: 400 })
    }

    const tracking = trackingData.get(trackingId)
    if (!tracking) {
      return NextResponse.json({ error: "Tracking ID not found" }, { status: 404 })
    }

    // Calculate unique visitors based on IP addresses
    const uniqueIPs = new Set(tracking.scans.map((scan) => scan.ip))

    // Get device type statistics
    const deviceStats = tracking.scans.reduce(
      (acc, scan) => {
        acc[scan.device.type] = (acc[scan.device.type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Get browser statistics
    const browserStats = tracking.scans.reduce(
      (acc, scan) => {
        acc[scan.device.browser] = (acc[scan.device.browser] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Get OS statistics
    const osStats = tracking.scans.reduce(
      (acc, scan) => {
        acc[scan.device.os] = (acc[scan.device.os] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Get location statistics
    const locationStats = tracking.scans.reduce(
      (acc, scan) => {
        const location = scan.location?.country || "Unknown"
        acc[location] = (acc[location] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const analytics = {
      trackingId,
      originalUrl: tracking.originalUrl,
      createdAt: tracking.createdAt,
      totalScans: tracking.scans.length,
      uniqueVisitors: uniqueIPs.size,
      appStore: tracking.appStore,
      usageLimit: tracking.usageLimit,
      statistics: {
        devices: deviceStats,
        browsers: browserStats,
        operatingSystems: osStats,
        locations: locationStats,
      },
      recentScans: tracking.scans.slice(0, 20), // Last 20 scans
      scans: tracking.scans, // All scans for detailed view
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
