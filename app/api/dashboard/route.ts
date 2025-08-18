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

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    
    // Filter tracking data by user ID, or return all if no userId provided (for admin dashboard)
    const filteredTrackingData = userId 
      ? Array.from(trackingData.values()).filter(tracking => tracking.userId === userId)
      : Array.from(trackingData.values())
    
    const qrCodes = filteredTrackingData.map((tracking) => {
      // Calculate unique visitors based on IP addresses
      const uniqueIPs = new Set(tracking.scans.map((scan) => scan.ip))
      
      // Get location statistics
      const locationStats = tracking.scans.reduce(
        (acc, scan) => {
          const location = scan.location?.country || "Unknown"
          acc[location] = (acc[location] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      // Get top location
      const topLocation = Object.entries(locationStats)
        .sort(([, a], [, b]) => b - a)[0]
      const topLocationName = topLocation ? topLocation[0] : "No scans"
      const topLocationCount = topLocation ? topLocation[1] : 0

      // Get recent scan locations (last 5 unique locations)
      const recentLocations = tracking.scans
        .map(scan => scan.location?.country || "Unknown")
        .filter((country, index, arr) => arr.indexOf(country) === index)
        .slice(0, 3)
      
      // Determine status
      let status = "Active"
      if (tracking.usageLimit?.enabled) {
        if (tracking.usageLimit.currentScans >= tracking.usageLimit.maxScans) {
          status = "Exceeded"
        } else if (tracking.usageLimit.currentScans / tracking.usageLimit.maxScans > 0.8) {
          status = "Limited"
        }
      }

      // Get last scan timestamp
      const lastScanAt = tracking.scans.length > 0 ? tracking.scans[0].timestamp : undefined

      return {
        id: tracking.id,
        trackingId: tracking.id,
        originalUrl: tracking.originalUrl,
        trackingUrl: `${request.nextUrl.origin}/track/${tracking.id}`,
        createdAt: tracking.createdAt,
        appStore: tracking.appStore,
        usageLimit: tracking.usageLimit,
        totalScans: tracking.scans.length,
        uniqueVisitors: uniqueIPs.size,
        lastScanAt,
        status,
        topLocation: topLocationName,
        topLocationCount,
        recentLocations,
        locationStats,
      }
    })

    // Sort by creation date (newest first)
    qrCodes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json(qrCodes)
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}