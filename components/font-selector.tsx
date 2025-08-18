"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { ChevronDown, Plus } from "lucide-react"
import { Button } from "./ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command"
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog"
import { LoaderIcon } from "./ui/loader-icon"
import type { FontConfig } from "../hooks/use-fonts"

interface FontSelectorProps {
  fonts: FontConfig[]
  currentFontIndex: number
  onFontSelect: (fontName: string) => void
  onAddFont: (fontNames: string[]) => void
  isPending: boolean
  isLoading: boolean
  skeletonCount: number
}

// Font skeleton component
function FontSkeleton() {
  return (
    <div className="flex items-center px-2 py-1.5 rounded-sm">
      <div className="h-4 bg-neutral-700/50 rounded animate-pulse w-24" />
    </div>
  )
}

export function FontSelector({
  fonts,
  currentFontIndex,
  onFontSelect,
  onAddFont,
  isPending,
  isLoading,
  skeletonCount,
}: FontSelectorProps) {
  const [commandOpen, setCommandOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")

  const currentFont = fonts[currentFontIndex]

  // Parse font names from search
  const fontNames = useMemo(() => {
    if (!searchValue.trim()) return []
    const hasMultipleFonts = searchValue.includes(",")
    return hasMultipleFonts
      ? searchValue
          .split(",")
          .map((name) => name.trim())
          .filter(Boolean)
      : [searchValue.trim()]
  }, [searchValue])

  // Check which fonts from the search already exist and which are new
  const { existingFonts, newFonts } = useMemo(() => {
    const existing: string[] = []
    const newOnes: string[] = []

    fontNames.forEach((fontName) => {
      const existingFont = fonts.find((font) => font.name.toLowerCase() === fontName.toLowerCase())
      if (existingFont) {
        existing.push(fontName)
      } else {
        newOnes.push(fontName)
      }
    })

    return { existingFonts: existing, newFonts: newOnes }
  }, [fontNames, fonts])

  // Filter fonts based on search - show all matching fonts including those in search
  const filteredFonts = useMemo(() => {
    if (!searchValue.trim()) return fonts

    // Get fonts that match the search query
    const matchingFonts = fonts.filter((font) => font.name.toLowerCase().includes(searchValue.toLowerCase()))

    // If we have font names from search, also include exact matches
    if (fontNames.length > 0) {
      const exactMatches = fonts.filter((font) =>
        fontNames.some((searchFont) => font.name.toLowerCase() === searchFont.toLowerCase()),
      )

      // Combine and deduplicate
      const combined = [...matchingFonts, ...exactMatches]
      const unique = combined.filter((font, index, arr) => arr.findIndex((f) => f.name === font.name) === index)

      return unique
    }

    return matchingFonts
  }, [fonts, searchValue, fontNames])

  const handleFontSelect = (fontName: string) => {
    onFontSelect(fontName)
    setCommandOpen(false)
    setSearchValue("")
  }

  const handleAddFont = () => {
    if (newFonts.length > 0) {
      onAddFont(newFonts)
      setCommandOpen(false)
      setSearchValue("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchValue && newFonts.length > 0) {
      e.preventDefault()
      handleAddFont()
    }
  }

  const handleOpenChange = (open: boolean) => {
    setCommandOpen(open)
    if (!open) {
      setSearchValue("")
    }
  }

  // Only disable button during initial font loading, not when adding fonts
  const isButtonDisabled = isLoading

  return (
    <Dialog open={commandOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={commandOpen}
          disabled={isButtonDisabled}
          className="w-full justify-between bg-background border-neutral-800"
        >
          {isLoading ? (
            <div className="flex items-center">
              <LoaderIcon size={12} />
              <span className="ml-2 text-xs">Fetching</span>
            </div>
          ) : (
            <span
              style={{
                fontFamily: currentFont?.font.style?.fontFamily || currentFont?.name,
              }}
            >
              {currentFont?.name || "Select font..."}
            </span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0 max-w-md">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search or add fonts..."
            value={searchValue}
            onValueChange={setSearchValue}
            onKeyDown={handleKeyDown}
          />
          <CommandList>
            {/* Show add font option if there are new fonts to add */}
            {searchValue && newFonts.length > 0 && (
              <CommandGroup heading="Add Font">
                <CommandItem onSelect={handleAddFont} className="cursor-pointer">
                  <Plus className="mr-2 h-4 w-4" />
                  {newFonts.length > 1 ? (
                    <span>
                      Add {newFonts.length} fonts: {newFonts.join(", ")}
                    </span>
                  ) : (
                    <span>Add "{newFonts[0]}"</span>
                  )}
                  {isPending && <LoaderIcon size={14} className="ml-2" />}
                </CommandItem>
              </CommandGroup>
            )}

            {/* Show existing fonts that match search */}
            {filteredFonts.length > 0 && (
              <CommandGroup heading={searchValue ? "Existing Fonts" : "Fonts"}>
                {filteredFonts.map((font, index) => (
                  <CommandItem
                    key={`${font.name}-${font.id || index}`}
                    onSelect={() => handleFontSelect(font.name)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center w-full">
                      <span style={{ fontFamily: font.font.style?.fontFamily || font.name }}>{font.name}</span>
                      {/* Show indicator if this font was in the search */}
                      {existingFonts.some((existing) => existing.toLowerCase() === font.name.toLowerCase()) && (
                        <span className="ml-auto text-xs text-muted-foreground">✓</span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Show skeleton placeholders for loading fonts */}
            {!searchValue && skeletonCount > 0 && (
              <CommandGroup heading="Loading...">
                {Array.from({ length: skeletonCount }).map((_, index) => (
                  <FontSkeleton key={`skeleton-${index}`} />
                ))}
              </CommandGroup>
            )}

            {!searchValue && fonts.length === 0 && skeletonCount === 0 && (
              <CommandEmpty>No fonts available.</CommandEmpty>
            )}

            {searchValue && filteredFonts.length === 0 && newFonts.length === 0 && (
              <CommandEmpty>No matching fonts found.</CommandEmpty>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
