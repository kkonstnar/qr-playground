"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "./ui/button"
import { QrCode, BarChart3, Home, User, LogIn, LogOut } from "lucide-react"
import { useAuth } from "./auth-provider"
import { AuthModal } from "./auth-modal"
import { useState } from "react"

export function Navigation() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  return (
    <>
      <nav className="border-b border-neutral-800 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <QrCode className="h-6 w-6" />
                <span className="font-medium">QR Playground</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={pathname === "/" ? "default" : "ghost"}
                size="sm"
                asChild
              >
                <Link href="/" className="flex items-center space-x-2">
                  <Home className="h-4 w-4" />
                  <span>Generator</span>
                </Link>
              </Button>
              
              <Button
                variant={pathname === "/dashboard" ? "default" : "ghost"}
                size="sm"
                asChild
              >
                <Link href="/dashboard" className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </Button>
              
              {user && (
                <Button
                  variant={pathname === "/track" ? "default" : "ghost"}
                  size="sm"
                  asChild
                >
                  <Link href="/track" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>My QR Codes</span>
                  </Link>
                </Button>
              )}
              
              {user ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAuthModal(true)}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </>
  )
}