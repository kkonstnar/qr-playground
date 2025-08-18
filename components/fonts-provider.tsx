"use client"

import type React from "react"

import { Suspense } from "react"
import { useFonts } from "../hooks/use-fonts"
import { LoaderIcon } from "./ui/loader-icon"

interface FontsProviderProps {
  children: (fonts: ReturnType<typeof useFonts>) => React.ReactNode
}

function FontsContent({ children }: FontsProviderProps) {
  const fontsData = useFonts()
  return <>{children(fontsData)}</>
}

export function FontsProvider({ children }: FontsProviderProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <LoaderIcon size={28} />
            <p className="text-neutral-400 text-sm">Loading fonts...</p>
          </div>
        </div>
      }
    >
      <FontsContent>{children}</FontsContent>
    </Suspense>
  )
}
