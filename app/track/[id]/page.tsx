"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Shield, Clock, Smartphone, AlertTriangle, MaximizeIcon as Limit } from "lucide-react"

interface TrackingData {
  originalUrl: string
  trackingId: string
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
  deviceDetected?: {
    type: string
    isIOS: boolean
    isAndroid: boolean
  }
}

export default function TrackingPage() {
  const params = useParams()
  const router = useRouter()
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [limitExceeded, setLimitExceeded] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    const trackingId = params.id as string
    if (trackingId) {
      fetchTrackingData(trackingId)
    }
  }, [params.id])

  useEffect(() => {
    if (trackingData && !limitExceeded && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (trackingData && !limitExceeded && countdown === 0) {
      handleRedirect(trackingData.originalUrl)
    }
  }, [trackingData, limitExceeded, countdown])

  const fetchTrackingData = async (trackingId: string) => {
    try {
      const response = await fetch(`/api/track/${trackingId}`)

      if (response.status === 429) {
        // Usage limit exceeded
        const errorData = await response.json()
        setLimitExceeded(true)
        setError(`This QR code has reached its usage limit of ${errorData.maxScans} scans.`)
        setLoading(false)
        return
      }

      if (!response.ok) {
        throw new Error("Tracking ID not found")
      }

      const data = await response.json()
      setTrackingData(data)
    } catch (error) {
      console.error("Error fetching tracking data:", error)
      setError("Invalid or expired tracking link")
    } finally {
      setLoading(false)
    }
  }

  const handleRedirect = (url: string) => {
    setRedirecting(true)
    window.location.href = url
  }

  const getDeviceIcon = () => {
    if (trackingData?.deviceDetected?.isIOS) return "📱 iOS"
    if (trackingData?.deviceDetected?.isAndroid) return "🤖 Android"
    return "💻 Desktop"
  }

  const getRedirectReason = () => {
    if (!trackingData?.appStore?.enabled) return null

    if (trackingData.deviceDetected?.isIOS) {
      return "Redirecting to iOS App Store"
    } else if (trackingData.deviceDetected?.isAndroid) {
      return "Redirecting to Google Play Store"
    } else {
      return "Redirecting to fallback website"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3">Loading...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (limitExceeded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <Limit className="w-5 h-5" />
              Usage Limit Exceeded
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <p className="text-sm text-orange-800 dark:text-orange-200">{error}</p>
            </div>

            <div className="text-center">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-orange-500" />
              <p className="text-sm text-muted-foreground mb-4">
                This QR code was configured with a usage limit to control access.
              </p>
            </div>

            <Button onClick={() => router.push("/")} className="w-full">
              Create Your Own QR Code
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Shield className="w-5 h-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => router.push("/")} className="w-full">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            {redirecting ? "Redirecting..." : "QR Code Scanned"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Device Detection */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">Device detected:</span>
            <Badge variant="secondary">{getDeviceIcon()}</Badge>
          </div>

          {/* App Store Smart Redirect */}
          {trackingData?.appStore?.enabled && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Smart App Store Link</span>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300">{getRedirectReason()}</p>
            </div>
          )}

          {/* Usage Limit Info */}
          {trackingData?.usageLimit?.enabled && (
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Limit className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800 dark:text-orange-200">Usage Tracking</span>
              </div>
              <p className="text-xs text-orange-700 dark:text-orange-300">
                Scan {trackingData.usageLimit.currentScans + 1} of {trackingData.usageLimit.maxScans} allowed
              </p>
            </div>
          )}

          {/* Destination URL */}
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">You will be redirected to:</p>
            <p className="font-mono text-sm break-all">{trackingData?.originalUrl}</p>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
            <Clock className="w-4 h-4" />
            {redirecting ? "Redirecting now..." : `Redirecting in ${countdown} seconds...`}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => handleRedirect(trackingData?.originalUrl || "")}
              className="flex-1"
              disabled={redirecting}
            >
              {redirecting ? "Redirecting..." : "Go Now"}
            </Button>
            <Button variant="outline" onClick={() => router.push("/")} disabled={redirecting}>
              Cancel
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            This scan has been recorded for analytics purposes
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
