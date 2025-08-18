import { type NextRequest, NextResponse } from "next/server"
import { sql, type Font } from "../../../lib/db"

// GET /api/fonts - Fetch all fonts
export async function GET() {
  try {
    const fonts = await sql<Font[]>`
      SELECT id, name, weights, default_text, created_at FROM fonts ORDER BY id ASC
    `

    // Parse JSONB weights to JavaScript array
    const parsedFonts = fonts.map((font) => ({
      ...font,
      weights: typeof font.weights === "string" ? JSON.parse(font.weights) : font.weights,
    }))

    return NextResponse.json(parsedFonts)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch fonts" }, { status: 500 })
  }
}

// POST /api/fonts - Add a new font
export async function POST(request: NextRequest) {
  try {
    const { name, weights, defaultText = "Logo Text" } = await request.json()

    if (!name || !weights || !Array.isArray(weights)) {
      return NextResponse.json({ error: "Name and weights are required" }, { status: 400 })
    }

    // Convert weights array to JSONB
    const weightsJson = JSON.stringify(weights)

    const result = await sql<Font[]>`
      INSERT INTO fonts (name, weights, default_text)
      VALUES (${name}, ${weightsJson}::jsonb, ${defaultText})
      RETURNING *
    `

    // Parse JSONB weights to JavaScript array
    const font = {
      ...result[0],
      weights: typeof result[0].weights === "string" ? JSON.parse(result[0].weights) : result[0].weights,
    }

    return NextResponse.json(font)
  } catch (error) {
    return NextResponse.json({ error: "Failed to add font" }, { status: 500 })
  }
}
