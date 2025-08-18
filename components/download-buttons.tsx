"use client"

import { Download } from "lucide-react"
import { Button } from "./ui/button"

interface DownloadButtonsProps {
  onDownload: (format: "png" | "svg" | "gif") => void
  hasAnimation?: boolean
}

export function DownloadButtons({ onDownload, hasAnimation = false }: DownloadButtonsProps) {
  return (
    <div className="flex flex-row justify-center items-center gap-4 mb-8">
      <Button
        onClick={() => onDownload("png")}
        className="flex items-center bg-primary text-primary-foreground hover:bg-primary/90"
      >
        Download PNG <Download className="inline-block ml-2 w-4 h-4" />
      </Button>
      <Button
        onClick={() => onDownload("svg")}
        variant="outline"
        className="flex items-center bg-background text-foreground border-neutral-800 hover:bg-neutral-900"
      >
        Download SVG <Download className="inline-block ml-2 w-4 h-4" />
      </Button>
      {hasAnimation && (
        <Button
          onClick={() => onDownload("gif")}
          variant="outline"
          className="flex items-center bg-background text-foreground border-neutral-800 hover:bg-neutral-900"
        >
          Download GIF <Download className="inline-block ml-2 w-4 h-4" />
        </Button>
      )}
    </div>
  )
}
