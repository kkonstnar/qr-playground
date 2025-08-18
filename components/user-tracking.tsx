"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"
import {
  BarChart3,
  QrCode,
  MapPin,
  Activity,
  Users,
  Edit2,
  Check,
  X,
  ExternalLink,
} from "lucide-react"
import { AnalyticsModal } from "./analytics-modal"
import { useAuth } from "./auth-provider"

interface QRCodeData {
  id: string
  trackingId: string
  name?: string
  originalUrl: string
  trackingUrl: string
  createdAt: string
  totalScans: number
  uniqueVisitors: number
  lastScanAt?: string
  topLocation: string
  topLocationCount: number
  recentLocations: string[]
}

export function UserTracking() {
  const { user } = useAuth()
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTrackingId, setSelectedTrackingId] = useState<string>("")
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [editingId, setEditingId] = useState<string>("")
  const [editingName, setEditingName] = useState<string>("")

  const fetchQRCodes = async () => {
    if (!user) {
      setQrCodes([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/dashboard?userId=${user.id}`)
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
  }, [user])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const handleViewAnalytics = (trackingId: string) => {
    setSelectedTrackingId(trackingId)
    setShowAnalytics(true)
  }

  const handleEditName = (qr: QRCodeData) => {
    setEditingId(qr.id)
    setEditingName(qr.name || `QR Code for ${qr.originalUrl}`)
  }

  const handleSaveName = async (qrId: string) => {
    // TODO: API call to save name
    console.log("Saving name:", editingName, "for QR:", qrId)
    
    // Update local state
    setQrCodes(prev => prev.map(qr => 
      qr.id === qrId ? { ...qr, name: editingName } : qr
    ))
    
    setEditingId("")
    setEditingName("")
  }

  const handleCancelEdit = () => {
    setEditingId("")
    setEditingName("")
  }

  const totalScans = qrCodes.reduce((sum, qr) => sum + qr.totalScans, 0)
  const totalUniqueVisitors = qrCodes.reduce((sum, qr) => sum + qr.uniqueVisitors, 0)

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md">
              <CardContent className="text-center py-8">
                <QrCode className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h2 className="text-xl font-bold mb-2">Sign In Required</h2>
                <p className="text-muted-foreground mb-4">
                  Please sign in to view and track your QR codes
                </p>
                <Button asChild>
                  <a href="/">Go to QR Generator</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="py-6">
          <h1 className="text-2xl font-bold">My QR Codes</h1>
          <p className="text-muted-foreground">Track performance of your QR codes</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <QrCode className="w-4 h-4" />
                My QR Codes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{qrCodes.length}</div>
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
                <MapPin className="w-4 h-4" />
                Best Performer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {qrCodes.length > 0 
                  ? Math.max(...qrCodes.map(qr => qr.totalScans)).toLocaleString()
                  : "0"
                }
              </div>
              <div className="text-xs text-muted-foreground">scans</div>
            </CardContent>
          </Card>
        </div>

        {/* QR Codes List */}
        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="text-center py-8">
                <div className="flex items-center justify-center gap-2">
                  <Activity className="w-4 h-4 animate-spin" />
                  Loading your QR codes...
                </div>
              </CardContent>
            </Card>
          ) : qrCodes.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <QrCode className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No QR codes yet</p>
                <p className="text-sm text-muted-foreground mb-4">Create your first QR code to start tracking</p>
                <Button asChild>
                  <a href="/">Create QR Code</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            qrCodes.map((qr) => (
              <Card key={qr.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* QR Code Name */}
                      <div className="mb-3">
                        {editingId === qr.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="text-lg font-semibold"
                              placeholder="Enter QR code name"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleSaveName(qr.id)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelEdit}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">
                              {qr.name || `QR Code for ${qr.originalUrl}`}
                            </h3>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditName(qr)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground">{qr.originalUrl}</p>
                        <p className="text-xs text-muted-foreground font-mono">ID: {qr.trackingId}</p>
                      </div>

                      {/* Statistics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-2xl font-bold">{qr.totalScans.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">Total Scans</div>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-2xl font-bold">{qr.uniqueVisitors.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">Unique Visitors</div>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-lg font-bold">{qr.topLocation}</div>
                          <div className="text-xs text-muted-foreground">Top Location</div>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-lg font-bold">
                            {qr.lastScanAt ? formatDate(qr.lastScanAt) : "Never"}
                          </div>
                          <div className="text-xs text-muted-foreground">Last Scan</div>
                        </div>
                      </div>

                      {/* Recent Locations */}
                      {qr.recentLocations && qr.recentLocations.length > 0 && (
                        <div className="mb-4">
                          <Label className="text-sm font-medium">Recent Scanning Locations:</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {qr.recentLocations.map((location, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                <MapPin className="w-3 h-3 mr-1" />
                                {location}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground">
                        Created: {formatDate(qr.createdAt)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => handleViewAnalytics(qr.trackingId)}
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Analytics
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(qr.trackingUrl, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open QR Link
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
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