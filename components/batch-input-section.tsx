"use client"

import type React from "react"
import { useState } from "react"
import { Switch } from "./ui/switch"
import { Button } from "./ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { FileText, Eye, EyeOff, X } from "lucide-react"

interface CSVRow {
  url: string
  title?: string
  description?: string
}

interface BatchInputSectionProps {
  batchMode: boolean
  batchText: string
  csvData: CSVRow[]
  showCsvPreview: boolean
  csvError: string
  onBatchModeChange: (enabled: boolean) => void
  onBatchTextChange: (text: string) => void
  onCsvUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onCsvPreviewToggle: () => void
  onApplyCsvData: () => void
  onClearCsvData: () => void
  csvInputRef: React.RefObject<HTMLInputElement>
}

export function BatchInputSection({
  batchMode,
  batchText,
  csvData,
  showCsvPreview,
  csvError,
  onBatchModeChange,
  onBatchTextChange,
  onCsvUpload,
  onCsvPreviewToggle,
  onApplyCsvData,
  onClearCsvData,
  csvInputRef,
}: BatchInputSectionProps) {
  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="p-4 border border-neutral-800 rounded-lg bg-muted/50">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium">Batch Mode</label>
            <p className="text-xs text-muted-foreground">Generate multiple QR codes at once</p>
          </div>
          <Switch checked={batchMode} onCheckedChange={onBatchModeChange} />
        </div>
      </div>

      {/* CSV Import */}
      {batchMode && (
        <div className="p-4 border border-neutral-800 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <label className="text-sm font-medium">CSV Import</label>
              <p className="text-xs text-muted-foreground">Upload a CSV file with URLs for bulk generation</p>
            </div>
            <div className="flex items-center gap-2">
              <input ref={csvInputRef} type="file" accept=".csv" onChange={onCsvUpload} className="hidden" />
              <Button
                onClick={() => csvInputRef.current?.click()}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Upload CSV
              </Button>
              {csvData.length > 0 && (
                <>
                  <Button
                    onClick={onCsvPreviewToggle}
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {showCsvPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showCsvPreview ? "Hide" : "Preview"}
                  </Button>
                  <Button onClick={onClearCsvData} variant="ghost" size="sm">
                    <X className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {csvError && (
            <div className="mb-3 p-2 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-400">
              {csvError}
            </div>
          )}

          {csvData.length > 0 && (
            <div className="mb-3 p-2 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-800 rounded text-sm text-green-700 dark:text-green-400">
              Successfully imported {csvData.length} URLs from CSV
            </div>
          )}

          {/* CSV Preview */}
          {showCsvPreview && csvData.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">CSV Preview ({csvData.length} rows)</h4>
                <Button onClick={onApplyCsvData} size="sm" className="flex items-center gap-2">
                  Apply to Batch
                </Button>
              </div>
              <div className="max-h-60 overflow-y-auto border border-neutral-700 rounded">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>URL</TableHead>
                      {csvData.some((row) => row.title) && <TableHead>Title</TableHead>}
                      {csvData.some((row) => row.description) && <TableHead>Description</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvData.slice(0, 10).map((row, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono text-xs">{index + 1}</TableCell>
                        <TableCell className="font-mono text-xs max-w-xs truncate" title={row.url}>
                          {row.url}
                        </TableCell>
                        {csvData.some((r) => r.title) && (
                          <TableCell className="text-xs max-w-xs truncate" title={row.title}>
                            {row.title || "-"}
                          </TableCell>
                        )}
                        {csvData.some((r) => r.description) && (
                          <TableCell className="text-xs max-w-xs truncate" title={row.description}>
                            {row.description || "-"}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                    {csvData.length > 10 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-xs text-muted-foreground py-2">
                          ... and {csvData.length - 10} more rows
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Text Input - Only show in batch mode */}
      {batchMode && (
        <div>
          <label className="block text-sm font-medium mb-2">URLs (one per line)</label>
          <textarea
            value={batchText}
            onChange={(e) => onBatchTextChange(e.target.value)}
            placeholder="Enter URLs, one per line:&#10;https://example.com&#10;https://google.com&#10;https://github.com&#10;&#10;Or upload a CSV file above for bulk import"
            className="w-full bg-background border border-neutral-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-h-[120px] resize-y font-mono"
          />
        </div>
      )}
    </div>
  )
}