"use client"

import { useState, useEffect, useOptimistic, useTransition } from "react"
import { Comfortaa } from "next/font/google"
import type { NextFont } from "next/dist/compiled/@next/font"
import { getFontWeights } from "../lib/fontUtils"
import useSWR from "swr"

// Pre-load Comfortaa font
const comfortaa = Comfortaa({ subsets: ["latin"], display: "swap" })

export interface FontConfig {
  id?: number
  name: string
  font: NextFont | { className: string; style: { fontFamily: string } }
  defaultText: string
  weights: string[]
  hasItalic?: boolean
  isLoading?: boolean
}

// Check if font has italic support
const checkItalicSupport = async (fontName: string): Promise<boolean> => {
  try {
    const response = await fetch(
      `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, "+")}:ital,wght@1,400&display=swap`,
    )
    const css = await response.text()
    return css.includes("font-style: italic")
  } catch {
    return false
  }
}

// Load font CSS and wait for font to be available
const loadFontInBrowser = async (fontName: string, weights: string[]) => {
  const link = document.createElement("link")
  link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, "+")}:ital,wght@0,${weights.join(";0,")};1,${weights.join(";1,")}&display=swap`
  link.rel = "stylesheet"
  document.head.appendChild(link)

  try {
    await document.fonts.load(`16px "${fontName}"`)
  } catch (error) {
    // Silently handle font loading errors
  }
}

// Fetcher function for SWR
const fontsFetcher = async () => {
  try {
    const response = await fetch("/api/fonts")
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    throw error
  }
}

export function useFonts() {
  const [isPending, startTransition] = useTransition()
  const [allFonts, setAllFonts] = useState<FontConfig[]>([])
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [skeletonCount, setSkeletonCount] = useState(3)
  const [loadedFontIds, setLoadedFontIds] = useState<Set<number>>(new Set())
  const [hasMinimumFonts, setHasMinimumFonts] = useState(false)

  // Use SWR for caching with better error handling
  const {
    data: dbFonts = [],
    error,
    isLoading: isSWRLoading,
    mutate: mutateFonts,
  } = useSWR("fonts", fontsFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 300000, // 5 minutes
    focusThrottleInterval: 600000, // 10 minutes
  })

  // Initialize fonts once
  useEffect(() => {
    let isMounted = true

    const initializeFonts = async () => {
      try {
        // Load predefined fonts first
        const predefinedFonts: FontConfig[] = [
          {
            name: "Comfortaa",
            font: comfortaa,
            defaultText: "Brand X",
            weights: await getFontWeights("Comfortaa"),
            hasItalic: await checkItalicSupport("Comfortaa"),
          },
        ]

        if (!isMounted) return
        setAllFonts(predefinedFonts)
        setHasMinimumFonts(true) // Enable selector with predefined font

        // Wait for SWR to load database fonts
        if (isSWRLoading) {
          return
        }

        if (error) {
          setIsInitialLoading(false)
          setSkeletonCount(0)
          return
        }

        if (dbFonts.length === 0) {
          setIsInitialLoading(false)
          setSkeletonCount(0)
          return
        }

        setSkeletonCount(Math.min(3, dbFonts.length))

        // Process fonts individually and stream them
        let loadedCount = 0
        const processFont = async (dbFont: any, index: number) => {
          try {
            await loadFontInBrowser(dbFont.name, dbFont.weights)
            const hasItalic = await checkItalicSupport(dbFont.name)

            const processedFont: FontConfig = {
              id: dbFont.id,
              name: dbFont.name,
              font: {
                className: "",
                style: { fontFamily: dbFont.name },
              },
              defaultText: dbFont.default_text,
              weights: dbFont.weights,
              hasItalic,
            }

            if (!isMounted) return

            // Add font to the list if not already present
            setAllFonts((prev) => {
              const exists = prev.find((f) => f.id === dbFont.id || f.name === dbFont.name)
              if (exists) {
                return prev
              }
              return [...prev, processedFont]
            })

            // Track loaded fonts
            setLoadedFontIds((prev) => new Set([...prev, dbFont.id]))
            loadedCount++

            // Enable selector after first 5 fonts (including predefined)
            if (loadedCount >= 4) {
              setHasMinimumFonts(true)
            }

            // Reduce skeleton count
            setSkeletonCount((prev) => Math.max(0, prev - 1))
          } catch (error) {
            if (!isMounted) return
            setSkeletonCount((prev) => Math.max(0, prev - 1))
          }
        }

        // Process fonts with batching for better performance
        const batchSize = 3
        for (let i = 0; i < dbFonts.length; i += batchSize) {
          const batch = dbFonts.slice(i, i + batchSize)
          await Promise.all(batch.map((font, index) => processFont(font, i + index)))

          // Small delay between batches to prevent blocking
          if (i + batchSize < dbFonts.length) {
            await new Promise((resolve) => setTimeout(resolve, 100))
          }
        }

        if (!isMounted) return
        setIsInitialLoading(false)
        setSkeletonCount(0)
        setHasMinimumFonts(true)
      } catch (error) {
        if (!isMounted) return
        setIsInitialLoading(false)
        setSkeletonCount(0)
        setHasMinimumFonts(true)
      }
    }

    initializeFonts()

    return () => {
      isMounted = false
    }
  }, [dbFonts, isSWRLoading, error]) // Depend on SWR state

  // Optimistic updates for adding fonts
  const [optimisticFonts, addOptimisticFont] = useOptimistic(
    allFonts,
    (state: FontConfig[], action: { type: "add"; font: FontConfig } | { type: "delete"; id: number }) => {
      if (action.type === "add") {
        const exists = state.find((f) => f.name.toLowerCase() === action.font.name.toLowerCase())
        if (exists) return state
        return [...state, action.font]
      } else {
        return state.filter((font) => font.id !== action.id)
      }
    },
  )

  const handleAddFont = async (fontNames: string[]) => {
    for (const fontName of fontNames) {
      try {
        // Check if font already exists
        const existingFont = allFonts.find((font) => font.name.toLowerCase() === fontName.toLowerCase())
        if (existingFont) {
          continue
        }

        // Create optimistic font immediately
        const optimisticFont: FontConfig = {
          id: Date.now() + Math.random(), // Temporary ID
          name: fontName,
          font: {
            className: "",
            style: { fontFamily: fontName },
          },
          defaultText: fontName,
          weights: ["400"],
          hasItalic: false,
          isLoading: true,
        }

        // Add optimistically to UI immediately
        addOptimisticFont({ type: "add", font: optimisticFont })

        // Start background operations
        startTransition(async () => {
          try {
            // Get weights and add to database
            const weights = await getFontWeights(fontName)

            // Call API to add font
            const response = await fetch("/api/fonts", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: fontName,
                weights,
                defaultText: fontName,
              }),
            })

            if (!response.ok) {
              throw new Error(`Failed to add font: ${response.status}`)
            }

            const result = await response.json()

            if (result) {
              // Load font assets in browser
              await loadFontInBrowser(fontName, weights)
              const hasItalic = await checkItalicSupport(fontName)

              // Update the stable font list
              setAllFonts((prev) => {
                const withoutOptimistic = prev.filter((f) => f.id !== optimisticFont.id)
                return [
                  ...withoutOptimistic,
                  {
                    id: result.id,
                    name: result.name,
                    font: {
                      className: "",
                      style: { fontFamily: result.name },
                    },
                    defaultText: result.default_text,
                    weights: result.weights,
                    hasItalic,
                  },
                ]
              })

              // Update cache
              await mutateFonts()
            }
          } catch (error) {
            // Silently handle errors
          }
        })
      } catch (error) {
        // Silently handle errors
      }
    }
  }

  const handleDeleteFont = async (id?: number) => {
    if (!id) return

    // Check if we're in production
    if (process.env.NODE_ENV === "production") {
      return
    }

    // Add optimistically to remove from UI immediately
    addOptimisticFont({ type: "delete", id })

    startTransition(async () => {
      try {
        const response = await fetch(`/api/fonts/${id}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error(`Failed to delete font: ${response.status}`)
        }

        const result = await response.json()

        if (result.id) {
          // Update stable font list
          setAllFonts((prev) => prev.filter((font) => font.id !== id))
          // Update the cache
          await mutateFonts()
        }
      } catch (error) {
        // Silently handle errors
      }
    })
  }

  return {
    fonts: optimisticFonts,
    isLoading: !hasMinimumFonts,
    isPending,
    error,
    skeletonCount,
    handleAddFont,
    handleDeleteFont,
  }
}
