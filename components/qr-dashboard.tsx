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
  Eye,
  Download,
  ExternalLink,
  Smartphone,
  Globe,
  Clock,
  Users,
  TrendingUp,
  Plus,
  RefreshCw,
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
}

export function QRDashboard() {
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

  const handleViewAnalytics = (trackingId: string) => {
    setSelectedTrackingId(trackingId)
    setShowAnalytics(true)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="w-full max-w-7xl mx-auto px-12 space-y-6">
        {/* Header */}
        <div className="flex items-center flex-wrap gap-8 py-12 justify-between">
          <div>
            <h1 className="text-2xl font-medium">QR Code Dashboard</h1>
            <p className="text-muted-foreground">Manage and track your QR codes</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={fetchQRCodes} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button size="sm" asChild>
              <Link href="/">
                
                Create QR Code
              </Link>
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <QrCode className="w-4 h-4" />
                Total QR Codes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{qrCodes.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Total Scans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalScans.toLocaleString()}</div>
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
              <div className="text-2xl font-bold">{totalUniqueVisitors.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Active QR Codes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeQRs}</div>
            </CardContent>
          </Card>
        </div>

        {/* QR Codes Table */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              QR Codes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
              <Table className="[&_td]:border-border [&_th]:border-border border-separate border-spacing-0 [&_tfoot_td]:border-t [&_th]:border-b [&_tr]:border-none [&_tr:not(:last-child)_td]:border-b">
                <TableHeader className="bg-background/90 sticky top-0 z-10 backdrop-blur-xs">
                  <TableRow className="hover:bg-transparent">
                    <TableHead>URL</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Scans</TableHead>
                    <TableHead>Visitors</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Last Scan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Features</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Loading QR codes...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : qrCodes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
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
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="w-3 h-3" />
                            {formatDate(qr.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold">{qr.totalScans.toLocaleString()}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold">{qr.uniqueVisitors.toLocaleString()}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{getUsageText(qr)}</div>
                        </TableCell>
                        <TableCell>
                          {qr.lastScanAt ? (
                            <div className="text-sm">{formatDate(qr.lastScanAt)}</div>
                          ) : (
                            <div className="text-sm text-muted-foreground">Never</div>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(qr.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {qr.appStore?.enabled && (
                              <Badge variant="outline" className="text-xs">
                                <Smartphone className="w-3 h-3 mr-1" />
                                App Store
                              </Badge>
                            )}
                            {qr.usageLimit?.enabled && (
                              <Badge variant="outline" className="text-xs">
                                Limits
                              </Badge>
                            )}
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
                    <TableCell colSpan={2} className="font-medium">Total</TableCell>
                    <TableCell className="font-bold">{totalScans.toLocaleString()}</TableCell>
                    <TableCell className="font-bold">{totalUniqueVisitors.toLocaleString()}</TableCell>
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