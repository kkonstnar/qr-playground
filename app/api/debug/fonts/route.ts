import { NextResponse } from "next/server"
import { getFonts } from "../../../../lib/actions"

// GET /api/debug/fonts - Debug endpoint to check font data structure
export async function GET() {
  try {
    const fonts = await getFonts()

    return NextResponse.json({
      success: true,
      count: fonts.length,
      fonts: fonts.map((font) => ({
        id: font.id,
        name: font.name,
        weights: font.weights,
        weightsType: typeof font.weights,
        weightsIsArray: Array.isArray(font.weights),
        defaultText: font.default_text,
        hasValidName: !!font.name,
        nameType: typeof font.name,
      })),
    })
  } catch (error) {
    console.error("Debug fonts error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        count: 0,
        fonts: [],
      },
      { status: 500 },
    )
  }
}
