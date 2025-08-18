export async function getFontWeights(fontName: string): Promise<string[]> {
  // Fallback weights for when CORS blocks the request
  const fallbackWeights = ["300", "400", "500", "600", "700"]

  try {
    // Try to fetch, but if it fails due to CORS, use fallback
    const response = await fetch(
      `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, "+")}:wght@100;200;300;400;500;600;700;800;900&display=swap`,
    )

    if (!response.ok) {
      return fallbackWeights
    }

    const css = await response.text()

    const weightRegex = /font-weight:\s*(\d+)/g
    const weights = new Set<string>()
    let match

    while ((match = weightRegex.exec(css)) !== null) {
      weights.add(match[1])
    }

    const foundWeights = Array.from(weights).sort((a, b) => Number.parseInt(a) - Number.parseInt(b))

    // Return found weights or fallback if none found
    return foundWeights.length > 0 ? foundWeights : fallbackWeights
  } catch (error) {
    console.error(`Error fetching weights for ${fontName}:`, error)
    return fallbackWeights // Return fallback weights if fetching fails
  }
}
