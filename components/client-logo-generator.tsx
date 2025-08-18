"use client"

import { Suspense } from "react"
import LogoGenerator from "./logo-generator"
import { LogoGeneratorSkeleton } from "./logo-generator-skeleton"

export default function ClientLogoGenerator() {
  return (
    <main className="min-h-screen bg-background text-foreground p-4 font-mono flex flex-col">
      <div className="w-full max-w-3xl mx-auto flex-1">
        <div className="mb-8">
          <Suspense fallback={<LogoGeneratorSkeleton />}>
            <LogoGenerator />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
