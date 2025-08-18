"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"
import {
  BarChart3,
  QrCode,
  Download,
  ExternalLink,
  Smartphone,
  Globe,
  Clock,
  Users,
  TrendingUp,
  Plus,
  RefreshCw,
  MapPin,
  Activity,
} from "lucide-react"
import { AnalyticsModal } from "./analytics-modal"
import Link from "next/link"

interface QRCodeData {
  id: string
  trackingId: string
  originalUrl: string
  trackingUrl: string
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
  totalScans: number
  uniqueVisitors: number
  lastScanAt?: string
  status: "Active" | "Limited" | "Exceeded"
  topLocation: string
  topLocationCount: number
  recentLocations: string[]
  locationStats: Record<string, number>
}

export function QRDashboardEnhanced() {
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTrackingId, setSelectedTrackingId] = useState<string>("")
  const [showAnalytics, setShowAnalytics] = useState(false)

  const fetchQRCodes = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/dashboard")
      if (response.ok) {
        const data = await response.json()
        setQrCodes(data)
      } else {
        console.error("Failed to fetch QR codes")
      }
    } catch (error) {
      console.error("Error fetching QR codes:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQRCodes()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Active</Badge>
      case "Limited":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">Limited</Badge>
      case "Exceeded":
        return <Badge variant="destructive">Exceeded</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getUsageText = (qr: QRCodeData) => {
    if (qr.usageLimit?.enabled) {
      return `${qr.usageLimit.currentScans}/${qr.usageLimit.maxScans}`
    }
    return "Unlimited"
  }

  const totalScans = qrCodes.reduce((sum, qr) => sum + qr.totalScans, 0)
  const totalUniqueVisitors = qrCodes.reduce((sum, qr) => sum + qr.uniqueVisitors, 0)
  const activeQRs = qrCodes.filter(qr => qr.status === "Active").length

  // Get top locations across all QR codes
  const allLocationStats = qrCodes.reduce((acc, qr) => {
    Object.entries(qr.locationStats).forEach(([country, count]) => {
      acc[country] = (acc[country] || 0) + count
    })
    return acc
  }, {} as Record<string, number>)

  const topLocations = Object.entries(allLocationStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  const handleViewAnalytics = (trackingId: string) => {
    setSelectedTrackingId(trackingId)
    setShowAnalytics(true)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between py-6">
          <div>
            <h1 className="text-3xl font-bold">QR Code Dashboard</h1>
            <p className="text-muted-foreground">Track performance and locations of your QR codes</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={fetchQRCodes} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button size="sm" asChild>
              <Link href="/">
                <Plus className="w-4 h-4 mr-2" />
                Create QR Code
              </Link>
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <QrCode className="w-4 h-4" />
                Total QR Codes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{qrCodes.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Total Scans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{totalScans.toLocaleString()}</div>
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
              <div className="text-3xl font-bold text-purple-600">{totalUniqueVisitors.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Top Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-orange-600">
                {topLocations[0] ? topLocations[0][0] : "No data"}
              </div>
              <div className="text-xs text-muted-foreground">
                {topLocations[0] ? `${topLocations[0][1]} scans` : ""}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Countries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-teal-600">
                {Object.keys(allLocationStats).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Locations Card */}
        {topLocations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Top Scanning Locations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {topLocations.map(([country, count], index) => (
                  <div key={country} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                      }`} />
                      <span className="font-medium">{country}</span>
                    </div>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* QR Codes Table */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              QR Code Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 500px)' }}>
              <Table className="[&_td]:border-border [&_th]:border-border border-separate border-spacing-0 [&_tfoot_td]:border-t [&_th]:border-b [&_tr]:border-none [&_tr:not(:last-child)_td]:border-b">
                <TableHeader className="bg-background/90 sticky top-0 z-10 backdrop-blur-xs">
                  <TableRow className="hover:bg-transparent">
                    <TableHead>URL</TableHead>
                    <TableHead className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Activity className="w-4 h-4" />
                        Scans
                      </div>
                    </TableHead>
                    <TableHead className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="w-4 h-4" />
                        Visitors
                      </div>
                    </TableHead>
                    <TableHead className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <MapPin className="w-4 h-4" />
                        Top Location
                      </div>
                    </TableHead>
                    <TableHead>Recent Locations</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Loading QR codes...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : qrCodes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="text-muted-foreground">
                          <QrCode className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No QR codes created yet</p>
                          <p className="text-sm">Create your first QR code to get started</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    qrCodes.map((qr) => (
                      <TableRow key={qr.id}>
                        <TableCell className="font-medium">
                          <div className="max-w-xs">
                            <div className="truncate" title={qr.originalUrl}>
                              {qr.originalUrl}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">
                              {qr.trackingId}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="text-2xl font-bold text-green-600">{qr.totalScans.toLocaleString()}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{qr.uniqueVisitors.toLocaleString()}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <MapPin className="w-4 h-4 text-orange-500" />
                            <div>
                              <div className="font-semibold text-orange-600">{qr.topLocation}</div>
                              <div className="text-xs text-muted-foreground">
                                {qr.topLocationCount > 0 ? `${qr.topLocationCount} scans` : "No scans"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {qr.recentLocations.slice(0, 3).map((location, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {location}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(qr.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="w-3 h-3" />
                            {formatDate(qr.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewAnalytics(qr.trackingId)}
                              title="View Analytics"
                            >
                              <BarChart3 className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => window.open(qr.trackingUrl, '_blank')}
                              title="Open Tracking URL"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => window.open(qr.originalUrl, '_blank')}
                              title="Open Original URL"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
                <TableFooter className="bg-transparent">
                  <TableRow className="hover:bg-transparent">
                    <TableCell className="font-medium">Total</TableCell>
                    <TableCell className="text-center font-bold text-green-600">{totalScans.toLocaleString()}</TableCell>
                    <TableCell className="text-center font-bold text-purple-600">{totalUniqueVisitors.toLocaleString()}</TableCell>
                    <TableCell colSpan={5}></TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Modal */}
      <AnalyticsModal
        open={showAnalytics}
        onOpenChange={setShowAnalytics}
        trackingId={selectedTrackingId}
      />
    </div>
  )
}