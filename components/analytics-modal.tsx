"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Skeleton } from "./ui/skeleton"
import { Progress } from "./ui/progress"
import { MapPin, Smartphone, Globe, Clock, TrendingUp, Users, MaximizeIcon as Limit, RefreshCw } from "lucide-react"
import { Button } from "./ui/button"

interface AnalyticsData {
  trackingId: string
  originalUrl: string
  createdAt: string
  totalScans: number
  uniqueVisitors: number
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
  statistics: {
    devices: Record<string, number>
    browsers: Record<string, number>
    operatingSystems: Record<string, number>
    locations: Record<string, number>
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

interface AnalyticsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trackingId: string
}

export function AnalyticsModal({ open, onOpenChange, trackingId }: AnalyticsModalProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && trackingId) {
      fetchAnalytics()
    }
  }, [open, trackingId])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/analytics?trackingId=${trackingId}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case "mobile":
        return <Smartphone className="w-4 h-4" />
      case "tablet":
        return <Smartphone className="w-4 h-4" />
      case "desktop":
        return <Globe className="w-4 h-4" />
      default:
        return <Globe className="w-4 h-4" />
    }
  }

  const getUsageProgress = () => {
    if (!analytics?.usageLimit?.enabled) return 0
    return (analytics.usageLimit.currentScans / analytics.usageLimit.maxScans) * 100
  }

  const getRemainingScans = () => {
    if (!analytics?.usageLimit?.enabled) return null
    return analytics.usageLimit.maxScans - analytics.usageLimit.currentScans
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              QR Code Analytics
            </DialogTitle>
            <Button onClick={fetchAnalytics} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-20" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 flex-1" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : analytics ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Total Scans
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalScans}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Unique Visitors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.uniqueVisitors}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Latest Scan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    {analytics.scans.length > 0 ? formatDate(analytics.scans[0].timestamp) : "No scans yet"}
                  </div>
                </CardContent>
              </Card>

              {analytics.usageLimit?.enabled && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Limit className="w-4 h-4" />
                      Usage Limit
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{analytics.usageLimit.currentScans}</span>
                        <span>{analytics.usageLimit.maxScans}</span>
                      </div>
                      <Progress value={getUsageProgress()} className="h-2" />
                      <div className="text-xs text-muted-foreground">{getRemainingScans()} scans remaining</div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* App Store & Usage Limit Info */}
            {(analytics.appStore?.enabled || analytics.usageLimit?.enabled) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analytics.appStore?.enabled && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        App Store Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-xs">
                        <span className="font-medium">iOS:</span> {analytics.appStore.iosUrl || "Not set"}
                      </div>
                      <div className="text-xs">
                        <span className="font-medium">Android:</span> {analytics.appStore.androidUrl || "Not set"}
                      </div>
                      <div className="text-xs">
                        <span className="font-medium">Fallback:</span> {analytics.appStore.fallbackUrl || "Not set"}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {analytics.usageLimit?.enabled && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Limit className="w-4 h-4" />
                        Usage Limit Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-xs">
                        <span className="font-medium">Maximum Scans:</span> {analytics.usageLimit.maxScans}
                      </div>
                      <div className="text-xs">
                        <span className="font-medium">Current Scans:</span> {analytics.usageLimit.currentScans}
                      </div>
                      <div className="text-xs">
                        <span className="font-medium">Status:</span>{" "}
                        <Badge variant={getRemainingScans()! > 0 ? "default" : "destructive"}>
                          {getRemainingScans()! > 0 ? "Active" : "Limit Reached"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Device Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(analytics.statistics.devices).map(([device, count]) => (
                      <div key={device} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(device)}
                          <span className="text-sm capitalize">{device}</span>
                        </div>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Browsers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(analytics.statistics.browsers).map(([browser, count]) => (
                      <div key={browser} className="flex items-center justify-between">
                        <span className="text-sm">{browser}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Locations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(analytics.statistics.locations).map(([location, count]) => (
                      <div key={location} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          <span className="text-sm">{location}</span>
                        </div>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Scans */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Scans</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.scans.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No scans recorded yet</p>
                    <p className="text-sm">Share your QR code to start tracking scans</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {analytics.scans.slice(0, 10).map((scan) => (
                      <div
                        key={scan.id}
                        className="flex items-center justify-between p-3 border border-neutral-800 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {getDeviceIcon(scan.device.type)}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                {scan.device.browser} on {scan.device.os}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {scan.device.type}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(scan.timestamp)}
                              {scan.location && (
                                <>
                                  <MapPin className="w-3 h-3 ml-2" />
                                  {scan.location.city}, {scan.location.country}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">{scan.ip}</div>
                      </div>
                    ))}
                    {analytics.scans.length > 10 && (
                      <div className="text-center text-sm text-muted-foreground">
                        ... and {analytics.scans.length - 10} more scans
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No analytics data available</p>
            <p className="text-sm">Enable tracking and share your QR code to see analytics</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
