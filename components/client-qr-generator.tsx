"use client"

import { Suspense } from "react"
import { QRGeneratorSkeleton } from "./qr-generator-skeleton"
import QRGenerator from "./qr-generator"

export default function ClientQRGenerator() {
  return (
    <Suspense fallback={<QRGeneratorSkeleton />}>
      <QRGenerator />
    </Suspense>
  )
}
