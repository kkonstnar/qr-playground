"use client"

import { useState } from "react"
import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
  QrCode,
  Palette,
  Download,
  BarChart3,
  Upload,
  Move,
  FileText,
  Smartphone,
  MaximizeIcon as Limit,
} from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"

interface UserGuideProps {
  isMobile: boolean
}

export function UserGuide({ isMobile }: UserGuideProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const features = [
    {
      icon: <QrCode className="w-5 h-5" />,
      title: "QR Code Generation",
      description:
        "Generate QR codes for URLs, text, email addresses, phone numbers, SMS messages, WiFi credentials, and contact information.",
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: "CSV Bulk Import",
      description:
        "Upload CSV files with URLs, titles, and descriptions for mass QR code generation. Supports automatic column detection.",
    },
    {
      icon: <Smartphone className="w-5 h-5" />,
      title: "App Store Links",
      description:
        "Smart device detection that redirects iOS users to App Store and Android users to Google Play Store automatically.",
    },
    {
      icon: <Limit className="w-5 h-5" />,
      title: "Usage Limits",
      description:
        "Set maximum scan limits for QR codes. Perfect for limited-time offers, event tickets, or controlled access.",
    },
    {
      icon: <Upload className="w-5 h-5" />,
      title: "Logo Integration",
      description:
        "Upload your logo and embed it in QR codes. Choose from center, corner, or custom positioning with adjustable size.",
    },
    {
      icon: <Move className="w-5 h-5" />,
      title: "Logo Positioning",
      description:
        "Position your logo anywhere on the QR code - center, corners, or use custom X/Y coordinates for precise placement.",
    },
    {
      icon: <Palette className="w-5 h-5" />,
      title: "Customization",
      description:
        "Customize colors, size, margin, and error correction level. Real-time preview shows changes instantly.",
    },
    {
      icon: <Download className="w-5 h-5" />,
      title: "Multiple Formats",
      description:
        "Download QR codes as PNG or SVG files. Batch mode allows generating and downloading multiple QR codes at once.",
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: "Scan Tracking",
      description:
        "Enable tracking for URLs to capture device information, location data, and scan timestamps with detailed analytics.",
    },
  ]

  const appStoreExamples = [
    {
      scenario: "Mobile App Launch",
      description: "Perfect for promoting new mobile apps across platforms",
      setup:
        "iOS: https://apps.apple.com/app/your-app\nAndroid: https://play.google.com/store/apps/details?id=com.yourapp\nFallback: https://yourwebsite.com/download",
    },
    {
      scenario: "Marketing Campaign",
      description: "QR codes in print ads that work on any device",
      setup: "iOS: App Store link\nAndroid: Google Play link\nFallback: Landing page with download options",
    },
    {
      scenario: "Event App",
      description: "Conference or event attendees can easily get your app",
      setup: "Smart redirect ensures everyone gets the right version for their device",
    },
  ]

  const usageLimitExamples = [
    {
      scenario: "Limited Offers",
      description: "First 100 customers get a discount",
      limit: "100 scans maximum",
    },
    {
      scenario: "Event Tickets",
      description: "Each QR code can only be used once",
      limit: "1 scan maximum",
    },
    {
      scenario: "Beta Testing",
      description: "Limit access to your beta app",
      limit: "50 scans maximum",
    },
    {
      scenario: "Contest Entry",
      description: "Limited entries for a giveaway",
      limit: "500 scans maximum",
    },
  ]

  const csvFormats = [
    {
      format: "Simple URL List",
      example: "url\nhttps://example.com\nhttps://google.com\nhttps://github.com",
      description: "Basic CSV with just URLs in the first column",
    },
    {
      format: "With Headers",
      example:
        "url,title,description\nhttps://example.com,Example Site,A sample website\nhttps://google.com,Google,Search engine",
      description: "CSV with column headers for better organization",
    },
    {
      format: "Alternative Headers",
      example:
        "link,name,desc\nhttps://example.com,My Website,Company homepage\nhttps://shop.com,Online Store,E-commerce site",
      description: "Flexible header names (link/url, name/title, desc/description)",
    },
    {
      format: "No Headers",
      example: "https://example.com,Example Site,Sample description\nhttps://google.com,Google,Search engine",
      description: "CSV without headers - first column assumed to be URL",
    },
  ]

  const examples = [
    {
      type: "URL",
      example: "https://example.com",
      description: "Direct link to websites",
    },
    {
      type: "Email",
      example: "mailto:contact@example.com",
      description: "Opens email client",
    },
    {
      type: "Phone",
      example: "tel:+1234567890",
      description: "Initiates phone call",
    },
    {
      type: "SMS",
      example: "sms:+1234567890?body=Hello",
      description: "Pre-filled text message",
    },
    {
      type: "WiFi",
      example: "WIFI:T:WPA;S:NetworkName;P:password;;",
      description: "Auto-connect to WiFi",
    },
    {
      type: "Contact",
      example: "BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nORG:Company\nTEL:+1234567890\nEMAIL:john@example.com\nEND:VCARD",
      description: "Contact information",
    },
  ]

  return (
    <div className="w-full max-w-4xl mx-auto mt-12">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              <CardTitle className="font-medium text-lg">User Guide</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2"
            >
              {isExpanded ? (
                <>
                  Hide Guide <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  Show Guide <ChevronDown className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
          <CardDescription>Learn how to use all the features of the QR Playground</CardDescription>
        </CardHeader>

        {isExpanded && (
          <CardContent className="space-y-8">
            {/* Features Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="text-primary mt-0.5">{feature.icon}</div>
                    <div>
                      <h4 className="font-medium text-sm">{feature.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* App Store Links Guide */}
            <div>
              <h3 className="text-lg font-semibold mb-4">App Store Links</h3>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Create smart QR codes that automatically redirect users to the appropriate app store based on their
                  device.
                </p>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm">How it works:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                    <li>iOS devices (iPhone, iPad) are redirected to the App Store URL</li>
                    <li>Android devices are redirected to the Google Play Store URL</li>
                    <li>Desktop and unknown devices go to the fallback URL</li>
                    <li>Device detection happens automatically when the QR code is scanned</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Use Cases:</h4>
                  {appStoreExamples.map((example, index) => (
                    <div key={index} className="p-3 rounded-lg bg-muted/50">
                      <h5 className="font-medium text-sm mb-1">{example.scenario}</h5>
                      <p className="text-xs text-muted-foreground mb-2">{example.description}</p>
                      {example.setup && (
                        <code className="text-xs bg-background px-2 py-1 rounded border font-mono block whitespace-pre-wrap">
                          {example.setup}
                        </code>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Usage Limits Guide */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Usage Limits</h3>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Control how many times your QR codes can be scanned. Perfect for limited offers, events, and access
                  control.
                </p>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm">How it works:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                    <li>Set a maximum number of scans (1 to 10,000)</li>
                    <li>Each scan is tracked and counted</li>
                    <li>Once the limit is reached, the QR code stops working</li>
                    <li>Users see a "limit exceeded" message after the maximum is reached</li>
                    <li>Analytics show remaining scans and usage statistics</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Use Cases:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {usageLimitExamples.map((example, index) => (
                      <div key={index} className="p-3 rounded-lg bg-muted/50">
                        <h5 className="font-medium text-sm mb-1">{example.scenario}</h5>
                        <p className="text-xs text-muted-foreground mb-1">{example.description}</p>
                        <span className="text-xs bg-muted text-foreground px-2 py-1 rounded border">
                          {example.limit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* CSV Import Guide */}
            <div>
              <h3 className="text-lg font-semibold mb-4">CSV Import Guide</h3>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Upload CSV files to generate multiple QR codes at once. The system automatically detects column
                  headers and formats.
                </p>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Supported CSV Formats:</h4>
                  {csvFormats.map((format, index) => (
                    <div key={index} className="p-3 rounded-lg bg-muted/50">
                      <h5 className="font-medium text-sm mb-1">{format.format}</h5>
                      <p className="text-xs text-muted-foreground mb-2">{format.description}</p>
                      <code className="text-xs bg-background px-2 py-1 rounded border font-mono block whitespace-pre-wrap">
                        {format.example}
                      </code>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">CSV Import Steps:</h4>
                  <ol className="text-xs text-muted-foreground space-y-1 ml-4 list-decimal">
                    <li>Enable batch mode</li>
                    <li>Click "Upload CSV" button</li>
                    <li>Select your CSV file (.csv extension required)</li>
                    <li>Preview the imported data in the table</li>
                    <li>Click "Apply to Batch" to load URLs into the generator</li>
                    <li>Generate and download your QR codes</li>
                  </ol>
                </div>

                <div className="p-3 rounded-lg bg-muted/50 border">
                  <h4 className="font-medium text-sm mb-1">💡 Pro Tips:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Column headers can be: url/link, title/name, description/desc</li>
                    <li>• Files without headers work too - first column assumed to be URL</li>
                    <li>• Titles and descriptions appear in the QR code cards</li>
                    <li>• All QR codes use the same styling and logo settings</li>
                    <li>• Large CSV files are processed efficiently in batches</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Logo Positioning Guide */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Logo Positioning Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Preset Positions</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>
                      <strong>Center:</strong> Logo placed in the middle with circular background
                    </li>
                    <li>
                      <strong>Top Left:</strong> Logo in upper left corner with rounded background
                    </li>
                    <li>
                      <strong>Top Right:</strong> Logo in upper right corner
                    </li>
                    <li>
                      <strong>Bottom Left:</strong> Logo in lower left corner
                    </li>
                    <li>
                      <strong>Bottom Right:</strong> Logo in lower right corner
                    </li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Custom Positioning</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>
                      <strong>X Position:</strong> Horizontal placement (0-100%)
                    </li>
                    <li>
                      <strong>Y Position:</strong> Vertical placement (0-100%)
                    </li>
                    <li>
                      <strong>Size:</strong> Logo size relative to QR code (10-40%)
                    </li>
                    <li>
                      <strong>Auto-bounds:</strong> Logo stays within QR code boundaries
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Batch Mode Guide */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Batch Mode</h3>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Generate multiple QR codes at once using manual input or CSV import:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                  <li>• Toggle batch mode on to switch to multi-URL input</li>
                  <li>• Enter one URL per line manually, or upload a CSV file</li>
                  <li>• All QR codes will use the same styling and logo settings</li>
                  <li>• Download individual QR codes or all at once</li>
                  <li>• Tracking works for all URLs if enabled</li>
                  <li>• CSV data includes titles and descriptions in QR cards</li>
                  <li>• App store links and usage limits apply to all generated QR codes</li>
                </ul>
              </div>
            </div>

            {/* Error Correction Guide */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Error Correction Levels</h3>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Error correction allows QR codes to be read even when damaged or partially obscured. Higher levels provide better damage tolerance but reduce data capacity.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <h4 className="font-medium text-sm mb-2">Low (7%)</h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      Can recover from up to 7% damage. Best for clean environments and simple text.
                    </p>
                    <div className="text-xs text-muted-foreground">
                      ✓ Maximum data capacity<br/>
                      ✓ Smallest QR codes<br/>
                      ✓ Clean, controlled scanning
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/50">
                    <h4 className="font-medium text-sm mb-2">Medium (15%) - Recommended</h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      Can recover from up to 15% damage. Good balance between reliability and size.
                    </p>
                    <div className="text-xs text-muted-foreground">
                      ✓ Balanced approach<br/>
                      ✓ Good for most applications<br/>
                      ✓ Handles minor damage well
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/50">
                    <h4 className="font-medium text-sm mb-2">Quartile (25%)</h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      Can recover from up to 25% damage. Good for adding logos or branding.
                    </p>
                    <div className="text-xs text-muted-foreground">
                      ✓ Excellent for logo integration<br/>
                      ✓ Handles significant damage<br/>
                      ✓ Print media applications
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/50">
                    <h4 className="font-medium text-sm mb-2">High (30%)</h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      Can recover from up to 30% damage. Maximum reliability for harsh conditions.
                    </p>
                    <div className="text-xs text-muted-foreground">
                      ✓ Maximum damage tolerance<br/>
                      ✓ Industrial/outdoor use<br/>
                      ✓ Large logo compatibility
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-muted/50 border">
                  <h4 className="font-medium text-sm mb-2">💡 Choosing the Right Level:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• <strong>Low:</strong> Digital displays, clean environments, maximum data</li>
                    <li>• <strong>Medium:</strong> General purpose, business cards, flyers</li>
                    <li>• <strong>Quartile:</strong> Adding logos, outdoor signs, marketing materials</li>
                    <li>• <strong>High:</strong> Industrial labels, harsh environments, large logos</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Examples Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Supported Formats</h3>
              <div className="grid grid-cols-1 gap-3">
                {examples.map((example, index) => (
                  <div key={index} className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-sm">{example.type}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{example.description}</p>
                      </div>
                      <code className="text-xs bg-background px-2 py-1 rounded border font-mono whitespace-nowrap">
                        {example.example.length > 40 ? `${example.example.substring(0, 40)}...` : example.example}
                      </code>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Tips</h3>
              <div className="space-y-2">
                <ul className="text-xs text-muted-foreground space-y-2">
                  <li>• Use higher error correction levels when adding logos to ensure scannability</li>
                  <li>• Keep logos simple and high-contrast for better QR code readability</li>
                  <li>• Test QR codes with different devices and scanning apps</li>
                  <li>• For CSV import, ensure URLs are properly formatted with http:// or https://</li>
                  <li>• Use descriptive titles in CSV files for better organization</li>
                  <li>• Enable tracking only for URLs you own or have permission to track</li>
                  <li>• Use custom positioning to avoid covering important QR code areas</li>
                  <li>• PNG format is recommended for logos with transparency</li>
                  <li>• Large CSV files are processed efficiently - no size limits</li>
                  <li>• App store links work best with proper fallback URLs for desktop users</li>
                  <li>• Usage limits are perfect for time-sensitive campaigns and events</li>
                  <li>• Monitor analytics to track usage patterns and optimize your campaigns</li>
                </ul>
              </div>
            </div>

            {/* Keyboard Shortcuts */}
            {!isMobile && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Keyboard Shortcuts</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs">Toggle theme</span>
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl + D</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs">Reset settings</span>
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl + R</kbd>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs">Download PNG</span>
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl + S</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs">Toggle batch mode</span>
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl + B</kbd>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  )
}
